import { useEffect, useRef, useState } from 'preact/hooks';

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Anime un nombre entier vers sa nouvelle valeur au lieu de le remplacer
 * brutalement — pensé pour les totaux des calculateurs, où le recalcul est
 * l'interaction la plus visible de la page. Saute directement à la valeur
 * finale au premier rendu et si l'utilisateur préfère moins de mouvement.
 */
export function useAnimatedNumber(cible: number, duree = 450): number {
  const [valeur, setValeur] = useState(cible);
  const origine = useRef(cible);
  const debut = useRef<number | null>(null);
  const frame = useRef<number>();
  const premierRendu = useRef(true);

  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      origine.current = cible;
      setValeur(cible);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      origine.current = cible;
      setValeur(cible);
      return;
    }

    const depart = origine.current;
    debut.current = null;

    function tick(horodatage: number) {
      if (debut.current === null) debut.current = horodatage;
      const progres = Math.min((horodatage - debut.current) / duree, 1);
      setValeur(Math.round(depart + (cible - depart) * easeOutCubic(progres)));
      if (progres < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        origine.current = cible;
      }
    }
    frame.current = requestAnimationFrame(tick);

    return () => {
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    };
  }, [cible, duree]);

  return valeur;
}
