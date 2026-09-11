import { useMemo, useState } from 'preact/hooks';

type Taille = 'petit' | 'moyen' | 'grand';
type Gamme = 'standard' | 'premium';

const ALIMENTATION: Record<Taille, Record<Gamme, number>> = {
  petit: { standard: 25, premium: 45 },
  moyen: { standard: 40, premium: 70 },
  grand: { standard: 60, premium: 110 },
};

export default function CalculateurCout() {
  const [taille, setTaille] = useState<Taille>('moyen');
  const [gamme, setGamme] = useState<Gamme>('standard');
  const [assurance, setAssurance] = useState(false);
  const [toilettage, setToilettage] = useState(false);

  const detail = useMemo(() => {
    const alimentation = ALIMENTATION[taille][gamme];
    const hygieneVeterinaireBase = 25; // antiparasitaires, provision santé courante
    const assuranceCout = assurance ? (taille === 'grand' ? 35 : taille === 'moyen' ? 28 : 20) : 0;
    const toilettageCout = toilettage ? 40 : 0;
    const total = alimentation + hygieneVeterinaireBase + assuranceCout + toilettageCout;
    return { alimentation, hygieneVeterinaireBase, assuranceCout, toilettageCout, total };
  }, [taille, gamme, assurance, toilettage]);

  return (
    <div class="grid gap-8 sm:grid-cols-2">
      <div class="space-y-6">
        <div>
          <label class="mb-2 block text-sm font-medium text-encre-900">Taille du chien</label>
          <div class="flex gap-2">
            {(['petit', 'moyen', 'grand'] as Taille[]).map((t) => (
              <button
                key={t}
                onClick={() => setTaille(t)}
                class={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize ${
                  taille === t ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-600' : 'border-sable-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-encre-900">Gamme d'alimentation</label>
          <div class="flex gap-2">
            {(['standard', 'premium'] as Gamme[]).map((g) => (
              <button
                key={g}
                onClick={() => setGamme(g)}
                class={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize ${
                  gamme === g ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-600' : 'border-sable-300'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <label class="flex items-center gap-3 text-sm font-medium text-encre-900">
          <input type="checkbox" checked={assurance} onChange={(e) => setAssurance(e.currentTarget.checked)} />
          Assurance / mutuelle santé
        </label>

        <label class="flex items-center gap-3 text-sm font-medium text-encre-900">
          <input type="checkbox" checked={toilettage} onChange={(e) => setToilettage(e.currentTarget.checked)} />
          Toilettage professionnel régulier
        </label>
      </div>

      <div class="rounded-lg bg-boussole-700 p-6 text-white">
        <p class="text-sm text-sable-200">Coût mensuel estimé</p>
        <p class="mt-1 font-display text-4xl font-semibold">{detail.total} €</p>
        <dl class="mt-6 space-y-2 text-sm text-sable-200">
          <div class="flex justify-between">
            <dt>Alimentation</dt>
            <dd>{detail.alimentation} €</dd>
          </div>
          <div class="flex justify-between">
            <dt>Santé courante (antiparasitaires...)</dt>
            <dd>{detail.hygieneVeterinaireBase} €</dd>
          </div>
          {assurance && (
            <div class="flex justify-between">
              <dt>Assurance</dt>
              <dd>{detail.assuranceCout} €</dd>
            </div>
          )}
          {toilettage && (
            <div class="flex justify-between">
              <dt>Toilettage</dt>
              <dd>{detail.toilettageCout} €</dd>
            </div>
          )}
        </dl>
        <p class="mt-6 text-xs text-sable-200/70">
          Estimation hors frais exceptionnels (chirurgie, garde en vacances, équipement initial).
        </p>
      </div>
    </div>
  );
}
