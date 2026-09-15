import { useEffect, useRef, useState } from 'preact/hooks';
import { trackEvent } from '../lib/analytics';
import { NIVEAU_ORDRE, SURFACE_RANG, tailleChien, notesSante, type NiveauActivite, type Surface } from '../lib/raceScoring';

export type Espece = 'chien' | 'chat';
export type Exterieur = 'aucun' | 'balcon' | 'jardin';
export type Etage = 'rdc_ascenseur' | 'sans_ascenseur';

// Données réelles issues des collections `chiens` et `chats` (voir la page
// qui rend ce composant) — même principe que QuizRace.tsx : le pool s'élargit
// automatiquement à chaque nouvelle fiche publiée, rien à toucher ici.
export interface RaceEspaceItem {
  slug: string;
  nom: string;
  resume: string;
  espece: Espece;
  niveauActivite: NiveauActivite;
  adapteAppartement: boolean;
  poidsMin: number;
  poidsMax: number;
  // Prédispositions santé pertinentes pour les escaliers répétés — voir
  // content.config.ts. Absentes = non documentées, jamais traitées comme un
  // "non" garanti.
  brachycephale?: boolean;
  risqueArticulaireOuDorsal?: boolean;
  // Alimentent des notes de vigilance santé non scorées — voir notesSante()
  // dans src/lib/raceScoring.ts.
  risqueSurpoids?: boolean;
  sensibiliteChaleur?: boolean;
  sensibiliteFroid?: boolean;
}

// Exportées pour être réutilisées telles quelles par le diagnostic unifié
// (DiagnosticUnifie.tsx), qui ajoute budget/présence/expérience à ces mêmes
// critères d'espace plutôt que de reécrire le scoring.
export interface Reponses {
  espece: Espece | null;
  surface: Surface | null;
  exterieur: Exterieur | null;
  etage: Etage | null;
}

interface Props {
  races: RaceEspaceItem[];
}

export interface Resultat {
  race: RaceEspaceItem;
  score: number;
  raisons: { texte: string; positif: boolean }[];
}

// Scoring chien : croise le gabarit réel de la race (poids) et son niveau
// d'activité documenté avec la surface, l'accès à un extérieur et l'étage
// déclarés — pas juste "grand chien = besoin d'espace". Un grand chien à
// faible niveau d'activité et un petit chien très actif sont bien traités
// différemment (voir NIVEAU_ORDRE ci-dessous, indépendant du gabarit).
export function scoreChien(race: RaceEspaceItem, r: Reponses): Resultat {
  const raisons: Resultat['raisons'] = [];
  let score = 0;

  const taille = tailleChien(race.poidsMin, race.poidsMax);
  const surfaceRang = SURFACE_RANG[r.surface!];
  const rangRequis = taille === 'petit' ? 0 : taille === 'moyen' ? 1 : 2;
  const ecart = surfaceRang - rangRequis;

  if (taille === 'petit') {
    score += 3;
    raisons.push({ texte: 'Petit gabarit : s\'adapte à toutes les surfaces, y compris un studio.', positif: true });
  } else if (ecart >= 0) {
    score += 3;
    raisons.push({ texte: `Surface déclarée cohérente avec un chien de gabarit ${taille}.`, positif: true });
  } else {
    score += ecart * 2;
    raisons.push({ texte: `Gabarit ${taille} : la surface déclarée est un peu juste, ce chien a besoin de plus d'espace pour circuler et se poser confortablement.`, positif: false });
  }

  if (!race.adapteAppartement) {
    if (surfaceRang >= 2) {
      score -= 1;
      raisons.push({ texte: 'Cette race n\'est pas documentée comme spécialement adaptée à l\'appartement, même si la surface aide.', positif: false });
    } else {
      score -= 3;
      raisons.push({ texte: 'Cette race n\'est pas documentée comme adaptée à l\'appartement.', positif: false });
    }
  }

  const activite = NIVEAU_ORDRE[race.niveauActivite];
  if (r.exterieur === 'jardin') {
    score += 2;
    raisons.push({ texte: 'Un jardin couvre largement les besoins de dépense physique, quel que soit le niveau d\'activité de la race.', positif: true });
  } else if (r.exterieur === 'balcon') {
    if (activite <= 1) {
      score += 1;
      raisons.push({ texte: 'Niveau d\'activité modéré : un balcon en complément de sorties régulières suffit.', positif: true });
    } else {
      score -= 1;
      raisons.push({ texte: 'Niveau d\'activité élevé : un balcon ne remplace pas de vraies sorties actives quotidiennes.', positif: false });
    }
  } else {
    if (activite <= 1) {
      raisons.push({ texte: 'Pas d\'extérieur privé, mais un niveau d\'activité modéré reste gérable avec des sorties régulières.', positif: true });
    } else {
      score -= 2;
      raisons.push({ texte: 'Niveau d\'activité élevé sans extérieur privé : prévoyez plusieurs sorties longues et actives chaque jour pour éviter la frustration comportementale (destructions, aboiements, anxiété).', positif: false });
    }
  }

  // Les escaliers répétés ne sont pas qu'un enjeu de gabarit : la
  // brachycéphalie (effort respiratoire) et les prédispositions articulaires
  // ou dorsales (luxation de la rotule, hernie discale, hémivertèbres...)
  // documentées sur de petites races concernent tout autant, sinon plus, que
  // le seul grand gabarit — corrigé suite à un retour vétérinaire sur ce
  // calculateur (voir CHECKLIST_REPOSITIONNEMENT.md, chantier 1).
  if (r.etage === 'sans_ascenseur') {
    const motifs: string[] = [];
    if (taille === 'grand') motifs.push('son grand gabarit');
    if (race.brachycephale) motifs.push('sa prédisposition respiratoire (brachycéphalie)');
    if (race.risqueArticulaireOuDorsal) motifs.push('sa prédisposition articulaire ou dorsale documentée sur sa fiche');

    if (motifs.length > 0) {
      score -= motifs.length;
      const liste = motifs.length === 1 ? motifs[0] : motifs.slice(0, -1).join(', ') + ' et ' + motifs[motifs.length - 1];
      raisons.push({
        texte: `Escaliers sans ascenseur : à anticiper avec ${liste} — les montées répétées sont une vraie sollicitation, pas un détail.`,
        positif: false,
      });
    }
  }

  return { race, score, raisons };
}

