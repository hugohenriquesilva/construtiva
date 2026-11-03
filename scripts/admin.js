/* global __dirname */
// Scripts administrativos do Construtiva (Firebase Admin SDK).
// O Admin SDK ignora as regras do Firestore, por isso é o único caminho para tornar alguém admin.
//
// Preparação (uma vez):
//   1. Console do Firebase > Configurações do projeto > Contas de serviço > Gerar nova chave privada
//   2. Salve o arquivo como scripts/serviceAccountKey.json (já está no .gitignore — nunca faça commit dele)
//   3. cd scripts && npm install
//
// Uso:
//   node admin.js set-admin <uid>     torna o usuário admin
//   node admin.js seed                grava as profissões iniciais
//   node admin.js migrate [--dry-run] migra usuários (role) e portfólios (ids de profissão, remove "area")
//   node admin.js merge <ORIGEM> <DESTINO> [--dry-run]
//                                     troca ORIGEM por DESTINO em todos os portfólios e exclui ORIGEM
//   node admin.js geocode-services [--dry-run]
//                                     grava latitude/longitude nos serviços que ainda não têm

const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const MAX_SECONDARY_PROFESSIONS = 3;

const INITIAL_PROFESSIONS = [
  'ELETRICISTA',
  'ENCANADOR',
  'PEDREIRO',
  'PINTOR',
  'MARCENEIRO',
  'GESSEIRO',
];

initializeApp({
  credential: cert(require(path.join(__dirname, 'serviceAccountKey.json'))),
});
const db = getFirestore();

// Mesmas regras de src/services/professionService.ts
function normalizeProfessionName(name) {
  return name.trim().toUpperCase();
}

