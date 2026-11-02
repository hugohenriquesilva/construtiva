import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { auth, db } from "../../firebaseConfig";
import { getPortfolio } from "./portfolioService";
import { validateProposalInput } from "./proposalRules";
export {
  canCreateProposal,
  resolveProposalPortfolioUid,
  validateProposalInput,
} from "./proposalRules";

export type ProposalDate = Date | Timestamp | null;

export type ServiceProposal = {
  id: string;
  serviceId: string;
  professionalUid: string;
  estimatedCents: number;
  description: string;
  createdAt: ProposalDate;
};

function parseProposalDate(value: unknown): ProposalDate {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value;
  if (value instanceof Timestamp) return value;
  return null;
}

function toProposalDocument(
  serviceId: string,
  id: string,
  data: DocumentData,
): ServiceProposal {
  return {
    id,
    serviceId,
    professionalUid:
      typeof data.professionalUid === "string" ? data.professionalUid : "",
    estimatedCents:
      typeof data.estimatedCents === "number" && Number.isFinite(data.estimatedCents)
        ? data.estimatedCents
        : 0,
    description: typeof data.description === "string" ? data.description : "",
    createdAt: parseProposalDate(data.createdAt),
  };
}

export async function getServiceProposals(
  serviceId: string,
): Promise<ServiceProposal[]> {
  const proposalsRef = query(
    collection(db, "services", serviceId, "proposals"),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(proposalsRef);
  return snapshot.docs.map((proposal) =>
    toProposalDocument(serviceId, proposal.id, proposal.data()),
  );
}

export async function getServiceProposal(
  serviceId: string,
  professionalUid: string,
): Promise<ServiceProposal | null> {
  const proposalRef = doc(db, "services", serviceId, "proposals", professionalUid);
  const snapshot = await getDoc(proposalRef);

  return snapshot.exists()
    ? toProposalDocument(serviceId, snapshot.id, snapshot.data())
    : null;
}

export async function saveServiceProposal(
  serviceId: string,
  estimatedCents: number,
  description: string,
): Promise<ServiceProposal> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error("Usuário não autenticado.");
  }

  const normalizedDescription = description.trim();
  const validationError = validateProposalInput(estimatedCents, normalizedDescription);
  if (validationError) {
    throw new Error(validationError);
  }

  const portfolio = await getPortfolio(uid);
  if (!portfolio?.isActive) {
    throw new Error("Ative seu portfólio profissional antes de enviar uma proposta.");
  }

  const serviceRef = doc(db, "services", serviceId);
  const proposalRef = doc(db, "services", serviceId, "proposals", uid);

  const createdProposal = await runTransaction(db, async (transaction) => {
    const serviceSnapshot = await transaction.get(serviceRef);
    if (!serviceSnapshot.exists()) {
      throw new Error("Este serviço não está mais disponível.");
    }

    const serviceData = serviceSnapshot.data();
    if (serviceData.status !== "open") {
      throw new Error("Este serviço não está aberto para propostas.");
    }

    if (serviceData.ownerUid === uid) {
      throw new Error("Você não pode enviar uma proposta para o seu próprio serviço.");
    }

    const proposalSnapshot = await transaction.get(proposalRef);
    if (proposalSnapshot.exists()) {
      throw new Error("Você já enviou uma proposta para este serviço.");
    }

    const proposal = {
      professionalUid: uid,
      estimatedCents,
      description: normalizedDescription,
      createdAt: serverTimestamp(),
    };

    transaction.set(proposalRef, proposal);

    return {
      id: uid,
      serviceId,
      professionalUid: uid,
      estimatedCents,
      description: normalizedDescription,
      createdAt: new Date(),
    } satisfies ServiceProposal;
  });

  return createdProposal;
}