// Scoring chat : logique volontairement différente de celle du chien. Le
// poids n'est pas un indicateur pertinent du besoin d'espace, l'accès à un
// extérieur n'est pas un simple bonus (risque de chute ou de fugue à
// sécuriser) et l'aménagement vertical compte plus que la surface au sol.
export function scoreChat(race: RaceEspaceItem, r: Reponses): Resultat {
  const raisons: Resultat['raisons'] = [];
  let score = 0;

  if (race.adapteAppartement) {
    score += 3;
    raisons.push({ texte: 'Race documentée comme bien adaptée à la vie en appartement.', positif: true });
  } else {
    score -= 2;
    raisons.push({ texte: 'Cette race est plutôt documentée comme ayant besoin d\'accès à l\'extérieur — l\'appartement seul risque de ne pas suffire.', positif: false });
  }

  const activite = NIVEAU_ORDRE[race.niveauActivite];
  const surfaceRang = SURFACE_RANG[r.surface!];
  if (activite >= 2 && surfaceRang <= 0) {
    score -= 1;
    raisons.push({ texte: 'Niveau d\'activité élevé dans un espace réduit : prévoyez un vrai aménagement vertical (arbre à chat, étagères) pour compenser.', positif: false });
  } else if (activite >= 2) {
    score += 1;
    raisons.push({ texte: 'Niveau d\'activité élevé : un espace bien aménagé verticalement aide à canaliser l\'énergie.', positif: true });
  }

  if (r.exterieur === 'jardin' || r.exterieur === 'balcon') {
    raisons.push({ texte: 'Balcon ou jardin accessible : à sécuriser (filet de protection) avant d\'y laisser un chat seul, le risque de chute ou de fugue est réel, y compris chez un chat prudent.', positif: true });
  }

  return { race, score, raisons };
}

const QUESTIONS = [
  {
    key: 'espece' as const,
    label: 'Pour quel animal ?',
    options: [
      { value: 'chien', label: 'Un chien' },
      { value: 'chat', label: 'Un chat' },
    ],
  },
  {
    key: 'surface' as const,
    label: 'Quelle est la surface de votre logement ?',
    options: [
      { value: 'petite', label: 'Moins de 30 m²' },
      { value: 'moyenne', label: '30 à 60 m²' },
      { value: 'grande', label: '60 à 100 m²' },
      { value: 'tres_grande', label: 'Plus de 100 m²' },
    ],
  },
  {
    key: 'exterieur' as const,
    label: 'Avez-vous accès à un extérieur privé ?',
    options: [
      { value: 'aucun', label: 'Aucun' },
      { value: 'balcon', label: 'Balcon ou terrasse' },
      { value: 'jardin', label: 'Jardin' },
    ],
  },
  {
    key: 'etage' as const,
    label: 'À quel étage se trouve votre logement ?',
    options: [
      { value: 'rdc_ascenseur', label: 'Rez-de-chaussée ou avec ascenseur' },
      { value: 'sans_ascenseur', label: 'En étage, sans ascenseur' },
    ],
  },
];

