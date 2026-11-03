import {
    collection,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    setDoc,
    Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { getPortfolio, PortfolioData } from './portfolioService';
import { getServiceById, ServiceDocument } from './serviceService';

export interface Report {
    professionalUid: string;
    professionalName: string;
    reporterUid: string;
    createdAt: Timestamp | null;
}

export interface ReportedProfile {
    professionalUid: string;
    // Nome gravado na denúncia mais recente, usado quando o portfólio já foi excluído
    professionalName: string;
    reportsCount: number;
    oldestReportAt: number;
    portfolio: PortfolioData | null;
}

export interface ReportedService {
    serviceId: string;
    // Título gravado na denúncia mais recente, usado quando o serviço não existe mais
    serviceTitle: string;
    reportsCount: number;
    oldestReportAt: number;
    service: ServiceDocument | null;
}

const reportsRef = collection(db, 'denuncias');
const serviceReportsRef = collection(db, 'denunciasServicos');

// Id determinístico: cada usuário só consegue denunciar o mesmo perfil (ou serviço) uma vez
// (as regras do Firestore bloqueiam regravar um documento existente)
function reportId(targetId: string, reporterUid: string): string {
    return `${targetId}_${reporterUid}`;
}

// Registrar denúncia; lança "report-duplicate" se o usuário já denunciou este perfil
export async function reportProfile(
    professionalUid: string,
    professionalName: string,
    reporterUid: string
): Promise<void> {
    const reportRef = doc(db, 'denuncias', reportId(professionalUid, reporterUid));

    const existing = await getDoc(reportRef);
    if (existing.exists()) throw new Error('report-duplicate');

    await setDoc(reportRef, {
        professionalUid,
        professionalName,
        reporterUid,
        createdAt: serverTimestamp(),
    });
}

// Registrar denúncia de serviço; lança "report-duplicate" se o usuário já denunciou este serviço
export async function reportService(
    serviceId: string,
    serviceTitle: string,
    reporterUid: string
): Promise<void> {
    const reportRef = doc(db, 'denunciasServicos', reportId(serviceId, reporterUid));

    const existing = await getDoc(reportRef);
    if (existing.exists()) throw new Error('report-duplicate');

    await setDoc(reportRef, {
        serviceId,
        serviceTitle,
        reporterUid,
        createdAt: serverTimestamp(),
    });
}

interface ReportGroup {
    targetId: string;
    // Nome/título gravado na denúncia mais recente
    targetName: string;
    reportsCount: number;
    oldestReportAt: number;
}

// Agrupa as denúncias pelo alvo (perfil ou serviço). A contagem vem dos próprios documentos
// de denúncia, então sempre bate com o que está gravado.
function groupReports(docs: { data: () => Record<string, unknown> }[], idField: string, nameField: string): ReportGroup[] {
    const grouped = new Map<string, ReportGroup & { newestReportAt: number }>();

    docs.forEach((d) => {
        const report = d.data();
        const targetId = String(report[idField] ?? '');
        if (!targetId) return;
        const targetName = String(report[nameField] ?? '');
        const createdAt = (report.createdAt as Timestamp | null)?.toMillis() ?? Date.now();
        const current = grouped.get(targetId);

        if (!current) {
            grouped.set(targetId, {
                targetId,
                targetName,
                reportsCount: 1,
                oldestReportAt: createdAt,
                newestReportAt: createdAt,
            });
            return;
        }

        current.reportsCount += 1;
        current.oldestReportAt = Math.min(current.oldestReportAt, createdAt);
        if (createdAt > current.newestReportAt) {
            current.newestReportAt = createdAt;
            current.targetName = targetName;
        }
    });

    return [...grouped.values()].map(({ newestReportAt, ...group }) => group);
}

// Mesma classificação para perfis e serviços: alvos existentes antes dos excluídos;
// mais denúncias primeiro; empate pela denúncia mais antiga.
function compareReported(
    a: { exists: boolean; reportsCount: number; oldestReportAt: number },
    b: { exists: boolean; reportsCount: number; oldestReportAt: number },
): number {
    return Number(!a.exists) - Number(!b.exists)
        || b.reportsCount - a.reportsCount
        || a.oldestReportAt - b.oldestReportAt;
}

// Listar perfis denunciados (somente admin, garantido pelas regras do Firestore)
export async function listReportedProfiles(): Promise<ReportedProfile[]> {
    const snap = await getDocs(reportsRef);
    const profiles = await Promise.all(
        groupReports(snap.docs, 'professionalUid', 'professionalName').map(async (group) => ({
            professionalUid: group.targetId,
            professionalName: group.targetName,
            reportsCount: group.reportsCount,
            oldestReportAt: group.oldestReportAt,
            portfolio: await getPortfolio(group.targetId),
        }))
    );

    return profiles.sort((a, b) =>
        compareReported({ ...a, exists: !!a.portfolio }, { ...b, exists: !!b.portfolio }));
}

// Listar serviços denunciados (somente admin, garantido pelas regras do Firestore)
export async function listReportedServices(): Promise<ReportedService[]> {
    const snap = await getDocs(serviceReportsRef);
    const services = await Promise.all(
        groupReports(snap.docs, 'serviceId', 'serviceTitle').map(async (group) => ({
            serviceId: group.targetId,
            serviceTitle: group.targetName,
            reportsCount: group.reportsCount,
            oldestReportAt: group.oldestReportAt,
            service: await getServiceById(group.targetId),
        }))
    );

    return services.sort((a, b) =>
        compareReported({ ...a, exists: !!a.service }, { ...b, exists: !!b.service }));
}