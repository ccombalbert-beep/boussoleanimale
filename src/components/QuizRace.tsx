import { useEffect, useRef, useState } from 'preact/hooks';
import { trackEvent } from '../lib/analytics';

type Logement = 'appartement' | 'maison_jardin';
type Activite = 'faible' | 'modere' | 'eleve';
type Experience = 'debutant' | 'confirme';
type Aboiement = 'rare' | 'occasionnel' | 'frequent';
type ToleranceAboiement = 'faible' | 'peu_importe';
type NiveauActivite = 'faible' | 'modere' | 'eleve' | 'tres_eleve';
type Taille = 'petit' | 'moyen' | 'grand' | 'peu_importe';
type Budget = 'bas' | 'moyen' | 'eleve' | 'peu_importe';

interface Reponses {
  logement: Logement | null;
  taille: Taille | null;
  activite: Activite | null;
  experience: Experience | null;
  budget: Budget | null;
  aboiement: ToleranceAboiement | null;
  enfants: boolean | null;
}

// Données réelles issues du catalogue de fiches (voir la page qui rend ce
// composant : elle passe tout le contenu de la collection `chiens`, pas une
// sélection à la main) — le pool de races s'élargit donc automatiquement dès
// qu'une nouvelle fiche chien est publiée, sans code à toucher ici.
export interface RaceQuizItem {
  slug: string;
  nom: string;
  resume: string;
  niveauActivite: NiveauActivite;
  adapteAppartement: boolean;
  adapteEnfants: boolean;
  aboiement?: Aboiement;
  poidsMin: number;
  poidsMax: number;
  coutMensuelMin: number;
  coutMensuelMax: number;
}

interface Props {
  races: RaceQuizItem[];
}

const NIVEAU_ORDRE: Record<NiveauActivite, number> = { faible: 0, modere: 1, eleve: 2, tres_eleve: 3 };
// La réponse "eleve" du quiz ("plus d'1h30, activement") doit couvrir aussi
// bien les races 'eleve' que 'tres_eleve' du catalogue — d'où une cible à
// 2.5 plutôt que 2, à mi-chemin entre les deux niveaux réels.
const NIVEAU_CIBLE: Record<Activite, number> = { faible: 0, modere: 1, eleve: 2.5 };

const TAILLE_ORDRE: Record<'petit' | 'moyen' | 'grand', number> = { petit: 0, moyen: 1, grand: 2 };
// Seuils de poids repris tels quels du calculateur d'âge (CalculateurAge.tsx)
// pour ne pas avoir deux découpages "petit/moyen/grand" différents sur le
// site. Classée sur le poids moyen de la race, pas sur min ou max seul.
function tailleRace(race: RaceQuizItem): 'petit' | 'moyen' | 'grand' {
  const moyen = (race.poidsMin + race.poidsMax) / 2;
  if (moyen < 9) return 'petit';
  if (moyen < 23) return 'moyen';
  return 'grand';
}

const BUDGET_ORDRE: Record<'bas' | 'moyen' | 'eleve', number> = { bas: 0, moyen: 1, eleve: 2 };
// Seuils choisis en regardant la distribution réelle des coûts mensuels sur
// les 30 fiches chien (de 30-60 € à 100-200 €) plutôt qu'arbitrairement —
// coupent le catalogue en trois groupes à peu près équilibrés.
function budgetRace(race: RaceQuizItem): 'bas' | 'moyen' | 'eleve' {
  const moyen = (race.coutMensuelMin + race.coutMensuelMax) / 2;
  if (moyen < 70) return 'bas';
  if (moyen < 120) return 'moyen';
  return 'eleve';
}

