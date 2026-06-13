// UI wiring: load an image, read the controls, re-render on change,
// and hand the result to copy/download.

import { imageToEmoji } from './converter.js';

const $ = (id) => document.getElementById(id);

const els = {
  dropzone: $('dropzone'),
  fileInput: $('fileInput'),
  sampleBtn: $('sampleBtn'),
  mode: document.querySelectorAll('input[name="mode"]'),
  presets: document.querySelectorAll('.presets button'),
  cols: $('cols'),
  colsOut: $('colsOut'),
  wrapWarning: $('wrapWarning'),
  palette: $('palette'),
  paletteWarn: $('paletteWarn'),
  spacing: $('spacing'),
  trim: $('trim'),
  dither: $('dither'),
  autoContrast: $('autoContrast'),
  invert: $('invert'),
  background: $('background'),
  output: $('output'),
  dims: $('dims'),
  zoom: $('zoom'),
  copyBtn: $('copyBtn'),
  downloadBtn: $('downloadBtn'),
  copyHint: $('copyHint'),
  copyFallback: $('copyFallback'),
};

let currentImage = null;
let currentText = '';

function readOpts() {
  return {
    cols: +els.cols.value,
    mode: [...els.mode].find((r) => r.checked).value,
    palette: els.palette.value,
    trim: els.trim.checked,
    dither: els.dither.checked,
    autoContrast: els.autoContrast.checked,
    invert: els.invert.checked,
    spacing: els.spacing.value,
    background: els.background.value,
  };
}

function syncOutputs(opts) {
  els.colsOut.value = opts.cols;
  els.wrapWarning.classList.toggle('hidden', opts.cols <= 28);
  els.paletteWarn.classList.toggle('hidden', opts.palette !== 'expanded');
  document.querySelectorAll('[data-only]').forEach((el) => {
    el.classList.toggle('hidden', el.dataset.only !== opts.mode);
  });
}

function render() {
  const opts = readOpts();
  syncOutputs(opts);
  if (!currentImage) return;

  const { text, cols, rows, lineHeight } = imageToEmoji(currentImage, opts);
  currentText = text;
  els.output.textContent = text;
  // Match the preview's line-height to the chosen chat spacing so the preview
  // looks like what will actually paste (WYSIWYG).
  els.output.style.lineHeight = lineHeight;
  els.dims.textContent = `${cols} × ${rows} = ${cols * rows} emoji`;
  els.copyBtn.disabled = false;
  els.downloadBtn.disabled = false;
}

let raf = 0;
function scheduleRender() {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(render);
}

function loadFromSrc(src) {
  const img = new Image();
  img.onload = () => {
    currentImage = img;
    render();
  };
  img.onerror = () => {
    els.output.textContent = "Couldn't read that image. Try a PNG or JPG.";
  };
  img.src = src;
}

function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = (e) => loadFromSrc(e.target.result);
  reader.readAsDataURL(file);
}

// ── Input: click / drag / paste ───────────────────────────
els.dropzone.addEventListener('click', () => els.fileInput.click());
els.dropzone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    els.fileInput.click();
  }
});
els.fileInput.addEventListener('change', (e) => loadFile(e.target.files[0]));

['dragenter', 'dragover'].forEach((ev) =>
  els.dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    els.dropzone.classList.add('dragging');
  })
);
['dragleave', 'drop'].forEach((ev) =>
  els.dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    els.dropzone.classList.remove('dragging');
  })
);
els.dropzone.addEventListener('drop', (e) => loadFile(e.dataTransfer.files[0]));

window.addEventListener('paste', (e) => {
  const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith('image/'));
  if (item) loadFile(item.getAsFile());
});

// ── Controls ──────────────────────────────────────────────
[
  ...els.mode,
  els.cols, els.palette, els.spacing, els.trim, els.dither,
  els.autoContrast, els.invert, els.background,
].forEach((el) => el.addEventListener('input', scheduleRender));

els.presets.forEach((btn) =>
  btn.addEventListener('click', () => {
    els.cols.value = btn.dataset.cols;
    scheduleRender();
  })
);

els.zoom.addEventListener('input', () => {
  els.output.style.fontSize = `${els.zoom.value}px`;
});
els.output.style.fontSize = `${els.zoom.value}px`;

// ── Copy / download ───────────────────────────────────────
async function copyText() {
  if (!currentText) return;
  try {
    await navigator.clipboard.writeText(currentText);
    flashCopied();
  } catch {
    els.copyFallback.value = currentText;
    els.copyFallback.select();
    try {
      document.execCommand('copy');
      flashCopied();
    } catch {
      els.copyHint.textContent = 'Copy failed — select the art and copy manually.';
    }
    els.copyFallback.blur();
  }
}
function flashCopied() {
  els.copyHint.textContent = '✅ Copied! Paste it into any chat.';
  setTimeout(() => (els.copyHint.textContent = ''), 2500);
}
els.copyBtn.addEventListener('click', copyText);

els.downloadBtn.addEventListener('click', () => {
  if (!currentText) return;
  const blob = new Blob([currentText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'emojii.txt';
  a.click();
  URL.revokeObjectURL(url);
});

// ── Sample image (generated, no external asset) ───────────
els.sampleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  loadFromSrc(makeSampleSvg());
});

function makeSampleSvg() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#4aa3ff"/><stop offset="1" stop-color="#bfe3ff"/>
      </linearGradient>
    </defs>
    <rect width="240" height="240" fill="url(#sky)"/>
    <circle cx="185" cy="55" r="30" fill="#ffd83a"/>
    <rect y="165" width="240" height="75" fill="#43a047"/>
    <polygon points="40,165 95,70 150,165" fill="#7a5547"/>
    <polygon points="60,165 95,105 130,165" fill="#9c6b58"/>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

// ── PWA / offline ─────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () =>
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  );
}

syncOutputs(readOpts());
