import type { FaqIconName } from "./faq";

export type LegalItem = {
    icon: FaqIconName;
    title: string;
    text: string;
};

export const PRIVACY_ITEMS: LegalItem[] = [
    {
        icon: "lock-outline",
        title: "Dados coletados",
        text: "Podemos tratar dados como nome, CPF, e-mail, telefone, CEP, informações profissionais, fotografias e conteúdos publicados pelo usuário.",
    },
    {
        icon: "target",
        title: "Finalidade dos dados",
        text: "As informações são utilizadas para acesso à conta, criação de portfólios, publicação de serviços, envio de orçamentos e comunicação entre clientes e profissionais.",
    },
    {
        icon: "map-marker-outline",
        title: "Localização",
        text: "O CEP informado é utilizado para identificar a região do usuário e auxiliar na exibição de profissionais e serviços conforme a proximidade geográfica.",
    },
    {
        icon: "account-group-outline",
        title: "Compartilhamento",
        text: "Determinadas informações cadastradas em portfólios e serviços podem ser visualizadas por outros usuários da plataforma.",
    },
    {
        icon: "shield-check-outline",
        title: "Direitos do usuário",
        text: "O usuário pode solicitar acesso, correção e exclusão de dados, nos termos da LGPD e das condições aplicáveis.",
    },
];

export const TERMS_NOTICE = {
    title: "A Construtiva não se responsabiliza por acordos, negociações, pagamentos, execuções de serviços ou problemas decorrentes de serviços fechados fora da plataforma.",
    text: "O usuário é responsável por avaliar o profissional e combinar diretamente as condições do serviço.",
};

export const TERMS_ITEMS: LegalItem[] = [
    {
        icon: "hard-hat",
        title: "Finalidade da plataforma",
        text: "A Construtiva é uma plataforma que conecta clientes e profissionais da construção civil, facilitando a busca, o contato e a contratação de serviços.",
    },
    {
        icon: "account-outline",
        title: "Informações no cadastro",
        text: "O usuário deve fornecer informações verdadeiras, completas e atualizadas no momento do cadastro.",
    },
    {
        icon: "file-document-outline",
        title: "Conteúdo publicado",
        text: "O usuário é o único responsável pelo conteúdo que publicar na plataforma, como perfis, portfólios, descrições, fotos e demais informações.",
    },
    {
        icon: "flag-outline",
        title: "Moderação e denúncias",
        text: "A Construtiva pode moderar, analisar denúncias e excluir conteúdos ou perfis que violem estes termos, a legislação aplicável ou as regras da comunidade.",
    },
    {
        icon: "whatsapp",
        title: "Contato externo",
        text: "O contato entre cliente e profissional pode ocorrer por WhatsApp, sendo as negociações, combinações e acordos realizados diretamente entre as partes, sob sua exclusiva responsabilidade.",
    },
    {
        icon: "layers-outline",
        title: "Papel da plataforma",
        text: "A Construtiva atua apenas como intermediadora de conexão entre clientes e profissionais, não executa serviços, não participa das negociações e não garante a realização, a qualidade ou o resultado dos serviços.",
    },
    {
        icon: "check-decagram-outline",
        title: "Concordância",
        text: "A utilização contínua do aplicativo implica a concordância integral com estes Termos de uso.",
    },
];