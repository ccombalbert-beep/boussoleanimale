// Favoris — stockage localStorage uniquement (pas de compte utilisateur sur
// ce site), donc par navigateur/appareil, pas synchronisé. Même schéma
// d'événement que consentement.ts (dispatch d'un CustomEvent sur mise à
// jour) pour que plusieurs boutons affichés sur une même page (grille de
// cartes) restent synchronisés sans prop drilling.
const CLE_STOCKAGE = 'favoris-boussole-animale';

export type TypeFavori = 'chiens' | 'chats' | 'guides';

export type Favoris = Record<TypeFavori, string[]>;

const VIDE: Favoris = { chiens: [], chats: [], guides: [] };

export function lireFavoris(): Favoris {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE);
    if (!brut) return { ...VIDE };
    const valeur = JSON.parse(brut);
    return {
      chiens: Array.isArray(valeur.chiens) ? valeur.chiens : [],
      chats: Array.isArray(valeur.chats) ? valeur.chats : [],
      guides: Array.isArray(valeur.guides) ? valeur.guides : [],
    };
  } catch {
    return { ...VIDE };
  }
}

export function estFavori(type: TypeFavori, slug: string): boolean {
  return lireFavoris()[type].includes(slug);
}

export function basculerFavori(type: TypeFavori, slug: string): boolean {
  const favoris = lireFavoris();
  const deja = favoris[type].includes(slug);
  favoris[type] = deja ? favoris[type].filter((s) => s !== slug) : [...favoris[type], slug];
  try {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(favoris));
  } catch {}
  window.dispatchEvent(new CustomEvent('favoris:maj', { detail: favoris }));
  return !deja;
}
