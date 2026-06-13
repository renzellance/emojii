// Measure each palette emoji's real average color by rendering it with the
// device's own emoji font. This makes color matching accurate to how the user
// actually sees the emoji, instead of relying on hand-typed guesses.

const SIZE = 32;
const cache = new Map();

let sctx = null;
function ctx() {
  if (sctx) return sctx;
  const c = document.createElement('canvas');
  c.width = SIZE;
  c.height = SIZE;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.font = `${SIZE - 6}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  sctx = x;
  return x;
}

// Returns {r,g,b} averaged over the glyph's opaque pixels, or null on failure.
function measure(emoji) {
  if (cache.has(emoji)) return cache.get(emoji);
  let result = null;
  try {
    const x = ctx();
    x.clearRect(0, 0, SIZE, SIZE);
    x.fillText(emoji, SIZE / 2, SIZE / 2 + 1);
    const { data } = x.getImageData(0, 0, SIZE, SIZE);
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a < 32) continue;
      // Composite against the (transparent) canvas; alpha-weight the average.
      const w = a / 255;
      r += data[i] * w;
      g += data[i + 1] * w;
      b += data[i + 2] * w;
      n += w;
    }
    if (n > 0) result = { r: r / n, g: g / n, b: b / n };
  } catch {
    result = null;
  }
  cache.set(emoji, result);
  return result;
}

// Returns a palette array [{e,r,g,b}] with measured colors where possible,
// falling back to the hardcoded values otherwise.
export function calibratePalette(emojis) {
  return emojis.map((p) => {
    const m = measure(p.e);
    return m ? { e: p.e, r: m.r, g: m.g, b: m.b } : { ...p };
  });
}
