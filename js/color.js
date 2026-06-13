// Small colour-math helpers used by the converter.

export function luminance(r, g, b) {
  // Rec. 601 perceived brightness, 0..255
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Weighted "redmean" distance — cheap and noticeably more perceptual than
// plain RGB Euclidean, which matters when matching against a small palette.
// https://www.compuphase.com/cmetric.htm
export function colorDistance(r1, g1, b1, r2, g2, b2) {
  const rmean = (r1 + r2) / 2;
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return (
    (2 + rmean / 256) * dr * dr +
    4 * dg * dg +
    (2 + (255 - rmean) / 256) * db * db
  );
}

const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

// brightness: -100..100  (shifts), contrast: -100..100 (scales around mid-grey)
export function adjust(r, g, b, brightness, contrast) {
  const c = contrast / 100 + 1; // 0..2
  const add = brightness * 2.55; // -255..255
  const f = (v) => clamp((v - 128) * c + 128 + add);
  return [f(r), f(g), f(b)];
}
