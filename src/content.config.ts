import { defineCollection, z, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';

const raceSchema = ({ image }: SchemaContext) => z.object({
  nom: z.string(),
  nomLatin: z.string().optional(),
  groupeFCI: z.string().optional(),
  origine: z.string(),

  taille: z.object({
    min: z.number(),
    max: z.number(),
    unite: z.literal('cm'),
  }),
  poids: z.object({
    min: z.number(),
    max: z.number(),
    unite: z.literal('kg'),
  }),
  esperanceDeVie: z.object({
    min: z.number(),
    max: z.number(),
  }),
  typeDePoil: z.string(),
  niveauActivite: z.enum(['faible', 'modere', 'eleve', 'tres_eleve']),
  aboiement: z.enum(['rare', 'occasionnel', 'frequent']).optional(),
  adapteAppartement: z.boolean(),
  adapteEnfants: z.boolean(),

  budget: z.object({
    prixAchatMin: z.number(),
    prixAchatMax: z.number(),
    coutMensuelMin: z.number(),
    coutMensuelMax: z.number(),
  }),

  // Résumé court utilisé en intro de fiche ET en meta description SEO.
  resume: z.string().max(200),

  image: image(),
  imageAlt: z.string(),
  // Ancrage du recadrage object-cover pour les photos verticales/mal centrées
  // une fois forcées dans le ratio 16:9 du hero. "center" par défaut.
  imagePosition: z.enum(['center', 'top', 'bottom']).optional(),
  // Attribution requise pour les photos sous licence Creative Commons (CC-BY / CC-BY-SA).
  // Absent uniquement pour les photos CC0 / domaine public ou achetées avec droits complets.
  imageCredit: z
    .object({
      auteur: z.string(),
      licence: z.string(),
      lienLicence: z.string().url(),
      source: z.string().url(),
    })
    .optional(),

  // Section "mythe vs réalité" — garde-fou anti contenu générique :
  // impossible à produire par simple substitution de variables.
  mythes: z
    .array(
      z.object({
        mythe: z.string(),
        realite: z.string(),
      })
    )
    .min(1),

  faq: z
    .array(
      z.object({
        question: z.string(),
        reponse: z.string(),
      })
    )
    .min(3),

  racesSimilaires: z.array(z.string()).optional(),
  sources: z.array(z.string()).min(1),

  auteur: z.string(),
  dateMiseAJour: z.date(),
});

const chiens = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/chiens' }),
  schema: raceSchema,
});

const chats = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/chats' }),
  schema: raceSchema,
});

// Contenu éditorial transverse (comparatifs, guides pratiques) — ne rentre
// pas dans une seule fiche race, couvre des requêtes comparatives/pratiques.
const guideSchema = ({ image }: SchemaContext) =>
  z.object({
    titre: z.string(),
    // Titre court dédié à la balise <title> / SERP quand le titre éditorial
    // (accroche + clarificateur) dépasse la largeur d'affichage utile.
    // Optionnel : retombe sur `titre` si absent.
    titreCourt: z.string().optional(),
    resume: z.string().max(200),
    image: image(),
    imageAlt: z.string(),
    imagePosition: z.enum(['center', 'top', 'bottom']).optional(),
    imageCredit: z
      .object({
        auteur: z.string(),
        licence: z.string(),
        lienLicence: z.string().url(),
        source: z.string().url(),
      })
      .optional(),
    // Fiches référencées, avec leur collection — un guide croise souvent
    // des chiens et des chats.
    racesLiees: z
      .array(z.object({ slug: z.string(), espece: z.enum(['chien', 'chat']) }))
      .optional(),
    sources: z.array(z.string()).min(1),
    auteur: z.string(),
    dateMiseAJour: z.date(),
  });

const guides = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/guides' }),
  schema: guideSchema,
});

export const collections = { chiens, chats, guides };
