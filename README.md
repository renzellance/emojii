# emojii 🎨

Turn any image into **copy-paste emoji art** — like ASCII art, but built from
emoji so it keeps its colour and renders across every messaging app.

Upload (or drag, or paste) an image, pick a style, and copy a grid of emoji you
can drop straight into iMessage, WhatsApp, Discord, Slack, Telegram, Instagram —
anywhere that accepts text.

## Why emoji instead of ASCII characters

ASCII art relies on monospace fonts so every character lines up. Emoji are an
even better fit: on essentially every platform they render at a fixed, square
footprint, so a grid of emoji holds its shape when pasted into a chat — *and*
keeps colour. The two things that matter for cross-platform fidelity:

1. **Width.** If a row is wider than the chat bubble it wraps and the art
   breaks. Keep the width small (the app warns past 24). Narrow = safe on phones.
2. **Emoji choice.** Only widely-supported, single-cell emoji are used (the
   colour squares/circles are the safest). No flags, no skin-tone modifiers.

## Two styles

- **🎨 Color mosaic** — each cell becomes the emoji whose average colour is
  nearest the image block. Recognisable pictures made of colored emoji.
- **🌗 Brightness** — classic ASCII feel: image luminance mapped onto a
  dark → light emoji ramp. Best for logos and silhouettes.

## Features

- 100% client-side — your image **never leaves your device** (private, offline-capable).
- Drag-and-drop, click-to-browse, or paste an image from the clipboard.
- Width, palette/ramp, brightness, contrast, vertical-stretch and invert controls.
- Live preview with a zoom that doesn't affect the copied text.
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
js/converter.js         # image → emoji grid engine (canvas)
js/palettes.js          # emoji palettes + brightness ramps with colours
js/color.js             # colour-distance / luminance / adjust helpers
assets/icon.svg         # app icon
manifest.webmanifest    # PWA manifest
sw.js                   # offline service worker
```

## Tweaking the palettes

`js/palettes.js` holds every emoji with a representative average colour. Add an
emoji + its approximate RGB to a palette and nearest-colour matching picks it up
automatically. Stick to single-cell, widely-supported emoji for safe pasting.
