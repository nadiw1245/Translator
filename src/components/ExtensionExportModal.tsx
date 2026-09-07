import React, { useState } from "react";
import { 
  Download, 
  Chrome, 
  Check, 
  Copy, 
  FileCode, 
  Sparkles, 
  Bookmark, 
  Globe, 
  Laptop, 
  Smartphone, 
  HelpCircle, 
  MousePointer, 
  FolderDown, 
  Layers, 
  Zap, 
  ShieldCheck,
  Flame,
  ArrowRight
} from "lucide-react";
import { DictionaryEntry } from "../types";
import { 
  generateExtensionFiles, 
  downloadExtensionZip, 
  generateUniversalBookmarklet, 
  downloadUserScript, 
  downloadDirectFile,
  ExtensionFile 
} from "../utils/extensionBundle";

interface ExtensionExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dictionary: DictionaryEntry[];
}

type InstallMethod = "bookmarklet" | "userscript" | "chrome-zip" | "direct-files";

export const ExtensionExportModal: React.FC<ExtensionExportModalProps> = ({
  isOpen,
  onClose,
  dictionary,
}) => {
  if (!isOpen) return null;

  const [activeMethod, setActiveMethod] = useState<InstallMethod>("bookmarklet");
  const [downloading, setDownloading] = useState(false);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);
  const [copiedFile, setCopiedFile] = useState(false);

  const files = generateExtensionFiles(dictionary);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const activeFile = files[activeFileIndex];

  const bookmarkletHref = generateUniversalBookmarklet(dictionary);

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletHref);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 2500);
  };

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      const blob = await downloadExtensionZip(files);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sinhala-smart-translator-chrome-extension.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("ZIP download failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadSingleFile = (file: ExtensionFile) => {
    const mime = file.filename.endsWith(".json")
      ? "application/json"
      : file.filename.endsWith(".html")
      ? "text/html"
      : file.filename.endsWith(".css")
      ? "text/css"
      : "application/javascript";
    downloadDirectFile(file.filename, file.code, mime);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="glass-panel rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-white/15 my-auto max-h-[92vh] flex flex-col relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-sky-500/30">
              සිං
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Universal Browser Extension &amp; Runner
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  All Browsers Supported
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Install or run anywhere: Google Chrome, Apple Safari, Mozilla Firefox, Microsoft Edge, Arc, Brave &amp; Mobile!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl font-bold leading-none p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Multi-Browser Supported Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
          <span className="text-slate-400 text-[11px] font-medium pl-1">
            Compatible with all browsers:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { name: "Google Chrome", icon: "🌐" },
              { name: "Safari (Mac & iOS)", icon: "🧭" },
              { name: "Mozilla Firefox", icon: "🦊" },
              { name: "Microsoft Edge", icon: "🌊" },
              { name: "Arc & Brave", icon: "🦁" },
            ].map((b) => (
              <span
                key={b.name}
                className="px-2 py-0.5 rounded-full bg-black/40 text-slate-300 text-[11px] border border-white/10 flex items-center gap-1"
              >
                <span>{b.icon}</span>
                <span>{b.name}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Method Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => setActiveMethod("bookmarklet")}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              activeMethod === "bookmarklet"
                ? "bg-gradient-to-b from-sky-500/20 to-sky-950/40 border-sky-400/60 shadow-lg shadow-sky-500/20 text-white"
                : "glass-pill text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
              <Zap className="w-3.5 h-3.5" />
              <span>1-Click Universal</span>
            </div>
            <p className="text-xs font-semibold mt-1">Bookmarklet (No Zip)</p>
            <span className="text-[10px] text-slate-400 block mt-0.5">Runs on any browser &amp; site</span>
          </button>

          <button
            onClick={() => setActiveMethod("userscript")}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              activeMethod === "userscript"
                ? "bg-gradient-to-b from-emerald-500/20 to-emerald-950/40 border-emerald-400/60 shadow-lg shadow-emerald-500/20 text-white"
                : "glass-pill text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto Injector</span>
            </div>
            <p className="text-xs font-semibold mt-1">Tampermonkey Script</p>
            <span className="text-[10px] text-slate-400 block mt-0.5">Auto-runs on all web pages</span>
          </button>

          <button
            onClick={() => setActiveMethod("direct-files")}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              activeMethod === "direct-files"
                ? "bg-gradient-to-b from-purple-500/20 to-purple-950/40 border-purple-400/60 shadow-lg shadow-purple-500/20 text-white"
                : "glass-pill text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
              <FileCode className="w-3.5 h-3.5" />
              <span>Direct Files</span>
            </div>
            <p className="text-xs font-semibold mt-1">Single File Downloads</p>
            <span className="text-[10px] text-slate-400 block mt-0.5">Get code without zip file</span>
          </button>

          <button
            onClick={() => setActiveMethod("chrome-zip")}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              activeMethod === "chrome-zip"
                ? "bg-gradient-to-b from-amber-500/20 to-amber-950/40 border-amber-400/60 shadow-lg shadow-amber-500/20 text-white"
                : "glass-pill text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <FolderDown className="w-3.5 h-3.5" />
              <span>Chrome / Edge</span>
            </div>
            <p className="text-xs font-semibold mt-1">Unpacked (.zip)</p>
            <span className="text-[10px] text-slate-400 block mt-0.5">Manifest V3 package</span>
          </button>
        </div>

        {/* Content Area Based on Selected Method */}
        <div className="flex-1 overflow-y-auto space-y-4">
          
          {/* METHOD 1: UNIVERSAL BOOKMARKLET (NO ZIP) */}
          {activeMethod === "bookmarklet" && (
            <div className="space-y-4 rounded-2xl bg-gradient-to-b from-sky-950/40 via-slate-900/60 to-slate-950/80 border border-sky-500/30 p-5 shadow-inner">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-sky-400" />
                    <span>Drag &amp; Drop Universal Web Extension (No Zip, Zero Setup)</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Drag the glowing button below directly onto your Bookmarks Bar. Then visit ANY website (GitHub, StackOverflow, MDN, Wikipedia) and click it to activate the floating Sinhala translator!
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyBookmarklet}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    {copiedBookmarklet ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Code Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Script Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* The Draggable Bookmark Button */}
              <div className="p-6 rounded-2xl bg-black/50 border border-dashed border-sky-500/50 flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <MousePointer className="w-3.5 h-3.5 text-sky-400" />
                  <span>Drag this button to your Bookmarks Bar:</span>
                </span>

                <a
                  href={bookmarkletHref}
                  onClick={(e) => {
                    // Prevent navigation on click, explain to user
                    alert("👉 To install: Drag and drop this button into your Bookmarks Bar at the top of your browser! Or copy the code.");
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-indigo-500 text-slate-950 font-black text-sm shadow-xl shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all cursor-grab"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-950 text-sky-300 flex items-center justify-center font-bold text-xs">
                    සිං
                  </span>
                  <span>⚡ Sinhala Smart Translator</span>
                </a>

                <p className="text-[11px] text-slate-400 max-w-md">
                  💡 Don&apos;t see your Bookmarks bar? Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Ctrl + Shift + B</kbd> (or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Cmd + Shift + B</kbd> on Mac).
                </p>
              </div>

              {/* How it runs on websites */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="font-bold text-sky-400 block mb-1">1. Works on Any Page</span>
                  <p className="text-slate-400 text-[11px]">Click the bookmark on GitHub, MDN, Reddit, or any technical blog in any browser.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="font-bold text-sky-400 block mb-1">2. Floating Bubble [සිං]</span>
                  <p className="text-slate-400 text-[11px]">A sleek floating assistant appears in the bottom corner of that page with dictionary search.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="font-bold text-sky-400 block mb-1">3. Select Any Word</span>
                  <p className="text-slate-400 text-[11px]">Highlight any English technical jargon on the page to see instant Unicode Sinhala definition.</p>
                </div>
              </div>
            </div>
          )}

          {/* METHOD 2: USERSCRIPT (TAMPERMONKEY) */}
          {activeMethod === "userscript" && (
            <div className="space-y-4 rounded-2xl bg-gradient-to-b from-emerald-950/40 via-slate-900/60 to-slate-950/80 border border-emerald-500/30 p-5 shadow-inner">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Automated Userscript (.user.js for Tampermonkey / Greasemonkey)</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Auto-runs on EVERY website automatically without clicking anything. Great for Firefox, Chrome, Safari, and Kiwi Browser Android.
                  </p>
                </div>

                <button
                  onClick={() => downloadUserScript(dictionary)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .user.js Script</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs text-slate-300">
                <span className="font-semibold text-emerald-300">How to use Userscript:</span>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400 leading-relaxed">
                  <li>Install any free userscript manager (like <strong className="text-slate-200">Tampermonkey</strong> or <strong className="text-slate-200">Violentmonkey</strong> from your browser&apos;s store).</li>
                  <li>Click &quot;Download .user.js Script&quot; above and open it in Tampermonkey.</li>
                  <li>Click &quot;Install&quot; — the Sinhala technical translator will now be active on every website you visit!</li>
                </ol>
              </div>
            </div>
          )}

          {/* METHOD 3: DIRECT SINGLE FILES (NO ZIP) */}
          {activeMethod === "direct-files" && (
            <div className="space-y-4 rounded-2xl bg-gradient-to-b from-purple-950/40 via-slate-900/60 to-slate-950/80 border border-purple-500/30 p-5 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    <span>Download Individual Extension Source Files (No Zip Extractor Required)</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Save individual files directly to your computer or inspect the source code.
                  </p>
                </div>

                {activeFile && (
                  <button
                    onClick={() => handleDownloadSingleFile(activeFile)}
                    className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download {activeFile.filename}</span>
                  </button>
                )}
              </div>

              {/* File list */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {files.map((f, i) => (
                  <button
                    key={f.filename}
                    onClick={() => setActiveFileIndex(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap ${
                      activeFileIndex === i
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                        : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    {f.filename}
                  </button>
                ))}
              </div>

              {/* Code viewer */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 max-h-60 overflow-y-auto font-mono text-xs text-slate-300">
                <pre>{activeFile?.code}</pre>
              </div>
            </div>
          )}

          {/* METHOD 4: CHROME ZIP PACKAGE */}
          {activeMethod === "chrome-zip" && (
            <div className="space-y-4 rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900/60 to-slate-950/80 border border-amber-500/30 p-5 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FolderDown className="w-4 h-4 text-amber-400" />
                    <span>Full Chromium Extension ZIP (Manifest V3)</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Preloaded with {dictionary.length} technical terms, background service worker, and popup.
                  </p>
                </div>

                <button
                  onClick={handleDownloadZip}
                  disabled={downloading}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloading ? "Packaging ZIP..." : "Download Full ZIP"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs bg-black/40 p-3.5 rounded-xl border border-white/5">
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-400">Step 1:</span>
                  <p className="text-slate-300 font-medium">Extract ZIP</p>
                  <p className="text-[11px] text-slate-400">Unzip the archive to any folder.</p>
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-400">Step 2:</span>
                  <p className="text-slate-300 font-medium">Open Chrome</p>
                  <p className="text-[11px] text-slate-400">Go to chrome://extensions</p>
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-400">Step 3:</span>
                  <p className="text-slate-300 font-medium">Dev Mode</p>
                  <p className="text-[11px] text-slate-400">Turn on Developer mode toggle.</p>
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-400">Step 4:</span>
                  <p className="text-slate-300 font-medium">Load Unpacked</p>
                  <p className="text-[11px] text-slate-400">Select the extracted folder.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 relative z-10">
          <span>
            Unicode Sinhala Standard <strong className="text-sky-400 font-mono">U+0D80–U+0DFF</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl glass-pill hover:bg-white/10 text-slate-200 font-medium cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
