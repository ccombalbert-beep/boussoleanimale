// Lit une fiche race, un guide ou un outil directement depuis src/content/ ou
// src/pages/outils/ — jamais de données dupliquées à la main : le pipeline
// social lit la même source de vérité que le site.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '../../../');

const OUTILS = {
  'quelle-race-me-correspond': {
    titre: 'Quelle race me correspond ?',
    resume: 'Quiz qui croise logement, temps disponible et expérience pour recommander des races adaptées.',
    url: '/outils/quelle-race-me-correspond/',
  },
  'cout-mensuel-chien': {
    titre: 'Calculateur de coût mensuel — chien',
    resume: 'Estime le budget mensuel réel selon la taille et les besoins du chien.',
    url: '/outils/cout-mensuel-chien/',
  },
  'cout-mensuel-chat': {
    titre: 'Calculateur de coût mensuel — chat',
    resume: 'Estime le budget mensuel réel d’un chat.',
    url: '/outils/cout-mensuel-chat/',
  },
  'age-chien-chat': {
    titre: 'Âge chien/chat en âge humain',
    resume: 'Convertit l’âge réel d’un chien ou d’un chat en équivalent humain.',
    url: '/outils/age-chien-chat/',
  },
};

/**
 * @param {{type: 'race'|'guide'|'outil', collection: 'chiens'|'chats'|'guides'|null, slug: string}} source
 */
export function readSource(source) {
  const { type, collection, slug } = source;

  if (type === 'outil') {
    const outil = OUTILS[slug];
    if (!outil) throw new Error(`Outil inconnu : ${slug}`);
    return { type, slug, espece: null, ...outil, url: outil.url };
  }

  const dir = type === 'race' ? collection : 'guides';
  const filePath = path.join(SITE_ROOT, 'src/content', dir, `${slug}.mdx`);
  if (!existsSync(filePath)) {
    throw new Error(`Fiche introuvable : ${filePath}`);
  }
  const raw = readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  const espece = collection === 'chiens' ? 'chien' : collection === 'chats' ? 'chat' : null;
  const urlBase = type === 'race' ? `/${collection}/races/${slug}/` : `/guides/${slug}/`;

  return {
    type,
    slug,
    espece,
    url: urlBase,
    body: content,
    ...data,
  };
}

export function listHashtagSeeds(source, data) {
  const tags = [];
  if (data.espece === 'chien') tags.push('chien', 'racedechien');
  if (data.espece === 'chat') tags.push('chat', 'racedechat');
  if (data.nom) {
    const clean = data.nom
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlève les accents
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
    if (clean) tags.push(clean);
  }
  return tags;
}
