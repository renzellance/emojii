// The conversion engine: an image in, a string of emoji rows out.
//
// Quality comes from three things working together:
//   1. a width-matched palette (alignment),
//   2. Floyd–Steinberg dithering (makes a ~9-color palette read as full tone),
//   3. colors measured from the real emoji font (accurate matching).

import { luminance, colorDistance } from './color.js';
import { PALETTES, RAMP_SQUARES } from './palettes.js';
import { calibratePalette } from './sampler.js';

const BG_EMOJI = { white: '⬜', black: '⬛', blank: ' ' };

// Map a line-spacing preset to an approximate chat line-height. Used to both
// pick the row count (so the art isn't stretched) and set the preview's
// line-height, keeping the preview faithful to what actually pastes.
export const LINE_HEIGHTS = { compact: 1.15, normal: 1.45, roomy: 1.7 };

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

// Separate small canvas for analysing the image (background crop detection).
const acanvas = document.createElement('canvas');
const actx = acanvas.getContext('2d', { willReadFrequently: true });

// Find the bounding box of the subject by treating pixels close to the corner
// colour (or transparent) as background. Product shots with big plain margins
// then fill the grid instead of wasting it on empty space. Returns a source
// crop rectangle; falls back to the whole image when there's no clear margin.
function computeCrop(source, w, h) {
  const AW = Math.min(200, w);
  const scale = AW / w;
  const AH = Math.max(1, Math.round(h * scale));
  acanvas.width = AW;
  acanvas.height = AH;
  actx.clearRect(0, 0, AW, AH);
  actx.drawImage(source, 0, 0, AW, AH);
  const d = actx.getImageData(0, 0, AW, AH).data;

  const corners = [0, AW - 1, (AH - 1) * AW, (AH - 1) * AW + (AW - 1)];
  let br = 0, bg = 0, bb = 0;
  for (const c of corners) {
    br += d[c * 4];
    bg += d[c * 4 + 1];
    bb += d[c * 4 + 2];
  }
  br /= 4; bg /= 4; bb /= 4;

  const TOL = 32 * 32 * 3; // ~32 per channel
  const isBg = (i) => {
    if (d[i + 3] < 24) return true;
    const dr = d[i] - br, dg = d[i + 1] - bg, db = d[i + 2] - bb;
    return dr * dr + dg * dg + db * db < TOL;
  };

  let minX = AW, minY = AH, maxX = -1, maxY = -1;
  for (let y = 0; y < AH; y++) {
    for (let x = 0; x < AW; x++) {
      if (!isBg((y * AW + x) * 4)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX) return { sx: 0, sy: 0, sw: w, sh: h }; // all background

  const pad = Math.round(Math.max(AW, AH) * 0.03);
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(AW - 1, maxX + pad);
  maxY = Math.min(AH - 1, maxY + pad);
  return {
    sx: minX / scale,
    sy: minY / scale,
    sw: (maxX - minX + 1) / scale,
    sh: (maxY - minY + 1) / scale,
  };
}

// Calibrated palettes are cached so we only sample the emoji font once.
const calCache = new Map();
function getPalette(name) {
  if (calCache.has(name)) return calCache.get(name);
  const def = PALETTES[name] || PALETTES.squares;
  const cal = calibratePalette(def.emojis);
  calCache.set(name, cal);
  return cal;
}

function nearest(pal, r, g, b) {
  let best = 0;
  let bestDist = Infinity;
  for (let k = 0; k < pal.length; k++) {
    const d = colorDistance(r, g, b, pal[k].r, pal[k].g, pal[k].b);
    if (d < bestDist) {
      bestDist = d;
      best = k;
    }
  }
  return best;
}

// Gentle per-channel level stretch using luminance percentiles, so dull photos
// use the palette's full range without garish channel-by-channel shifts.
function autoLevels(buf, n) {
  const lums = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    lums[i] = luminance(buf[i * 3], buf[i * 3 + 1], buf[i * 3 + 2]);
  }
  const sorted = Float32Array.from(lums).sort();
  const lo = sorted[Math.floor(n * 0.02)];
  const hi = sorted[Math.floor(n * 0.98)];
  if (hi - lo < 8) return; // already full range / flat image
  const scale = 255 / (hi - lo);
  for (let i = 0; i < n * 3; i++) {
    buf[i] = (buf[i] - lo) * scale;
  }
}

/**
 * @returns {{ text: string, cols: number, rows: number, lineHeight: number }}
 */
export function imageToEmoji(source, opts) {
  const {
    cols = 32,
    mode = 'mosaic',
    palette = 'squares',
    dither = false,
    trim = true,
    autoContrast = true,
    invert = false,
    spacing = 'normal',
    background = 'white',
  } = opts;

  const w = source.width || source.naturalWidth;
  const h = source.height || source.naturalHeight;
  const crop = trim ? computeCrop(source, w, h) : { sx: 0, sy: 0, sw: w, sh: h };
  const aspect = crop.sw / crop.sh;
  const lineHeight = LINE_HEIGHTS[spacing] ?? LINE_HEIGHTS.normal;

  // Each emoji cell is ~1 wide and ~lineHeight tall once pasted, so divide the
  // row count by lineHeight to keep the picture's real proportions.
  const rows = Math.max(1, Math.round((cols / aspect) / lineHeight));

  canvas.width = cols;
  canvas.height = rows;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, cols, rows);
  ctx.drawImage(source, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, cols, rows);

  const img = ctx.getImageData(0, 0, cols, rows);
  const data = img.data;
  const n = cols * rows;

  // Float RGB working buffer + alpha mask.
  const buf = new Float32Array(n * 3);
  const opaque = new Uint8Array(n);
  const treatTransparent = background !== 'keep';
  for (let i = 0; i < n; i++) {
    const a = data[i * 4 + 3];
    opaque[i] = treatTransparent && a < 32 ? 0 : 1;
    let r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    if (invert) { r = 255 - r; g = 255 - g; b = 255 - b; }
    buf[i * 3] = r;
    buf[i * 3 + 1] = g;
    buf[i * 3 + 2] = b;
  }

  if (autoContrast) autoLevels(buf, n);

  const pal = getPalette(palette);
  const ramp = RAMP_SQUARES;
  const emptyEmoji = BG_EMOJI[background] ?? '⬜';
  const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

  // Floyd–Steinberg error diffusion weights.
  const diffuse = (i, er, eg, eb, f) => {
    if (i < 0 || i >= n || !opaque[i]) return;
    buf[i * 3] += er * f;
    buf[i * 3 + 1] += eg * f;
    buf[i * 3 + 2] += eb * f;
  };

  const out = new Array(n);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (!opaque[i]) { out[i] = emptyEmoji; continue; }
      const r = clamp(buf[i * 3]);
      const g = clamp(buf[i * 3 + 1]);
      const b = clamp(buf[i * 3 + 2]);

      if (mode === 'ramp') {
        const idx = Math.min(ramp.length - 1, Math.floor((luminance(r, g, b) / 256) * ramp.length));
        out[i] = ramp[idx];
        continue;
      }

      const k = nearest(pal, r, g, b);
      out[i] = pal[k].e;

      if (dither) {
        const er = r - pal[k].r, eg = g - pal[k].g, eb = b - pal[k].b;
        diffuse(i + 1, er, eg, eb, 7 / 16); // x+1, y
        diffuse(i + cols - 1, er, eg, eb, 3 / 16); // x-1, y+1
        diffuse(i + cols, er, eg, eb, 5 / 16); // x,   y+1
        diffuse(i + cols + 1, er, eg, eb, 1 / 16); // x+1, y+1
      }
    }
  }

  const lines = [];
  for (let y = 0; y < rows; y++) {
    lines.push(out.slice(y * cols, y * cols + cols).join(''));
  }
  return { text: lines.join('\n'), cols, rows, lineHeight };
}
