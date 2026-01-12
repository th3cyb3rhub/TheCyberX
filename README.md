# TheCyberX

<p align="center">
  <img src="icons/icon.svg" alt="TheCyberX Logo" width="128" height="128">
</p>

<p align="center">
  <strong>The All-in-One Pentesting Browser Extension</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#development">Development</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Features

**19 pentesting tools** organized in 4 categories:

### 🔐 Core Tools
- **Encoder/Decoder** - Base64, URL, HTML, Hex, Unicode, Binary
- **Hasher** - MD5, SHA-1, SHA-256, SHA-512
- **JWT Decoder** - Parse and validate tokens
- **Payloads** - SQLi, XSS, LFI, SSTI, CMDi, XXE
- **Google Dorks** - Dork generator with presets

### 🛡️ Security Tools
- **Reverse Shell** - 11 shell types (Bash, Python, PHP, etc.)
- **CORS Checker** - Test CORS misconfigurations
- **Header Analyzer** - Security headers analysis
- **Cookie Editor** - View/edit/delete cookies

### 🔍 Recon Tools
- **JS Extractor** - Find API endpoints in JavaScript
- **Link Extractor** - Extract all page links
- **Form Finder** - Discover hidden inputs
- **Comment Finder** - Find HTML/JS comments
- **Tech Detector** - Identify technologies

### 🛠️ Utility Tools
- **Regex Tester** - Test patterns with highlighting
- **Timestamp** - Unix ↔ Human time conversion
- **UUID Generator** - v4 UUID generation
- **IP Calculator** - CIDR/subnet calculations
- **Beautifier** - Format JSON/JS/HTML/CSS/XML

---

## Installation

### Chrome Web Store
*(Coming Soon)*

### Manual Installation (Chrome)

```bash
git clone https://github.com/thecyberhub/TheCyberX.git
cd TheCyberX
npm install
npm run build
```

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist/` folder

### Firefox Add-ons
*(Coming Soon)*

### Manual Installation (Firefox)

```bash
npm run build:firefox
```

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `dist-firefox/manifest.json`

---

## Development

```bash
# Install dependencies
npm install

# Development with hot reload
npm run dev

# Build for Chrome
npm run build

# Build for Firefox
npm run build:firefox
```

### Tech Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite 5 + CRXJS
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Manifest:** V3 (Chrome) / V2 (Firefox)

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## Privacy

TheCyberX processes all data locally. No data is sent to external servers. See [PRIVACY.md](PRIVACY.md) for details.

---

## License

MIT License - see [LICENSE](LICENSE)

---

<p align="center">
  Made with ❤️ by <a href="https://thecyberhub.org">TheCyberHub</a>
</p>
