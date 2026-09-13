/**
 * Réduit un texte éditorial (souvent pensé pour l'intro de page, jusqu'à
 * 200 caractères) à une longueur adaptée à une balise meta description
 * (~155 caractères avant troncature Google) — sans jamais couper au milieu
 * d'un mot, et en préférant couper en fin de phrase quand c'est possible.
 */
export function tronquerPourMeta(texte: string, max = 155): string {
  if (texte.length <= max) return texte;

  const zone = texte.slice(0, max);
  const dernierPoint = Math.max(zone.lastIndexOf('. '), zone.lastIndexOf(' — '));
  if (dernierPoint > max * 0.5) {
    return zone.slice(0, dernierPoint + 1).trim();
  }

  const dernierEspace = zone.lastIndexOf(' ');
  return `${zone.slice(0, dernierEspace)}…`;
}
