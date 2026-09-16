import { useEffect, useMemo, useState } from 'preact/hooks';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { trackEvent } from '../lib/analytics';

type Taille = 'petit' | 'moyen' | 'grand';
type Gamme = 'standard' | 'premium';

const ALIMENTATION: Record<Taille, Record<Gamme, number>> = {
  petit: { standard: 25, premium: 45 },
  moyen: { standard: 40, premium: 70 },
  grand: { standard: 60, premium: 110 },
};

// Antiparasitaires, vermifuges et provision santé courante — les doses et la
// plupart des actes vétérinaires courants se calculent au poids (voir notre
// guide sur le budget d'un chien), donc ce forfait doit varier avec le
// gabarit comme le fait déjà le coût de l'assurance ci-dessous. Corrigé
// suite à un audit de cohérence (15/09/2026) : un montant fixe de 25 €
// contredisait ce que le site explique lui-même dans sa FAQ budget.
const HYGIENE_VETERINAIRE_BASE: Record<Taille, number> = {
  petit: 18,
  moyen: 25,
  grand: 32,
};

// Exemples de fiches par gabarit, pour lier ce calculateur aux races
// concernées plutôt qu'au seul hub générique.
const RACES_PAR_TAILLE: Record<Taille, { slug: string; nom: string }[]> = {
  petit: [
    { slug: 'chihuahua', nom: 'Chihuahua' },
    { slug: 'cavalier-king-charles', nom: 'Cavalier King Charles' },
  ],
  moyen: [
    { slug: 'cocker-spaniel', nom: 'Cocker Spaniel' },
    { slug: 'basenji', nom: 'Basenji' },
  ],
  grand: [
    { slug: 'labrador', nom: 'Labrador' },
    { slug: 'berger-allemand', nom: 'Berger Allemand' },
  ],
};

export default function CalculateurCout() {
  const [taille, setTaille] = useState<Taille>('moyen');
  const [gamme, setGamme] = useState<Gamme>('standard');
  const [assurance, setAssurance] = useState(false);
  const [toilettage, setToilettage] = useState(false);

  const detail = useMemo(() => {
    const alimentation = ALIMENTATION[taille][gamme];
    const hygieneVeterinaireBase = HYGIENE_VETERINAIRE_BASE[taille];
    const assuranceCout = assurance ? (taille === 'grand' ? 35 : taille === 'moyen' ? 28 : 20) : 0;
    const toilettageCout = toilettage ? 40 : 0;
    const total = alimentation + hygieneVeterinaireBase + assuranceCout + toilettageCout;
    return { alimentation, hygieneVeterinaireBase, assuranceCout, toilettageCout, total };
  }, [taille, gamme, assurance, toilettage]);

  const totalAnime = useAnimatedNumber(detail.total);

  useEffect(() => {
    trackEvent('calculator_view', { calculator: 'cout_chien' });
  }, []);

  function interagir(field: string, value: string | boolean) {
    trackEvent('calculator_interact', { calculator: 'cout_chien', field, value });
  }

  return (
    <div class="grid gap-8 sm:grid-cols-2">
      <div class="space-y-6">
        <fieldset class="m-0 min-w-0 border-0 p-0">
          <legend class="mb-2 block text-sm font-medium text-encre-900">Taille du chien</legend>
          <div class="flex gap-2">
            {(['petit', 'moyen', 'grand'] as Taille[]).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={taille === t}
                onClick={() => { setTaille(t); interagir('taille', t); }}
                class={`flex-1 border px-3 py-2 text-sm font-medium capitalize transition-colors duration-150 active:scale-[0.97] ${
                  taille === t ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-600' : 'border-sable-400 hover:border-terracotta-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset class="m-0 min-w-0 border-0 p-0">
          <legend class="mb-2 block text-sm font-medium text-encre-900">Gamme d'alimentation</legend>
          <div class="flex gap-2">
            {(['standard', 'premium'] as Gamme[]).map((g) => (
              <button
                key={g}
                type="button"
                aria-pressed={gamme === g}
                onClick={() => { setGamme(g); interagir('gamme', g); }}
                class={`flex-1 border px-3 py-2 text-sm font-medium capitalize transition-colors duration-150 active:scale-[0.97] ${
                  gamme === g ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-600' : 'border-sable-400 hover:border-terracotta-300'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </fieldset>

        <label class="flex items-center gap-3 text-sm font-medium text-encre-900">
          <input
            type="checkbox"
            checked={assurance}
            onChange={(e) => { const v = e.currentTarget.checked; setAssurance(v); interagir('assurance', v); }}
          />
          Assurance / mutuelle santé
        </label>

        <label class="flex items-center gap-3 text-sm font-medium text-encre-900">
          <input
            type="checkbox"
            checked={toilettage}
            onChange={(e) => { const v = e.currentTarget.checked; setToilettage(v); interagir('toilettage', v); }}
          />
          Toilettage professionnel régulier
        </label>
      </div>

      <div class="border border-white/10 bg-boussole-700 p-6 text-white" aria-live="polite" aria-atomic="true">
        <p class="text-sm text-white/90">Coût mensuel estimé</p>
        <p class="mt-1 font-display text-4xl font-medium tabular-nums">{totalAnime} €</p>
        <dl class="mt-6 space-y-2 text-sm text-white/90">
          <div class="flex justify-between">
            <dt>Alimentation</dt>
            <dd>{detail.alimentation} €</dd>
          </div>
          <div class="flex justify-between">
            <dt>Santé courante (antiparasitaires...)</dt>
            <dd>{detail.hygieneVeterinaireBase} €</dd>
          </div>
          {assurance && (
            <div class="fade-in flex justify-between">
              <dt>Assurance</dt>
              <dd>{detail.assuranceCout} €</dd>
            </div>
          )}
          {toilettage && (
            <div class="fade-in flex justify-between">
              <dt>Toilettage</dt>
              <dd>{detail.toilettageCout} €</dd>
            </div>
          )}
        </dl>
        <p class="mt-6 text-xs text-white/75">
          Estimation hors frais exceptionnels (chirurgie, garde en vacances, équipement initial).
        </p>
      </div>

      <p class="text-sm text-encre-700 sm:col-span-2">
        Races de gabarit « {taille} » correspondant à cette estimation :{' '}
        {RACES_PAR_TAILLE[taille].map((race, i) => (
          <>
            {i > 0 && ', '}
            <a href={`/chiens/races/${race.slug}/`} class="font-medium text-terracotta-600 hover:text-terracotta-500">
              {race.nom}
            </a>
          </>
        ))}
        {' '}— ou <a href="/chiens/" class="font-medium text-terracotta-600 hover:text-terracotta-500">explorez toutes les races de chien</a>.
      </p>
    </div>
  );
}
