import { describe, expect, it } from "vitest";

import { getProfessionalSearchFeedback } from "../src/utils/professionalSearchFeedback";

describe("professional search feedback", () => {
  it("uses the friendly no-results copy when a completed search has no server message", () => {
    expect(getProfessionalSearchFeedback(null)).toEqual({
      kind: "empty",
      title: "Nenhum profissional encontrado!",
      description:
        "Não encontramos profissionais para esta busca. Tente pesquisar por outra profissão.",
    });
  });

  it("preserves location-specific guidance only when the response identifies the location", () => {
    expect(getProfessionalSearchFeedback(
      "Não foram encontrados profissionais para esta localização",
    )).toEqual({
      kind: "empty",
      title: "Nenhum profissional encontrado!",
      description:
        "Não encontramos profissionais para esta localização. Tente pesquisar por outra profissão.",
    });
  });

  it("keeps request failures distinct from empty search results", () => {
    expect(getProfessionalSearchFeedback(
      "Não foi possível buscar profissionais. Tente novamente.",
    )).toEqual({
      kind: "message",
      message: "Não foi possível buscar profissionais. Tente novamente.",
    });
  });

  it("preserves the message for a missing CEP instead of presenting it as no results", () => {
    expect(getProfessionalSearchFeedback(
      "Cadastre seu CEP para encontrar profissionais próximos a você.",
    )).toEqual({
      kind: "message",
      message: "Cadastre seu CEP para encontrar profissionais próximos a você.",
    });
  });
});
