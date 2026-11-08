import type { ComponentProps } from "react";
import type { MaterialCommunityIcons } from "@expo/vector-icons";

export type FaqIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export type FaqQuestion = {
    question: string;
    answer: string;
};

export type FaqTopic = {
    id: string;
    title: string;
    description: string;
    icon: FaqIconName;
    questions: FaqQuestion[];
};

export const FAQ_TOPICS: FaqTopic[] = [
    {
        id: "conta",
        title: "Primeiros passos e minha conta",
        description: "Dúvidas sobre o app, cadastro e perfil.",
        icon: "account-outline",
        questions: [
            {
                question: "O que é o Construtiva?",
                answer: "É um aplicativo que conecta clientes a profissionais da construção civil. Você pode encontrar profissionais, publicar serviços e receber orçamentos. Com um portfólio ativo, também pode oferecer seus serviços.",
            },
            {
                question: "Preciso de contas diferentes para ser cliente e profissional?",
                answer: "Não. A mesma conta funciona para os dois. Para atuar como profissional, basta criar e ativar seu portfólio em Adicionar > Meu portfólio.",
            },
            {
                question: "Como edito meu nome, foto e CEP?",
                answer: "Acesse Outras informações e toque em Editar perfil (ou no cartão com seu nome). Lá você altera nome, foto e o CEP residencial.",
            },
            {
                question: "Para que serve o CEP do meu perfil?",
                answer: "Ele é usado para mostrar os profissionais mais próximos de você na busca e na tela de início.",
            },
            {
                question: "Como altero minha senha?",
                answer: "Acesse Outras informações > Minha senha.",
            },
            {
                question: "Como excluo minha conta?",
                answer: "Acesse Outras informações > Excluir conta. A exclusão remove seu perfil, portfólio e dados associados e não pode ser desfeita.",
            },
        ],
    },
    {
        id: "profissionais",
        title: "Encontrando e contratando profissionais",
        description: "Como buscar, curtir e entrar em contato.",
        icon: "magnify",
        questions: [
            {
                question: "Como encontro um profissional?",
                answer: "Na aba de busca de profissionais, digite a profissão desejada e escolha uma opção da lista. Os profissionais mais próximos do seu CEP aparecem primeiro.",
            },
            {
                question: "Por que a busca pede meu CEP?",
                answer: "Os resultados são organizados por proximidade. Sem o CEP, não é possível saber quais profissionais atendem a sua região.",
            },
            {
                question: "Como entro em contato com um profissional?",
                answer: "Abra o perfil do profissional e toque no botão de contato pelo WhatsApp. Outra opção é publicar um serviço e receber orçamentos dos profissionais interessados.",
            },
            {
                question: "O que significa o selo “Com CNPJ”?",
                answer: "Indica que o profissional informou um CNPJ no portfólio.",
            },
            {
                question: "Como funcionam as curtidas?",
                answer: "Toque no coração do perfil para curtir um profissional. Os profissionais mais curtidos aparecem em destaque na tela de início.",
            },
        ],
    },
    {
        id: "portfolio",
        title: "Meu portfólio profissional",
        description: "Como cadastrar, editar e divulgar seu trabalho.",
        icon: "hard-hat",
        questions: [
            {
                question: "Como crio meu portfólio?",
                answer: "Acesse Adicionar > Meu portfólio e preencha foto, profissão principal, nome de exibição, tempo de experiência, CEP de atuação, raio de atuação e o texto “Sobre mim”. Você também pode adicionar fotos de trabalhos realizados.",
            },
            {
                question: "Quantas profissões posso cadastrar?",
                answer: "Uma profissão principal e até três profissões secundárias.",
            },
            {
                question: "Quantas fotos de trabalhos posso adicionar?",
                answer: "Até seis fotos de serviços realizados.",
            },
            {
                question: "Para que serve o raio de atuação?",
                answer: "Ele define até que distância do seu CEP de atuação os serviços aparecem na sua busca personalizada.",
            },
            {
                question: "Como edito meu portfólio?",
                answer: "Toque no lápis ao lado de Meu portfólio na tela Adicionar, ou abra seu portfólio e toque em Editar meu portfólio.",
            },
            {
                question: "O que acontece se eu desativar o portfólio?",
                answer: "Seu perfil deixa de aparecer para os clientes e você não consegue buscar serviços nem enviar orçamentos até ativá-lo novamente.",
            },
        ],
    },
    {
        id: "servicos",
        title: "Serviços e orçamentos",
        description: "Publicação de serviços e envio de orçamentos.",
        icon: "clipboard-text-outline",
        questions: [
            {
                question: "Como publico um serviço?",
                answer: "Acesse Adicionar > Cadastrar serviço e informe título, profissão, áreas, descrição, CEP, prazo e até cinco fotos.",
            },
            {
                question: "Por que minha descrição foi alterada ou recusada?",
                answer: "Toda descrição passa por uma revisão automática antes da publicação. Ela pode melhorar o texto para ficar mais claro ou recusar conteúdos que não seguem as diretrizes do aplicativo.",
            },
            {
                question: "Onde acompanho meus serviços e os orçamentos recebidos?",
                answer: "Em Outras informações > Meus serviços. Abra um serviço para ver as propostas recebidas.",
            },
            {
                question: "Como envio um orçamento?",
                answer: "Com o portfólio ativo, acesse Buscar serviços, abra o serviço e toque em Enviar proposta, informando valor e descrição. É possível enviar uma proposta por serviço.",
            },
            {
                question: "Quais serviços aparecem na minha busca?",
                answer: "Por padrão, os serviços das suas profissões dentro do seu raio de atuação. Ative “Exibir todos os serviços” para ver todas as profissões, do mais próximo ao mais distante.",
            },
            {
                question: "Outros profissionais veem o meu orçamento?",
                answer: "Não. Só você e o cliente que publicou o serviço têm acesso à sua proposta.",
            },
            {
                question: "Como encerro um serviço?",
                answer: "Abra o serviço em Meus serviços e toque em Encerrar serviço. Ele deixa de aparecer na busca e para de receber propostas.",
            },
        ],
    },
    {
        id: "seguranca",
        title: "Segurança e gerenciamento",
        description: "Privacidade, denúncias e encerramento de serviços.",
        icon: "shield-check-outline",
        questions: [
            {
                question: "Como denuncio um perfil ou serviço?",
                answer: "Toque na bandeira ao lado do nome do profissional ou do título do serviço e confirme. Cada pessoa pode denunciar o mesmo perfil ou serviço uma vez.",
            },
            {
                question: "Quem vê a minha denúncia?",
                answer: "Somente a equipe de administração do Construtiva. A pessoa denunciada não sabe quem fez a denúncia.",
            },
            {
                question: "O que acontece depois de uma denúncia?",
                answer: "A equipe analisa o conteúdo. Perfis e serviços que violem os Termos de uso podem ser excluídos.",
            },
            {
                question: "Quais dados meus ficam visíveis para outras pessoas?",
                answer: "Nome, foto, informações do portfólio e serviços publicados. CPF, e-mail e telefone da conta não são exibidos. O WhatsApp só aparece se você o informar no portfólio.",
            },
            {
                question: "O Construtiva intermedia pagamentos?",
                answer: "Não. Valores, pagamentos e a execução do serviço são combinados diretamente entre cliente e profissional. Consulte os Termos de uso para mais detalhes.",
            },
        ],
    },
];