function scoreRace(race: RaceQuizItem, r: Reponses): number {
  let score = 0;

  if (r.logement === 'appartement') score += race.adapteAppartement ? 3 : -6;
  if (r.logement === 'maison_jardin') score += 3; // une maison avec jardin convient à toutes les races

  if (r.taille && r.taille !== 'peu_importe') {
    const distance = Math.abs(TAILLE_ORDRE[tailleRace(race)] - TAILLE_ORDRE[r.taille]);
    score += Math.max(0, 2 - distance);
  }

  if (r.activite) {
    const distance = Math.abs(NIVEAU_ORDRE[race.niveauActivite] - NIVEAU_CIBLE[r.activite]);
    score += Math.max(0, 3 - distance);
  }

  // Pas de champ "adapté débutant" dans les fiches (ce serait un jugement
  // trop tranché pour figurer dans une fiche factuelle) — heuristique
  // éditoriale assumée : un niveau d'activité très élevé demande une
  // expérience réelle d'éducation canine, le reste convient à un débutant.
  if (r.experience === 'debutant' && race.niveauActivite === 'tres_eleve') score -= 3;

  if (r.budget && r.budget !== 'peu_importe') {
    const distance = Math.abs(BUDGET_ORDRE[budgetRace(race)] - BUDGET_ORDRE[r.budget]);
    score += Math.max(0, 2 - distance);
  }

  if (r.aboiement === 'faible' && race.aboiement) {
    score += race.aboiement === 'rare' ? 1.5 : race.aboiement === 'occasionnel' ? 0.5 : -1.5;
  }

  if (r.enfants === true) {
    // Critère éliminatoire plutôt que simple bonus : avec de jeunes enfants,
    // une race non recommandée ne doit pas remonter dans le classement.
    score += race.adapteEnfants ? 1 : -10;
  }

  return score;
}

const QUESTIONS = [
  {
    key: 'logement' as const,
    label: 'Où vivez-vous ?',
    options: [
      { value: 'appartement', label: 'En appartement' },
      { value: 'maison_jardin', label: 'En maison avec jardin' },
    ],
  },
  {
    key: 'taille' as const,
    label: 'Quelle taille de chien recherchez-vous ?',
    options: [
      { value: 'petit', label: 'Petit (moins de 9 kg)' },
      { value: 'moyen', label: 'Moyen (9 à 23 kg)' },
      { value: 'grand', label: 'Grand (plus de 23 kg)' },
      { value: 'peu_importe', label: 'Peu importe' },
    ],
  },
  {
    key: 'activite' as const,
    label: "Combien de temps pouvez-vous consacrer à l'exercice de votre chien chaque jour ?",
    options: [
      { value: 'faible', label: 'Moins de 30 minutes' },
      { value: 'modere', label: '30 minutes à 1h' },
      { value: 'eleve', label: 'Plus d\'1h30, activement' },
    ],
  },
  {
    key: 'experience' as const,
    label: 'Avez-vous déjà eu un chien ?',
    options: [
      { value: 'debutant', label: "Non, c'est une première" },
      { value: 'confirme', label: 'Oui, je suis expérimenté(e)' },
    ],
  },
  {
    key: 'budget' as const,
    label: 'Quel budget mensuel visez-vous pour ce chien ?',
    options: [
      { value: 'bas', label: 'Moins de 70 € / mois' },
      { value: 'moyen', label: '70 à 120 € / mois' },
      { value: 'eleve', label: 'Plus de 120 € / mois' },
      { value: 'peu_importe', label: 'Peu importe' },
    ],
  },
  {
    key: 'aboiement' as const,
    label: 'La tolérance de votre voisinage aux aboiements, ça compte pour vous ?',
    options: [
      { value: 'faible', label: 'Je préfère un chien qui aboie peu' },
      { value: 'peu_importe', label: 'Peu importe' },
    ],
  },
];

const boutonReponse =
  'select-none block w-full border border-sable-400 bg-sable-50 px-4 py-3 text-left font-medium transition-colors duration-150 hover:border-terracotta-400 active:scale-[0.98]';

