export type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Home: undefined;
  ForgotPassword: undefined;
  FormularioProfissional: undefined;
  PortfolioProfissional: { hideBackButton?: boolean; professionalUid?: string } | undefined;
  MaisInformacoes: { focusCep?: boolean } | undefined;
  BuscaPortfolio: undefined;
};
