// Taxonomie des sous-catégories de guides — un seul endroit pour les valeurs
// possibles et leurs libellés d'affichage, partagé par content.config.ts (le
// schéma), GuideLayout.astro (le fil d'Ariane) et guides/index.astro (le
// regroupement). Volontairement un champ optionnel dans le schéma plutôt
// qu'obligatoire : les guides déjà publiés avant cette catégorisation ne
// doivent pas casser le build tant qu'ils n'ont pas été retouchés.
export const CATEGORIES = [
  'bien-etre-sante',
  'education-comportement',
  'mode-de-vie-urbain',
  'budget-pratique',
] as const;

export type Categorie = (typeof CATEGORIES)[number];

export const CATEGORIE_LABELS: Record<Categorie, string> = {
  'bien-etre-sante': 'Bien-être & Santé',
  'education-comportement': 'Éducation & Comportement',
  'mode-de-vie-urbain': 'Mode de vie urbain',
  'budget-pratique': 'Budget & Aspects pratiques',
};
