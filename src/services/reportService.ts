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

const reportsRef = collection(db, 'denuncias');

// Id determinístico: cada usuário só consegue denunciar o mesmo perfil uma vez
// (as regras do Firestore bloqueiam regravar um documento existente)
function reportId(professionalUid: string, reporterUid: string): string {
    return `${professionalUid}_${reporterUid}`;
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

// Listar perfis denunciados (somente admin, garantido pelas regras do Firestore).
// A contagem vem dos próprios documentos de denúncia, então sempre bate com o que está gravado.
// Ordem: perfis existentes antes dos excluídos; mais denúncias primeiro; empate pela denúncia mais antiga.
export async function listReportedProfiles(): Promise<ReportedProfile[]> {
    const snap = await getDocs(reportsRef);
    const grouped = new Map<string, Omit<ReportedProfile, 'portfolio'> & { newestReportAt: number }>();

    snap.docs.forEach((d) => {
        const report = d.data() as Report;
        const createdAt = report.createdAt?.toMillis() ?? Date.now();
        const current = grouped.get(report.professionalUid);

        if (!current) {
            grouped.set(report.professionalUid, {
                professionalUid: report.professionalUid,
                professionalName: report.professionalName,
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
            current.professionalName = report.professionalName;
        }
    });

    const profiles = await Promise.all(
        [...grouped.values()].map(async ({ newestReportAt, ...profile }) => ({
            ...profile,
            portfolio: await getPortfolio(profile.professionalUid),
        }))
    );

    return profiles.sort(
        (a, b) =>
            Number(!a.portfolio) - Number(!b.portfolio) ||
            b.reportsCount - a.reportsCount ||
            a.oldestReportAt - b.oldestReportAt
    );
}