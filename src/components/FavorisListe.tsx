import { useEffect, useState } from 'preact/hooks';
import { lireFavoris, type Favoris } from '../lib/favoris';

export interface CarteItem {
  slug: string;
  href: string;
  titre: string;
  resume: string;
  imageSrc: string;
  imageAlt: string;
  etiquette: string;
}

interface Props {
  chiens: CarteItem[];
  chats: CarteItem[];
  guides: CarteItem[];
}

export default function FavorisListe({ chiens, chats, guides }: Props) {
  const [favoris, setFavoris] = useState<Favoris | null>(null);

  useEffect(() => {
    setFavoris(lireFavoris());
    const onMaj = (e: Event) => setFavoris((e as CustomEvent<Favoris>).detail);
    window.addEventListener('favoris:maj', onMaj);
    return () => window.removeEventListener('favoris:maj', onMaj);
  }, []);

  // Pendant l'hydratation (favoris === null), ne rien afficher plutôt qu'un
  // faux "aucun favori" — la vraie liste vit en localStorage, inaccessible
  // avant le montage client.
  if (favoris === null) {
    return <p class="text-encre-700/80">Chargement de vos favoris…</p>;
  }

  const items: CarteItem[] = [
    ...chiens.filter((c) => favoris.chiens.includes(c.slug)),
    ...chats.filter((c) => favoris.chats.includes(c.slug)),
    ...guides.filter((g) => favoris.guides.includes(g.slug)),
  ];

  if (items.length === 0) {
    return (
      <p class="border border-sable-300 bg-sable-50 p-6 text-center text-encre-700">
        Aucun favori pour l'instant. Cliquez sur l'icône{' '}
        <svg viewBox="0 0 20 20" width="14" height="14" class="inline-block align-[-1px]" aria-hidden="true">
          <path
            d="M10 17.3 3.9 11.4c-2-2-2-5.1 0-7 1.9-2 5.1-2 7 0l1.1 1.1 1.1-1.1c1.9-2 5.1-2 7 0 2 1.9 2 5 0 7L10 17.3Z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linejoin="round"
          />
        </svg>{' '}
        sur une fiche race ou un guide pour l'ajouter ici.
      </p>
    );
  }

  return (
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          class="card-lift group block border border-sable-300 bg-sable-50 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-terracotta-400"
        >
          <div class="overflow-hidden border-b border-sable-300 p-2">
            <img src={item.imageSrc} alt={item.imageAlt} loading="lazy" class="aspect-[4/3] w-full object-cover" />
          </div>
          <div class="p-4">
            <p class="label text-terracotta-600">{item.etiquette}</p>
            <h2 class="mt-1 font-display text-lg font-medium text-encre-900 transition-colors group-hover:text-terracotta-600">
              {item.titre}
            </h2>
            <p class="mt-1 line-clamp-2 text-sm text-encre-700">{item.resume}</p>
          </div>
        </a>
      ))}
    </div>
  );
}
