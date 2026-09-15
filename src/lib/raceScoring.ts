// Primitives de scoring partagées entre le quiz race (QuizRace.tsx), le
// calculateur d'espace vital (CalculateurEspaceVital.tsx) et le diagnostic
// unifié (DiagnosticUnifie.tsx) — extraites ici pour ne pas dupliquer trois
// fois les mêmes seuils "petit/moyen/grand" et "bas/moyen/élevé".

export type NiveauActivite = 'faible' | 'modere' | 'eleve' | 'tres_eleve';
export const NIVEAU_ORDRE: Record<NiveauActivite, number> = { faible: 0, modere: 1, eleve: 2, tres_eleve: 3 };

export type TailleChien = 'petit' | 'moyen' | 'grand';
export const TAILLE_ORDRE: Record<TailleChien, number> = { petit: 0, moyen: 1, grand: 2 };

// Seuils de poids repris du calculateur d'âge (CalculateurAge.tsx) — même
// découpage "petit/moyen/grand" partout sur le site plutôt que trois
// définitions différentes. Classé sur le poids moyen de la race, pertinent
// uniquement côté chien : chez le chat, le poids ne dit presque rien du
// besoin d'espace (voir CalculateurEspaceVital.tsx).
export function tailleChien(poidsMin: number, poidsMax: number): TailleChien {
  const moyen = (poidsMin + poidsMax) / 2;
  if (moyen < 9) return 'petit';
  if (moyen < 23) return 'moyen';
  return 'grand';
}

// Surface du logement déclarée par le visiteur — utilisée par le
// calculateur d'espace vital et le diagnostic unifié.
export type Surface = 'petite' | 'moyenne' | 'grande' | 'tres_grande';
export const SURFACE_RANG: Record<Surface, number> = { petite: 0, moyenne: 1, grande: 2, tres_grande: 3 };

export type BudgetNiveau = 'bas' | 'moyen' | 'eleve';
export const BUDGET_ORDRE: Record<BudgetNiveau, number> = { bas: 0, moyen: 1, eleve: 2 };

// Seuils choisis en regardant la distribution réelle des coûts mensuels sur
// le catalogue plutôt qu'arbitrairement — coupent en trois groupes à peu
// près équilibrés (voir QuizRace.tsx, origine de ce découpage).
export function budgetRace(coutMensuelMin: number, coutMensuelMax: number): BudgetNiveau {
  const moyen = (coutMensuelMin + coutMensuelMax) / 2;
  if (moyen < 70) return 'bas';
  if (moyen < 120) return 'moyen';
  return 'eleve';
}

// Sous-ensemble de `predispositions` (content.config.ts) utilisé pour
// générer des notes de vigilance santé — volontairement séparées du score
// de compatibilité logement (CalculateurEspaceVital.tsx) : un risque de
// surpoids ou une sensibilité thermique ne rendent pas une race plus ou
// moins adaptée à un appartement donné, mais restent des conseils réels à
// connaître avant d'adopter. Affichées sur l'espace vital et le diagnostic
// unifié, jamais utilisées pour classer les races entre elles.
export interface PredispositionsSante {
  brachycephale?: boolean;
  risqueSurpoids?: boolean;
  sensibiliteChaleur?: boolean;
  sensibiliteFroid?: boolean;
}

export function notesSante(p: PredispositionsSante): string[] {
  const notes: string[] = [];
  if (p.risqueSurpoids) {
    notes.push(
      "Prédisposée au surpoids : un contrôle strict des quantités et des friandises fait une vraie différence sur sa santé et son espérance de vie."
    );
  }
  // La brachycéphalie implique déjà une intolérance à la chaleur (voir
  // scoreChien/scoreChat) — sensibiliteChaleur ne documente que les cas non
  // brachycéphales (ex. Husky Sibérien), pour éviter de renseigner deux fois
  // la même information sur les races déjà marquées brachycephale.
  if (p.brachycephale || p.sensibiliteChaleur) {
    notes.push(
      "Sensible aux fortes chaleurs : évitez les sorties ou efforts aux heures chaudes, veillez à un accès permanent à l'eau et à l'ombre."
    );
  }
  if (p.sensibiliteFroid) {
    notes.push("Sensible au froid : un manteau ou un intérieur bien chauffé en hiver n'est pas un luxe pour cette race.");
  }
  return notes;
}
