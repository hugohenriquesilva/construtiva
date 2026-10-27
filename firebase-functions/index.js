const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// A limpeza é um evento durável do Auth: falhas são repetidas pelo servidor.
exports.cleanupDeletedAccount = functions
  .region('us-central1')
  .runWith({ failurePolicy: true, timeoutSeconds: 540 })
  .auth.user().onDelete(async (user) => {
    const uid = user.uid;

    // Remove curtidas dadas e ajusta os contadores uma única vez, inclusive em retries.
    const likes = await db.collectionGroup('likes').where('uid', '==', uid).get();
    for (const like of likes.docs) {
      const portfolioRef = like.ref.parent.parent;
      if (!portfolioRef || portfolioRef.parent.id !== 'portfolios') continue;
      await db.runTransaction(async (transaction) => {
        const existingLike = await transaction.get(like.ref);
        if (!existingLike.exists) return;
        const portfolio = await transaction.get(portfolioRef);
        transaction.delete(like.ref);
        if (portfolio.exists) {
          transaction.update(portfolioRef, {
            likesCount: Math.max(0, (portfolio.data().likesCount || 0) - 1),
          });
        }
      });
    }

    // recursiveDelete também apaga as curtidas recebidas no próprio portfólio.
    await db.recursiveDelete(db.doc(`portfolios/${uid}`));
    await db.recursiveDelete(db.doc(`users/${uid}`));
    await db.doc(`clientLocations/${uid}`).delete();
    await db.doc(`professionalLocations/${uid}`).delete();

    const bucket = admin.storage().bucket();
    await bucket.deleteFiles({ prefix: `portfolios/${uid}/` });
    await bucket.deleteFiles({ prefix: `profilePhoto/${uid}/` });
  });

exports.deleteAccount = functions.region('us-central1').https.onCall(async (_data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Entre novamente para excluir sua conta.');
  }
  const authTime = context.auth.token.auth_time;
  if (typeof authTime !== 'number' || Date.now() / 1000 - authTime > 300) {
    throw new functions.https.HttpsError('failed-precondition', 'É necessário entrar novamente antes de excluir.');
  }
  // A chamada individual de deleteUser dispara cleanupDeletedAccount.
  await admin.auth().deleteUser(context.auth.uid);
  return { deleted: true };
});