const boutonReponse =
  'select-none block w-full border border-sable-400 bg-sable-50 px-4 py-3 text-left font-medium transition-colors duration-150 hover:border-terracotta-400 active:scale-[0.98]';

export default function CalculateurEspaceVital({ races }: Props) {
  const [step, setStep] = useState(0);
  const [reponses, setReponses] = useState<Reponses>({ espece: null, surface: null, exterieur: null, etage: null });
  const [termine, setTermine] = useState(false);

  const titreRef = useRef<HTMLHeadingElement>(null);
  const premierRendu = useRef(true);
  const enTraitement = useRef(false);
  const premierRenduAnalytics = useRef(true);

  useEffect(() => {
    enTraitement.current = false;
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    titreRef.current?.focus();
  }, [step, termine]);

  const totalSteps = QUESTIONS.length;

  function repondre(key: keyof Reponses, value: string) {
    if (enTraitement.current) return;
    enTraitement.current = true;
    setReponses((prev) => ({ ...prev, [key]: value }));
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setTermine(true);
    }
  }

  const racesFiltrees = races.filter((r) => r.espece === reponses.espece);
  const resultats = termine
    ? [...racesFiltrees]
        .map((race) => (reponses.espece === 'chien' ? scoreChien(race, reponses) : scoreChat(race, reponses)))
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
    : [];

  useEffect(() => {
    if (premierRenduAnalytics.current) {
      premierRenduAnalytics.current = false;
      trackEvent('calculator_view', { calculator: 'espace_vital' });
      return;
    }
    if (termine) {
      trackEvent('calculator_interact', { calculator: 'espace_vital', field: 'resultat', value: resultats[0]?.race.slug });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termine]);

  function interagir(field: string, value: string) {
    trackEvent('calculator_interact', { calculator: 'espace_vital', field, value });
  }

  function recommencer() {
    setReponses({ espece: null, surface: null, exterieur: null, etage: null });
    setStep(0);
    setTermine(false);
  }

  let contenu;

  if (termine) {
    contenu = (
      <div>
        <h2 ref={titreRef} tabIndex={-1} class="mb-6 font-display text-2xl font-medium text-encre-900">
          Races compatibles avec votre logement
        </h2>
        <div class="space-y-4">
          {resultats.map((res, i) => {
            const notes = notesSante(res.race);
            return (
            <div key={res.race.slug} class="border border-sable-300 bg-sable-50 p-5">
              <p class="text-sm font-medium text-terracotta-600">#{i + 1} correspondance</p>
              <h3 class="mt-1 font-display text-xl font-medium">{res.race.nom}</h3>
              <p class="mt-1 text-encre-700">{res.race.resume}</p>
              <ul class="mt-4 space-y-1.5 text-sm">
                {res.raisons.map((raison) => (
                  <li key={raison.texte} class={`flex gap-2 ${raison.positif ? 'text-pin-700' : 'text-encre-700'}`}>
                    <span aria-hidden="true">{raison.positif ? '✓' : '△'}</span>
                    <span>{raison.texte}</span>
                  </li>
                ))}
              </ul>
              {notes.length > 0 && (
                <div class="mt-4 border-t border-sable-300 pt-3">
                  <p class="text-xs font-medium uppercase tracking-wide text-encre-700/70">À savoir</p>
                  <ul class="mt-1.5 space-y-1 text-sm text-encre-700">
                    {notes.map((note) => (
                      <li key={note} class="flex gap-2">
                        <span aria-hidden="true">ℹ</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <a
                href={`/${res.race.espece === 'chien' ? 'chiens' : 'chats'}/races/${res.race.slug}/`}
                class="mt-4 inline-block text-sm font-medium text-encre-900 hover:text-terracotta-600"
              >
                Voir la fiche complète →
              </a>
            </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={recommencer}
          class="mt-6 border border-sable-400 px-5 py-2 text-sm font-medium transition-colors duration-150 hover:border-terracotta-400 active:scale-[0.98]"
        >
          Recommencer
        </button>
      </div>
    );
  } else {
    const q = QUESTIONS[step];
    contenu = (
      <div>
        <p class="mb-2 text-sm text-encre-700/80">
          Question {step + 1} / {totalSteps}
        </p>
        <h2 ref={titreRef} tabIndex={-1} class="mb-6 font-display text-xl font-medium text-encre-900">
          {q.label}
        </h2>
        <div class="space-y-3">
          {q.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                repondre(q.key, opt.value);
                interagir(q.key, opt.value);
              }}
              class={boutonReponse}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div class="fade-in" key={termine ? 'resultat' : `q${step}`}>
      {contenu}
    </div>
  );
}
