# emojii 🎨

Turn any image into **copy-paste emoji art** — like ASCII art, but built from
emoji so it keeps its colour and renders across every messaging app.

Upload (or drag, or paste) an image, pick a style, and copy a grid of emoji you
can drop straight into iMessage, WhatsApp, Discord, Slack, Telegram, Instagram —
anywhere that accepts text.

## How it gets ASCII-art quality

Three things work together:

1. **A width-matched palette (alignment).** Only emoji that share the same
   character advance width keep their columns aligned when pasted. The large
   colored squares are such a set — this is exactly why Wordle grids
   (🟩🟨⬛⬜) line up perfectly in every app. The default **Squares** palette
   sticks to them. Object emoji (🪨, 🌸, fruit…) have different widths and
   shear the picture apart, so they're only in the opt-in **Expanded** palette.
2. **Floyd–Steinberg dithering.** Nine colors sounds like nothing, but
   diffusing each cell's rounding error into its neighbours turns a limited
   palette into smooth, detailed tone — e.g. a grey screen becomes a fine
   ⬛/⬜ stipple that reads as grey. This is the main quality lever.
3. **Colors sampled from your device's emoji font.** At runtime each emoji is
   rendered and its true average colour measured, so matching is accurate to
   how *you* see them rather than to hand-typed guesses.

Plus a chroma-weighted colour metric so near-neutral pixels prefer the neutral
squares (clean greys instead of muddy coloured speckle), and auto-contrast.

## The detail vs. chat-wrapping tradeoff

Emoji are physically large, so a high-resolution grid is wide and will wrap in a
narrow phone chat (wrapping breaks the art). The **Detail** presets and width
slider let you choose: keep it ≤ ~28 wide for guaranteed phone-chat safety, or
go wider for Discord / large screens. The **Row spacing** setting matches the
art's proportions to your chat app's line height, and the preview mirrors it so
what you see is what pastes.

## Two styles

- **🎨 Color mosaic** — dithered nearest-colour matching; recognisable pictures
  made of colored emoji. The main mode.
- **🌗 Brightness** — image luminance mapped onto a dark → light square ramp,
  for a flatter, logo-friendly look.

## Features

- 100% client-side — your image **never leaves your device** (private, offline-capable).
- Drag-and-drop, click-to-browse, or paste an image from the clipboard.
- Detail presets + width, palette, row-spacing, dithering, auto-contrast and invert controls.
- WYSIWYG live preview with a zoom that doesn't affect the copied text.
- One-tap **Copy** (with a fallback) and **Download .txt**.
- Installable PWA, works offline.

## Run it locally

It's a static site with **no build step and no dependencies**. Serve the folder
with anything, e.g.:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(Open via a server rather than `file://` so the service worker and ES modules
load correctly.)

## Deploy

A GitHub Actions workflow (`.github/workflows/deploy.yml`) publishes the repo
root to **GitHub Pages** on every push to `main`. To enable it:
**Settings → Pages → Build and deployment → Source: GitHub Actions.**

## Project layout

```
index.html              # markup + controls
css/styles.css          # styling (mobile-first, dark theme)
js/main.js              # UI wiring, input handling, copy/download
js/converter.js         # image → emoji grid engine (canvas + dithering)
js/sampler.js           # measures real emoji colours from the device font
js/palettes.js          # width-matched palettes + brightness ramp
js/color.js             # luminance + chroma-weighted colour distance
assets/icon.svg         # app icon
manifest.webmanifest    # PWA manifest
sw.js                   # offline service worker
```

## Tweaking the palettes

`js/palettes.js` defines each palette as a list of emoji with fallback RGB
values (the runtime sampler re-measures them in the browser). Add an emoji to a
palette and matching/dithering pick it up automatically. **For the paste-safe
`squares` palette, only add emoji with the same character width** (the large
colored squares) — mixing widths is what breaks column alignment in chats.
