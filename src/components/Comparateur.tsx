import { useEffect, useMemo, useState } from 'preact/hooks';
import { trackEvent } from '../lib/analytics';

type NiveauActivite = 'faible' | 'modere' | 'eleve' | 'tres_eleve';
type Aboiement = 'rare' | 'occasionnel' | 'frequent';

export interface CompareItem {
  slug: string;
  nom: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  tailleMin: number;
  tailleMax: number;
  poidsMin: number;
  poidsMax: number;
  esperanceMin: number;
  esperanceMax: number;
  niveauActivite: NiveauActivite;
  typeDePoil: string;
  aboiement?: Aboiement;
  adapteAppartement: boolean;
  adapteEnfants: boolean;
  prixAchatMin: number;
  prixAchatMax: number;
  coutMensuelMin: number;
  coutMensuelMax: number;
}

interface Props {
  chiens: CompareItem[];
  chats: CompareItem[];
}

const NIVEAU_LABEL: Record<NiveauActivite, string> = {
  faible: 'Faible',
  modere: 'Modéré',
  eleve: 'Élevé',
  tres_eleve: 'Très élevé',
};

const ABOIEMENT_LABEL: Record<Aboiement, string> = {
  rare: 'Rare',
  occasionnel: 'Occasionnel',
  frequent: 'Fréquent',
};

function lireSelectionDepuisUrl(): { espece: 'chien' | 'chat'; slugs: string[] } | null {
  const params = new URLSearchParams(window.location.search);
  const especes = params.get('especes');
  const races = params.get('races');
  if ((especes !== 'chien' && especes !== 'chat') || !races) return null;
  const slugs = races.split(',').filter(Boolean);
  if (slugs.length < 2) return null;
  return { espece: especes, slugs };
}

export default function Comparateur({ chiens, chats }: Props) {
  const [selection, setSelection] = useState<{ espece: 'chien' | 'chat'; slugs: string[] } | null>(null);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    const initiale = lireSelectionDepuisUrl();
    setSelection(initiale);
    setPret(true);
    if (initiale) {
      trackEvent('comparateur_vue', { espece: initiale.espece, races: initiale.slugs });
    }
  }, []);

  const dataset = selection?.espece === 'chat' ? chats : chiens;
  const items = useMemo(
    () => (selection ? selection.slugs.map((s) => dataset.find((r) => r.slug === s)).filter((r): r is CompareItem => !!r) : []),
    [selection, dataset]
  );

  function retirer(slug: string) {
    if (!selection) return;
    const slugs = selection.slugs.filter((s) => s !== slug);
    if (slugs.length < 2) {
      setSelection(null);
      window.history.replaceState(null, '', '/comparateur/');
      return;
    }
    const nouvelle = { ...selection, slugs };
    setSelection(nouvelle);
    const params = new URLSearchParams({ especes: nouvelle.espece, races: slugs.join(',') });
    window.history.replaceState(null, '', `/comparateur/?${params.toString()}`);
  }

  if (!pret) return null;

  if (!selection || items.length < 2) {
    return (
      <div class="border border-sable-300 bg-sable-50 p-6 text-center">
        <p class="text-encre-700">
          Sélectionnez 2 à 3 races à comparer depuis les pages{' '}
          <a href="/chiens/" class="font-medium text-terracotta-600 hover:text-terracotta-500">Chiens</a> ou{' '}
          <a href="/chats/" class="font-medium text-terracotta-600 hover:text-terracotta-500">Chats</a> — cochez
          "Comparer" sur les fiches qui vous intéressent, puis validez depuis la barre en bas de page.
        </p>
      </div>
    );
  }

  const lignes: { label: string; rendu: (item: CompareItem) => string }[] = [
    { label: 'Taille', rendu: (i) => `${i.tailleMin}–${i.tailleMax} cm` },
    { label: 'Poids', rendu: (i) => `${i.poidsMin}–${i.poidsMax} kg` },
    { label: 'Espérance de vie', rendu: (i) => `${i.esperanceMin}–${i.esperanceMax} ans` },
    { label: "Niveau d'activité", rendu: (i) => NIVEAU_LABEL[i.niveauActivite] },
    { label: 'Type de poil', rendu: (i) => i.typeDePoil },
    ...(selection.espece === 'chien'
      ? [{ label: 'Aboiement', rendu: (i: CompareItem) => (i.aboiement ? ABOIEMENT_LABEL[i.aboiement] : '—') }]
      : []),
    { label: 'Adapté appartement', rendu: (i) => (i.adapteAppartement ? 'Oui' : 'Non') },
    { label: 'Compatible enfants', rendu: (i) => (i.adapteEnfants ? 'Oui' : 'Non') },
    { label: "Prix d'achat", rendu: (i) => `${i.prixAchatMin}–${i.prixAchatMax} €` },
    { label: 'Coût mensuel', rendu: (i) => `${i.coutMensuelMin}–${i.coutMensuelMax} €` },
  ];

  return (
    <div class="overflow-x-auto">
      <table class="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr>
            <th class="w-40"></th>
            {items.map((item) => (
              <th key={item.slug} class="border-b border-sable-300 px-3 pb-4 text-left align-bottom">
                <a href={item.href} class="block">
                  <img src={item.imageSrc} alt={item.imageAlt} class="aspect-[4/3] w-full border border-sable-300 object-cover" />
                  <span class="mt-2 block font-display text-base font-medium text-encre-900 hover:text-terracotta-600">
                    {item.nom}
                  </span>
                </a>
                <button
                  type="button"
                  onClick={() => retirer(item.slug)}
                  class="mt-1 text-xs font-medium text-encre-700/80 hover:text-terracotta-600"
                >
                  Retirer
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lignes.map((ligne) => (
            <tr key={ligne.label} class="border-b border-sable-300 align-top">
              <th class="py-3 pr-3 text-left font-medium text-encre-900">{ligne.label}</th>
              {items.map((item) => (
                <td key={item.slug} class="py-3 px-3 text-encre-700">
                  {ligne.rendu(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
