// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────
let currentFormat = 'QR';
let currentMethod = 'camera';
let html5Scanner = null;
let isCameraActive = false;
let lastResult = null;
let generateDebounce = null;

// ─────────────────────────────────────────────
// TAB SWITCHING
// ─────────────────────────────────────────────
function switchTab(tab, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  document.getElementById('tab-' + tab).classList.add('active');
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');
  if (tab !== 'scan') stopCamera();
}

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────
let toastTimer = null;
function toast(msg, dur = 2400) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), dur);
}

// ─────────────────────────────────────────────
// GENERATE — Format selection
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
    QR:      'Any text, URL, email, WiFi credentials, vCard, geo coordinates, etc.',
    CODE128: 'Alphanumeric + special chars, variable length. Used in logistics & shipping.',
    EAN13:   'Exactly 12 or 13 digits. The standard retail product barcode worldwide.',
    EAN8:    'Exactly 7 or 8 digits. A short retail barcode for small packages.',
    CODE39:  'Uppercase A–Z, digits 0–9, and the characters: - . $ / + % SPACE'
  };
  document.getElementById('gen-hint').textContent = hints[currentFormat] || '';
}

function onInputChange() {
  clearTimeout(generateDebounce);
  generateDebounce = setTimeout(() => {
    const val = document.getElementById('gen-input').value.trim();
    if (val) generate();
    else clearOutputArea();
  }, 550);
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

  // Format-specific validation
  if (currentFormat === 'EAN13' && !/^\d{12,13}$/.test(input)) {
    errEl.textContent = 'EAN-13 requires exactly 12 or 13 digits.'; return;
  }
  if (currentFormat === 'EAN8' && !/^\d{7,8}$/.test(input)) {
    errEl.textContent = 'EAN-8 requires exactly 7 or 8 digits.'; return;
  }
  if (currentFormat === 'CODE39') {
    const code39Valid = /^[A-Z0-9\-\.\s\$\/\+\%]+$/i;
    if (!code39Valid.test(input)) {
      errEl.textContent = 'Code39: use A–Z, 0–9, and - . $ / + % or space only.'; return;
    }
  }

  clearOutputArea();
  document.getElementById('output-placeholder').style.display = 'none';

  try {
    if (currentFormat === 'QR') generateQR(input);
    else generateBarcode(input);
    document.getElementById('output-actions').style.display = 'flex';
    document.getElementById('output-area').classList.add('has-output');
  } catch (e) {
    document.getElementById('output-placeholder').style.display = 'flex';
    errEl.textContent = 'Generation failed: ' + (e.message || e);
  }
}

function generateQR(text) {
  const container = document.getElementById('qr-output');
  container.innerHTML = '';
  container.style.display = 'flex';

  const size = parseInt(document.getElementById('qr-size').value);
  const ecl  = document.getElementById('qr-ecl').value;

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
  const bg  = document.getElementById('barcode-output-bg');
  bg.style.display = 'block';

  const fmtMap = { CODE128: 'CODE128', EAN13: 'EAN13', EAN8: 'EAN8', CODE39: 'CODE39' };

  JsBarcode(svg, currentFormat === 'CODE39' ? text.toUpperCase() : text, {
    format:        fmtMap[currentFormat],
    width:         parseFloat(document.getElementById('bc-width').value),
    height:        parseInt(document.getElementById('bc-height').value),
    displayValue:  true,
    font:          'monospace',
    textAlign:     'center',
    textPosition:  'bottom',
    textMargin:    4,
    fontSize:      13,
    background:    '#ffffff',
    lineColor:     '#000000',
    margin:        12
  });
}

function clearGen() {
  document.getElementById('gen-input').value = '';
  document.getElementById('gen-error').textContent = '';
  clearOutputArea();
}

