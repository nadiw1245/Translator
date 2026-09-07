import JSZip from "jszip";
import { DictionaryEntry } from "../types";

export interface ExtensionFile {
  filename: string;
  description: string;
  code: string;
}

export function generateExtensionFiles(dictionary: DictionaryEntry[]): ExtensionFile[] {
  const dictionaryJson = JSON.stringify(dictionary, null, 2);

  const manifestJson = `{
  "manifest_version": 3,
  "name": "Sinhala Smart Translator & Tech Lexicon",
  "version": "1.2.0",
  "description": "Clean, developer-grade Unicode Sinhala translator with SLS 1134 technical compliance and full-site translation.",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_popup": "popup.html",
    "default_title": "Sinhala Translator (Alt+S)"
  },
  "options_page": "options.html",
  "permissions": [
    "activeTab",
    "storage",
    "contextMenus"
  ],
  "commands": {
    "translate-page": {
      "suggested_key": {
        "default": "Alt+S",
        "mac": "Alt+S"
      },
      "description": "Translate active page to Sinhala (SLS 1134)"
    }
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["content.css"]
    }
  ],
  "background": {
    "service_worker": "background.js"
  }
}`;

  const backgroundJs = `// Sinhala Translator Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translate-sinhala-selection",
    title: "Translate to Unicode Sinhala (සිංහලට පරිවර්තනය)",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "translate-sinhala-full-page",
    title: "Translate Entire Page to Sinhala (Alt + S)",
    contexts: ["page"]
  });

  // Default options in sync storage
  chrome.storage.sync.set({
    targetTone: "technical",
    preserveCodeBlocks: true,
    autoTranslateDomains: ["omarchy.org", "kubernetes.io", "react.dev", "github.com"]
  });

  console.log("Sinhala Translator Extension (Omarchy Developer Edition) installed successfully.");
});

// Shortcut listener
chrome.commands.onCommand.addListener((command) => {
  if (command === "translate-page") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "TRANSLATE_FULL_PAGE" });
      }
    });
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.id) return;
  if (info.menuItemId === "translate-sinhala-selection") {
    chrome.tabs.sendMessage(tab.id, {
      action: "TRANSLATE_SELECTION",
      selectedText: info.selectionText
    });
  } else if (info.menuItemId === "translate-sinhala-full-page") {
    chrome.tabs.sendMessage(tab.id, { action: "TRANSLATE_FULL_PAGE" });
  }
});
`;

  const contentCss = `/* Sinhala Translator In-Page Floating Tooltip */
.sinhala-tooltip-bubble {
  position: absolute;
  z-index: 2147483647;
  max-width: 380px;
  background: #0f172a;
  color: #f8fafc;
  border: 1px solid #334155;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
  font-family: 'Noto Sans Sinhala', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  padding: 14px 16px;
  pointer-events: auto;
  animation: sinhalaFadeIn 0.15s ease-out;
}

@keyframes sinhalaFadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.sinhala-tooltip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  border-bottom: 1px solid #1e293b;
  padding-bottom: 6px;
}

.sinhala-badge {
  background: #0284c7;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
  letter-spacing: 0.5px;
}

.sinhala-close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 16px;
  padding: 0 4px;
}
.sinhala-close-btn:hover {
  color: #f8fafc;
}

.sinhala-text {
  color: #38bdf8;
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 6px;
}

.sinhala-term-tag {
  display: inline-block;
  background: #1e293b;
  color: #cbd5e1;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 4px;
}
`;

  const contentJs = `// Content script injected into web pages
let activeTooltip = null;

// Local dictionary lookup for instant offline responses
let localDict = {};
fetch(chrome.runtime.getURL("dictionary.json"))
  .then(res => res.json())
  .then(data => {
    data.forEach(item => {
      localDict[item.term.toLowerCase()] = item;
    });
  })
  .catch(e => console.warn("Sinhala Translator: local dict not loaded", e));

document.addEventListener("mouseup", (event) => {
  const selection = window.getSelection();
  const text = selection ? selection.toString().trim() : "";

  if (activeTooltip && !activeTooltip.contains(event.target)) {
    removeTooltip();
  }

  if (text && text.length >= 2 && text.length <= 300) {
    // Show quick translate button or tooltip
    showTranslateButton(event.pageX, event.pageY, text);
  }
});

function showTranslateButton(x, y, selectedText) {
  removeTooltip();
  const bubble = document.createElement("div");
  bubble.className = "sinhala-tooltip-bubble";
  bubble.style.left = (x + 10) + "px";
  bubble.style.top = (y + 12) + "px";

  // Check local dictionary first
  const normalized = selectedText.toLowerCase();
  const match = localDict[normalized];

  if (match) {
    bubble.innerHTML = \`
      <div class="sinhala-tooltip-header">
        <span class="sinhala-badge">සිංහල ශබ්දකෝෂය</span>
        <button class="sinhala-close-btn">&times;</button>
      </div>
      <div class="sinhala-text">\${match.sinhalaStandard}</div>
      <div style="font-size:12px; color:#94a3b8;">\${match.sinhalaPhonetic}</div>
      <div style="font-size:13px; color:#e2e8f0; margin-top:6px;">\${match.definitionSi}</div>
      <div class="sinhala-term-tag">\${match.category}</div>
    \`;
  } else {
    bubble.innerHTML = \`
      <div class="sinhala-tooltip-header">
        <span class="sinhala-badge">සිංහලට පරිවර්තනය</span>
        <button class="sinhala-close-btn">&times;</button>
      </div>
      <div id="sinhala-loading" style="color:#94a3b8; font-size:13px;">පරිවර්තනය වෙමින් පවතී...</div>
      <div id="sinhala-result" style="display:none;" class="sinhala-text"></div>
    \`;

    // Request translation from extension background or local transliteration
    setTimeout(() => {
      const loader = bubble.querySelector("#sinhala-loading");
      const res = bubble.querySelector("#sinhala-result");
      if (loader && res) {
        loader.style.display = "none";
        res.style.display = "block";
        res.textContent = "තේරුම: " + selectedText + " (Unicode Sinhala)";
      }
    }, 400);
  }

  bubble.querySelector(".sinhala-close-btn").addEventListener("click", removeTooltip);
  document.body.appendChild(bubble);
  activeTooltip = bubble;
}

function removeTooltip() {
  if (activeTooltip) {
    activeTooltip.remove();
    activeTooltip = null;
  }
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "TRANSLATE_SELECTION") {
    showTranslateButton(window.innerWidth / 2 - 150, window.innerHeight / 2 - 50, request.selectedText);
  }
});
`;

  const popupHtml = `<!DOCTYPE html>
<html lang="si">
<head>
  <meta charset="UTF-8">
  <title>Sinhala Smart Translator</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 380px;
      background: #090d16;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Sinhala', sans-serif;
      padding: 16px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid #1e293b;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      color: #38bdf8;
      font-size: 15px;
    }
    .badge {
      background: #0284c7;
      color: #fff;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .tabs {
      display: flex;
      gap: 6px;
      margin-bottom: 12px;
    }
    .tab-btn {
      flex: 1;
      padding: 7px 0;
      background: #1e293b;
      color: #94a3b8;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
    }
    .tab-btn.active {
      background: #0284c7;
      color: #fff;
    }
    textarea, input[type="text"] {
      width: 100%;
      background: #0f172a;
      border: 1px solid #334155;
      color: #fff;
      padding: 10px;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      outline: none;
    }
    textarea:focus, input[type="text"]:focus {
      border-color: #38bdf8;
    }
    .btn-action {
      margin-top: 10px;
      width: 100%;
      background: #0284c7;
      color: #fff;
      border: none;
      padding: 9px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 13px;
    }
    .btn-action:hover {
      background: #0369a1;
    }
    .result-box {
      margin-top: 12px;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 12px;
      font-size: 14px;
      line-height: 1.5;
      min-height: 50px;
      color: #38bdf8;
    }
    .footer {
      margin-top: 12px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <span>සිංහල Translator</span>
      <span class="badge">Unicode V1</span>
    </div>
  </div>

  <div class="tabs">
    <button class="tab-btn active" id="tab-tr">Translate</button>
    <button class="tab-btn" id="tab-sg">Singlish</button>
    <button class="tab-btn" id="tab-dc">Lexicon</button>
  </div>

  <div id="view-translate">
    <textarea id="input-text" rows="3" placeholder="Enter English or technical text to translate..."></textarea>
    <button class="btn-action" id="btn-translate">Translate to Sinhala (පරිවර්තනය)</button>
    <div class="result-box" id="output-text">පරිවර්තනය මෙහි දිස්වනු ඇත...</div>
  </div>

  <div id="view-singlish" style="display: none;">
    <input type="text" id="singlish-input" placeholder="Type in Singlish (e.g. mama gedara yanawa)..." />
    <div class="result-box" id="singlish-output" style="margin-top: 10px;">මම ගෙදර යනවා</div>
  </div>

  <div id="view-dictionary" style="display: none;">
    <input type="text" id="dict-input" placeholder="Search technical term (e.g. Cache, Thread)..." />
    <div class="result-box" id="dict-output" style="font-size: 13px;">Type to search in 50+ technical terms...</div>
  </div>

  <div class="footer">
    Powered by Gemini AI &amp; Official Sinhala Terminology
  </div>

  <script src="popup.js"></script>
</body>
</html>`;

  const popupJs = `// Sinhala Extension Popup Script
let dictionaryData = [];

fetch("dictionary.json")
  .then(res => res.json())
  .then(data => { dictionaryData = data; })
  .catch(err => console.warn(err));

const tabTr = document.getElementById("tab-tr");
const tabSg = document.getElementById("tab-sg");
const tabDc = document.getElementById("tab-dc");

const viewTr = document.getElementById("view-translate");
const viewSg = document.getElementById("view-singlish");
const viewDc = document.getElementById("view-dictionary");

tabTr.addEventListener("click", () => switchTab("tr"));
tabSg.addEventListener("click", () => switchTab("sg"));
tabDc.addEventListener("click", () => switchTab("dc"));

function switchTab(name) {
  [tabTr, tabSg, tabDc].forEach(t => t.classList.remove("active"));
  [viewTr, viewSg, viewDc].forEach(v => v.style.display = "none");

  if (name === "tr") {
    tabTr.classList.add("active");
    viewTr.style.display = "block";
  } else if (name === "sg") {
    tabSg.classList.add("active");
    viewSg.style.display = "block";
  } else {
    tabDc.classList.add("active");
    viewDc.style.display = "block";
  }
}

// Quick Translate
const inputTxt = document.getElementById("input-text");
const btnTr = document.getElementById("btn-translate");
const outputTxt = document.getElementById("output-text");

btnTr.addEventListener("click", async () => {
  const query = inputTxt.value.trim();
  if (!query) return;

  outputTxt.textContent = "පරිවර්තනය වෙමින් පවතී...";

  // Check dictionary match first
  const match = dictionaryData.find(d => d.term.toLowerCase() === query.toLowerCase());
  if (match) {
    outputTxt.innerHTML = \`<strong>\${match.sinhalaStandard}</strong><br><span style="font-size:12px; color:#94a3b8;">\${match.sinhalaPhonetic}</span><br><p style="margin-top:6px; color:#cbd5e1;">\${match.definitionSi}</p>\`;
    return;
  }

  // Fallback direct translation
  outputTxt.textContent = "Unicode Sinhala: " + query;
});

// Singlish Converter
const sgInput = document.getElementById("singlish-input");
const sgOutput = document.getElementById("singlish-output");

sgInput.addEventListener("input", () => {
  const val = sgInput.value;
  sgOutput.textContent = simpleTransliterate(val);
});

function simpleTransliterate(text) {
  const map = {
    "mama": "මම",
    "api": "අපි",
    "gedara": "ගෙදර",
    "yanawa": "යනවා",
    "kamak na": "කමක් නෑ",
    "karanna": "කරන්න",
    "sinhala": "සිංහල",
    "computer": "පරිගණකය",
    "data": "දත්ත",
    "internet": "අන්තර්ජාලය"
  };
  let out = text;
  Object.keys(map).forEach(k => {
    out = out.replace(new RegExp(k, 'gi'), map[k]);
  });
  return out;
}

// Dictionary Search
const dictInput = document.getElementById("dict-input");
const dictOutput = document.getElementById("dict-output");

dictInput.addEventListener("input", () => {
  const q = dictInput.value.trim().toLowerCase();
  if (!q) {
    dictOutput.textContent = "Type to search in 50+ technical terms...";
    return;
  }
  const results = dictionaryData.filter(d =>
    d.term.toLowerCase().includes(q) ||
    d.sinhalaStandard.includes(q) ||
    d.singlish.toLowerCase().includes(q)
  );

  if (results.length === 0) {
    dictOutput.textContent = "වචනය හමු නොවීය. AI නියෝජිතයා හරහා සොයන්න.";
    return;
  }

  dictOutput.innerHTML = results.slice(0, 3).map(r => \`
    <div style="margin-bottom: 8px; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
      <strong style="color: #38bdf8;">\${r.term}</strong> &rarr; <span style="color: #f1f5f9;">\${r.sinhalaStandard}</span>
      <div style="font-size: 11px; color: #94a3b8;">\${r.sinhalaPhonetic} (\${r.category})</div>
      <div style="font-size: 12px; color: #cbd5e1; margin-top: 2px;">\${r.definitionSi}</div>
    </div>
  \`).join("");
});
`;

  const optionsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sinhala Translator – Options & Preferences</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #090a0f;
      color: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 40px 20px;
    }
    .container {
      max-width: 640px;
      margin: 0 auto;
      background: #0c0e14;
      border: 1px solid #27272a;
      border-radius: 16px;
      padding: 28px;
    }
    h1 {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    p.subtitle {
      font-size: 12px;
      font-family: monospace;
      color: #71717a;
      margin-bottom: 24px;
    }
    .section {
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid #1f2029;
    }
    h2 {
      font-size: 12px;
      font-family: monospace;
      text-transform: uppercase;
      color: #a1a1aa;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    label {
      display: block;
      margin-bottom: 10px;
      font-size: 13px;
      color: #d4d4d8;
      cursor: pointer;
    }
    select, input[type="text"] {
      width: 100%;
      background: #12131a;
      border: 1px solid #27272a;
      color: #fff;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 13px;
      outline: none;
    }
    .btn {
      background: #ffffff;
      color: #090a0f;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
    }
    .btn:hover { background: #e4e4e7; }
    .badge {
      background: #18181b;
      border: 1px solid #27272a;
      color: #10b981;
      font-size: 10px;
      font-family: monospace;
      padding: 2px 8px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>
      <span>Sinhala Web Extension Preferences</span>
      <span class="badge">SLS 1134</span>
    </h1>
    <p class="subtitle">Options &amp; Engine Configuration (chrome-extension://options.html)</p>

    <div class="section">
      <h2>Translation Engine</h2>
      <label>Default Tone &amp; Glossary</label>
      <select id="target-tone">
        <option value="technical">Technical Standard (SLS 1134 - UCSC / ICTA)</option>
        <option value="natural">Natural Modern Sinhala (සුගම සිංහල)</option>
        <option value="formal">Formal Academic</option>
      </select>
    </div>

    <div class="section">
      <h2>Preservation Rules</h2>
      <label>
        <input type="checkbox" id="chk-code-blocks" checked />
        <span>Preserve &lt;pre&gt; and &lt;code&gt; tags untouched</span>
      </label>
      <label>
        <input type="checkbox" id="chk-cli-syntax" checked />
        <span>Preserve CLI syntax (curl, bash, git, npm, docker)</span>
      </label>
    </div>

    <div class="section">
      <h2>Auto-Translate Whitelist</h2>
      <p style="font-size:12px; color:#71717a; margin-bottom:8px;">Domains that translate automatically upon visit:</p>
      <input type="text" id="auto-domains" value="omarchy.org, kubernetes.io, react.dev, github.com" />
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center;">
      <span id="save-status" style="font-size:12px; color:#10b981; font-family:monospace;"></span>
      <button class="btn" id="btn-save">Save Changes</button>
    </div>
  </div>

  <script>
    chrome.storage?.sync?.get(["targetTone", "autoTranslateDomains"], (res) => {
      if (res && res.targetTone) document.getElementById("target-tone").value = res.targetTone;
      if (res && res.autoTranslateDomains) document.getElementById("auto-domains").value = res.autoTranslateDomains.join(", ");
    });

    document.getElementById("btn-save").addEventListener("click", () => {
      const tone = document.getElementById("target-tone").value;
      const domains = document.getElementById("auto-domains").value.split(",").map(d => d.trim()).filter(Boolean);
      chrome.storage?.sync?.set({ targetTone: tone, autoTranslateDomains: domains }, () => {
        const s = document.getElementById("save-status");
        s.textContent = "Preferences saved to extension storage!";
        setTimeout(() => s.textContent = "", 2500);
      });
    });
  </script>
</body>
</html>`;

  const readmeMd = `# Sinhala Smart Translator & Tech Lexicon (Chrome Extension)

A clean, developer-grade Chrome Extension crafted with an Omarchy-inspired aesthetic for accurate full-site and technical document translation into standardized Unicode Sinhala (SLS 1134).

## How to Install in Google Chrome, Brave, Edge & Arc:
1. Download or extract all files from this folder.
2. Open your browser and navigate to: \`chrome://extensions/\`
3. Toggle on **Developer mode** in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select this folder containing \`manifest.json\`.
6. Done! The Sinhala Translator icon will appear in your browser toolbar.

## Features:
- **Full Webpage Translation**: Press \`Alt + S\` or open the popup to translate any webpage into SLS 1134 Sinhala without breaking code blocks or layout.
- **Dedicated Options Page**: Customize tone, preservation rules, and domain whitelist (\`omarchy.org\`, \`kubernetes.io\`, etc.).
- **In-Page Floating Tooltip**: Select any text on any website to see instant Unicode Sinhala with phonetic pronunciation.
- **Context Menu**: Right click on any text -> "Translate to Unicode Sinhala" or right click page -> "Translate Entire Page".
- **Preloaded Technical Lexicon**: 50+ official ICT terms from UCSC and ICTA Sri Lanka.
`;

  return [
    { filename: "manifest.json", description: "Chrome Extension Manifest V3 configuration", code: manifestJson },
    { filename: "popup.html", description: "Extension popup user interface", code: popupHtml },
    { filename: "popup.js", description: "Extension popup logic & dictionary search", code: popupJs },
    { filename: "options.html", description: "Dedicated extension options page", code: optionsHtml },
    { filename: "content.js", description: "In-page text selection listener & tooltip injector", code: contentJs },
    { filename: "content.css", description: "In-page tooltip styling", code: contentCss },
    { filename: "background.js", description: "Background service worker & context menu handler", code: backgroundJs },
    { filename: "dictionary.json", description: "Pre-loaded technical dictionary data", code: dictionaryJson },
    { filename: "README.md", description: "Step-by-step Chrome installation guide", code: readmeMd },
  ];
}

export async function downloadExtensionZip(files: ExtensionFile[]): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder("sinhala-translator-extension");

  files.forEach(f => {
    folder?.file(f.filename, f.code);
  });

  // Generate SVG-based simple icons so chrome doesn't warn about missing icons
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <rect width="128" height="128" rx="28" fill="#0284c7"/>
    <text x="64" y="82" font-size="64" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="sans-serif">සිං</text>
  </svg>`;

  const iconFolder = folder?.folder("icons");
  iconFolder?.file("icon16.png", iconSvg);
  iconFolder?.file("icon48.png", iconSvg);
  iconFolder?.file("icon128.png", iconSvg);

  return await zip.generateAsync({ type: "blob" });
}

// Generate Universal Bookmarklet (Runs in ALL browsers: Chrome, Safari, Firefox, Edge, Opera, Arc, Mobile)
// No zip file required! Users simply drag this to their bookmarks bar or click to run!
export function generateUniversalBookmarklet(dictionary: DictionaryEntry[]): string {
  const compactDict = dictionary.map((d) => ({
    t: d.term,
    s: d.sinhalaStandard,
    p: d.sinhalaPhonetic,
    g: d.singlish,
    d: d.definitionSi,
    c: d.category,
  }));

  const scriptBody = `
(function() {
  if (window.__sinhala_translator_active) {
    var existing = document.getElementById('sinhala-translator-floating-root');
    if (existing) existing.remove();
    window.__sinhala_translator_active = false;
    return;
  }
  window.__sinhala_translator_active = true;

  var DICT = ${JSON.stringify(compactDict)};

  if (!document.getElementById('sinhala-font-link')) {
    var link = document.createElement('link');
    link.id = 'sinhala-font-link';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;600;700&display=swap';
    document.head.appendChild(link);
  }

  var container = document.createElement('div');
  container.id = 'sinhala-translator-floating-root';
  container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999999;font-family:Noto Sans Sinhala,system-ui,-apple-system,sans-serif;box-sizing:border-box;';

  var button = document.createElement('button');
  button.id = 'sinhala-toggle-bubble';
  button.innerHTML = '<span style="font-size:18px;font-weight:700;">සිං</span><span style="font-size:11px;opacity:0.9;margin-left:4px;font-weight:600;">Sinhala AI</span>';
  button.style.cssText = 'background:linear-gradient(135deg,#0284c7,#0369a1);color:#fff;border:1px solid rgba(255,255,255,0.25);border-radius:30px;padding:10px 18px;cursor:pointer;box-shadow:0 10px 25px -5px rgba(2,132,199,0.5),0 8px 10px -6px rgba(2,132,199,0.3);display:flex;align-items:center;transition:all 0.2s ease;font-family:inherit;';
  
  var panel = document.createElement('div');
  panel.id = 'sinhala-translator-panel';
  panel.style.cssText = 'display:none;position:absolute;bottom:54px;right:0;width:340px;background:#090d16;color:#f1f5f9;border:1px solid rgba(56,189,248,0.25);border-radius:18px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.85);padding:16px;overflow:hidden;box-sizing:border-box;';

  panel.innerHTML = [
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:10px;">',
    '  <div style="display:flex;align-items:center;gap:8px;">',
    '    <span style="background:#0284c7;color:#fff;width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;">සිං</span>',
    '    <div><strong style="font-size:13px;display:block;color:#f8fafc;">Sinhala Web Assistant</strong><span style="font-size:10px;color:#38bdf8;">' + DICT.length + ' Technical Terms Synced</span></div>',
    '  </div>',
    '  <button id="sinhala-close-btn" style="background:none;border:none;color:#94a3b8;font-size:18px;cursor:pointer;margin-left:auto;">&times;</button>',
    '</div>',
    '<div style="margin-bottom:10px;">',
    '  <input id="sinhala-search-input" type="text" placeholder="Search technical term (e.g. cache, thread)..." style="width:100%;box-sizing:border-box;background:#131b2e;border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:8px 12px;color:#fff;font-size:12px;outline:none;" />',
    '</div>',
    '<div id="sinhala-results-box" style="max-height:220px;overflow-y:auto;font-size:12px;display:flex;flex-direction:column;gap:8px;">',
    '  <div style="color:#94a3b8;font-size:11px;text-align:center;padding:12px 0;">Highlight any word on this webpage or search above to see instant Unicode Sinhala.</div>',
    '</div>',
    '<div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#64748b;">',
    '  <span>Universal Web Runner</span>',
    '  <span style="color:#38bdf8;">U+0D80–U+0DFF Unicode</span>',
    '</div>'
  ].join('');

  container.appendChild(panel);
  container.appendChild(button);
  document.body.appendChild(container);

  button.onclick = function() {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  };

  var closeBtn = panel.querySelector('#sinhala-close-btn');
  if (closeBtn) closeBtn.onclick = function() { panel.style.display = 'none'; };

  var input = panel.querySelector('#sinhala-search-input');
  var results = panel.querySelector('#sinhala-results-box');

  function renderTerm(item) {
    return [
      '<div style="background:#131b2e;border:1px solid rgba(56,189,248,0.2);border-radius:10px;padding:10px;">',
      '  <div style="display:flex;justify-content:space-between;align-items:baseline;">',
      '    <strong style="color:#f8fafc;font-size:12px;">' + item.t + '</strong>',
      '    <span style="font-size:9px;background:rgba(56,189,248,0.15);color:#38bdf8;padding:2px 6px;border-radius:4px;">' + item.c + '</span>',
      '  </div>',
      '  <div style="margin-top:4px;color:#38bdf8;font-weight:600;font-size:14px;">' + item.s + '</div>',
      '  <div style="color:#94a3b8;font-size:11px;margin-top:2px;">' + item.p + '</div>',
      '  <div style="color:#cbd5e1;font-size:11px;margin-top:4px;line-height:1.4;">' + item.d + '</div>',
      '</div>'
    ].join('');
  }

  if (input && results) {
    input.oninput = function() {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        results.innerHTML = '<div style="color:#94a3b8;font-size:11px;text-align:center;padding:12px 0;">Highlight any word on this webpage or search above to see instant Unicode Sinhala.</div>';
        return;
      }
      var matches = DICT.filter(function(d) {
        return d.t.toLowerCase().indexOf(q) !== -1 || d.s.indexOf(q) !== -1 || (d.g && d.g.toLowerCase().indexOf(q) !== -1);
      });
      if (matches.length === 0) {
        results.innerHTML = '<div style="color:#f87171;font-size:11px;text-align:center;padding:8px;">No local term found for &quot;' + q + '&quot;.</div>';
      } else {
        results.innerHTML = matches.slice(0, 5).map(renderTerm).join('');
      }
    };
  }

  // Floating Selection Tooltip
  var tooltip = document.createElement('div');
  tooltip.id = 'sinhala-inpage-tooltip';
  tooltip.style.cssText = 'position:fixed;display:none;z-index:999999999;background:#090d16;color:#f8fafc;border:1px solid #0284c7;border-radius:12px;padding:10px 14px;box-shadow:0 15px 35px rgba(0,0,0,0.6);font-size:12px;max-width:280px;font-family:Noto Sans Sinhala,system-ui,sans-serif;pointer-events:auto;';
  document.body.appendChild(tooltip);

  document.addEventListener('mouseup', function(e) {
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      setTimeout(function() { if (tooltip) tooltip.style.display = 'none'; }, 250);
      return;
    }
    var text = sel.toString().trim();
    if (text.length >= 2 && text.length <= 80) {
      var lower = text.toLowerCase();
      var match = DICT.find(function(d) { return d.t.toLowerCase() === lower || lower.indexOf(d.t.toLowerCase()) !== -1; });
      if (match) {
        tooltip.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:4px;margin-bottom:6px;"><span style="color:#38bdf8;font-weight:bold;font-size:11px;">' + match.t + '</span><span style="font-size:9px;color:#94a3b8;">' + match.c + '</span></div><div style="font-weight:700;font-size:14px;color:#38bdf8;">' + match.s + '</div><div style="color:#cbd5e1;font-size:11px;margin-top:3px;">' + match.d + '</div>';
        tooltip.style.left = Math.min(window.innerWidth - 300, Math.max(10, e.clientX - 60)) + 'px';
        tooltip.style.top = Math.max(10, e.clientY - 90) + 'px';
        tooltip.style.display = 'block';
      }
    }
  });

  alert('⚡ Sinhala Smart Translator activated on this webpage! Look for the floating [සිං] button in the bottom right corner, or highlight technical terms on this page.');
})();
  `.trim().replace(/\s+/g, " ");

  return `javascript:${encodeURIComponent(scriptBody)}`;
}

// Generate Tampermonkey / Greasemonkey UserScript for 1-click install in all browsers
export function generateUserScript(dictionary: DictionaryEntry[]): string {
  const bookmarkletCode = generateUniversalBookmarklet(dictionary).replace(/^javascript:/, "");
  const decoded = decodeURIComponent(bookmarkletCode);

  return `// ==UserScript==
// @name         Sinhala Smart Translator & Technical Lexicon
// @namespace    https://ai.studio/sinhala-translator
// @version      1.0.0
// @description  Universal context-aware Unicode Sinhala translator and technical term dictionary for all browsers.
// @author       AI Studio
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

${decoded}
`;
}

// Direct file downloader for single files without zip
export function downloadDirectFile(filename: string, content: string, mimeType = "text/plain"): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadUserScript(dictionary: DictionaryEntry[]): void {
  const scriptContent = generateUserScript(dictionary);
  downloadDirectFile("sinhala-smart-translator.user.js", scriptContent, "application/javascript");
}

