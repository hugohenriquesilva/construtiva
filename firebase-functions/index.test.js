const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

function load() {
  const deletedUsers = [];
  let cleanupOptions;
  class HttpsError extends Error {
    constructor(code, message) { super(message); this.code = code; }
  }
  const builder = {
    region: () => builder,
    runWith: (options) => { cleanupOptions = options; return builder; },
    auth: { user: () => ({ onDelete: (handler) => handler }) },
    https: { HttpsError, onCall: (handler) => handler },
  };
  const admin = {
    initializeApp() {},
    firestore: () => ({}),
    auth: () => ({ deleteUser: async (uid) => { deletedUsers.push(uid); } }),
  };
  const context = { exports: {}, require: (name) => name === 'firebase-admin' ? admin : builder, Date, Math };
  vm.runInNewContext(readFileSync(`${__dirname}/index.js`, 'utf8'), context);
  return { ...context.exports, deletedUsers, cleanupOptions };
}

test('recusa chamadas sem autenticação', async () => {
  const service = load();
  await assert.rejects(service.deleteAccount({}, {}), { code: 'unauthenticated' });
  assert.deepEqual(service.deletedUsers, []);
});

test('recusa login antigo antes de alterar dados', async () => {
  const service = load();
  await assert.rejects(service.deleteAccount({}, {
    auth: { uid: 'owner', token: { auth_time: Date.now() / 1000 - 600 } },
  }), { code: 'failed-precondition' });
  assert.deepEqual(service.deletedUsers, []);
});

test('usa apenas o UID autenticado, ignorando UID enviado pelo cliente', async () => {
  const service = load();
  await service.deleteAccount({ uid: 'other-user' }, {
    auth: { uid: 'owner', token: { auth_time: Math.floor(Date.now() / 1000) } },
  });
  assert.deepEqual(service.deletedUsers, ['owner']);
});

test('habilita repetição automática da limpeza após falhas', () => {
  const service = load();
  assert.equal(service.cleanupOptions.failurePolicy, true);
});
