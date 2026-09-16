import { useEffect, useRef, useState } from 'preact/hooks';
import { trackEvent } from '../lib/analytics';
import { NIVEAU_ORDRE, TAILLE_ORDRE, tailleChien, BUDGET_ORDRE, budgetRace } from '../lib/raceScoring';

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

// La réponse "eleve" du quiz ("plus d'1h30, activement") doit couvrir aussi
// bien les races 'eleve' que 'tres_eleve' du catalogue — d'où une cible à
// 2.5 plutôt que 2, à mi-chemin entre les deux niveaux réels.
const NIVEAU_CIBLE: Record<Activite, number> = { faible: 0, modere: 1, eleve: 2.5 };

interface Raison {
  texte: string;
  positif: boolean;
}

interface ScoreResultat {
  score: number;
  raisons: Raison[];
}

// Retourne le score ET les raisons qui l'expliquent — jusqu'ici le quiz
// calculait un score opaque sans jamais montrer sa logique à l'utilisateur,
// contrairement au calculateur d'espace vital et au diagnostic unifié.
// Corrigé suite à un audit de cohérence (15/09/2026) : un utilisateur
// répondant "appartement" pouvait se voir recommander une race à activité
// élevée (Cocker Spaniel, Caniche...) sans jamais voir l'avertissement que
// le guide "quelle race pour appartement" formule pourtant explicitement —
// l'appartement ne dispense jamais du besoin d'exercice quotidien réel.
function scoreRace(race: RaceQuizItem, r: Reponses): ScoreResultat {
  const raisons: Raison[] = [];
  let score = 0;

  if (r.logement === 'appartement') {
    if (race.adapteAppartement) {
      score += 3;
      raisons.push({ texte: 'Race documentée comme adaptée à la vie en appartement.', positif: true });
    } else {
      score -= 6;
      raisons.push({ texte: 'Cette race n\'est pas documentée comme adaptée à l\'appartement.', positif: false });
    }
    if (race.niveauActivite === 'eleve' || race.niveauActivite === 'tres_eleve') {
      raisons.push({
        texte: 'Niveau d\'activité élevé : l\'appartement ne dispense pas de sorties quotidiennes réelles et actives.',
        positif: false,
      });
    }
  }
  if (r.logement === 'maison_jardin') {
    score += 3;
    raisons.push({ texte: 'Une maison avec jardin convient à tous les gabarits.', positif: true });
  }

  if (r.taille && r.taille !== 'peu_importe') {
    const taille = tailleChien(race.poidsMin, race.poidsMax);
    const distance = Math.abs(TAILLE_ORDRE[taille] - TAILLE_ORDRE[r.taille]);
    const gain = Math.max(0, 2 - distance);
    score += gain;
    if (distance === 0) {
      raisons.push({ texte: `Gabarit ${taille} : correspond à la taille recherchée.`, positif: true });
    } else if (gain === 0) {
      raisons.push({ texte: `Gabarit ${taille} : sensiblement différent de la taille recherchée.`, positif: false });
    }
  }

  if (r.activite) {
    const distance = Math.abs(NIVEAU_ORDRE[race.niveauActivite] - NIVEAU_CIBLE[r.activite]);
    const gain = Math.max(0, 3 - distance);
    score += gain;
    if (distance <= 0.5) {
      raisons.push({ texte: 'Niveau d\'activité cohérent avec le temps que vous pouvez y consacrer.', positif: true });
    } else if (gain === 0) {
      raisons.push({ texte: 'Niveau d\'activité nettement supérieur au temps que vous pouvez y consacrer.', positif: false });
    }
  }

  // Pas de champ "adapté débutant" dans les fiches (ce serait un jugement
  // trop tranché pour figurer dans une fiche factuelle) — heuristique
  // éditoriale assumée : un niveau d'activité très élevé demande une
  // expérience réelle d'éducation canine, le reste convient à un débutant.
  if (r.experience === 'debutant' && race.niveauActivite === 'tres_eleve') {
    score -= 3;
    raisons.push({
      texte: 'Niveau d\'activité très élevé : demande une vraie expérience d\'éducation, moins recommandé pour une première adoption.',
      positif: false,
    });
  }

  if (r.budget && r.budget !== 'peu_importe') {
    const niveauRace = budgetRace(race.coutMensuelMin, race.coutMensuelMax);
    const distance = Math.abs(BUDGET_ORDRE[niveauRace] - BUDGET_ORDRE[r.budget]);
    const gain = Math.max(0, 2 - distance);
    score += gain;
    if (distance === 0) {
      raisons.push({ texte: `Budget mensuel réel (${race.coutMensuelMin}-${race.coutMensuelMax} €) cohérent avec votre enveloppe.`, positif: true });
    } else if (gain === 0) {
      raisons.push({ texte: `Budget mensuel réel (${race.coutMensuelMin}-${race.coutMensuelMax} €) au-delà de votre enveloppe visée.`, positif: false });
    }
  }

  if (r.aboiement === 'faible' && race.aboiement) {
    if (race.aboiement === 'rare') {
      score += 1.5;
      raisons.push({ texte: 'Aboiement rare, documenté sur la fiche.', positif: true });
    } else if (race.aboiement === 'occasionnel') {
      score += 0.5;
      raisons.push({ texte: 'Aboiement occasionnel : à garder en tête.', positif: true });
    } else {
      score -= 1.5;
      raisons.push({ texte: 'Aboiement fréquent documenté : à anticiper si la tranquillité du voisinage compte pour vous.', positif: false });
    }
  }

  if (r.enfants === true) {
    // Critère quasi-éliminatoire plutôt que simple bonus : avec de jeunes
    // enfants, une race non recommandée ne doit pas remonter dans le
    // classement.
    if (race.adapteEnfants) {
      score += 1;
      raisons.push({ texte: 'Race documentée comme compatible avec de jeunes enfants.', positif: true });
    } else {
      score -= 10;
      raisons.push({ texte: 'Cette race n\'est pas recommandée avec de jeunes enfants en bas âge.', positif: false });
    }
  }

  return { score, raisons };
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

  const resultats = [...races]
    .map((race) => ({ race, ...scoreRace(race, reponses) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

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
      trackEvent('quiz_complete', { top_result: resultats[0]?.race.slug });
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
          {resultats.map((res, i) => (
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
              <a
                href={`/chiens/races/${res.race.slug}/`}
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
