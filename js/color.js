// Colour-math helpers used by the converter.

export function luminance(r, g, b) {
  // Rec. 601 perceived brightness, 0..255
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Distance in a luma/chroma opponent space, with chroma weighted up (WC).
// Two reasons this beats plain RGB here:
//   • it's more perceptual, so nearest-colour picks look right;
//   • weighting chroma means a near-neutral pixel prefers the neutral squares
//     (⬛/⬜) over a same-brightness brown — so greys dither into a clean
//     black/white stipple instead of a muddy coloured speckle.
const WC = 2;

export function colorDistance(r1, g1, b1, r2, g2, b2) {
  const y1 = 0.299 * r1 + 0.587 * g1 + 0.114 * b1;
  const y2 = 0.299 * r2 + 0.587 * g2 + 0.114 * b2;
  const co1 = r1 - b1, co2 = r2 - b2;
  const cg1 = g1 - (r1 + b1) / 2, cg2 = g2 - (r2 + b2) / 2;
  const dy = y1 - y2;
  const dco = co1 - co2;
  const dcg = cg1 - cg2;
  return dy * dy + WC * (dco * dco + dcg * dcg);
}
