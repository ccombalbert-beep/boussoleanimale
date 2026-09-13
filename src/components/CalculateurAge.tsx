import { useMemo, useState } from 'preact/hooks';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';

type Espece = 'chien' | 'chat';
type TailleChien = 'petit' | 'moyen' | 'grand' | 'geant';

// Barème vétérinaire consensuel (AAHA / AAFP / International Cat Care) :
// 1 an = 15 ans humains, 2 ans = 24 ans humains, puis un rythme annuel qui
// varie selon le gabarit pour les chiens (les grandes races vieillissent
// plus vite après leur maturité), et fixe pour les chats.
const RYTHME_ANNUEL_CHIEN: Record<TailleChien, number> = {
  petit: 4,
  moyen: 5,
  grand: 6,
  geant: 7,
};
const RYTHME_ANNUEL_CHAT = 4;

const TAILLE_LABELS: Record<TailleChien, { label: string; sousTitre: string }> = {
  petit: { label: 'Petit', sousTitre: '< 9 kg' },
  moyen: { label: 'Moyen', sousTitre: '9 à 23 kg' },
  grand: { label: 'Grand', sousTitre: '23 à 40 kg' },
  geant: { label: 'Géant', sousTitre: '> 40 kg' },
};

function ageHumain(ageAnimal: number, rythmeAnnuel: number): number {
  if (ageAnimal <= 0) return 0;
  if (ageAnimal === 1) return 15;
  return Math.round(24 + (ageAnimal - 2) * rythmeAnnuel);
}

export default function CalculateurAge() {
  const [espece, setEspece] = useState<Espece>('chien');
  const [taille, setTaille] = useState<TailleChien>('moyen');
  const [age, setAge] = useState(3);

  const rythme = espece === 'chien' ? RYTHME_ANNUEL_CHIEN[taille] : RYTHME_ANNUEL_CHAT;
  const resultat = useMemo(() => ageHumain(age, rythme), [age, rythme]);
  const resultatAnime = useAnimatedNumber(resultat);

  const maxAge = espece === 'chien' ? 18 : 22;

  return (
    <div class="space-y-8">
      <fieldset class="m-0 min-w-0 border-0 p-0">
        <legend class="mb-2 block text-sm font-medium text-encre-900">Espèce</legend>
        <div class="flex gap-2">
          {(['chien', 'chat'] as Espece[]).map((e) => (
            <button
              key={e}
              type="button"
              aria-pressed={espece === e}
              onClick={() => {
                setEspece(e);
                setAge((a) => Math.min(a, e === 'chien' ? 18 : 22));
              }}
              class={`flex-1 border px-3 py-2 text-sm font-medium capitalize transition-colors duration-150 active:scale-[0.97] ${
                espece === e ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-600' : 'border-sable-400 hover:border-terracotta-300'
              }`}
            >
              {e === 'chien' ? 'Chien' : 'Chat'}
            </button>
          ))}
        </div>
      </fieldset>

      {espece === 'chien' && (
        <fieldset class="m-0 min-w-0 border-0 p-0">
          <legend class="mb-2 block text-sm font-medium text-encre-900">Gabarit adulte du chien</legend>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(Object.keys(TAILLE_LABELS) as TailleChien[]).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={taille === t}
                onClick={() => setTaille(t)}
                class={`border px-3 py-2 text-left text-sm font-medium transition-colors duration-150 active:scale-[0.97] ${
                  taille === t ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-600' : 'border-sable-400 hover:border-terracotta-300'
                }`}
              >
                {TAILLE_LABELS[t].label}
                <span class="block text-xs font-normal text-encre-700/80">{TAILLE_LABELS[t].sousTitre}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div>
        <div class="mb-2 flex items-baseline justify-between text-sm font-medium text-encre-900">
          <label for="age-input">Âge de votre {espece}</label>
          <span class="font-display text-lg text-terracotta-600" aria-hidden="true">{age} an{age > 1 ? 's' : ''}</span>
        </div>
        <input
          id="age-input"
          type="range"
          min="1"
          max={maxAge}
          step="1"
          value={age}
          aria-valuetext={`${age} an${age > 1 ? 's' : ''}`}
          onInput={(e) => setAge(Number(e.currentTarget.value))}
          class="w-full accent-terracotta-500"
        />
      </div>

      <div class="border border-white/10 bg-boussole-700 p-6 text-center text-white" aria-live="polite" aria-atomic="true">
        <p class="text-sm text-white/90">
          Équivaut à environ
        </p>
        <p class="mt-1 font-display text-5xl font-medium tabular-nums">{resultatAnime} ans</p>
        <p class="mt-1 text-sm text-white/90">en âge humain</p>
      </div>

      <p class="text-xs text-encre-700/80">
        Barème basé sur le consensus vétérinaire AAHA / AAFP (chats) et AAHA (chiens, ajusté par gabarit) : la
        première année compte pour 15 ans humains, la deuxième pour 24, puis chaque année supplémentaire ajoute un
        nombre d'années variable selon l'espèce et le gabarit — les grandes races de chien vieillissent plus vite
        après leur maturité que les petites.
      </p>

      <p class="text-sm text-encre-700">
        Envie d'en savoir plus sur les besoins de votre {espece} à cet âge ?{' '}
        <a
          href={espece === 'chien' ? '/chiens/' : '/chats/'}
          class="font-medium text-terracotta-600 hover:text-terracotta-500"
        >
          Parcourez les races de {espece === 'chien' ? 'chien' : 'chat'}
        </a>{' '}
        ou estimez son{' '}
        <a
          href={espece === 'chien' ? '/outils/cout-mensuel-chien/' : '/outils/cout-mensuel-chat/'}
          class="font-medium text-terracotta-600 hover:text-terracotta-500"
        >
          budget mensuel réel
        </a>.
      </p>
    </div>
  );
}