function clearOutputArea() {
  const qrOut = document.getElementById('qr-output');
  qrOut.style.display = 'none';
  qrOut.innerHTML = '';
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
      const canvas = document.querySelector('#qr-output canvas');
      if (canvas) { resolve(canvas); return; }
      const img = document.querySelector('#qr-output img');
      if (img) {
        const c = document.createElement('canvas');
        c.width  = img.naturalWidth  || img.width;
        c.height = img.naturalHeight || img.height;
        c.getContext('2d').drawImage(img, 0, 0);
        resolve(c); return;
      }
      reject(new Error('No QR output found'));
    } else {
      const svg = document.getElementById('barcode-output');
      const xml = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([xml], { type: 'image/svg+xml' });
      const url  = URL.createObjectURL(blob);
      const img  = new Image();
      img.onload = () => {
        const w = svg.clientWidth  || 400;
        const h = svg.clientHeight || 150;
        const c = document.createElement('canvas');
        c.width  = w * 2;   // 2× for crisp PNG
        c.height = h * 2;
        const ctx = c.getContext('2d');
        ctx.scale(2, 2);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
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
  } catch (e) {
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
      } catch {
        toast('Clipboard write blocked by browser security policy');
      }
    }, 'image/png');
  } catch (e) {
    toast('Copy failed: ' + e.message);
  }
}

// ─────────────────────────────────────────────
// SCAN — Method switching
// ─────────────────────────────────────────────
function setMethod(method) {
  currentMethod = method;
  stopCamera();

  ['camera', 'upload', 'paste'].forEach(m => {
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
  dot.className = 'status-dot' + (state ? ' ' + state : '');
  txt.textContent = msg;
}

function startCamera() {
  if (isCameraActive) return;
  setCameraStatus('', 'requesting camera access...');
  document.getElementById('btn-start-cam').disabled = true;

  html5Scanner = new Html5Qrcode('camera-viewport', { verbose: false });

  const config = {
    fps: 12,
    qrbox: (vw, vh) => {
      const min = Math.min(vw, vh);
      const size = Math.round(min * 0.65);
      return { width: size, height: size };
    },
    aspectRatio: 4 / 3
  };

  html5Scanner.start(
    { facingMode: 'environment' },
    config,
    (decodedText, decodedResult) => {
      const formatName = decodedResult?.result?.format?.formatName
        || decodedResult?.decodedText && 'Unknown'
        || 'Unknown';
      showResult(decodedText, formatName);
      toast('✓ Code detected!');
    },
    () => { /* scan error per frame — ignored */ }
  ).then(() => {
    isCameraActive = true;
    document.getElementById('btn-start-cam').style.display = 'none';
    document.getElementById('btn-stop-cam').style.display = 'inline-flex';
    document.getElementById('btn-start-cam').disabled = false;
    document.getElementById('scan-beam').style.display = 'block';
    document.getElementById('scan-corners').style.display = 'block';
    setCameraStatus('active', 'scanning — aim at a code');
  }).catch(err => {
    const msg = (typeof err === 'string') ? err : err.message;
    if (msg && msg.includes('Permission')) {
      setCameraStatus('error', 'camera permission denied — check browser settings');
    } else {
      setCameraStatus('error', 'camera unavailable: ' + (msg || 'unknown error'));
    }
    document.getElementById('btn-start-cam').disabled = false;
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
  const errorEl  = document.getElementById('upload-error');
  const loading  = document.getElementById('upload-loading');
  const preview  = document.getElementById('upload-preview');

  if (errorEl)  errorEl.textContent = '';
  if (loading)  loading.classList.add('show');

  // Show preview
  if (preview) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      preview.classList.add('show');
    };
    reader.readAsDataURL(file);
  }

  // Scan using a temp element
  const tempScanner = new Html5Qrcode('__temp_scan_el__');
  tempScanner.scanFile(file, true)
    .then(decoded => {
      if (loading) loading.classList.remove('show');
      // html5-qrcode scanFile returns just the string; format detection limited
      showResult(decoded, detectBarcodeFormatFromValue(decoded));
      toast('✓ Code detected!');
    })
    .catch(() => {
      if (loading) loading.classList.remove('show');
      if (errorEl) errorEl.textContent = 'No barcode or QR code found in this image. Try a clearer image with better contrast.';
    })
    .finally(() => {
      try { tempScanner.clear(); } catch (_) {}
    });
}

// Drop zone
const dropZone = document.getElementById('drop-zone');
if (dropZone) {
  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) scanImageFile(file);
    else toast('Please drop an image file');
  });
}

// Hidden div for file-scan temp element
const tempEl = document.createElement('div');
tempEl.id = '__temp_scan_el__';
tempEl.style.cssText = 'display:none;position:absolute;width:1px;height:1px;overflow:hidden;';
document.body.appendChild(tempEl);

