# Exclusão de conta

A tela chama `deleteAccount` com o usuário autenticado. A função exige autenticação de até 5 minutos e exclui o usuário do Firebase Authentication. O evento `cleanupDeletedAccount` remove os dados de forma assíncrona, com repetição automática em caso de falha. Nenhuma conta real é excluída durante os testes locais.

A limpeza cobre os caminhos usados hoje no aplicativo: `users/{uid}`, `portfolios/{uid}` (incluindo subcoleções), `clientLocations/{uid}`, `professionalLocations/{uid}`, curtidas dadas em outros portfólios com ajuste dos contadores e arquivos em `portfolios/{uid}/` e `profilePhoto/{uid}/` no Storage.

## Publicação necessária antes do uso

Essas funções ainda precisam ser publicadas no projeto Firebase. Antes disso, a tela mostra erro e não exclui a conta. É necessário ter Firebase CLI, acesso ao projeto e faturamento compatível com Cloud Functions.

1. Instale as dependências: `npm --prefix firebase-functions install`.
2. Confira o projeto e os índices existentes no console. A configuração de índices fornecida inclui apenas o índice de grupo de coleção `likes.uid`; incorpore-o à configuração existente para evitar remover outros índices. Crie esse índice e aguarde ficar pronto.
3. Publique somente as novas funções:

   ```sh
   firebase deploy --config firebase.account-deletion.json --project construtiva-c292f --only functions:account-deletion
   ```

Não use deploy geral: há uma função de busca existente cujo código não está neste repositório. O codebase separado preserva as outras funções.

Valide com uma conta de teste: cancelamento, senha errada, exclusão de cliente, exclusão de profissional com fotos/curtidas, sessão Google antiga e falha de conexão. Confira os dados no console depois da limpeza. Monitore falhas da função de limpeza: Firebase Auth, Firestore e Storage não participam de uma única transação.

Contas Google devem entrar novamente com Google caso a autenticação tenha mais de cinco minutos. O aplicativo não pede senha para esse provedor.
