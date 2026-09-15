import { useEffect, useRef, useState } from 'preact/hooks';
import { trackEvent } from '../lib/analytics';
import { BUDGET_ORDRE, NIVEAU_ORDRE, budgetRace, type BudgetNiveau, type Surface } from '../lib/raceScoring';
import {
  scoreChien,
  scoreChat,
  type RaceEspaceItem,
  type Espece,
  type Exterieur,
  type Etage,
} from './CalculateurEspaceVital';

// Diagnostic unifié : ajoute budget, présence quotidienne et expérience aux
// critères d'espace déjà scorés par CalculateurEspaceVital.tsx (scoreChien /
// scoreChat réutilisés tels quels, pas réécrits) — voir chantier 2 de
// CHECKLIST_REPOSITIONNEMENT.md. Les calculateurs individuels et le
// calculateur d'espace vital restent inchangés à côté de cet outil.
export interface RaceDiagnosticItem extends RaceEspaceItem {
  coutMensuelMin: number;
  coutMensuelMax: number;
  // Anxiété de séparation / intolérance documentée à la solitude prolongée
  // — voir content.config.ts. N'existe que sur ce diagnostic, pas sur
  // l'espace vital qui n'a pas de critère de présence.
  intoleranceSolitude?: boolean;
}

type Presence = 'moins_4h' | '4_8h' | 'plus_8h';
type Experience = 'debutant' | 'confirme';
type Budget = BudgetNiveau | 'peu_importe';

interface Reponses {
  espece: Espece | null;
  surface: Surface | null;
  exterieur: Exterieur | null;
  etage: Etage | null;
  budget: Budget | null;
  presence: Presence | null;
  experience: Experience | null;
}

interface Props {
  races: RaceDiagnosticItem[];
}

interface Critere {
  label: string;
  ok: boolean;
  detail: string;
}

interface Resultat {
  race: RaceDiagnosticItem;
  score: number;
  criteres: Critere[];
}

function scoreBudget(race: RaceDiagnosticItem, r: Reponses): Critere & { score: number } {
  if (!r.budget || r.budget === 'peu_importe') {
    return { label: 'Budget', ok: true, detail: 'Aucune contrainte de budget indiquée.', score: 0 };
  }
  const niveauRace = budgetRace(race.coutMensuelMin, race.coutMensuelMax);
  const ecart = BUDGET_ORDRE[niveauRace] - BUDGET_ORDRE[r.budget];
  if (ecart <= 0) {
    return {
      label: 'Budget',
      ok: true,
      detail: `Budget mensuel réel (${race.coutMensuelMin}-${race.coutMensuelMax} €) dans l'enveloppe visée.`,
      score: 2,
    };
  }
  return {
    label: 'Budget',
    ok: false,
    detail: `Budget mensuel réel (${race.coutMensuelMin}-${race.coutMensuelMax} €) au-dessus de l'enveloppe visée.`,
    score: -ecart * 2,
  };
}

// Le chat tolère mieux la solitude que le chien à niveau d'activité
// équivalent — traité différemment plutôt que la même règle pour les deux
// espèces (même principe que le calculateur d'espace vital). L'anxiété de
// séparation documentée sur certaines races (Bichon Frisé, Épagneul Breton,
// Siamois...) est un facteur réel et distinct du niveau d'activité — un
// chien calme peut très bien mal supporter la solitude, et inversement —
// donc prioritaire sur l'heuristique activité seule plutôt que d'y être
// noyé.
function scorePresence(race: RaceDiagnosticItem, r: Reponses): Critere & { score: number } {
  const activite = NIVEAU_ORDRE[race.niveauActivite];

  if (r.presence !== 'moins_4h' && race.intoleranceSolitude) {
    return {
      label: 'Présence quotidienne',
      ok: false,
      detail: `Anxiété de séparation documentée sur cette race : ${r.presence === 'plus_8h' ? 'plus de 8h' : '4 à 8h'} seul chaque jour est à risque réel, indépendamment du niveau d'activité — une transition progressive à la solitude ou une solution de garde est recommandée.`,
      score: r.presence === 'plus_8h' ? -3 : -2,
    };
  }

  if (r.presence === 'plus_8h') {
    if (race.espece === 'chien' && activite >= 2) {
      return {
        label: 'Présence quotidienne',
        ok: false,
        detail: "Niveau d'activité élevé et plus de 8h seul chaque jour : risque réel de frustration comportementale (destructions, aboiements).",
        score: -3,
      };
    }
    if (race.espece === 'chat' && activite >= 3) {
      return {
        label: 'Présence quotidienne',
        ok: false,
        detail: "Niveau d'activité très élevé pour un chat livré à lui-même plus de 8h : prévoyez un environnement bien enrichi (arbre à chat, jouets automatiques).",
        score: -1,
      };
    }
    return {
      label: 'Présence quotidienne',
      ok: true,
      detail: race.espece === 'chien'
        ? 'Plus de 8h seul reste long pour un chien, même à activité modérée — une solution de garde en journée reste utile.'
        : 'Un chat s\'accommode généralement bien de longues journées seul, à condition d\'un environnement stimulant.',
      score: race.espece === 'chien' ? -1 : 0,
    };
  }
  if (r.presence === '4_8h') {
    if (race.espece === 'chien' && activite >= 3) {
      return {
        label: 'Présence quotidienne',
        ok: false,
        detail: "Niveau d'activité très élevé : même 4 à 8h seul peut être long sans dépense physique en amont.",
        score: -1,
      };
    }
    return { label: 'Présence quotidienne', ok: true, detail: 'Compatible avec une présence quotidienne modérée.', score: 0 };
  }
  return { label: 'Présence quotidienne', ok: true, detail: 'Présence importante à la maison : convient à tous les niveaux d\'activité.', score: 1 };
}

