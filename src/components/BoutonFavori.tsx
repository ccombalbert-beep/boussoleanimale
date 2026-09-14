import { useEffect, useState } from 'preact/hooks';
import { basculerFavori, estFavori, type TypeFavori } from '../lib/favoris';
import { trackEvent } from '../lib/analytics';

interface Props {
  type: TypeFavori;
  slug: string;
  // Variante compacte utilisée en superposition sur les cartes des hubs ;
  // variante standard utilisée seule sur une page de fiche/guide.
  compact?: boolean;
}

export default function BoutonFavori({ type, slug, compact = false }: Props) {
  // false par défaut pour un rendu SSR identique avant hydratation ; la
  // vraie valeur (localStorage, uniquement disponible client-side) est
  // appliquée juste après le montage, avec un léger flash possible — even
  // trade-off pour ne pas bloquer le rendu initial sur du stockage local.
  const [actif, setActif] = useState(false);

  useEffect(() => {
    setActif(estFavori(type, slug));
    const onMaj = () => setActif(estFavori(type, slug));
    window.addEventListener('favoris:maj', onMaj);
    return () => window.removeEventListener('favoris:maj', onMaj);
  }, [type, slug]);

  function basculer(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const nouvelEtat = basculerFavori(type, slug);
    setActif(nouvelEtat);
    trackEvent('favori_bascule', { type, slug, actif: nouvelEtat });
  }

  const taille = compact ? 'h-8 w-8' : 'h-10 w-10';

  return (
    <button
      type="button"
      onClick={basculer}
      aria-pressed={actif}
      aria-label={actif ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      title={actif ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      class={`flex ${taille} items-center justify-center border transition-colors duration-150 active:scale-[0.95] ${
        actif
          ? 'border-terracotta-500 bg-terracotta-500 text-white'
          : 'border-sable-400 bg-sable-50/95 text-encre-700 hover:border-terracotta-400'
      }`}
    >
      <svg viewBox="0 0 20 20" width={compact ? 15 : 17} height={compact ? 15 : 17} aria-hidden="true">
        <path
          d="M10 17.3 3.9 11.4c-2-2-2-5.1 0-7 1.9-2 5.1-2 7 0l1.1 1.1 1.1-1.1c1.9-2 5.1-2 7 0 2 1.9 2 5 0 7L10 17.3Z"
          fill={actif ? 'currentColor' : 'none'}
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  );
}
