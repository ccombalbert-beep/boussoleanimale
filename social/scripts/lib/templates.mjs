// Gabarits de copywriting par pilier. Chaque fonction reçoit les données
// brutes d'une fiche (cf. content-source.mjs) et rend 3 variantes de hook +
// une légende + un CTA. Aucun appel réseau, aucune dépendance à une clé API :
// tout est déterministe et gratuit, pour que le pipeline tourne offline.
import { listHashtagSeeds } from './content-source.mjs';

const CTA_LIEN_BIO = "Fiche complète (santé, budget, mythes) : lien en bio.";
const CTA_CALCULATEUR = "Calcule le budget réel de ta situation : lien en bio.";
const MARQUE_TAG = 'boussoleanimale';

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function hashtagsFor(pillar, data) {
  const seeds = listHashtagSeeds(null, data);
  const intention = {
    1: 'racesdechien',
    2: 'mythesanimaliers',
    3: 'conseilanimal',
    4: 'naturaliste',
    5: 'saviezvous',
  }[pillar] ?? 'animaux';
  const reach = data.espece === 'chat' ? 'chatdecompagnie' : data.espece === 'chien' ? 'chiendecompagnie' : 'animaldecompagnie';
  return [...new Set([MARQUE_TAG, reach, ...seeds, intention, 'futuradoptant'])].slice(0, 10);
}

// --- Pilier 1 : Portrait de race ------------------------------------------
function pillar1(data) {
  const nom = data.nom;
  const hooks = [
    `${nom} : ce qu'on ne te dit pas avant d'en adopter un`,
    `Tu crois connaître le ${nom} ? Regarde ça.`,
    `${capitalize(data.resume.split('—')[0]?.trim() || data.resume)}`,
  ];
  const caption = [
    data.resume,
    '',
    `📏 ${data.taille?.min}-${data.taille?.max} cm  ⚖️ ${data.poids?.min}-${data.poids?.max} kg  ❤️ ${data.esperanceDeVie?.min}-${data.esperanceDeVie?.max} ans`,
    '',
    CTA_LIEN_BIO,
  ].join('\n');
  return { hooks, caption };
}

// --- Pilier 2 : Mythe vs Réalité -------------------------------------------
function pillar2(data, { mytheIndex = 0 } = {}) {
  const m = data.mythes?.[mytheIndex];
  if (!m) throw new Error(`Pas de mythe à l'index ${mytheIndex} pour ${data.nom}`);
  const hooks = [
    `"${m.mythe}"`,
    `Le mythe le plus répandu sur le ${data.nom}, en une phrase :`,
    `Faux. Complètement faux.`,
  ];
  const caption = [
    `❌ Idée reçue : ${m.mythe}`,
    '',
    `✅ La réalité : ${m.realite}`,
    '',
    CTA_LIEN_BIO,
  ].join('\n');
  return { hooks, caption };
}

// --- Pilier 3 : Dans les chiffres ------------------------------------------
function pillar3(data) {
  const hooks = [
    data.titreCourt ?? data.titre ?? `Ce que révèlent vraiment les chiffres`,
    `On a comparé les vraies données. Le résultat surprend.`,
    `Le chiffre que personne ne regarde avant d'adopter`,
  ];
  const caption = [
    data.resume,
    '',
    CTA_CALCULATEUR,
  ].join('\n');
  return { hooks, caption };
}

// --- Pilier 4 : Cabinet Naturaliste -----------------------------------------
function pillar4(data) {
  const hooks = [
    `Planche naturaliste — ${data.nom}`,
    `${data.nom}.`,
  ];
  const caption = [
    `${data.nom} — ${data.origine ?? ''}`.trim(),
    '',
    `📸 ${data.imageCredit?.auteur ?? 'source Wikimedia Commons'}`,
  ].join('\n');
  return { hooks, caption };
}

// --- Pilier 5 : Le saviez-vous (FAQ éclair) ---------------------------------
function pillar5(data, { faqIndex = 0 } = {}) {
  const qa = data.faq?.[faqIndex];
  if (!qa) throw new Error(`Pas de FAQ à l'index ${faqIndex} pour ${data.nom}`);
  const hooks = [
    qa.question,
    `On te pose la question. Tu réponds quoi ?`,
    `La question qu'on nous pose le plus sur le ${data.nom}`,
  ];
  const caption = [
    `❓ ${qa.question}`,
    '',
    `${qa.reponse}`,
    '',
    CTA_LIEN_BIO,
  ].join('\n');
  return { hooks, caption };
}

// --- Outils : ni mythe, ni FAQ, ni fiche signalétique — gabarit dédié,
// quel que soit le pilier demandé dans le calendrier. Souvent ce format sert
// juste de lien vers un sticker natif (sondage IG) ; le texte généré ici est
// une base, pas la version finale pour ces posts-là.
function outilBuilder(data) {
  const hooks = [
    data.titre,
    `On a fait l'outil pour toi.`,
  ];
  const caption = [data.resume, '', `Essaie-le : lien en bio.`].join('\n');
  return { hooks, caption };
}

const BUILDERS = { 1: pillar1, 2: pillar2, 3: pillar3, 4: pillar4, 5: pillar5 };

export function buildContent(pillar, data, opts = {}) {
  const builder = data.type === 'outil' ? outilBuilder : BUILDERS[pillar];
  if (!builder) throw new Error(`Pilier inconnu : ${pillar}`);
  const { hooks, caption } = builder(data, opts);
  const hashtags = hashtagsFor(pillar, data);
  return { hooks, caption, hashtags: hashtags.map((h) => `#${h}`) };
}
