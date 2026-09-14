import { useEffect, useMemo, useState } from 'preact/hooks';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { trackEvent } from '../lib/analytics';

type Gamme = 'standard' | 'premium';
type Litiere = 'standard' | 'agglomerante';

const ALIMENTATION: Record<Gamme, number> = {
  standard: 20,
  premium: 40,
};

const LITIERE: Record<Litiere, number> = {
  standard: 12,
  agglomerante: 20,
};

export default function CalculateurCoutChat() {
  const [gamme, setGamme] = useState<Gamme>('standard');
  const [litiere, setLitiere] = useState<Litiere>('standard');
  const [assurance, setAssurance] = useState(false);
  const [exterieur, setExterieur] = useState(false);

  const detail = useMemo(() => {
    const alimentation = ALIMENTATION[gamme];
    const litiereCout = LITIERE[litiere];
    const santeBase = 15; // antiparasitaires, provision santé courante
    const assuranceCout = assurance ? 20 : 0;
    // Un chat sortant est globalement moins exposé aux accidents domestiques
    // mais plus aux parasites, bagarres et maladies infectieuses transmissibles :
    // le suivi vétérinaire de base est en pratique un peu plus sollicité.
    const exterieurCout = exterieur ? 8 : 0;
    const total = alimentation + litiereCout + santeBase + assuranceCout + exterieurCout;
    return { alimentation, litiereCout, santeBase, assuranceCout, exterieurCout, total };
  }, [gamme, litiere, assurance, exterieur]);

  const totalAnime = useAnimatedNumber(detail.total);

  useEffect(() => {
    trackEvent('calculator_view', { calculator: 'cout_chat' });
  }, []);

  function interagir(field: string, value: string | boolean) {
    trackEvent('calculator_interact', { calculator: 'cout_chat', field, value });
  }

  return (
    <div class="grid gap-8 sm:grid-cols-2">
      <div class="space-y-6">
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

        <fieldset class="m-0 min-w-0 border-0 p-0">
          <legend class="mb-2 block text-sm font-medium text-encre-900">Litière</legend>
          <div class="flex gap-2">
            <button
              type="button"
              aria-pressed={litiere === 'standard'}
              onClick={() => { setLitiere('standard'); interagir('litiere', 'standard'); }}
              class={`flex-1 border px-3 py-2 text-sm font-medium transition-colors duration-150 active:scale-[0.97] ${
                litiere === 'standard' ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-600' : 'border-sable-400 hover:border-terracotta-300'
              }`}
            >
              Standard
            </button>
            <button
              type="button"
              aria-pressed={litiere === 'agglomerante'}
              onClick={() => { setLitiere('agglomerante'); interagir('litiere', 'agglomerante'); }}
              class={`flex-1 border px-3 py-2 text-sm font-medium transition-colors duration-150 active:scale-[0.97] ${
                litiere === 'agglomerante' ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-600' : 'border-sable-400 hover:border-terracotta-300'
              }`}
            >
              Agglomérante
            </button>
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
            checked={exterieur}
            onChange={(e) => { const v = e.currentTarget.checked; setExterieur(v); interagir('exterieur', v); }}
          />
          Accès à l'extérieur (parasites, bagarres, vaccins renforcés)
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
            <dt>Litière</dt>
            <dd>{detail.litiereCout} €</dd>
          </div>
          <div class="flex justify-between">
            <dt>Santé courante (antiparasitaires...)</dt>
            <dd>{detail.santeBase} €</dd>
          </div>
          {assurance && (
            <div class="fade-in flex justify-between">
              <dt>Assurance</dt>
              <dd>{detail.assuranceCout} €</dd>
            </div>
          )}
          {exterieur && (
            <div class="fade-in flex justify-between">
              <dt>Suivi renforcé (accès extérieur)</dt>
              <dd>{detail.exterieurCout} €</dd>
            </div>
          )}
        </dl>
        <p class="mt-6 text-xs text-white/75">
          Estimation hors frais exceptionnels (chirurgie, garde en vacances, équipement initial).
        </p>
      </div>

      <p class="text-sm text-encre-700 sm:col-span-2">
        Quelques fiches pour affiner cette estimation selon la race :{' '}
        <a href="/chats/races/maine-coon/" class="font-medium text-terracotta-600 hover:text-terracotta-500">Maine Coon</a>,{' '}
        <a href="/chats/races/europeen/" class="font-medium text-terracotta-600 hover:text-terracotta-500">Européen</a>,{' '}
        <a href="/chats/races/sphynx/" class="font-medium text-terracotta-600 hover:text-terracotta-500">Sphynx</a>
        {' '}— ou <a href="/chats/" class="font-medium text-terracotta-600 hover:text-terracotta-500">explorez toutes les races de chat</a>.
      </p>
    </div>
  );
}