// ─────────────────────────────────────────────
// SCAN — Paste / URL
// ─────────────────────────────────────────────
function scanFromURL() {
  const url = document.getElementById('paste-url-input').value.trim();
  const errEl = document.getElementById('paste-error');
  const loading = document.getElementById('paste-loading');
  errEl.textContent = '';

  if (!url) { errEl.textContent = 'Please enter an image URL.'; return; }

  loading.classList.add('show');

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img, 0, 0);
    canvas.toBlob(blob => {
      const file = new File([blob], 'scan.png', { type: 'image/png' });
      const tempScanner = new Html5Qrcode('__temp_scan_el__');
      tempScanner.scanFile(file, true)
        .then(decoded => {
          loading.classList.remove('show');
          showResult(decoded, detectBarcodeFormatFromValue(decoded));
          toast('✓ Code detected!');
        })
        .catch(() => {
          loading.classList.remove('show');
          errEl.textContent = 'No barcode or QR code found at that URL.';
        })
        .finally(() => { try { tempScanner.clear(); } catch (_) {} });
    });
  };
  img.onerror = () => {
    loading.classList.remove('show');
    errEl.textContent = 'Could not load that image (CORS policy may block it). Try downloading the image and using Upload instead.';
  };
  img.src = url;
}

// Clipboard paste
document.getElementById('paste-area').addEventListener('paste', async (e) => {
  const items = (e.clipboardData || e.originalEvent.clipboardData).items;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      const loading = document.getElementById('paste-loading');
      if (loading) loading.classList.add('show');
      const tempScanner = new Html5Qrcode('__temp_scan_el__');
      tempScanner.scanFile(file, true)
        .then(decoded => {
          if (loading) loading.classList.remove('show');
          showResult(decoded, detectBarcodeFormatFromValue(decoded));
          toast('✓ Code detected from clipboard!');
        })
        .catch(() => {
          if (loading) loading.classList.remove('show');
          document.getElementById('paste-error').textContent = 'No barcode or QR code found in the pasted image.';
        })
        .finally(() => { try { tempScanner.clear(); } catch (_) {} });
      return;
    }
  }
  // If no image, check for pasted text URL
  const text = e.clipboardData.getData('text');
  if (text && /^https?:\/\/.*\.(png|jpg|jpeg|webp|gif|bmp)/i.test(text)) {
    document.getElementById('paste-url-input').value = text;
    scanFromURL();
  }
});

// ─────────────────────────────────────────────
// DECODE — Interpret what the barcode contains
// ─────────────────────────────────────────────

/**
 * Heuristic barcode format detection from value content.
 * Used for upload/paste scans where html5-qrcode doesn't return the format.
 */
