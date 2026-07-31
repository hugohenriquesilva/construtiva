export type PortfolioStatus = 'Ativo' | 'Inativo';

export const menuItems: { label: string; action: string; status?: PortfolioStatus }[] = [
    { label: 'Minha senha', action: 'Alteração de senha' },
    { label: 'Meus contatos', action: 'Meus contatos' },
    { label: 'Meu portfólio', action: 'Meu portfólio', status: 'Ativo' },
    { label: 'Nossa política de privacidade', action: 'Política de privacidade' },
    { label: 'Perguntas frequentes', action: 'Perguntas frequentes' },
];