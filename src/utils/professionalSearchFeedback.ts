export type ProfessionalSearchFeedback =
  | { kind: "empty"; title: string; description: string }
  | { kind: "message"; message: string };

export function getProfessionalSearchFeedback(
  message: string | null,
): ProfessionalSearchFeedback {
  const normalizedMessage = message?.toLocaleLowerCase("pt-BR") ?? "";

  if (
    normalizedMessage.includes("não foi possível")
    || normalizedMessage.includes("nao foi possivel")
  ) {
    return {
      kind: "message",
      message: message ?? "Não foi possível concluir a busca. Tente novamente.",
    };
  }

  if (normalizedMessage.startsWith("cadastre seu cep")) {
    return { kind: "message", message: message ?? "" };
  }

  if (
    /não foram encontrados profissionais.*(localização|localizacao|location)/.test(normalizedMessage)
    || /nenhum profissional encontrado.*(localização|localizacao|location)/.test(normalizedMessage)
  ) {
    return {
      kind: "empty",
      title: "Nenhum profissional encontrado!",
      description:
        "Não encontramos profissionais para esta localização. Tente pesquisar por outra profissão.",
    };
  }

  return {
    kind: "empty",
    title: "Nenhum profissional encontrado!",
    description:
      "Não encontramos profissionais para esta busca. Tente pesquisar por outra profissão.",
  };
}