function scoreExperience(race: RaceDiagnosticItem, r: Reponses): Critere & { score: number } {
  if (r.experience === 'debutant' && race.niveauActivite === 'tres_eleve') {
    return {
      label: 'Expérience requise',
      ok: false,
      detail: "Niveau d'activité très élevé : demande une vraie expérience d'éducation, moins recommandé pour un premier animal.",
      score: -3,
    };
  }
  return {
    label: 'Expérience requise',
    ok: true,
    detail: r.experience === 'confirme' ? 'Votre expérience couvre largement les besoins de cette race.' : 'Race adaptée à un premier animal.',
    score: 0,
  };
}

function scoreGlobal(race: RaceDiagnosticItem, r: Reponses): Resultat {
  const espaceRes = race.espece === 'chien' ? scoreChien(race, r) : scoreChat(race, r);
  const espaceCritere: Critere = {
    label: 'Espace & logement',
    ok: espaceRes.score >= 1,
    detail: espaceRes.raisons.map((raison) => raison.texte).join(' '),
  };
  const budgetCritere = scoreBudget(race, r);
  const presenceCritere = scorePresence(race, r);
  const experienceCritere = scoreExperience(race, r);

  return {
    race,
    score: espaceRes.score + budgetCritere.score + presenceCritere.score + experienceCritere.score,
    criteres: [espaceCritere, budgetCritere, presenceCritere, experienceCritere],
  };
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
  {
    key: 'budget' as const,
    label: 'Quel budget mensuel maximum visez-vous ?',
    options: [
      { value: 'bas', label: 'Moins de 70 € / mois' },
      { value: 'moyen', label: '70 à 120 € / mois' },
      { value: 'eleve', label: 'Plus de 120 € / mois' },
      { value: 'peu_importe', label: 'Peu importe' },
    ],
  },
  {
    key: 'presence' as const,
    label: "Combien de temps l'animal sera-t-il seul, en moyenne, chaque jour ?",
    options: [
      { value: 'moins_4h', label: 'Moins de 4h' },
      { value: '4_8h', label: '4 à 8h' },
      { value: 'plus_8h', label: 'Plus de 8h' },
    ],
  },
  {
    key: 'experience' as const,
    label: 'Avez-vous déjà eu ce type d\'animal ?',
    options: [
      { value: 'debutant', label: "Non, c'est une première" },
      { value: 'confirme', label: 'Oui, je suis expérimenté(e)' },
    ],
  },
];

const boutonReponse =
  'select-none block w-full border border-sable-400 bg-sable-50 px-4 py-3 text-left font-medium transition-colors duration-150 hover:border-terracotta-400 active:scale-[0.98]';

export default function DiagnosticUnifie({ races }: Props) {
  const [step, setStep] = useState(0);
  const [reponses, setReponses] = useState<Reponses>({
    espece: null,
    surface: null,
    exterieur: null,
    etage: null,
    budget: null,
    presence: null,
    experience: null,
  });
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
    ? [...racesFiltrees].map((race) => scoreGlobal(race, reponses)).sort((a, b) => b.score - a.score).slice(0, 4)
    : [];

  useEffect(() => {
    if (premierRenduAnalytics.current) {
      premierRenduAnalytics.current = false;
      trackEvent('calculator_view', { calculator: 'diagnostic_unifie' });
      return;
    }
    if (termine) {
      trackEvent('calculator_interact', { calculator: 'diagnostic_unifie', field: 'resultat', value: resultats[0]?.race.slug });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termine]);

  function interagir(field: string, value: string) {
    trackEvent('calculator_interact', { calculator: 'diagnostic_unifie', field, value });
  }

  function recommencer() {
    setReponses({ espece: null, surface: null, exterieur: null, etage: null, budget: null, presence: null, experience: null });
    setStep(0);
    setTermine(false);
  }

  let contenu;

  if (termine) {
    contenu = (
      <div>
        <h2 ref={titreRef} tabIndex={-1} class="mb-6 font-display text-2xl font-medium text-encre-900">
          Votre compatibilité, race par race
        </h2>
        <div class="space-y-4">
          {resultats.map((res, i) => (
            <div key={res.race.slug} class="border border-sable-300 bg-sable-50 p-5">
              <p class="text-sm font-medium text-terracotta-600">#{i + 1} correspondance</p>
              <h3 class="mt-1 font-display text-xl font-medium">{res.race.nom}</h3>
              <p class="mt-1 text-encre-700">{res.race.resume}</p>
              <ul class="mt-4 space-y-2 text-sm">
                {res.criteres.map((critere) => (
                  <li key={critere.label} class="flex gap-2">
                    <span aria-hidden="true" class={critere.ok ? 'text-pin-700' : 'text-terracotta-600'}>
                      {critere.ok ? '✓' : '△'}
                    </span>
                    <span>
                      <span class="font-medium text-encre-900">{critere.label}</span>
                      {' — '}
                      <span class="text-encre-700">{critere.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href={`/${res.race.espece === 'chien' ? 'chiens' : 'chats'}/races/${res.race.slug}/`}
                class="mt-4 inline-block text-sm font-medium text-encre-900 hover:text-terracotta-600"
              >
                Voir la fiche complète →
              </a>
            </div>
          ))}
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