function detectBarcodeFormatFromValue(value) {
  if (/^\d{13}$/.test(value)) return 'EAN-13';
  if (/^\d{8}$/.test(value))  return 'EAN-8';
  if (/^\d{12}$/.test(value)) return 'UPC-A';
  if (/^[A-Z0-9\-\.\s\$\/\+\%]+$/.test(value) && value.length <= 43) return 'Code39';
  if (/^https?:\/\//i.test(value)) return 'QR Code (URL)';
  if (/^WIFI:/i.test(value))       return 'QR Code (WiFi)';
  if (/^BEGIN:VCARD/i.test(value)) return 'QR Code (vCard)';
  if (/^BEGIN:VEVENT/i.test(value))return 'QR Code (Calendar)';
  if (/^mailto:/i.test(value))     return 'QR Code (Email)';
  if (/^tel:/i.test(value))        return 'QR Code (Phone)';
  if (/^sms:/i.test(value))        return 'QR Code (SMS)';
  if (/^geo:/i.test(value))        return 'QR Code (Location)';
  if (/^SMSTO:/i.test(value))      return 'QR Code (SMS)';
  if (value.length > 20)           return 'QR Code';
  return 'Code128';
}

/**
 * Interprets the raw decoded string into structured, human-readable data.
 * Returns { type, badge, fields: [{key, value, highlight}] }
 */
function interpretDecodedValue(raw, format) {
  const v = raw.trim();

  // ── URL ──────────────────────────────────────
  if (/^https?:\/\//i.test(v)) {
    try {
      const url = new URL(v);
      const fields = [
        { key: 'Domain',   value: url.hostname, highlight: true },
        { key: 'Protocol', value: url.protocol.replace(':', '') }
      ];
      if (url.pathname && url.pathname !== '/') fields.push({ key: 'Path', value: url.pathname });
      if (url.search) fields.push({ key: 'Query', value: url.search });
      return { type: 'URL', badge: 'badge-url', fields };
    } catch {
      return { type: 'URL', badge: 'badge-url', fields: [{ key: 'Link', value: v, highlight: true }] };
    }
  }

  // ── WiFi ─────────────────────────────────────
  if (/^WIFI:/i.test(v)) {
    const extract = (key) => {
      const m = v.match(new RegExp(key + ':([^;]*)', 'i'));
      return m ? m[1].replace(/\\;/g, ';') : null;
    };
    const ssid     = extract('S');
    const password = extract('P');
    const type     = extract('T');
    const hidden   = extract('H');
    const fields = [];
    if (ssid)     fields.push({ key: 'Network (SSID)', value: ssid, highlight: true });
    if (type)     fields.push({ key: 'Security',       value: type.toUpperCase() });
    if (password) fields.push({ key: 'Password',       value: password, highlight: true });
    if (hidden)   fields.push({ key: 'Hidden',         value: hidden === 'true' ? 'Yes' : 'No' });
    return { type: 'WiFi Credentials', badge: 'badge-wifi', fields };
  }

  // ── Email (mailto:) ──────────────────────────
  if (/^mailto:/i.test(v)) {
    try {
      const url    = new URL(v);
      const to     = url.pathname;
      const subject = url.searchParams.get('subject');
      const body    = url.searchParams.get('body');
      const cc      = url.searchParams.get('cc');
      const fields = [{ key: 'To', value: to, highlight: true }];
      if (subject) fields.push({ key: 'Subject', value: subject });
      if (cc)      fields.push({ key: 'CC',      value: cc });
      if (body)    fields.push({ key: 'Body',    value: body.substring(0, 120) + (body.length > 120 ? '…' : '') });
      return { type: 'Email', badge: 'badge-email', fields };
    } catch {
      return { type: 'Email', badge: 'badge-email', fields: [{ key: 'Address', value: v.replace(/^mailto:/i, ''), highlight: true }] };
    }
  }

  // ── Phone (tel:) ──────────────────────────────
  if (/^tel:/i.test(v)) {
    const number = v.replace(/^tel:/i, '').replace(/[^\d\+\-\(\)\s]/g, '');
    return {
      type: 'Phone Number', badge: 'badge-phone',
      fields: [{ key: 'Number', value: number, highlight: true }]
    };
  }

  // ── SMS ───────────────────────────────────────
  if (/^sms:|^smsto:/i.test(v)) {
    const parts = v.replace(/^sms:|^smsto:/i, '').split(':');
    const fields = [{ key: 'To', value: parts[0] || '—', highlight: true }];
    if (parts[1]) fields.push({ key: 'Message', value: parts[1] });
    return { type: 'SMS Message', badge: 'badge-sms', fields };
  }

  // ── Geo location ────────────────────────────
  if (/^geo:/i.test(v)) {
    const coords = v.replace(/^geo:/i, '').split(',');
    const lat = parseFloat(coords[0]);
    const lng = parseFloat(coords[1]);
    const alt = coords[2] ? parseFloat(coords[2]) : null;
    const fields = [
      { key: 'Latitude',  value: isNaN(lat) ? coords[0] : lat.toFixed(6), highlight: true },
      { key: 'Longitude', value: isNaN(lng) ? coords[1] : lng.toFixed(6), highlight: true }
    ];
    if (alt !== null && !isNaN(alt)) fields.push({ key: 'Altitude', value: alt + 'm' });
    const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
    fields.push({ key: 'Maps Link', value: mapsUrl, highlight: false });
    return { type: 'Geographic Location', badge: 'badge-geo', fields };
  }

  // ── vCard (Contact) ──────────────────────────
  if (/^BEGIN:VCARD/i.test(v)) {
    const get = (prop) => {
      const m = v.match(new RegExp('^' + prop + '[^:]*:(.+)$', 'im'));
      return m ? m[1].trim() : null;
    };
    const name  = get('FN') || get('N');
    const org   = get('ORG');
    const phone = get('TEL');
    const email = get('EMAIL');
    const url   = get('URL');
    const addr  = get('ADR');
    const title = get('TITLE');
    const fields = [];
    if (name)  fields.push({ key: 'Name',         value: name.replace(/;/g, ' ').trim(), highlight: true });
    if (org)   fields.push({ key: 'Organisation',  value: org });
    if (title) fields.push({ key: 'Title',         value: title });
    if (phone) fields.push({ key: 'Phone',         value: phone });
    if (email) fields.push({ key: 'Email',         value: email });
    if (url)   fields.push({ key: 'Website',       value: url });
    if (addr)  fields.push({ key: 'Address',       value: addr.replace(/;+/g, ', ').trim() });
    return { type: 'Contact Card (vCard)', badge: 'badge-contact', fields };
  }

  // ── Calendar Event ───────────────────────────
  if (/^BEGIN:VEVENT/i.test(v)) {
    const get = (prop) => {
      const m = v.match(new RegExp('^' + prop + '[^:]*:(.+)$', 'im'));
      return m ? m[1].trim() : null;
    };
    const summary  = get('SUMMARY');
    const dtstart  = get('DTSTART');
    const dtend    = get('DTEND');
    const location = get('LOCATION');
    const desc     = get('DESCRIPTION');
    const fields = [];
    if (summary)  fields.push({ key: 'Event',       value: summary, highlight: true });
    if (dtstart)  fields.push({ key: 'Start',        value: formatICSDate(dtstart) });
    if (dtend)    fields.push({ key: 'End',          value: formatICSDate(dtend) });
    if (location) fields.push({ key: 'Location',     value: location });
    if (desc)     fields.push({ key: 'Description',  value: desc.substring(0, 100) + (desc.length > 100 ? '…' : '') });
    return { type: 'Calendar Event', badge: 'badge-contact', fields };
  }

  // ── EAN-13 / EAN-8 / UPC-A (retail product) ─
  if (/^\d{8}$|^\d{12,13}$/.test(v)) {
    const len = v.length;
    const fmtLabel = len === 8 ? 'EAN-8' : len === 12 ? 'UPC-A' : 'EAN-13';

    // Compute / verify check digit
    const digits = v.split('').map(Number);
    const checkDigit = digits[digits.length - 1];
    const payload    = digits.slice(0, -1);
    const computed   = computeEANCheckDigit(payload, fmtLabel === 'EAN-8');
    const valid      = computed === checkDigit;

    const fields = [
      { key: 'Format',      value: fmtLabel, highlight: true },
      { key: 'Digits',      value: v },
      { key: 'Check digit', value: checkDigit + (valid ? ' ✓ valid' : ' ✗ mismatch'), highlight: valid }
    ];

    // EAN-13: extract GS1 country prefix
    if (len === 13) {
      const prefix = getGS1Prefix(v);
      if (prefix) fields.push({ key: 'GS1 Prefix', value: prefix });
    }

    return { type: 'Retail Barcode (' + fmtLabel + ')', badge: 'badge-ean', fields };
  }

  // ── Plain text fallback ──────────────────────
  const charCount = v.length;
  const wordCount = v.split(/\s+/).filter(Boolean).length;
  const fields = [{ key: 'Content', value: v, highlight: false }];
  if (charCount > 0) {
    fields.push({ key: 'Length', value: charCount + ' character' + (charCount !== 1 ? 's' : '') });
    if (wordCount > 1) fields.push({ key: 'Words', value: wordCount.toString() });
  }

  // Try to detect if it looks like a product SKU / serial
  if (/^[A-Z0-9\-]{6,30}$/.test(v)) {
    fields.push({ key: 'Likely type', value: 'Product SKU / Serial / ID' });
  }

  return { type: 'Plain Text', badge: 'badge-text', fields };
}

// ── EAN check digit helper ──
function computeEANCheckDigit(payload, isEAN8) {
  let sum = 0;
  for (let i = 0; i < payload.length; i++) {
    sum += payload[i] * (isEAN8
      ? (i % 2 === 0 ? 3 : 1)   // EAN-8:  odd positions × 3
      : (i % 2 === 0 ? 1 : 3)); // EAN-13: even positions × 1, odd × 3
  }
  return (10 - (sum % 10)) % 10;
}

// ── GS1 country/region prefix ──
function getGS1Prefix(ean13) {
  const p = parseInt(ean13.substring(0, 3));
  const ranges = [
    [[0,19],[380,380],[383,383],[385,385],[387,387],[389,389],
     [400,440],[450,459],[460,469],[471,471],[474,479],[480,480],
     [482,482],[484,484],[486,486],[488,488],[489,489],
     [520,521],[528,528],[529,529],[531,531],[535,535],[539,539],
     [540,549],[560,560],[569,569],[590,590],[594,594],[599,599],
     [600,601],[603,603],[608,608],[609,609],[611,611],[613,613],
     [616,616],[618,618],[619,619],[621,621],[622,622],[624,624],
     [625,625],[626,626],[627,627],[628,629],[640,649],[690,695],
     [700,709],[729,729],[740,745],[750,750],[754,755],[759,759],
     [760,769],[770,771],[773,773],[775,775],[777,777],[778,779],
     [780,780],[784,784],[785,785],[786,786],[789,790],[800,839],
     [840,849],[850,850],[858,858],[859,859],[860,860],[865,865],
     [867,867],[868,869],[870,879],[880,880],[883,883],[884,884],
     [885,885],[888,888],[890,890],[893,893],[896,896],[899,899],
     [900,919],[930,939],[940,949],[950,952],[955,955],[958,958],
     [960,969],[977,977],[978,979],[980,980],[981,982],[990,999]]
  ];
  // Simplified: just map well-known prefixes
  const known = {
    '000': 'USA / Canada', '001': 'USA / Canada', '002': 'USA / Canada',
    '030': 'USA / Canada', '060': 'USA / Canada',
    '200': 'Restricted (store use)',
    '300': 'France', '301': 'France', '302': 'France',
    '380': 'Bulgaria', '383': 'Slovenia', '385': 'Croatia', '387': 'Bosnia',
    '400': 'Germany', '401': 'Germany', '440': 'Germany',
    '450': 'Japan', '460': 'Russia',
    '471': 'Taiwan', '474': 'Estonia', '475': 'Latvia',
    '477': 'Lithuania', '479': 'Sri Lanka', '480': 'Philippines',
    '482': 'Ukraine', '484': 'Moldova', '486': 'Georgia',
    '488': 'Kazakhstan', '489': 'Hong Kong',
    '500': 'UK', '501': 'UK', '509': 'UK',
    '520': 'Greece', '528': 'Lebanon', '529': 'Cyprus',
    '531': 'North Macedonia', '535': 'Malta', '539': 'Ireland',
    '540': 'Belgium / Luxembourg', '560': 'Portugal',
    '569': 'Iceland', '590': 'Poland', '594': 'Romania',
    '599': 'Hungary', '600': 'South Africa', '608': 'Bahrain',
    '609': 'Mauritius', '611': 'Morocco', '613': 'Algeria',
    '616': 'Kenya', '618': 'Ivory Coast', '619': 'Tunisia',
    '621': 'Syria', '622': 'Egypt', '624': 'Libya',
    '625': 'Jordan', '626': 'Iran', '627': 'Kuwait', '628': 'Saudi Arabia',
    '629': 'UAE', '640': 'Finland',
    '690': 'China', '691': 'China', '692': 'China',
    '700': 'Norway', '729': 'Israel',
    '740': 'Guatemala', '741': 'El Salvador', '742': 'Honduras',
    '743': 'Nicaragua', '744': 'Costa Rica', '745': 'Panama',
    '750': 'Mexico', '754': 'Canada', '755': 'Canada',
    '759': 'Venezuela', '760': 'Switzerland', '770': 'Colombia',
    '773': 'Uruguay', '775': 'Peru', '777': 'Bolivia',
    '779': 'Argentina', '780': 'Chile', '784': 'Paraguay',
    '785': 'Peru', '786': 'Ecuador', '789': 'Brazil', '790': 'Brazil',
    '800': 'Italy', '840': 'Spain',
    '850': 'Cuba', '858': 'Slovakia', '859': 'Czech Republic',
    '860': 'Serbia', '865': 'Mongolia', '867': 'North Korea',
    '868': 'Turkey', '869': 'Turkey',
    '870': 'Netherlands', '880': 'South Korea',
    '883': 'Myanmar', '884': 'Cambodia', '885': 'Thailand',
    '888': 'Singapore', '890': 'India', '893': 'Vietnam',
    '896': 'Pakistan', '899': 'Indonesia',
    '900': 'Austria', '930': 'Australia', '940': 'New Zealand',
    '950': 'GS1 Global Office', '955': 'Malaysia', '958': 'Macau',
    '977': 'ISSN (Periodicals)', '978': 'ISBN (Books)', '979': 'ISBN / ISMN',
    '980': 'Refund receipts', '981': 'Coupons', '982': 'Coupons',
  };
  const key3 = ean13.substring(0, 3);
  const key2 = ean13.substring(0, 2);
  return known[key3] || known[key2] || null;
}

// ── ICS date formatter ──
function formatICSDate(ics) {
  if (!ics || ics.length < 8) return ics;
  const d = ics.replace(/[TZ]/g, '');
  const y = d.substring(0, 4), mo = d.substring(4, 6), dd = d.substring(6, 8);
  const h = d.substring(8, 10), m = d.substring(10, 12);
  if (h && m) return `${y}-${mo}-${dd} ${h}:${m}`;
  return `${y}-${mo}-${dd}`;
}

// ─────────────────────────────────────────────
// SCAN — Show / Clear Result
// ─────────────────────────────────────────────
function showResult(value, format) {
  lastResult = value;

  document.getElementById('result-value').textContent  = value;
  document.getElementById('result-format').textContent = format || 'Unknown';

  // Determine link visibility
  const isLink = /^https?:\/\//i.test(value) || /^geo:/i.test(value);
  document.getElementById('btn-open-link').style.display = isLink ? 'inline-flex' : 'none';

  // Interpret content
  const interpreted = interpretDecodedValue(value, format);

  // Badge
  const badgeEl = document.getElementById('result-type-badge');
  badgeEl.innerHTML = `<span class="decoded-type-badge ${interpreted.badge}">● ${interpreted.type}</span>`;

  // Interpreted fields grid
  const interpSection = document.getElementById('result-interpreted');
  const interpGrid    = document.getElementById('result-interpreted-grid');
  if (interpreted.fields && interpreted.fields.length > 0) {
    interpGrid.innerHTML = interpreted.fields.map(f =>
      `<span class="interp-key">${f.key}</span>` +
      `<span class="interp-val${f.highlight ? ' highlight' : ''}">${escapeHtml(f.value)}</span>`
    ).join('');
    interpSection.style.display = 'block';
  } else {
    interpSection.style.display = 'none';
  }

  document.getElementById('scan-result').classList.add('show');

  // Scroll result into view on mobile
  if (window.innerWidth < 640) {
    setTimeout(() => {
      document.getElementById('scan-result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }
}

function clearResult() {
  document.getElementById('scan-result').classList.remove('show');
  document.getElementById('result-type-badge').innerHTML = '';
  document.getElementById('result-interpreted').style.display = 'none';
  const preview = document.getElementById('upload-preview');
  if (preview) { preview.src = ''; preview.classList.remove('show'); }
  lastResult = null;
}

function copyResult() {
  if (!lastResult) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(lastResult)
      .then(() => toast('✓ Copied to clipboard!'))
      .catch(() => fallbackCopy(lastResult));
  } else {
    fallbackCopy(lastResult);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
  document.body.appendChild(ta);
  ta.focus(); ta.select();
  try { document.execCommand('copy'); toast('✓ Copied!'); }
  catch { toast('Could not copy — please select and copy manually.'); }
  document.body.removeChild(ta);
}

function openResultLink() {
  if (!lastResult) return;
  if (/^https?:\/\//i.test(lastResult)) {
    window.open(lastResult, '_blank', 'noopener,noreferrer');
  } else if (/^geo:/i.test(lastResult)) {
    const coords = lastResult.replace(/^geo:/i, '').split(',');
    window.open(`https://maps.google.com/?q=${coords[0]},${coords[1]}`, '_blank', 'noopener');
  }
}

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}