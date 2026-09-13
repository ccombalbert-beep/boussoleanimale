import { useEffect, useRef, useState } from 'preact/hooks';

type Logement = 'appartement' | 'maison_jardin';
type Activite = 'faible' | 'modere' | 'eleve';
type Experience = 'debutant' | 'confirme';
type Poil = 'peu_importe' | 'faible';

interface Reponses {
  logement: Logement | null;
  activite: Activite | null;
  experience: Experience | null;
  enfants: boolean | null;
  poil: Poil | null;
}

interface Race {
  slug: string;
  nom: string;
  ficheDisponible: boolean;
  logement: Logement[];
  activite: Activite[];
  experience: Experience[];
  compatibleEnfants: boolean;
  entretienFaible: boolean;
  description: string;
}

const RACES: Race[] = [
  {
    slug: 'berger-australien',
    nom: 'Berger Australien',
    ficheDisponible: true,
    logement: ['maison_jardin'],
    activite: ['eleve'],
    experience: ['confirme'],
    compatibleEnfants: true,
    entretienFaible: false,
    description: "Sportif et intelligent, il a besoin d'une vraie mission quotidienne.",
  },
  {
    slug: 'bouledogue-francais',
    nom: 'Bouledogue Français',
    ficheDisponible: true,
    logement: ['appartement', 'maison_jardin'],
    activite: ['faible'],
    experience: ['debutant', 'confirme'],
    compatibleEnfants: true,
    entretienFaible: true,
    description: 'Calme, adaptable, parfait compagnon urbain à faible besoin sportif.',
  },
  {
    slug: 'labrador',
    nom: 'Labrador',
    ficheDisponible: true,
    logement: ['maison_jardin'],
    activite: ['modere', 'eleve'],
    experience: ['debutant', 'confirme'],
    compatibleEnfants: true,
    entretienFaible: true,
    description: 'Sociable et équilibré, excellent premier chien familial.',
  },
  {
    slug: 'cavalier-king-charles',
    nom: 'Cavalier King Charles',
    ficheDisponible: true,
    logement: ['appartement', 'maison_jardin'],
    activite: ['faible', 'modere'],
    experience: ['debutant'],
    compatibleEnfants: true,
    entretienFaible: false,
    description: 'Doux et câlin, très adaptable à la vie en appartement.',
  },
  {
    slug: 'border-collie',
    nom: 'Border Collie',
    ficheDisponible: true,
    logement: ['maison_jardin'],
    activite: ['eleve'],
    experience: ['confirme'],
    compatibleEnfants: true,
    entretienFaible: false,
    description: "Extrêmement intelligent, exige un travail mental quotidien intense.",
  },
  {
    slug: 'chihuahua',
    nom: 'Chihuahua',
    ficheDisponible: true,
    logement: ['appartement', 'maison_jardin'],
    activite: ['faible'],
    experience: ['debutant', 'confirme'],
    compatibleEnfants: false,
    entretienFaible: true,
    description: 'Petit format, faibles besoins physiques, mais fragile avec les jeunes enfants.',
  },
];

function scoreRace(race: Race, r: Reponses): number {
  let score = 0;
  if (r.logement && race.logement.includes(r.logement)) score += 3;
  if (r.activite && race.activite.includes(r.activite)) score += 3;
  if (r.experience && race.experience.includes(r.experience)) score += 2;
  if (r.enfants === true) {
    // Critère éliminatoire plutôt que simple bonus : avec de jeunes enfants,
    // une race non recommandée ne doit pas remonter dans le classement.
    score += race.compatibleEnfants ? 1 : -10;
  }
  if (r.poil === 'faible' && race.entretienFaible) score += 1;
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
    key: 'poil' as const,
    label: "Le brossage et la gestion des poils, c'est important pour vous ?",
    options: [
      { value: 'faible', label: 'Je veux un entretien minimal' },
      { value: 'peu_importe', label: 'Peu importe' },
    ],
  },
];

const boutonReponse =
  'select-none block w-full border border-sable-400 bg-sable-50 px-4 py-3 text-left font-medium transition-colors duration-150 hover:border-terracotta-400 active:scale-[0.98]';

export default function QuizRace() {
  const [step, setStep] = useState(0);
  const [reponses, setReponses] = useState<Reponses>({
    logement: null,
    activite: null,
    experience: null,
    enfants: null,
    poil: null,
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

  const resultats = [...RACES].sort((a, b) => scoreRace(b, reponses) - scoreRace(a, reponses)).slice(0, 3);

  function recommencer() {
    setReponses({ logement: null, activite: null, experience: null, enfants: null, poil: null });
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
              <p class="mt-1 text-encre-700">{race.description}</p>
              {race.ficheDisponible ? (
                <a
                  href={`/chiens/races/${race.slug}/`}
                  class="mt-3 inline-block text-sm font-medium text-encre-900 hover:text-terracotta-600"
                >
                  Voir la fiche complète →
                </a>
              ) : (
                <p class="mt-3 text-sm text-encre-700/80">Fiche complète bientôt disponible</p>
              )}
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
