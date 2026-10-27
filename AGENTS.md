# CONSTRUTIVA — Instruções para o Codex

## Projeto

CONSTRUTIVA é um aplicativo mobile que conecta clientes e profissionais da construção civil.

Tecnologias principais:
- React Native
- TypeScript / JavaScript
- Expo / Expo Go
- Firebase
- Firestore
- Realtime Database
- Google Maps API
- Banco NoSQL

O mesmo usuário pode atuar como cliente e profissional.
Não existem contas separadas.

O acesso às funcionalidades profissionais depende de possuir um portfólio profissional ativo.

---

## Regras obrigatórias de desenvolvimento

1. Antes de alterar uma funcionalidade existente, analise sua implementação atual.

2. Trabalhe sobre a arquitetura e os padrões já existentes no projeto.

3. Não crie uma arquitetura paralela ou refatore grandes partes do projeto sem necessidade.

4. Não invente:
   - campos;
   - coleções;
   - documentos;
   - propriedades;
   - funções;
   - telas;
   - regras de negócio;
   - comportamentos;
   - filtros.

5. Não presuma que algo existe. Verifique primeiro no código.

6. Prefira alterações pequenas e localizadas.

7. Não substitua arquivos inteiros quando uma alteração pontual for suficiente.

8. Não modifique arquivos que não sejam necessários para a tarefa atual.

9. Antes de modificar vários arquivos, informe quais precisam ser alterados e por quê.

10. Preserve nomes, padrões, componentes, serviços e estruturas existentes sempre que forem adequados.

11. Ao trabalhar com Firebase/Firestore:
    - analise primeiro como os dados já são salvos;
    - preserve a estrutura existente quando possível;
    - não crie novas coleções ou estruturas sem necessidade;
    - explique qualquer alteração na estrutura dos dados.

12. Ao trabalhar com formulários:
    - verifique os estados existentes;
    - validações;
    - máscaras;
    - componentes reutilizados;
    - fluxo de salvamento.

13. Se encontrar código que contradiga uma regra fornecida pelo usuário, não escolha sozinho qual versão seguir. Informe a divergência antes de alterar.

14. Se faltar uma informação necessária para implementar uma regra de negócio, pergunte antes de decidir.

15. Não implemente funcionalidades futuras durante a tarefa atual.

16. Ao finalizar uma implementação:
    - informe resumidamente o que foi alterado;
    - informe os arquivos alterados;
    - explique como testar no Expo;
    - informe possíveis erros ou pontos que ainda precisam ser verificados.

---

## Portfólio profissional

O portfólio é o que permite ao usuário atuar como profissional.

Dados atualmente definidos para o portfólio:
- foto de perfil;
- status ativo/inativo;
- área de atuação;
- profissão principal;
- até 3 profissões secundárias;
- nome de exibição;
- CNPJ opcional;
- anos de atuação;
- CEP de atuação;
- raio de atuação;
- descrição "Sobre mim";
- até 6 fotos de serviços realizados;
- telefone para WhatsApp.

### Telefone para WhatsApp

Existe um campo chamado:

`Telefone para WhatsApp`

Esse campo pertence ao PORTFÓLIO PROFISSIONAL.

Ele é independente do telefone geral cadastrado na conta do usuário.

Conceitualmente:

USUÁRIO
├── telefone geral
└── PORTFÓLIO
    └── telefone para WhatsApp

Nunca assumir que os dois telefones possuem o mesmo valor.

O telefone do WhatsApp será utilizado para contato entre cliente e profissional.

Antes de implementar links ou integração com WhatsApp, verificar a implementação existente.

---

## Orçamentos

Um profissional poderá enviar orçamento/lance para um serviço publicado.

Campos atualmente definidos:
- valor estimado;
- descrição da proposta.

Não adicionar outros campos sem autorização.

Pré-condições:
- usuário autenticado;
- portfólio profissional ativo;
- serviço publicado e disponível.

Essa funcionalidade NÃO deve ser implementada enquanto a tarefa atual for apenas o telefone para WhatsApp.

---

## Busca de serviços

A busca de serviços será destinada ao profissional.

Os filtros ainda NÃO estão definidos.

Nunca criar filtros por conta própria.

---

## Localização

O projeto trabalha com:
- CEP;
- localização;
- distância;
- Google Maps API;
- GeoHash em partes da implementação/estudo.

Não alterar a estratégia de localização sem analisar a implementação existente.

---

## Forma de trabalho

Para novas tarefas, seguir preferencialmente:

ANALISAR
→ identificar arquivos envolvidos
→ entender implementação atual
→ informar alterações necessárias
→ aguardar autorização quando solicitado
→ implementar somente o necessário
→ testar/verificar
→ resumir alterações

Priorizar precisão e alterações mínimas em vez de grandes refatorações.