// Gestion du consentement cookies (CMP maison) — RGPD / ePrivacy.
// Les catégories "audience" et "publicite" sont refusées par défaut : aucun
// script non essentiel ne doit se charger tant que `consentementDonne()` ne
// renvoie pas true pour la catégorie concernée. Incrémenter VERSION force un
// nouveau recueil de consentement (ex. si un nouveau sous-traitant apparaît).
export const VERSION_CONSENTEMENT = 1;
const CLE_STOCKAGE = 'consentement-cookies';

export type CategorieConsentement = 'audience' | 'publicite';

export interface Consentement {
  necessaire: true;
  audience: boolean;
  publicite: boolean;
  date: string;
  version: number;
}

export function lireConsentement(): Consentement | null {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE);
    if (!brut) return null;
    const valeur = JSON.parse(brut) as Consentement;
    if (valeur.version !== VERSION_CONSENTEMENT) return null;
    return valeur;
  } catch {
    return null;
  }
}

export function ecrireConsentement(choix: { audience: boolean; publicite: boolean }): Consentement {
  const consentement: Consentement = {
    necessaire: true,
    audience: choix.audience,
    publicite: choix.publicite,
    date: new Date().toISOString(),
    version: VERSION_CONSENTEMENT,
  };
  try {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(consentement));
  } catch {}
  window.dispatchEvent(new CustomEvent('consentement:maj', { detail: consentement }));
  return consentement;
}

// À utiliser par tout futur script tiers (mesure d'audience, régie publicitaire)
// avant de s'exécuter : if (!consentementDonne('publicite')) return;
export function consentementDonne(categorie: CategorieConsentement): boolean {
  return lireConsentement()?.[categorie] === true;
}