function professionDuplicateKey(name) {
  return normalizeProfessionName(name).normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Carrega as profissões existentes indexadas pela chave sem acentos
async function loadProfessionIndex() {
  const snap = await db.collection('professions').get();
  const index = new Map();
  snap.forEach((d) => index.set(d.data().normalizedName, d.id));
  return index;
}

// Retorna o id da profissão, criando-a se ainda não existir
async function ensureProfession(index, rawName, dryRun) {
  const name = normalizeProfessionName(rawName);
  if (!name) return null;

  const key = professionDuplicateKey(name);
  if (index.has(key)) return index.get(key);

  if (dryRun) {
    const fakeId = `<nova:${name}>`;
    index.set(key, fakeId);
    console.log(`  + profissão seria criada: ${name}`);
    return fakeId;
  }

  const now = new Date().toISOString();
  const ref = await db.collection('professions').add({
    name,
    normalizedName: key,
    createdAt: now,
    updatedAt: now,
  });
  index.set(key, ref.id);
  console.log(`  + profissão criada: ${name} (${ref.id})`);
  return ref.id;
}

async function setAdmin(uid) {
  if (!uid) throw new Error('Informe o uid: node admin.js set-admin <uid>');

  const ref = db.collection('users').doc(uid);
  const snap = await ref.get();
  if (!snap.exists) throw new Error(`Usuário ${uid} não encontrado em "users"`);

  await ref.update({ role: 'admin' });
  console.log(`Usuário ${uid} (${snap.data().email ?? 'sem email'}) agora é admin.`);
}

async function seed() {
  const index = await loadProfessionIndex();
  for (const name of INITIAL_PROFESSIONS) {
    await ensureProfession(index, name, false);
  }
  console.log(`Seed concluído. Total de profissões: ${index.size}`);
}

async function migratePortfolios(index, dryRun) {
  const snap = await db.collection('portfolios').get();
  const portfolioUids = new Set();
  const truncated = [];
  const withoutMain = [];

  for (const docSnap of snap.docs) {
    portfolioUids.add(docSnap.id);
    const data = docSnap.data();
    const hasLegacyFields =
      'area' in data || 'mainProfession' in data || 'secondaryProfessions' in data;
    if (!hasLegacyFields) continue;

    console.log(`Portfólio ${docSnap.id}:`);

    const mainProfessionId =
      data.mainProfessionId ??
      (data.mainProfession ? await ensureProfession(index, data.mainProfession, dryRun) : null);
    if (!mainProfessionId) withoutMain.push(docSnap.id);

    let secondaryIds = data.secondaryProfessionIds ?? [];
    if (!data.secondaryProfessionIds && Array.isArray(data.secondaryProfessions)) {
      for (const name of data.secondaryProfessions) {
        const id = await ensureProfession(index, name, dryRun);
        if (id) secondaryIds.push(id);
      }
    }
    // Sem repetição e sem repetir a principal
    secondaryIds = [...new Set(secondaryIds)].filter((id) => id !== mainProfessionId);
    if (secondaryIds.length > MAX_SECONDARY_PROFESSIONS) {
      truncated.push(`${docSnap.id} (${secondaryIds.length} -> ${MAX_SECONDARY_PROFESSIONS})`);
      secondaryIds = secondaryIds.slice(0, MAX_SECONDARY_PROFESSIONS);
    }

    const update = {
      mainProfessionId,
      secondaryProfessionIds: secondaryIds,
      area: FieldValue.delete(),
      mainProfession: FieldValue.delete(),
      secondaryProfessions: FieldValue.delete(),
    };
    console.log(`  principal: ${mainProfessionId} | secundárias: [${secondaryIds.join(', ')}]`);
    if (!dryRun) await docSnap.ref.update(update);
  }

  if (truncated.length) {
    console.log(`\nPortfólios com secundárias cortadas para ${MAX_SECONDARY_PROFESSIONS}:`);
    truncated.forEach((t) => console.log(`  - ${t}`));
  }
  if (withoutMain.length) {
    console.log('\nPortfólios sem profissão principal (o dono precisará escolher uma ao editar):');
    withoutMain.forEach((uid) => console.log(`  - ${uid}`));
  }

  return portfolioUids;
}

async function migrateUserRoles(portfolioUids, dryRun) {
  const snap = await db.collection('users').get();
  let changed = 0;

  for (const docSnap of snap.docs) {
    const currentRole = docSnap.data().role;
    if (currentRole === 'admin') continue;

    const role = portfolioUids.has(docSnap.id) ? 'professional' : 'client';
    if (currentRole === role) continue;

    console.log(`Usuário ${docSnap.id}: ${currentRole ?? '(sem role)'} -> ${role}`);
    if (!dryRun) await docSnap.ref.update({ role });
    changed++;
  }

  console.log(`\nRoles ${dryRun ? 'a alterar' : 'alteradas'}: ${changed} de ${snap.size} usuários.`);
}

async function migrate(dryRun) {
  console.log(dryRun ? '=== SIMULAÇÃO (nada será gravado) ===\n' : '=== MIGRAÇÃO ===\n');
  const index = await loadProfessionIndex();
  const portfolioUids = await migratePortfolios(index, dryRun);
  console.log('');
  await migrateUserRoles(portfolioUids, dryRun);
}

// Funde duas profissões duplicadas: os portfólios passam a apontar para o destino e a origem é excluída
async function mergeProfessions(fromName, toName, dryRun) {
  if (!fromName || !toName) throw new Error('Uso: node admin.js merge <ORIGEM> <DESTINO> [--dry-run]');
  console.log(dryRun ? '=== SIMULAÇÃO (nada será gravado) ===' : '=== FUSÃO ===');

  const index = await loadProfessionIndex();
  const fromId = index.get(professionDuplicateKey(fromName));
  const toId = index.get(professionDuplicateKey(toName));
  if (!fromId) throw new Error(`Profissão de origem não encontrada: ${fromName}`);
  if (!toId) throw new Error(`Profissão de destino não encontrada: ${toName}`);
  if (fromId === toId) throw new Error('Origem e destino são a mesma profissão');

  console.log(`${normalizeProfessionName(fromName)} (${fromId}) -> ${normalizeProfessionName(toName)} (${toId})\n`);

  const portfolios = db.collection('portfolios');
  const [asMain, asSecondary] = await Promise.all([
    portfolios.where('mainProfessionId', '==', fromId).get(),
    portfolios.where('secondaryProfessionIds', 'array-contains', fromId).get(),
  ]);
  const affected = new Map();
  [...asMain.docs, ...asSecondary.docs].forEach((d) => affected.set(d.id, d));

  for (const docSnap of affected.values()) {
    const data = docSnap.data();
    const mainProfessionId = data.mainProfessionId === fromId ? toId : data.mainProfessionId;
    // Sem repetição e sem repetir a principal (ex.: principal ELETRICISTA + secundária ELÉTRICA)
    const secondaryProfessionIds = [
      ...new Set((data.secondaryProfessionIds ?? []).map((id) => (id === fromId ? toId : id))),
    ].filter((id) => id !== mainProfessionId);

    console.log(`Portfólio ${docSnap.id}:`);
    console.log(`  principal: ${data.mainProfessionId} -> ${mainProfessionId}`);
    console.log(`  secundárias: [${(data.secondaryProfessionIds ?? []).join(', ')}] -> [${secondaryProfessionIds.join(', ')}]`);
    if (!dryRun) await docSnap.ref.update({ mainProfessionId, secondaryProfessionIds });
  }

  console.log(`\nPortfólios ${dryRun ? 'a alterar' : 'alterados'}: ${affected.size}`);
  if (!dryRun) await db.collection('professions').doc(fromId).delete();
  console.log(`Profissão ${normalizeProfessionName(fromName)} ${dryRun ? 'seria excluída' : 'excluída'}.\n`);
}

// Mesma geocodificação de src/services/serviceService.ts (viaCEP + Nominatim)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function searchNominatim(fields) {
  const params = new URLSearchParams({
    format: 'json',
    limit: '1',
    countrycodes: 'br',
    country: 'Brasil',
    ...fields,
  });
  // A política de uso do Nominatim permite no máximo 1 requisição por segundo
  await sleep(1100);
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'User-Agent': 'ConstrutivaApp/1.0 (scripts/admin.js)' },
  });
  if (!response.ok) throw new Error(`Nominatim respondeu ${response.status}`);

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const latitude = parseFloat(data[0].lat);
  const longitude = parseFloat(data[0].lon);
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
}

