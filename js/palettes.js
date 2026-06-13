// Emoji palettes.
//
// THE cross-platform alignment rule, learned the hard way:
// only emoji that share the SAME character advance width will keep their
// columns aligned when pasted into a chat. The large colored squares are a
// matched-width set — this is exactly why Wordle result grids (🟩🟨⬛⬜) line
// up perfectly in every app on every device. Object emoji (🪨 rock, 🌸 flower,
// fruit, etc.) have different widths and shear the picture apart, so they are
// NOT in the paste-safe set.
//
// The `r,g,b` values here are fallbacks. At runtime the sampler re-measures
// each emoji against the device's own emoji font for accurate matching.

export const PALETTES = {
  // The bulletproof set: 9 width-matched colored squares. Default.
  squares: {
    label: 'Squares (aligns everywhere)',
    safe: true,
    emojis: [
      { e: '🟥', r: 229, g: 57, b: 53 },
      { e: '🟧', r: 245, g: 124, b: 0 },
      { e: '🟨', r: 253, g: 216, b: 53 },
      { e: '🟩', r: 67, g: 160, b: 71 },
      { e: '🟦', r: 30, g: 136, b: 229 },
      { e: '🟪', r: 142, g: 68, b: 173 },
      { e: '🟫', r: 121, g: 85, b: 72 },
      { e: '⬛', r: 30, g: 30, b: 30 },
      { e: '⬜', r: 236, g: 236, b: 236 },
    ],
  },

  // More colors for extra fidelity, at the cost of alignment on some apps.
  // Adds circles (same hues, different shape) plus a few object emoji that
  // widen the gamut (pink / grey / teal-ish) which the squares lack.
  expanded: {
    label: 'Expanded (more colors, may misalign)',
    safe: false,
    emojis: [
      { e: '🟥', r: 229, g: 57, b: 53 },
      { e: '🟧', r: 245, g: 124, b: 0 },
      { e: '🟨', r: 253, g: 216, b: 53 },
      { e: '🟩', r: 67, g: 160, b: 71 },
      { e: '🟦', r: 30, g: 136, b: 229 },
      { e: '🟪', r: 142, g: 68, b: 173 },
      { e: '🟫', r: 121, g: 85, b: 72 },
      { e: '⬛', r: 30, g: 30, b: 30 },
      { e: '⬜', r: 236, g: 236, b: 236 },
      { e: '🟤', r: 130, g: 95, b: 70 },
      { e: '🌸', r: 246, g: 185, b: 205 }, // pink
      { e: '🪨', r: 120, g: 120, b: 120 }, // grey
      { e: '🩵', r: 130, g: 205, b: 235 }, // light blue
      { e: '🫒', r: 110, g: 120, b: 55 }, // olive
      { e: '🍑', r: 245, g: 170, b: 120 }, // peach / skin
    ],
  },
};

// Brightness ramp for the monochrome mode: squares ordered dark → light by
// measured luminance, indexed by image luminance.
export const RAMP_SQUARES = ['⬛', '🟫', '🟪', '🟥', '🟦', '🟩', '🟧', '🟨', '⬜'];
