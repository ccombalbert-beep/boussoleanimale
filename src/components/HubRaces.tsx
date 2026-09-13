import { useMemo, useState } from 'preact/hooks';

type NiveauActivite = 'faible' | 'modere' | 'eleve' | 'tres_eleve';
type Aboiement = 'rare' | 'occasionnel' | 'frequent';

export interface RaceItem {
  slug: string;
  nom: string;
  resume: string;
  imageSrc: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
  niveauActivite: NiveauActivite;
  adapteAppartement: boolean;
  adapteEnfants: boolean;
  aboiement?: Aboiement;
}

interface Props {
  races: RaceItem[];
  espece: 'chien' | 'chat';
}

const NIVEAU_LABEL: Record<NiveauActivite, string> = {
  faible: 'Faible',
  modere: 'Modéré',
  eleve: 'Élevé',
  tres_eleve: 'Très élevé',
};

function normaliser(texte: string) {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export default function HubRaces({ races, espece }: Props) {
  const [recherche, setRecherche] = useState('');
  const [niveauActivite, setNiveauActivite] = useState<NiveauActivite | 'tous'>('tous');
  const [appartement, setAppartement] = useState<'tous' | 'oui'>('tous');
  const [enfants, setEnfants] = useState<'tous' | 'oui'>('tous');
  const [aboiement, setAboiement] = useState<Aboiement | 'tous'>('tous');

  const rechercheNormalisee = normaliser(recherche.trim());

  const resultats = useMemo(() => {
    return races.filter((race) => {
      if (rechercheNormalisee && !normaliser(race.nom).includes(rechercheNormalisee)) return false;
      if (niveauActivite !== 'tous' && race.niveauActivite !== niveauActivite) return false;
      if (appartement === 'oui' && !race.adapteAppartement) return false;
      if (enfants === 'oui' && !race.adapteEnfants) return false;
      if (aboiement !== 'tous' && race.aboiement !== aboiement) return false;
      return true;
    });
  }, [races, rechercheNormalisee, niveauActivite, appartement, enfants, aboiement]);

  const filtresActifs =
    niveauActivite !== 'tous' || appartement !== 'tous' || enfants !== 'tous' || aboiement !== 'tous' || recherche !== '';

  function reinitialiser() {
    setRecherche('');
    setNiveauActivite('tous');
    setAppartement('tous');
    setEnfants('tous');
    setAboiement('tous');
  }

  return (
    <div>
      <div class="border border-sable-300 bg-sable-50 p-4">
        <label class="block">
          <span class="label mb-1.5 block text-encre-700/80">Rechercher une race</span>
          <input
            type="text"
            value={recherche}
            onInput={(e) => setRecherche(e.currentTarget.value)}
            placeholder={espece === 'chien' ? 'Ex. Labrador, Caniche...' : 'Ex. Maine Coon, Persan...'}
            class="w-full border border-sable-400 bg-sable-50 px-3 py-2 text-sm text-encre-900 placeholder:text-encre-700/80 focus:border-terracotta-500"
          />
        </label>

        <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label class="block">
            <span class="label mb-1.5 block text-encre-700/80">Niveau d'activité</span>
            <select
              value={niveauActivite}
              onChange={(e) => setNiveauActivite(e.currentTarget.value as NiveauActivite | 'tous')}
              class="w-full border border-sable-400 bg-sable-50 px-3 py-2 text-sm text-encre-900 focus:border-terracotta-500"
            >
              <option value="tous">Tous</option>
              {(['faible', 'modere', 'eleve', 'tres_eleve'] as NiveauActivite[]).map((n) => (
                <option value={n}>{NIVEAU_LABEL[n]}</option>
              ))}
            </select>
          </label>

          {espece === 'chien' && (
            <label class="block">
              <span class="label mb-1.5 block text-encre-700/80">Aboiement</span>
              <select
                value={aboiement}
                onChange={(e) => setAboiement(e.currentTarget.value as Aboiement | 'tous')}
                class="w-full border border-sable-400 bg-sable-50 px-3 py-2 text-sm text-encre-900 focus:border-terracotta-500"
              >
                <option value="tous">Tous</option>
                <option value="rare">Rare</option>
                <option value="occasionnel">Occasionnel</option>
                <option value="frequent">Fréquent</option>
              </select>
            </label>
          )}

          <label class="flex items-center gap-2 self-end pb-2">
            <input type="checkbox" checked={appartement === 'oui'} onChange={(e) => setAppartement(e.currentTarget.checked ? 'oui' : 'tous')} />
            <span class="text-sm font-medium text-encre-900">Adapté à l'appartement</span>
          </label>

          <label class="flex items-center gap-2 self-end pb-2">
            <input type="checkbox" checked={enfants === 'oui'} onChange={(e) => setEnfants(e.currentTarget.checked ? 'oui' : 'tous')} />
            <span class="text-sm font-medium text-encre-900">Compatible enfants</span>
          </label>
        </div>

        {filtresActifs && (
          <button type="button" onClick={reinitialiser} class="label mt-4 text-terracotta-600 hover:text-terracotta-500">
            Réinitialiser les filtres
          </button>
        )}
      </div>

      <p class="mt-4 text-sm text-encre-700/80" aria-live="polite" aria-atomic="true">
        {resultats.length} race{resultats.length > 1 ? 's' : ''} {filtresActifs ? 'correspondent' : 'au total'}
      </p>

      {resultats.length === 0 ? (
        <p class="mt-8 border border-sable-300 bg-sable-50 p-6 text-center text-encre-700">
          Aucune race ne correspond à ces critères. Essayez d'élargir votre recherche.
        </p>
      ) : (
        <div class="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resultats.map((race, i) => {
            const traits = [
              NIVEAU_LABEL[race.niveauActivite],
              race.adapteAppartement && 'Appartement OK',
              race.adapteEnfants && 'Enfants OK',
            ].filter(Boolean) as string[];
            // La première carte est visible sans scroll à toutes les largeurs
            // (première ligne de la grille, quel que soit le nombre de
            // colonnes) — donc candidate LCP la plus probable de la page. La
            // charger en lazy comme les autres retarderait inutilement son
            // fetch et pénaliserait le LCP réel.
            const estCandidatLCP = i === 0;
            return (
              <a
                href={`/${espece === 'chien' ? 'chiens' : 'chats'}/races/${race.slug}/`}
                class="card-lift group block border border-sable-300 bg-sable-50 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-terracotta-400"
              >
                <div class="relative overflow-hidden border-b border-sable-300 p-2">
                  <img
                    src={race.imageSrc}
                    width={race.imageWidth}
                    height={race.imageHeight}
                    alt={race.imageAlt}
                    loading={estCandidatLCP ? 'eager' : 'lazy'}
                    fetchpriority={estCandidatLCP ? 'high' : undefined}
                    class="race-photo aspect-[4/3] w-full object-cover"
                    style={`view-transition-name: race-photo-${race.slug}`}
                  />
                  <div class="reveal-on-hover pointer-events-none absolute inset-x-2 bottom-2 items-center gap-x-2 bg-boussole-700/90 px-3 py-2 text-xs text-white">
                    {traits.join(' · ')}
                  </div>
                </div>
                <div class="p-4">
                  <h2 class="font-display text-lg font-medium text-encre-900 transition-colors group-hover:text-terracotta-600">{race.nom}</h2>
                  <p class="mt-1 line-clamp-2 text-sm text-encre-700">{race.resume}</p>
                  <p class="reveal-on-touch mt-2 text-xs text-encre-700/80">{traits.join(' · ')}</p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