async function geocodeCep(cep) {
  const digits = String(cep ?? '').replace(/\D/g, '');
  if (digits.length !== 8) return null;

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  const address = await response.json();
  if (address.erro) return null;

  const city = address.localidade || '';
  if (address.logradouro && city) {
    const result = await searchNominatim({ street: address.logradouro, city });
    if (result) return result;
  }
  return searchNominatim({ postalcode: `${digits.slice(0, 5)}-${digits.slice(5)}` });
}

function hasCoordinates(data) {
  return Number.isFinite(data.latitude) && Math.abs(data.latitude) <= 90
    && Number.isFinite(data.longitude) && Math.abs(data.longitude) <= 180;
}

// Serviços publicados antes de a busca por distância existir não têm coordenadas
async function geocodeServices(dryRun) {
  const snap = await db.collection('services').get();
  const pending = snap.docs.filter((d) => !hasCoordinates(d.data()));
  console.log(`${snap.size} serviço(s); ${pending.length} sem coordenadas.`);

  let updated = 0;
  const failed = [];
  for (const serviceDoc of pending) {
    const { cep, title } = serviceDoc.data();
    try {
      const coordinates = await geocodeCep(cep);
      if (!coordinates) {
        failed.push(`${serviceDoc.id} (CEP ${cep ?? 'ausente'}): endereço não localizado`);
        continue;
      }
      if (!dryRun) await serviceDoc.ref.update(coordinates);
      updated += 1;
      console.log(`  ${dryRun ? 'seria atualizado' : 'atualizado'}: ${serviceDoc.id} "${title ?? ''}" -> ${coordinates.latitude}, ${coordinates.longitude}`);
    } catch (error) {
      failed.push(`${serviceDoc.id} (CEP ${cep ?? 'ausente'}): ${error.message}`);
    }
  }

  console.log(`${dryRun ? 'Seriam atualizados' : 'Atualizados'}: ${updated}. Sem localização: ${failed.length}.`);
  failed.forEach((line) => console.log(`  ! ${line}`));
}


async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (command === 'set-admin') return setAdmin(args[0]);
  if (command === 'seed') return seed();
  if (command === 'migrate') return migrate(args.includes('--dry-run'));
  if (command === 'merge') {
    const [fromName, toName] = args.filter((a) => a !== '--dry-run');
    return mergeProfessions(fromName, toName, args.includes('--dry-run'));
  }
  if (command === 'geocode-services') return geocodeServices(args.includes('--dry-run'));

  console.log('Comandos: set-admin <uid> | seed | migrate [--dry-run] | merge <ORIGEM> <DESTINO> [--dry-run] | geocode-services [--dry-run]');
}

main().catch((error) => {
  console.error('Erro:', error.message);
  process.exitCode = 1;
});
