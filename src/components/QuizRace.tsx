import { useState } from 'preact/hooks';

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
    ficheDisponible: false,
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
    ficheDisponible: false,
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
    ficheDisponible: false,
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
    ficheDisponible: false,
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
    ficheDisponible: false,
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

  const totalSteps = QUESTIONS.length + 1; // + question enfants

  function repondre(key: keyof Reponses, value: unknown) {
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

  if (termine) {
    return (
      <div>
        <h2 class="mb-6 font-display text-2xl font-semibold text-encre-900">Vos races recommandées</h2>
        <div class="space-y-4">
          {resultats.map((race, i) => (
            <div key={race.slug} class="rounded-lg border border-sable-300 bg-sable-50 p-5">
              <p class="text-sm font-medium text-terracotta-600">#{i + 1} correspondance</p>
              <h3 class="mt-1 font-display text-xl font-semibold">{race.nom}</h3>
              <p class="mt-1 text-encre-700">{race.description}</p>
              {race.ficheDisponible ? (
                <a
                  href={`/chiens/races/${race.slug}/`}
                  class="mt-3 inline-block text-sm font-medium text-boussole-600 hover:text-terracotta-600"
                >
                  Voir la fiche complète →
                </a>
              ) : (
                <p class="mt-3 text-sm text-encre-700/50">Fiche complète bientôt disponible</p>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={recommencer}
          class="mt-6 rounded-full border border-sable-300 px-5 py-2 text-sm font-medium hover:border-terracotta-400"
        >
          Recommencer le quiz
        </button>
      </div>
    );
  }

  if (step < QUESTIONS.length) {
    const q = QUESTIONS[step];
    return (
      <div>
        <p class="mb-2 text-sm text-encre-700/60">
          Question {step + 1} / {totalSteps}
        </p>
        <h2 class="mb-6 font-display text-xl font-semibold text-encre-900">{q.label}</h2>
        <div class="space-y-3">
          {q.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => repondre(q.key, opt.value)}
              class="block w-full rounded-lg border border-sable-300 bg-sable-50 px-4 py-3 text-left font-medium hover:border-terracotta-400 hover:bg-white"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Dernière question : enfants (booléenne, gérée à part)
  return (
    <div>
      <p class="mb-2 text-sm text-encre-700/60">
        Question {totalSteps} / {totalSteps}
      </p>
      <h2 class="mb-6 font-display text-xl font-semibold text-encre-900">
        Avez-vous (ou prévoyez-vous d'avoir) des enfants en bas âge à la maison ?
      </h2>
      <div class="space-y-3">
        <button
          onClick={() => repondre('enfants', true)}
          class="block w-full rounded-lg border border-sable-300 bg-sable-50 px-4 py-3 text-left font-medium hover:border-terracotta-400 hover:bg-white"
        >
          Oui
        </button>
        <button
          onClick={() => repondre('enfants', false)}
          class="block w-full rounded-lg border border-sable-300 bg-sable-50 px-4 py-3 text-left font-medium hover:border-terracotta-400 hover:bg-white"
        >
          Non
        </button>
      </div>
    </div>
  );
}
