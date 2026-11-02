export function validateProposalInput(
  estimatedCents: number,
  description: string,
): string | null {
  if (!Number.isFinite(estimatedCents) || estimatedCents <= 0) {
    return "Informe um valor válido para a proposta.";
  }

  const normalizedDescription = description.trim();
  if (!normalizedDescription) {
    return "Escreva uma descrição para a proposta.";
  }

  return null;
}

export function canCreateProposal(params: {
  currentUserId: string | undefined;
  serviceOwnerUid?: string;
  serviceStatus?: string;
  portfolioActive?: boolean;
  alreadySubmitted?: boolean;
}): boolean {
  const {
    currentUserId,
    serviceOwnerUid,
    serviceStatus,
    portfolioActive,
    alreadySubmitted,
  } = params;

  return !!currentUserId
    && !!serviceOwnerUid
    && currentUserId !== serviceOwnerUid
    && serviceStatus === "open"
    && !!portfolioActive
    && !alreadySubmitted;
}

export function resolveProposalPortfolioUid(params: {
  proposalProfessionalUid?: string;
  isServiceOwner?: boolean;
}): string | null {
  const { proposalProfessionalUid, isServiceOwner = false } = params;
  if (isServiceOwner || !proposalProfessionalUid) {
    return null;
  }

  return proposalProfessionalUid;
}
