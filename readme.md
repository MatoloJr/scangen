<div align="center">

```
 ▐████▌  ███  ██  ███  ██  ███  ▐████▌
 ▌       ▌    ▌   ▌ ▌  ▌   ▌ ▌  ▌
 ▌████   ███  ██  ███  ██  ███   ▌████
 ▌       ▌    ▌   ▌▌   ▌   ▌▌   ▌
 ▐████▌  ███  ██  ▌▌█  ██  ▌▌█  ▐████▌
```

# ScanGen

**A fully client-side barcode and QR code scanner & generator.**  
No server. No uploads. No accounts. Just open and use.

[![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/MatoloJr/scangen/pulls)

[Live Demo](#) · [Report a Bug](https://github.com/MatoloJr/scangen/issues) · [Request a Feature](https://github.com/MatoloJr/scangen/issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
  - [Scanning Codes](#scanning-codes)
  - [Generating Codes](#generating-codes)
  - [Decoding & Interpretation](#decoding--interpretation)
- [Supported Formats](#supported-formats)
- [Barcode Interpretation Engine](#barcode-interpretation-engine)
- [Project Structure](#project-structure)
- [Libraries Used](#libraries-used)
- [Browser Compatibility](#browser-compatibility)
- [Responsive Design](#responsive-design)
- [Privacy & Security](#privacy--security)
- [Known Limitations](#known-limitations)
- [Contributing](#contributing)
- [Author](#author)
- [License](#license)

---

## Overview

ScanGen is a lightweight, zero-dependency web tool that lets you **scan** and **generate** barcodes and QR codes entirely in the browser. Everything runs locally — no data ever leaves your device.

It was built to be:

- **Fast** — no build step, no framework, instant load
- **Private** — 100% client-side, no analytics, no tracking
- **Portable** — a single folder of three files, works anywhere
- **Informative** — doesn't just spit out raw data; it interprets what codes *mean*

---

## Features

### Scanner
- 📷 **Live camera scanning** with animated beam overlay and corner brackets
- 🖼 **Image upload** with drag-and-drop support and image preview
- 📋 **Clipboard paste** — paste a copied image directly with `Ctrl+V` / `⌘V`
- 🔗 **URL scanning** — load and scan a barcode image from a public URL
- ✅ **Automatic format detection** for scanned results
- 🧠 **Smart interpretation** — decodes what the barcode *contains* (see below)

### Generator
- **QR Code** with configurable error correction (L / M / Q / H) and size
- **Code128** with adjustable bar width and height
- **EAN-13** with check-digit validation
- **EAN-8** with check-digit validation
- **Code39** with character-set validation
- ⬇ **Download as PNG** (2× resolution for crisp printing)
- 📋 **Copy image to clipboard**
- ⚡ **Live preview** — regenerates automatically as you type (debounced)

### General
- 🌑 Dark terminal-inspired UI
- 📱 Fully responsive — works on any screen from 320px to 4K
- ♿ Accessible — ARIA roles, labels, live regions, and keyboard navigation
- 🔔 Non-intrusive toast notifications
- ❌ No server, no backend, no sign-up

---

## Screenshots

> _Add screenshots to a `/screenshots` folder and update paths below._

| Scan Tab | Generate Tab | Scan Result |
|---|---|---|
| ![Scan](screenshots/scan.png) | ![Generate](screenshots/generate.png) | ![Result](screenshots/result.png) |

---

## Getting Started

### Option 1 — Open directly (no setup required)

```bash
git clone https://github.com/MatoloJr/scangen.git
cd scangen
```

Then open `index.html` in your browser.

> **Note:** Live camera scanning requires a secure context (HTTPS or `localhost`). If you open the file directly via `file://`, camera access will be blocked by the browser. Use the upload or paste methods instead, or serve it locally.

### Option 2 — Local development server

Using Python (no install needed on most systems):

```bash
# Python 3
python -m http.server 5500

# Python 2
python -m SimpleHTTPServer 5500
```

Then open `http://localhost:5500` in your browser.

Using Node.js:

```bash
npx serve .
# or
npx http-server . -p 5500
```

Using VS Code: install the **Live Server** extension, right-click `index.html` → **Open with Live Server**.

### Option 3 — Deploy to the web

Since ScanGen is purely static HTML/CSS/JS, you can host it on:

| Platform | Command / Steps |
|---|---|
| **GitHub Pages** | Push to `main`, enable Pages in repo Settings → Pages |
| **Vercel** | `vercel --prod` or drag-and-drop folder in dashboard |
| **Netlify** | Drag-and-drop the folder at netlify.com/drop |
| **Cloudflare Pages** | Connect repo, build command: _(none)_, output: `.` |

---

## Usage Guide

### Scanning Codes

ScanGen offers three input methods, selectable via the tab buttons in the Scan panel.

#### Live Camera

1. Click **▶ Start Scanner**
2. Allow camera permission when prompted by the browser
3. Aim your camera at any barcode or QR code
4. ScanGen detects and decodes it automatically — no button press needed
5. The result appears below with full interpretation
6. Click **■ Stop** to release the camera

> On mobile, the rear (environment-facing) camera is used by default.

#### Upload Image

1. Click or tap the upload drop zone
2. Choose an image file (PNG, JPG, WEBP, GIF)
3. Alternatively, drag and drop an image file onto the zone
4. ScanGen scans the image and shows the decoded result

**Tips for best results:**
- Use high-contrast images (dark bars on white background)
- Avoid blurry, rotated, or heavily compressed images
- Make sure the entire barcode is visible and not cropped

#### Paste / URL

**Paste an image:**
1. Copy an image containing a barcode to your clipboard (e.g. screenshot with `Print Screen` or `Cmd+Shift+4`)
2. Click inside the Paste / URL panel
3. Press `Ctrl+V` (Windows/Linux) or `⌘V` (macOS)

**Scan from URL:**
1. Find a publicly accessible image URL containing a barcode
2. Paste the URL into the text field
3. Click **🔍 Scan URL**

> CORS policy may prevent loading images from some third-party domains. If a URL fails, download the image and use Upload instead.

---

### Generating Codes

1. Go to the **GENERATE** tab
2. Select a format using the pill buttons (QR Code, Code128, EAN-13, EAN-8, Code39)
3. Type or paste your content in the text area
4. The code generates automatically after 550ms of inactivity
5. Adjust size/height sliders if needed
6. Click **⬇ Download PNG** to save or **📋 Copy Image** to copy to clipboard

**Format-specific tips:**

| Format | Content Rules |
|---|---|
| QR Code | Any text up to ~4,000 characters. URLs, WiFi, contacts all work. |
| Code128 | Any printable ASCII character. No length limit for the tool. |
| EAN-13 | Enter exactly 12 digits — the 13th check digit is computed automatically by JsBarcode. Or enter all 13. |
| EAN-8 | Enter exactly 7 or 8 digits. |
| Code39 | Uppercase A–Z, digits 0–9, and these special characters: `- . $ / + % SPACE`. Lowercase is auto-uppercased. |

---

### Decoding & Interpretation

When a code is scanned, ScanGen does more than show you raw text. The **interpretation engine** in `script.js` analyses the decoded string and presents structured, human-readable information.

| Raw value detected | What ScanGen shows |
|---|---|
| `https://example.com/path?q=1` | Domain, protocol, path, query string — plus an **Open Link** button |
| `WIFI:T:WPA;S:MyNetwork;P:hunter2;;` | Network name (SSID), security type (WPA/WPA2/WEP), password |
| `mailto:hello@example.com?subject=Hi` | Recipient, subject line, body preview |
| `tel:+254700000000` | Formatted phone number |
| `sms:+254700000000:Hello there` | Recipient number and message body |
| `geo:1.2921,36.8219` | Latitude, longitude, altitude (if present), Google Maps link |
| `BEGIN:VCARD...` | Name, organisation, title, phone, email, website, address |
| `BEGIN:VEVENT...` | Event name, start/end time, location, description |
| `5901234123457` | EAN-13 with GS1 country prefix, check-digit verification |
| `12345678` | EAN-8 with check-digit verification |
| Plain text / Code128 / Code39 | Content, character count, word count, likely type (SKU/serial) |

---

## Supported Formats

### Scanning (via ZXing / html5-qrcode)

| Format | Type | Common Use |
|---|---|---|
| QR Code | 2D matrix | URLs, WiFi, contacts, app links |
| Micro QR | 2D matrix | Small labels |
| Aztec | 2D matrix | Transit tickets, boarding passes |
| Data Matrix | 2D matrix | Electronics, pharmaceuticals |
| PDF417 | 2D stacked | Driving licences, shipping labels |
| Code128 | 1D linear | Logistics, shipping, inventory |
| Code39 | 1D linear | Healthcare, industrial, ID cards |
| Code93 | 1D linear | Inventory |
| EAN-13 | 1D linear | Retail products worldwide |
| EAN-8 | 1D linear | Small retail items |
| UPC-A | 1D linear | North American retail |
| UPC-E | 1D linear | Compressed UPC |
| ITF (Interleaved 2 of 5) | 1D linear | Cartons, outer packaging |
| Codabar | 1D linear | Libraries, blood banks |
| RSS / GS1 DataBar | 1D linear | Fresh produce, coupons |

### Generation (via JsBarcode + qrcodejs)

| Format | Configurable Options |
|---|---|
| QR Code | Error correction level (L/M/Q/H), size in pixels |
| Code128 | Bar width, height |
| EAN-13 | Bar width, height |
| EAN-8 | Bar width, height |
| Code39 | Bar width, height |

---

## Barcode Interpretation Engine

The interpretation engine is a pure JavaScript function `interpretDecodedValue(raw, format)` in `script.js`. It uses pattern matching and URI parsing to classify and extract structured data from any scanned string.

### How it works

```
Raw decoded string
        │
        ▼
  Pattern detection (regex + URI parsing)
        │
   ┌────┴──────────────────────────────────────┐
   │                                           │
   ▼                                           ▼
Known schema (URL, WiFi, vCard, etc.)     Raw text
   │                                           │
   ▼                                           ▼
Parse fields (key/value pairs)       Heuristic analysis
   │                                  (length, charset,
   ▼                                   word count, SKU)
Rendered interpretation grid
```

### Detected schemas

```
https?://     → URL parser      → domain, path, query
WIFI:         → WiFi parser     → SSID, password, security type
mailto:       → URL parser      → to, subject, cc, body
tel:          → regex           → phone number
sms:/smsto:   → regex           → recipient, message body
geo:          → coordinate      → lat, lng, altitude, maps link
BEGIN:VCARD   → line parser     → name, org, phone, email, address
BEGIN:VEVENT  → line parser     → summary, start, end, location
^\d{8}$       → EAN-8 validator → check digit, format label
^\d{12,13}$   → EAN-13/UPC-A   → GS1 prefix (country), check digit
* (fallback)  → text analyser  → char count, word count, SKU hint
```

### GS1 Country Prefix Database

For EAN-13 codes, ScanGen includes a built-in GS1 prefix lookup table covering 100+ country and region codes, including:
- 000–019: USA / Canada
- 300–379: France
- 400–440: Germany
- 460–469: Russia
- 500–509: United Kingdom
- 616: Kenya 🇰🇪
- 690–695: China
- 700–709: Norway
- 800–839: Italy
- 890: India
- 978–979: ISBN (books)
- and many more

---

## Project Structure

```
scangen/
├── index.html      # Markup, layout, ARIA roles, CDN script tags
├── style.css       # All styling — variables, responsive grid, animations
├── script.js       # All logic — scanner, generator, interpreter
└── README.md       # This file
```

The project is intentionally kept as three plain files with zero build tooling, so anyone can read, fork, and modify it without setup.

---

## Libraries Used

All libraries are loaded from CDN — no npm, no bundler.

| Library | Version | Purpose | CDN |
|---|---|---|---|
| [qrcodejs](https://github.com/davidshimjs/qrcodejs) | 1.0.0 | QR code generation (canvas/img) | cdnjs |
| [JsBarcode](https://github.com/lindell/JsBarcode) | 3.11.5 | 1D barcode generation (SVG) | cdnjs |
| [html5-qrcode](https://github.com/mebjas/html5-qrcode) | 2.3.8 | Camera + file scanning (ZXing wrapper) | unpkg |

No other dependencies. No CSS framework. No bundler. No transpiler.

---

## Browser Compatibility

| Browser | Scan (Camera) | Scan (Upload) | Generate | Notes |
|---|---|---|---|---|
| Chrome 90+ | ✅ | ✅ | ✅ | Full support |
| Edge 90+ | ✅ | ✅ | ✅ | Full support |
| Firefox 90+ | ✅ | ✅ | ✅ | Full support |
| Safari 14+ | ✅ | ✅ | ✅ | Requires HTTPS for camera |
| Samsung Internet | ✅ | ✅ | ✅ | Full support |
| Chrome Android | ✅ | ✅ | ✅ | Rear camera used by default |
| Safari iOS 14+ | ✅ | ✅ | ✅ | HTTPS required for camera |

> **Camera scanning always requires HTTPS or `localhost`** due to browser `getUserMedia` security policy. Upload and paste scanning work on any origin including `file://`.

---

## Responsive Design

ScanGen is built mobile-first with fluid layouts that adapt seamlessly to any screen size.

| Breakpoint | Layout adjustments |
|---|---|
| `< 380px` | Header badge hidden; buttons go full-width; font scales down |
| `< 400px` | Button groups stack vertically |
| `< 480px` | Scan method buttons switch to horizontal list layout |
| `< 520px` | Form rows collapse to single column |
| `480px+` | Toast anchors to bottom-right corner |
| `640px+` | Full two-column form grids; default layout |
| `860px+` | Content capped at max-width, centred |

Key responsive techniques used:
- `clamp()` for fluid font sizes, padding, and spacing
- CSS Grid with responsive `grid-template-columns`
- `aspect-ratio: 4/3` on the camera viewport with `@supports` fallback
- `min-height: 100dvh` for correct viewport height on mobile browsers
- SVG barcode output with `max-width: 100%` and `height: auto`
- QR code capped at `min(256px, 85vw)` so it never overflows on small screens

---

## Privacy & Security

- **Zero server communication.** All scanning and generation happens in your browser's JavaScript engine.
- **No image uploads.** Images used for scanning are read locally via the File API or MediaDevices API and never sent anywhere.
- **No analytics.** No Google Analytics, no Mixpanel, no tracking pixels.
- **No cookies.** No localStorage, no sessionStorage, no persistent storage of any kind.
- **Camera access.** The browser's `getUserMedia` API is used only while the scanner is active. Clicking **■ Stop** releases the camera immediately.
- **External requests.** The only external requests are the three CDN library loads on page open. After that, the page can be used fully offline (libraries are cached by the browser).

---

## Known Limitations

| Limitation | Explanation |
|---|---|
| Camera needs HTTPS | Browser `getUserMedia` policy blocks camera on `http://` and `file://` origins. Use localhost or deploy to HTTPS. |
| CORS on URL scan | Some image URLs from third-party hosts reject cross-origin requests. Download the image and use Upload instead. |
| Clipboard image paste | Pasting images from clipboard requires the Clipboard API, which is only available on HTTPS and may require a user permission prompt in some browsers. |
| EAN check digit entry | JsBarcode expects the full digit string including the check digit for EAN formats. Enter 12 digits for EAN-13; the library appends the correct check digit. |
| SVG download on Firefox | Some Firefox versions block `URL.createObjectURL` on SVG blobs. If PNG download fails, try Chrome or Edge. |
| No offline install | ScanGen is not a PWA and does not have a service worker. Libraries load from CDN each first visit. |

---

## Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Make** your changes — keep it to the three plain files unless there's a strong reason to add more
4. **Test** in at least Chrome and Firefox, on desktop and mobile
5. **Commit**: `git commit -m "feat: add my feature"`
6. **Push**: `git push origin feature/my-feature`
7. **Open** a Pull Request

### Ideas welcome

- Additional QR data schemas (BTC addresses, calendar invites deep-parse, TOTP/OTP)
- Copy-to-clipboard for individual interpreted fields
- Scan history (localStorage, opt-in)
- QR code colour customisation
- Dark/light theme toggle
- PWA manifest + service worker for full offline support
- Additional barcode formats in the generator (ITF, PDF417)

### Code style

- Vanilla JS only — no frameworks, no TypeScript
- Keep `index.html`, `style.css`, and `script.js` as the only source files
- Comment non-obvious logic clearly
- Follow the existing naming conventions (camelCase functions, kebab-case CSS classes)

---

## Author

**Emmanuel Matolo**  
Software Engineering Student @ Zetech University, Nairobi 🇰🇪  

- GitHub: [@MatoloJr](https://github.com/MatoloJr)
- LinkedIn: [Emmanuel Matolo](https://www.linkedin.com/in/emmanuel-muoki-79809830b/)

---

## License

This project is licensed under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2026 Emmanuel Matolo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">
  Made with ⚡ by <a href="https://github.com/MatoloJr">MatoloJr</a> · Nairobi, Kenya
</div>