export default function QuizRace({ races }: Props) {
  const [step, setStep] = useState(0);
  const [reponses, setReponses] = useState<Reponses>({
    logement: null,
    taille: null,
    activite: null,
    experience: null,
    budget: null,
    aboiement: null,
    enfants: null,
  });
  const [termine, setTermine] = useState(false);

  const titreRef = useRef<HTMLHeadingElement>(null);
  const premierRendu = useRef(true);
  // Verrou anti-double-clic : chaque question remonte entièrement (cf. key
  // sur le conteneur plus bas), donc un double-clic rapide sur une réponse
  // fait atterrir le second clic sur le premier bouton de la question
  // suivante, à la même position à l'écran — ça saute une question sans
  // que l'utilisateur ait rien vu. Reproduit et confirmé en testant un vrai
  // double-clic natif avant ce correctif. Le verrou se relâche une fois la
  // nouvelle question affichée (même effet que le focus ci-dessous).
  const enTraitement = useRef(false);
  // Garde dédiée : `premierRendu` ci-dessous est déjà consommé par l'effet
  // de focus (même commit, même passage), donc inutilisable tel quel pour
  // distinguer "premier rendu" dans un second effet sur les mêmes deps.
  const premierRenduAnalytics = useRef(true);

  // Après chaque étape, le focus clavier suit le nouveau titre : sans ça, le
  // titre change visuellement mais le focus reste sur le bouton disparu, et
  // un utilisateur clavier/lecteur d'écran perd le fil du quiz.
  useEffect(() => {
    enTraitement.current = false;
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    titreRef.current?.focus();
  }, [step, termine]);

  const totalSteps = QUESTIONS.length + 1; // + question enfants

  function repondre(key: keyof Reponses, value: unknown) {
    if (enTraitement.current) return;
    enTraitement.current = true;
    setReponses((prev) => ({ ...prev, [key]: value }));
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setTermine(true);
    }
  }

  const resultats = [...races].sort((a, b) => scoreRace(b, reponses) - scoreRace(a, reponses)).slice(0, 3);

  // Tunnel de conversion : démarrage au montage (implicite, ce useEffect ne
  // se déclenche qu'après), puis une lecture par question atteinte (permet
  // de calculer le taux d'abandon par étape dans GA4), et l'issue finale
  // avec le premier résultat obtenu.
  useEffect(() => {
    if (premierRenduAnalytics.current) {
      premierRenduAnalytics.current = false;
      trackEvent('quiz_start');
      return;
    }
    if (termine) {
      trackEvent('quiz_complete', { top_result: resultats[0]?.slug });
    } else {
      trackEvent('quiz_step', { step: step + 1, total: totalSteps });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, termine]);

  function recommencer() {
    setReponses({
      logement: null,
      taille: null,
      activite: null,
      experience: null,
      budget: null,
      aboiement: null,
      enfants: null,
    });
    setStep(0);
    setTermine(false);
  }

  let contenu;

  if (termine) {
    contenu = (
      <div>
        <h2 ref={titreRef} tabIndex={-1} class="mb-6 font-display text-2xl font-medium text-encre-900">
          Vos races recommandées
        </h2>
        <div class="space-y-4">
          {resultats.map((race, i) => (
            <div key={race.slug} class="border border-sable-300 bg-sable-50 p-5">
              <p class="text-sm font-medium text-terracotta-600">#{i + 1} correspondance</p>
              <h3 class="mt-1 font-display text-xl font-medium">{race.nom}</h3>
              <p class="mt-1 text-encre-700">{race.resume}</p>
              <a
                href={`/chiens/races/${race.slug}/`}
                class="mt-3 inline-block text-sm font-medium text-encre-900 hover:text-terracotta-600"
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
          Recommencer le quiz
        </button>
      </div>
    );
  } else if (step < QUESTIONS.length) {
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
            <button key={opt.value} type="button" onClick={() => repondre(q.key, opt.value)} class={boutonReponse}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  } else {
    // Dernière question : enfants (booléenne, gérée à part)
    contenu = (
      <div>
        <p class="mb-2 text-sm text-encre-700/80">
          Question {totalSteps} / {totalSteps}
        </p>
        <h2 ref={titreRef} tabIndex={-1} class="mb-6 font-display text-xl font-medium text-encre-900">
          Avez-vous (ou prévoyez-vous d'avoir) des enfants en bas âge à la maison ?
        </h2>
        <div class="space-y-3">
          <button type="button" onClick={() => repondre('enfants', true)} class={boutonReponse}>
            Oui
          </button>
          <button type="button" onClick={() => repondre('enfants', false)} class={boutonReponse}>
            Non
          </button>
        </div>
      </div>
    );
  }

  // La clé force un remount à chaque changement d'étape, ce qui relance le
  // fondu CSS — chaque question et le résultat final apparaissent en douceur.
  return (
    <div class="fade-in" key={termine ? 'resultat' : `q${step}`}>
      {contenu}
    </div>
  );
}
