import { describe, expect, it, vi } from "vitest";

import {
  canCreateProposal,
  resolveProposalPortfolioUid,
  validateProposalInput,
} from "../src/services/proposalRules";
import { validateProposalInput as validateServiceProposalInput } from "../src/services/proposalService";

vi.mock("../firebaseConfig", () => ({
  auth: { currentUser: null },
  db: {},
}));

vi.mock("../src/services/portfolioService", () => ({
  getPortfolio: vi.fn(),
}));

describe("proposal validation", () => {
  it("rejects invalid value and empty description", () => {
    expect(validateProposalInput(0, "Descrição")).toBe("Informe um valor válido para a proposta.");
    expect(validateProposalInput(2500, "   ")).toBe("Escreva uma descrição para a proposta.");
    expect(validateProposalInput(2500, "  Orçamento válido  ")).toBeNull();
  });

  it("exports the validator through proposalService", () => {
    expect(validateServiceProposalInput(0, "Descrição")).toBe(
      "Informe um valor válido para a proposta.",
    );
    expect(validateServiceProposalInput(2500, "Descrição válida")).toBeNull();
  });

  it("allows only eligible professionals to create a proposal", () => {
    expect(canCreateProposal({
      currentUserId: "professional-1",
      serviceOwnerUid: "client-1",
      serviceStatus: "open",
      portfolioActive: true,
      alreadySubmitted: false,
    })).toBe(true);

    expect(canCreateProposal({
      currentUserId: "professional-1",
      serviceOwnerUid: "professional-1",
      serviceStatus: "open",
      portfolioActive: true,
      alreadySubmitted: false,
    })).toBe(false);

    expect(canCreateProposal({
      currentUserId: "professional-1",
      serviceOwnerUid: "client-1",
      serviceStatus: "closed",
      portfolioActive: true,
      alreadySubmitted: false,
    })).toBe(false);

    expect(canCreateProposal({
      currentUserId: "professional-1",
      serviceOwnerUid: "client-1",
      serviceStatus: "open",
      portfolioActive: false,
      alreadySubmitted: false,
    })).toBe(false);

    expect(canCreateProposal({
      currentUserId: "professional-1",
      serviceOwnerUid: "client-1",
      serviceStatus: "open",
      portfolioActive: true,
      alreadySubmitted: true,
    })).toBe(false);
  });

  it("uses the professional uid as portfolio destination for proposal cards", () => {
    expect(resolveProposalPortfolioUid({
      proposalProfessionalUid: "professional-2",
      isServiceOwner: false,
    })).toBe("professional-2");

    expect(resolveProposalPortfolioUid({
      proposalProfessionalUid: "professional-2",
      isServiceOwner: true,
    })).toBeNull();

    expect(resolveProposalPortfolioUid({
      proposalProfessionalUid: undefined,
      isServiceOwner: false,
    })).toBeNull();
  });
});
