// Rendu des visuels statiques. Composite une photo (déjà vérifiée, déjà
// utilisée sur le site) avec un calque SVG (texte, dégradés, filigrane).
//
// Limite technique connue et assumée : le moteur SVG de sharp (librsvg) ne
// charge pas les polices variables du site (Newsreader/Inter) même
// installées dans ~/Library/Fonts — cache fontconfig non accessible sans
// Homebrew dans cet environnement. On utilise Georgia (serif, proche
// esprit de Newsreader) et Helvetica Neue (sans, proche esprit d'Inter),
// deux polices système toujours disponibles sur macOS. Pour un rendu
// pixel-parfait avec les vraies polices de marque, cf. README.md
// ("Fidélité typographique") — rendu via un navigateur (Browser tool /
// Puppeteer) au lieu de sharp, qui respecte les vraies polices web.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const PALETTE = {
  sable50: '#fbf8ef',
  sable100: '#f6f1e4',
  sable200: '#ece2c8',
  sable300: '#d6c9a8',
  sable400: '#8f7a4a',
  encre700: '#4a4131',
  encre900: '#15130f',
  terracotta400: '#c69447',
  terracotta500: '#ab7c2e',
  terracotta600: '#7d5a1f',
  pin600: '#3f5c46',
};

export const FONT_DISPLAY = 'Georgia';
export const FONT_BODY = 'Helvetica Neue';

export function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Découpe un texte en lignes qui tiennent dans maxCharsPerLine (approximation
 * simple par nombre de caractères — suffisant pour ce gabarit, pas de mesure
 * de police réelle nécessaire à ce stade).
 */
export function wrapText(text, maxCharsPerLine) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';
  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = w;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Compose une photo de fond (recadrée en "cover") avec un calque SVG
 * (texte, dégradés...) et écrit le PNG final.
 */
export async function renderOverlaidImage({ imagePath, overlaySvg, outPath, width, height }) {
  // 'entropy' (zone à plus forte densité de détail) donne de meilleurs
  // résultats qu'« attention » sur nos photos de fiches, souvent prises en
  // exposition canine/féline avec du texte de sponsor en arrière-plan qui
  // trompait la détection de saillance.
  const bg = await sharp(imagePath)
    .resize(width, height, { fit: 'cover', position: 'entropy' })
    .toBuffer();

  await sharp(bg)
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .png()
    .toFile(outPath);
}

/** Calque plein cadre, sans photo — pour les slides carrousel 100% texte. */
export async function renderFlatImage({ overlaySvg, outPath, width, height }) {
  await sharp(Buffer.from(overlaySvg)).png().toFile(outPath);
}

export function watermarkSvg(width, height) {
  return `<text x="${width / 2}" y="${height - 48}" text-anchor="middle" font-family="${FONT_BODY}" font-weight="600" font-size="24" fill="${PALETTE.terracotta400}" letter-spacing="1">boussoleanimale.fr</text>`;
}
