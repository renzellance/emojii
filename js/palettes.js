// Emoji palettes with representative average colours.
//
// Cross-platform rules these palettes follow:
//  • single-codepoint, solidly-filled glyphs that render as one square cell
//    on every major platform (the colour squares/circles are the safest);
//  • no skin-tone modifiers, no flags (regional-indicator pairs render
//    double-wide), minimal use of VS16 (only the red heart needs it);
//  • colours are eyeballed averages of common renderings — close enough for
//    nearest-colour matching, and easy to tweak.

export const MOSAIC_PALETTES = {
  full: [
    { e: '🟥', r: 229, g: 57, b: 53 }, { e: '🔴', r: 221, g: 46, b: 68 },
    { e: '🟧', r: 245, g: 124, b: 0 }, { e: '🟠', r: 240, g: 138, b: 30 },
    { e: '🟨', r: 253, g: 216, b: 53 }, { e: '🟡', r: 248, g: 200, b: 55 },
    { e: '🟩', r: 67, g: 160, b: 71 }, { e: '🟢', r: 90, g: 170, b: 90 },
    { e: '🟦', r: 30, g: 136, b: 229 }, { e: '🔵', r: 60, g: 150, b: 235 },
    { e: '🟪', r: 142, g: 68, b: 173 }, { e: '🟣', r: 160, g: 110, b: 200 },
    { e: '🟫', r: 121, g: 85, b: 72 }, { e: '🟤', r: 130, g: 95, b: 70 },
    { e: '⬛', r: 30, g: 30, b: 30 }, { e: '⬜', r: 236, g: 236, b: 236 },
    { e: '🌸', r: 246, g: 185, b: 205 }, // pink, widens the gamut
    { e: '🪨', r: 120, g: 120, b: 120 }, // mid grey, missing from the squares
  ],
  squares: [
    { e: '🟥', r: 229, g: 57, b: 53 }, { e: '🟧', r: 245, g: 124, b: 0 },
    { e: '🟨', r: 253, g: 216, b: 53 }, { e: '🟩', r: 67, g: 160, b: 71 },
    { e: '🟦', r: 30, g: 136, b: 229 }, { e: '🟪', r: 142, g: 68, b: 173 },
    { e: '🟫', r: 121, g: 85, b: 72 }, { e: '⬛', r: 30, g: 30, b: 30 },
    { e: '⬜', r: 236, g: 236, b: 236 },
  ],
  hearts: [
    { e: '❤️', r: 221, g: 46, b: 68 }, { e: '🧡', r: 244, g: 144, b: 30 },
    { e: '💛', r: 253, g: 216, b: 60 }, { e: '💚', r: 120, g: 180, b: 90 },
    { e: '💙', r: 85, g: 172, b: 238 }, { e: '💜', r: 170, g: 130, b: 210 },
    { e: '🤎', r: 130, g: 95, b: 75 }, { e: '🖤', r: 35, g: 35, b: 35 },
    { e: '🤍', r: 240, g: 240, b: 240 },
  ],
};

// Brightness ramps: ordered dark → light, indexed by luminance.
export const RAMPS = {
  thermal: ['⬛', '🟫', '🟪', '🟥', '🟦', '🟩', '🟧', '🟨', '⬜'],
  mono: ['⬛', '◼️', '◾', '▪️', '▫️', '◽', '◻️', '⬜'],
  blocks: ['⬛', '🟦', '🟩', '🟨', '⬜'],
};
