// Gabarits visuels — chaque fonction reçoit les données d'une fiche et rend
// un tableau de { name, svg } (une entrée = une slide de carrousel, ou un
// visuel unique pour les formats à une seule image).
import { PALETTE, FONT_DISPLAY, FONT_BODY, esc, wrapText, watermarkSvg } from './visual-helpers.mjs';

const W = 1080;
const H = 1350;

// --- Pilier 1 : fiche spécimen résumée --------------------------------------
function titleFontSize(nom) {
  const len = nom.length;
  if (len <= 14) return 52;
  if (len <= 20) return 44;
  if (len <= 26) return 36;
  return 30;
}

function truncateWithEllipsis(lines, max) {
  if (lines.length <= max) return lines;
  const kept = lines.slice(0, max);
  kept[max - 1] = kept[max - 1].replace(/[.,;:—–\s]*$/, '') + ' …';
  return kept;
}

export function specimenCard(data) {
  const bandTop = 820;
  const chipsTop = bandTop + 150;
  const statChip = (label, value, x) => `
    <g transform="translate(${x}, ${chipsTop})">
      <rect width="300" height="86" rx="10" fill="${PALETTE.sable200}" />
      <text x="150" y="34" text-anchor="middle" font-family="${FONT_BODY}" font-size="15" letter-spacing="1.5" fill="${PALETTE.encre700}">${esc(label)}</text>
      <text x="150" y="66" text-anchor="middle" font-family="${FONT_DISPLAY}" font-weight="700" font-size="26" fill="${PALETTE.encre900}">${esc(value)}</text>
    </g>`;

  const resumeLines = truncateWithEllipsis(wrapText(data.resume, 58), 4);
  const titleSize = titleFontSize(data.nom);

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${PALETTE.encre900}" stop-opacity="0" />
        <stop offset="1" stop-color="${PALETTE.encre900}" stop-opacity="0.55" />
      </linearGradient>
    </defs>
    <rect x="0" y="${bandTop - 140}" width="${W}" height="140" fill="url(#fade)" />
    <rect x="0" y="${bandTop}" width="${W}" height="${H - bandTop}" fill="${PALETTE.sable50}" />
    <rect x="0" y="${bandTop}" width="${W}" height="6" fill="${PALETTE.terracotta500}" />

    <text x="64" y="${bandTop + 56}" font-family="${FONT_BODY}" font-weight="600" font-size="18" letter-spacing="3" fill="${PALETTE.terracotta600}">FICHE NATURALISTE</text>
    <text x="64" y="${bandTop + 120}" font-family="${FONT_DISPLAY}" font-weight="700" font-size="${titleSize}" fill="${PALETTE.encre900}">${esc(data.nom)}</text>

    ${statChip('TAILLE', `${data.taille?.min}–${data.taille?.max} cm`, 64)}
    ${statChip('POIDS', `${data.poids?.min}–${data.poids?.max} kg`, 390)}
    ${statChip('VIE', `${data.esperanceDeVie?.min}–${data.esperanceDeVie?.max} ans`, 716)}

    ${resumeLines.map((l, i) => `<text x="64" y="${chipsTop + 170 + i * 34}" font-family="${FONT_BODY}" font-size="24" fill="${PALETTE.encre700}">${esc(l)}</text>`).join('')}

    ${watermarkSvg(W, H)}
  </svg>`;

  return [{ name: 'specimen', svg }];
}

// --- Pilier 2 : carrousel mythe / réalité (2 slides) ------------------------
export function mytheCarousel(data, { mytheIndex = 0 } = {}) {
  const m = data.mythes?.[mytheIndex];
  if (!m) throw new Error(`Pas de mythe à l'index ${mytheIndex} pour ${data.nom}`);

  const mytheLines = truncateWithEllipsis(wrapText(m.mythe, 30), 6);
  const realiteLines = truncateWithEllipsis(wrapText(m.realite, 34), 9);

  const slide1 = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${PALETTE.encre900}" stop-opacity="0.15" />
        <stop offset="0.55" stop-color="${PALETTE.encre900}" stop-opacity="0.55" />
        <stop offset="1" stop-color="${PALETTE.encre900}" stop-opacity="0.88" />
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#scrim)" />
    <rect x="64" y="820" width="230" height="48" rx="24" fill="${PALETTE.terracotta500}" />
    <text x="179" y="852" text-anchor="middle" font-family="${FONT_BODY}" font-weight="700" font-size="20" letter-spacing="2" fill="${PALETTE.sable50}">IDÉE REÇUE</text>
    ${mytheLines.map((l, i) => `<text x="64" y="${940 + i * 58}" font-family="${FONT_DISPLAY}" font-style="italic" font-weight="600" font-size="46" fill="${PALETTE.sable50}">${esc(l)}</text>`).join('')}
    ${watermarkSvg(W, H)}
  </svg>`;

  const slide2 = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${PALETTE.encre900}" />
    <circle cx="120" cy="150" r="34" fill="${PALETTE.pin600}" />
    <path d="M104 150 L115 162 L138 136" stroke="${PALETTE.sable50}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <text x="176" y="162" font-family="${FONT_BODY}" font-weight="700" font-size="24" letter-spacing="2" fill="${PALETTE.terracotta400}">LA RÉALITÉ</text>
    ${realiteLines.map((l, i) => `<text x="64" y="${250 + i * 48}" font-family="${FONT_BODY}" font-size="30" fill="${PALETTE.sable100}">${esc(l)}</text>`).join('')}
    <text x="64" y="${H - 130}" font-family="${FONT_DISPLAY}" font-weight="700" font-size="34" fill="${PALETTE.sable50}">${esc(data.nom)}</text>
    <text x="64" y="${H - 92}" font-family="${FONT_BODY}" font-size="20" fill="${PALETTE.sable300}">Fiche complète, sources incluses — lien en bio</text>
    ${watermarkSvg(W, H)}
  </svg>`;

  return [
    { name: 'mythe', svg: slide1 },
    { name: 'realite', svg: slide2 },
  ];
}

// --- Pilier 4 : citation naturaliste (photo + légende minimale) ------------
export function naturalisteCard(data) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${PALETTE.encre900}" stop-opacity="0" />
        <stop offset="1" stop-color="${PALETTE.encre900}" stop-opacity="0.75" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="${PALETTE.sable50}" stroke-width="28" />
    <rect x="0" y="${H - 260}" width="${W}" height="260" fill="url(#bottomFade)" />
    <text x="64" y="${H - 150}" font-family="${FONT_DISPLAY}" font-style="italic" font-weight="600" font-size="42" fill="${PALETTE.sable50}">${esc(data.nom)}</text>
    <text x="64" y="${H - 104}" font-family="${FONT_BODY}" font-size="20" letter-spacing="1" fill="${PALETTE.sable200}">${esc((data.origine ?? '').toUpperCase())}</text>
    <text x="64" y="${H - 66}" font-family="${FONT_BODY}" font-size="16" fill="${PALETTE.sable300}">Photo : ${esc(data.imageCredit?.auteur ?? 'Wikimedia Commons')} — ${esc(data.imageCredit?.licence ?? '')}</text>
  </svg>`;
  return [{ name: 'naturaliste', svg }];
}
