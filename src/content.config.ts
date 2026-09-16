import { defineCollection, z, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORIES } from './lib/guideCategories';

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

  // Prédispositions pertinentes pour la mobilité (escaliers, effort physique
  // répété) — dérivées du texte déjà documenté en section "Santé et
  // prédispositions" de chaque fiche, pas une nouvelle recherche à part.
  // Absentes (undefined) = non documentées pour cette race, jamais traitées
  // comme "false" garanti. Utilisées par le calculateur d'espace vital pour
  // ne plus réserver l'alerte "sans ascenseur" aux seuls grands gabarits.
  predispositions: z
    .object({
      // Syndrome obstructif des races brachycéphales (BOAS) : effort et
      // chaleur mal tolérés, escaliers répétés inclus.
      brachycephale: z.boolean().optional(),
      // Luxation de la rotule, hernie discale/chondrodystrophie,
      // hémivertèbres, dysplasie de la hanche — tout ce qui rend les
      // escaliers répétés une vraie sollicitation articulaire ou dorsale.
      risqueArticulaireOuDorsal: z.boolean().optional(),
      // Anxiété de séparation / intolérance documentée à la solitude
      // prolongée — distinct du niveau d'activité, utilisé par le
      // diagnostic unifié pour le critère "présence quotidienne".
      intoleranceSolitude: z.boolean().optional(),
      // Les trois champs suivants alimentent des notes informatives (pas de
      // score) sur les résultats des calculateurs — volontairement laissés
      // hors du scoring de compatibilité logement, contrairement aux trois
      // champs ci-dessus : ce sont des conseils de vigilance santé, pas des
      // critères qui rendent une race plus ou moins adaptée à un logement
      // donné. Voir aussi `notesSante()` dans src/lib/raceScoring.ts.
      risqueSurpoids: z.boolean().optional(),
      sensibiliteChaleur: z.boolean().optional(),
      sensibiliteFroid: z.boolean().optional(),
    })
    .optional(),

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
    // Sous-catégorie éditoriale — optionnelle : les guides déjà publiés
    // avant l'introduction de cette taxonomie (15/09/2026) restent valides
    // sans elle, regroupés dans "Non classé" sur /guides/ jusqu'à
    // rétrocatégorisation. Voir src/lib/guideCategories.ts pour la liste des
    // valeurs et leurs libellés d'affichage.
    categorie: z.enum(CATEGORIES).optional(),
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
    // Optionnel : quand présent, GuideLayout génère automatiquement le
    // balisage Schema.org FAQPage en plus d'Article (voir generate-csp.mjs
    // n'a rien à voir ici — c'est du JSON-LD, pas du script, non concerné
    // par la CSP script-src).
    faq: z
      .array(
        z.object({
          question: z.string(),
          reponse: z.string(),
        })
      )
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
