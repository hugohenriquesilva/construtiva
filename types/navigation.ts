export type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Home: undefined;
  ForgotPassword: undefined;
  FormularioProfissional: undefined;
  PortfolioProfissional: { hideBackButton?: boolean; professionalUid?: string } | undefined;
  MaisInformacoes: { focusCep?: boolean } | undefined;
  BuscaPortfolio: undefined;
  Adicionar: undefined;
  EdicaoProfissoes: undefined;
  CadastrarServico: undefined;
  MeusServicos: undefined;
  BuscaServicos: undefined;
  DetalhesServico: { serviceId: string };
  Denuncias: undefined;
  PerguntasFrequentes: { topicId?: string } | undefined;
  PrivacidadeTermos: { tab?: "privacy" | "terms" } | undefined;
};
