// The conversion engine: an <img>/bitmap in, a string of emoji rows out.
// Everything is pixel work on an offscreen canvas — no network, no deps.

import { luminance, colorDistance, adjust } from './color.js';
import { MOSAIC_PALETTES, RAMPS } from './palettes.js';

const BG_EMOJI = { white: '⬜', black: '⬛', blank: ' ' };

// One reusable canvas keeps repeated re-renders cheap while sliders move.
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

function nearestEmoji(palette, r, g, b) {
  let best = palette[0].e;
  let bestDist = Infinity;
  for (const p of palette) {
    const d = colorDistance(r, g, b, p.r, p.g, p.b);
    if (d < bestDist) {
      bestDist = d;
      best = p.e;
    }
  }
  return best;
}

/**
 * @param {HTMLImageElement|ImageBitmap} source
 * @param {object} opts
 * @returns {{ text: string, cols: number, rows: number }}
 */
export function imageToEmoji(source, opts) {
  const {
    cols = 18,
    mode = 'mosaic',
    palette = 'full',
    ramp = 'thermal',
    brightness = 0,
    contrast = 0,
    invert = false,
    stretch = 1,
    background = 'white',
  } = opts;

  const w = source.width || source.naturalWidth;
  const h = source.height || source.naturalHeight;
  const aspect = w / h;

  // Chat clients add a little vertical gap between emoji rows, so square
  // sampling looks stretched. `stretch` lets the user correct it; the default
  // of ~1 is a good starting point and they can nudge it.
  const rows = Math.max(1, Math.round((cols / aspect) * stretch));

  canvas.width = cols;
  canvas.height = rows;
  // Let the browser do the block-averaging for us as it downsamples.
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, cols, rows);
  ctx.drawImage(source, 0, 0, cols, rows);

  const data = ctx.getImageData(0, 0, cols, rows).data;
  const pal = MOSAIC_PALETTES[palette] || MOSAIC_PALETTES.full;
  const ramparr = RAMPS[ramp] || RAMPS.thermal;
  const treatTransparent = background !== 'keep';
  const emptyEmoji = BG_EMOJI[background] ?? '⬜';

  const lines = [];
  for (let y = 0; y < rows; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const a = data[i + 3];
      if (treatTransparent && a < 32) {
        line += emptyEmoji;
        continue;
      }
      let [r, g, b] = adjust(data[i], data[i + 1], data[i + 2], brightness, contrast);
      if (invert) {
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
      }
      if (mode === 'mosaic') {
        line += nearestEmoji(pal, r, g, b);
      } else {
        const lum = luminance(r, g, b);
        const idx = Math.min(ramparr.length - 1, Math.floor((lum / 256) * ramparr.length));
        line += ramparr[idx];
      }
    }
    lines.push(line);
  }

  return { text: lines.join('\n'), cols, rows };
}
