// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
let currentFormat = 'QR';
let currentMethod = 'camera';
let html5Scanner = null;
let isCameraActive = false;
let lastResult = null;
let generateDebounce = null;

// ─────────────────────────────────────────────
// Tab switching
// ─────────────────────────────────────────────
function switchTab(tab, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  btn.classList.add('active');
  if (tab !== 'scan') stopCamera();
}

// ─────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────
function toast(msg, dur = 2200) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

// ─────────────────────────────────────────────
// GENERATE — Format
// ─────────────────────────────────────────────
function setFormat(fmt, el) {
  currentFormat = fmt;
  document.querySelectorAll('.format-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('qr-options').style.display = fmt === 'QR' ? 'block' : 'none';
  document.getElementById('barcode-options').style.display = fmt !== 'QR' ? 'block' : 'none';
  updateHint();
  clearOutputArea();
}

function updateHint() {
  const hints = {
    QR: 'Any text, URL, email, WiFi, vCard, etc.',
    CODE128: 'Alphanumeric, any length. Used in logistics & shipping.',
    EAN13: 'Exactly 12 or 13 digits. Standard retail barcode.',
    EAN8: 'Exactly 7 or 8 digits. Short retail barcode.',
    CODE39: 'Uppercase A-Z, 0-9, and - . $ / + % space only.'
  };
  document.getElementById('gen-hint').textContent = hints[currentFormat] || '';
}

function onInputChange() {
  clearTimeout(generateDebounce);
  generateDebounce = setTimeout(() => {
    const val = document.getElementById('gen-input').value.trim();
    if (val) generate();
  }, 600);
}

updateHint();

// ─────────────────────────────────────────────
// GENERATE — Core
// ─────────────────────────────────────────────
function generate() {
  const input = document.getElementById('gen-input').value.trim();
  const errEl = document.getElementById('gen-error');
  errEl.textContent = '';

  if (!input) { errEl.textContent = 'Please enter some content.'; return; }

  // Validate
  if (currentFormat === 'EAN13' && !/^\d{12,13}$/.test(input)) {
    errEl.textContent = 'EAN-13 requires exactly 12 or 13 digits.'; return;
  }
  if (currentFormat === 'EAN8' && !/^\d{7,8}$/.test(input)) {
    errEl.textContent = 'EAN-8 requires exactly 7 or 8 digits.'; return;
  }
  if (currentFormat === 'CODE39' && /[^A-Z0-9\-\.\ \$\/\+\%]/.test(input.toUpperCase())) {
    errEl.textContent = 'Code39 only supports A-Z, 0-9, and - . $ / + % space.'; return;
  }

  clearOutputArea();
  const ph = document.getElementById('output-placeholder');
  ph.style.display = 'none';

  try {
    if (currentFormat === 'QR') generateQR(input);
    else generateBarcode(input);
    document.getElementById('output-actions').style.display = 'flex';
    document.getElementById('output-area').classList.add('has-output');
  } catch(e) {
    ph.style.display = 'flex';
    errEl.textContent = 'Generation failed: ' + e.message;
  }
}

function generateQR(text) {
  const container = document.getElementById('qr-output');
  container.innerHTML = '';
  container.style.display = 'block';

  const size = parseInt(document.getElementById('qr-size').value);
  const ecl = document.getElementById('qr-ecl').value;

  new QRCode(container, {
    text: text,
    width: size,
    height: size,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel[ecl]
  });
}

function generateBarcode(text) {
  const svg = document.getElementById('barcode-output');
  const bg = document.getElementById('barcode-output-bg');
  bg.style.display = 'block';

  const width = parseFloat(document.getElementById('bc-width').value);
  const height = parseInt(document.getElementById('bc-height').value);

  const fmtMap = {
    CODE128: 'CODE128',
    EAN13: 'EAN13',
    EAN8: 'EAN8',
    CODE39: 'CODE39'
  };

  JsBarcode(svg, text, {
    format: fmtMap[currentFormat],
    width: width,
    height: height,
    displayValue: true,
    fontOptions: '',
    font: 'monospace',
    textAlign: 'center',
    textPosition: 'bottom',
    textMargin: 4,
    fontSize: 13,
    background: '#ffffff',
    lineColor: '#000000',
    margin: 12
  });
}

function clearGen() {
  document.getElementById('gen-input').value = '';
  document.getElementById('gen-error').textContent = '';
  clearOutputArea();
}

function clearOutputArea() {
  document.getElementById('qr-output').style.display = 'none';
  document.getElementById('qr-output').innerHTML = '';
  document.getElementById('barcode-output-bg').style.display = 'none';
  document.getElementById('output-placeholder').style.display = 'flex';
  document.getElementById('output-actions').style.display = 'none';
  document.getElementById('output-area').classList.remove('has-output');
}

// ─────────────────────────────────────────────
// GENERATE — Download / Copy
// ─────────────────────────────────────────────
function getOutputCanvas() {
  return new Promise((resolve, reject) => {
    if (currentFormat === 'QR') {
      const img = document.querySelector('#qr-output img');
      const canvas = document.querySelector('#qr-output canvas');
      if (canvas) { resolve(canvas); return; }
      if (img) {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth || img.width;
        c.height = img.naturalHeight || img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(c); return;
      }
      reject(new Error('No QR output found'));
    } else {
      const svg = document.getElementById('barcode-output');
      const xml = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([xml], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width || svg.clientWidth;
        c.height = img.height || svg.clientHeight;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve(c);
      };
      img.onerror = () => reject(new Error('SVG render failed'));
      img.src = url;
    }
  });
}

async function downloadCode() {
  try {
    const canvas = await getOutputCanvas();
    const link = document.createElement('a');
    link.download = `scanGen_${currentFormat}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast('✓ Downloaded!');
  } catch(e) {
    toast('Download failed: ' + e.message);
  }
}

async function copyCodeImage() {
  try {
    const canvas = await getOutputCanvas();
    canvas.toBlob(async blob => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        toast('✓ Image copied to clipboard!');
      } catch(e) {
        toast('Clipboard write blocked by browser');
      }
    }, 'image/png');
  } catch(e) {
    toast('Copy failed: ' + e.message);
  }
}

// ─────────────────────────────────────────────
// SCAN — Method switching
// ─────────────────────────────────────────────
function setMethod(method) {
  currentMethod = method;
  stopCamera();

  ['camera','upload','paste'].forEach(m => {
    document.getElementById('method-' + m).classList.toggle('active', m === method);
    const panel = document.getElementById('panel-' + m);
    if (panel) panel.style.display = m === method ? 'block' : 'none';
  });
  clearResult();
}

// ─────────────────────────────────────────────
// SCAN — Camera
// ─────────────────────────────────────────────
function setCameraStatus(state, msg) {
  const dot = document.getElementById('camera-status-dot');
  const txt = document.getElementById('camera-status-text');
  dot.className = 'status-dot' + (state === 'active' ? ' active' : state === 'error' ? ' error' : '');
  txt.textContent = msg;
}

function startCamera() {
  if (isCameraActive) return;
  setCameraStatus('', 'starting...');

  html5Scanner = new Html5Qrcode('camera-viewport', { verbose: false });

  html5Scanner.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: { width: 220, height: 220 } },
    (decodedText, decodedResult) => {
      showResult(decodedText, decodedResult.result?.format?.formatName || 'Unknown');
      toast('✓ Code detected!');
    },
    () => {}
  ).then(() => {
    isCameraActive = true;
    document.getElementById('btn-start-cam').style.display = 'none';
    document.getElementById('btn-stop-cam').style.display = 'inline-flex';
    document.getElementById('scan-beam').style.display = 'block';
    document.getElementById('scan-corners').style.display = 'block';
    setCameraStatus('active', 'scanning — aim at a code');
  }).catch(err => {
    setCameraStatus('error', 'camera error: ' + (err.message || err));
    html5Scanner = null;
  });
}

function stopCamera() {
  if (html5Scanner && isCameraActive) {
    html5Scanner.stop().then(() => {
      html5Scanner.clear();
      html5Scanner = null;
      isCameraActive = false;
      document.getElementById('btn-start-cam').style.display = 'inline-flex';
      document.getElementById('btn-stop-cam').style.display = 'none';
      document.getElementById('scan-beam').style.display = 'none';
      document.getElementById('scan-corners').style.display = 'none';
      setCameraStatus('', 'camera idle');
    }).catch(() => {
      html5Scanner = null;
      isCameraActive = false;
    });
  }
}

// ─────────────────────────────────────────────
// SCAN — Upload
// ─────────────────────────────────────────────
function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  scanImageFile(file);
}

function scanImageFile(file) {
  document.getElementById('upload-error').textContent = '';
  const reader = new FileReader();
  reader.onload = (ev) => {
    const tempScanner = new Html5Qrcode('__temp_scan_el__');
    tempScanner.scanFile(file, true)
      .then(decoded => {
        showResult(decoded, 'Image scan');
        toast('✓ Code detected!');
        tempScanner.clear();
      })
      .catch(() => {
        document.getElementById('upload-error').textContent = 'No barcode or QR code found in this image.';
        tempScanner.clear();
      });
  };
  reader.readAsDataURL(file);
}

// Drop zone
const dropZone = document.getElementById('drop-zone');
if (dropZone) {
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) scanImageFile(file);
  });
}

// Need a hidden div for the "file scan" temp element
const tempEl = document.createElement('div');
tempEl.id = '__temp_scan_el__';
tempEl.style.display = 'none';
document.body.appendChild(tempEl);

// ─────────────────────────────────────────────
// SCAN — Paste / URL
// ─────────────────────────────────────────────
function scanFromURL() {
  const url = document.getElementById('paste-url-input').value.trim();
  document.getElementById('paste-error').textContent = '';
  if (!url) { document.getElementById('paste-error').textContent = 'Please enter an image URL.'; return; }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img, 0, 0);
    canvas.toBlob(blob => {
      const file = new File([blob], 'image.png', { type: 'image/png' });
      scanImageFile(file);
    });
  };
  img.onerror = () => {
    document.getElementById('paste-error').textContent = 'Could not load image from that URL (CORS may block it).';
  };
  img.src = url;
}

// Clipboard paste
document.getElementById('paste-area').addEventListener('paste', async (e) => {
  const items = (e.clipboardData || e.originalEvent.clipboardData).items;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      scanImageFile(file);
      return;
    }
  }
});

// ─────────────────────────────────────────────
// SCAN — Result
// ─────────────────────────────────────────────
function showResult(value, format) {
  lastResult = value;
  document.getElementById('result-value').textContent = value;
  document.getElementById('result-format').textContent = format;
  const resultBox = document.getElementById('scan-result');
  resultBox.classList.add('show');

  const linkBtn = document.getElementById('btn-open-link');
  const isLink = /^https?:\/\//i.test(value);
  linkBtn.style.display = isLink ? 'inline-flex' : 'none';
}

function clearResult() {
  document.getElementById('scan-result').classList.remove('show');
  lastResult = null;
}

function copyResult() {
  if (!lastResult) return;
  navigator.clipboard.writeText(lastResult).then(() => toast('✓ Copied!')).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = lastResult;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    toast('✓ Copied!');
  });
}

function openResultLink() {
  if (lastResult && /^https?:\/\//i.test(lastResult)) {
    window.open(lastResult, '_blank', 'noopener');
  }
}