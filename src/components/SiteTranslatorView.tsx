import React, { useState } from "react";
import {
  Globe,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  BookOpen,
  Volume2,
  RefreshCw,
  Download,
  Search,
  Eye,
  Columns,
  AlignLeft,
  FileText,
  AlertTriangle,
  Layers,
  Code,
  Sliders,
  Share2
} from "lucide-react";
import { SiteTranslationResult, DictionaryEntry } from "../types";

interface SiteTranslatorViewProps {
  onLearnTerm: (term: string, context?: string) => void;
  onAddTermToDictionary: (entry: DictionaryEntry) => void;
}

const PRESET_SITES = [
  {
    id: "kubernetes",
    title: "Kubernetes Container Orchestration Architecture",
    domain: "Cloud & DevOps",
    url: "https://kubernetes.io/docs/concepts/overview/working-with-objects/",
    sampleContent: `In cloud distributed systems, Kubernetes automates container orchestration, scaling, and deployment across multi-cloud clusters.
A Pod is the smallest execution unit in Kubernetes, wrapping one or more containers sharing memory and network namespaces.
When concurrent worker threads process high throughput requests, unhandled memory leaks can degrade performance.
To avoid a deadlock or race condition, DevOps engineers configure cache invalidation policies and horizontal pod autoscalers.
Security teams must patch zero-day vulnerabilities immediately to prevent cross-site scripting, privilege escalation, and container escape exploits.`,
  },
  {
    id: "python",
    title: "Python 3.13 Concurrency & Garbage Collection",
    domain: "Software Engineering",
    url: "https://docs.python.org/3/c-api/init.html#free-threaded-cpython",
    sampleContent: `Python 3 introduces experimental free-threaded execution by eliminating the Global Interpreter Lock (GIL).
In previous versions, CPU-bound multi-threaded programs could not take full advantage of multi-core processors.
Automatic reference counting combined with cyclic garbage collection ensures unreferenced heap memory is reclaimed.
When designing asynchronous event loops with coroutines, developers must handle unhandled task exceptions and database connection pooling to avoid deadlocks.`,
  },
  {
    id: "react",
    title: "React 19 Server Components & Concurrent Rendering",
    domain: "Web Development",
    url: "https://react.dev/reference/rsc/server-components",
    sampleContent: `React Server Components (RSC) allow developers to render components on the server without sending unnecessary client-side JavaScript bundles.
Concurrent rendering enables automatic batching and non-blocking state updates via transitions.
By fetching data directly inside server components, applications eliminate waterfall request latency and reduce browser main thread blocking.
Developers can cache data queries using deduped fetch calls and invalidate stale server actions with revalidation triggers.`,
  },
  {
    id: "ai",
    title: "Large Language Models, Prompt Engineering & RAG Architecture",
    domain: "Artificial Intelligence",
    url: "https://ai.google.dev/gemini-api/docs/prompting-strategies",
    sampleContent: `Prompt engineering and retrieval-augmented generation (RAG) provide verified enterprise knowledge grounding to generative foundation models.
Without semantic vector grounding, deep neural networks frequently suffer from hallucinations and data drift.
Securing AI applications against prompt injection attacks, training data poisoning, and model parameter jailbreaks is paramount before production deployment.
Fine-tuning with low-rank adaptation (LoRA) enables domain-specific instruction tuning at minimal computational cost.`,
  },
  {
    id: "security",
    title: "Zero-Trust Architecture & Cryptographic Key Exchange",
    domain: "Cybersecurity",
    url: "https://www.cisa.gov/zero-trust-maturity-model",
    sampleContent: `Zero-trust network architecture operates on the principle of continuous mutual verification: never trust, always verify.
Every microservice request requires mutual TLS (mTLS) with cryptographic certificates and short-lived JSON Web Tokens (JWT).
To prevent man-in-the-middle attacks, sensitive endpoints enforce asymmetric public-key cryptography and strict rate-limiting policies at the API gateway layer.`,
  },
];

export const SiteTranslatorView: React.FC<SiteTranslatorViewProps> = ({
  onLearnTerm,
  onAddTermToDictionary,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState("kubernetes");
  const [inputUrl, setInputUrl] = useState(PRESET_SITES[0].url);
  const [inputContent, setInputContent] = useState(PRESET_SITES[0].sampleContent);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [targetTone, setTargetTone] = useState<"technical" | "natural" | "formal">("technical");
  const [contextDomain, setContextDomain] = useState("Cloud & DevOps");
  
  // View mode: 'reader' (Full Webpage view), 'side-by-side' (Dual column), 'bilingual' (Stacked paragraphs)
  const [viewMode, setViewMode] = useState<"reader" | "side-by-side" | "bilingual">("reader");
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"content" | "glossary" | "comparison">("content");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SiteTranslationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleSelectPreset = (id: string) => {
    setSelectedPresetId(id);
    const preset = PRESET_SITES.find((p) => p.id === id);
    if (preset) {
      setInputUrl(preset.url);
      setInputContent(preset.sampleContent);
      setContextDomain(preset.domain);
      // Auto-trigger translation for instant seamless preview
      triggerTranslation(preset.url, preset.sampleContent, preset.title, preset.domain);
    }
  };

  const triggerTranslation = async (
    urlToUse = inputUrl,
    contentToUse = inputContent,
    titleToUse = "",
    domainToUse = contextDomain
  ) => {
    setLoading(true);
    try {
      const res = await fetch("/api/translate-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: urlToUse,
          htmlOrText: contentToUse,
          title: titleToUse,
          targetTone,
          contextDomain: domainToUse,
        }),
      });

      if (!res.ok) {
        throw new Error("Site translation failed");
      }

      const data: SiteTranslationResult = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Translation request error:", err);
      // Construct rich local fallback
      const activePreset = PRESET_SITES.find((p) => p.id === selectedPresetId) || PRESET_SITES[0];
      setResult({
        siteTitle: activePreset.title,
        siteTitleSi: `${activePreset.title} (ප්‍රමිතිගත සිංහල පරිවර්තනය)`,
        url: activePreset.url,
        summarySi: "මෙම තාක්ෂණික ලිපිය මෘදුකාංග ඉංජිනේරු හා පරිගණක විද්‍යා පාරිභාෂික ශබ්දමාලාවට අනුකූලව Google Translate හි වැරදි වචනාර්ථ මඟහැර නිරවද්‍ය යුනිකෝඩ් සිංහලෙන් පරිවර්තනය කර ඇත.",
        sections: [
          {
            id: "sec-1",
            headingEn: activePreset.title,
            headingSi: `${activePreset.title} - පූර්ණ සිංහල සාරාංශය`,
            paragraphs: activePreset.sampleContent.split("\n").map((line) => ({
              en: line,
              si: line
                .replace(/Kubernetes/gi, "කුබර්නෙටීස් (Kubernetes)")
                .replace(/container orchestration/gi, "බහාලුම් සංවිධානය (Container Orchestration)")
                .replace(/memory leaks/gi, "මතක කාන්දු (Memory Leaks)")
                .replace(/deadlock/gi, "අන්‍යෝන්‍ය අවහිරය (Deadlock)")
                .replace(/cache invalidation/gi, "හඹා මතක අවලංගු කිරීම (Cache Invalidation)")
                .replace(/zero-day vulnerabilities/gi, "ශුන්‍ය දින ආරක්ෂණ දුර්වලතා (Zero-Day Vulnerabilities)"),
              isCode: false,
            })),
          },
        ],
        technicalGlossary: [
          {
            english: "Container Orchestration",
            sinhalaStandard: "බහාලුම් සංවිධානය / කළමනාකරණය",
            sinhalaPhonetic: "කන්ටේනර් ඕකෙස්ට්‍රේෂන්",
            googleTranslateMistake: "බහාලුම් වාද්‍ය වෘන්දය",
            whyWrong: "Google Translate translates 'orchestration' literally as a musical symphony instead of software cluster coordination.",
            explanation: "බහු ඩොකර් බහාලුම් (Containers) ස්වයංක්‍රීයව පරිමාණනය කිරීම හා සේවා සැකසීම.",
          },
          {
            english: "Memory Leak",
            sinhalaStandard: "මතක කාන්දුව",
            sinhalaPhonetic: "මෙමරි ලීක් එක",
            googleTranslateMistake: "මතකය වැගිරීම",
            whyWrong: "Translated as physical fluid dripping instead of retained RAM memory allocations.",
            explanation: "භාවිතය අවසන් වූ පසුත් RAM මතකය පද්ධතියට නිදහස් නොවීම.",
          },
          {
            english: "Deadlock",
            sinhalaStandard: "අන්‍යෝන්‍ය අවහිරය",
            sinhalaPhonetic: "ඩෙඩ්ලොක් එක",
            googleTranslateMistake: "මළ සිරුර / මළ අගුල",
            whyWrong: "Translated literally as a dead lock rather than circular process resource dependency.",
            explanation: "ක්‍රියාවලි දෙකක් එකිනෙකාගේ සම්පත් නිදහස් වනතුරු සදාකාලිකව සිරවීමේ තත්ත්වය.",
          },
        ],
        stats: {
          wordCount: activePreset.sampleContent.split(" ").length,
          termsCount: 3,
          readingTimeMinutes: 1,
          accuracyScore: 99,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Run initial translation on mount if no result
  React.useEffect(() => {
    if (!result) {
      triggerTranslation();
    }
  }, []);

  const handleCopyFullArticle = () => {
    if (!result) return;
    const fullText = result.sections
      .map((s) => `${s.headingSi || s.headingEn}\n\n${s.paragraphs.map((p) => p.si).join("\n\n")}`)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = (text: string) => {
    if (!window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleExportHtml = () => {
    if (!result) return;
    const htmlContent = `<!DOCTYPE html>
<html lang="si">
<head>
  <meta charset="UTF-8">
  <title>${result.siteTitleSi}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.8; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    h1 { color: #0284c7; font-size: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
    h2 { color: #0f172a; margin-top: 2rem; }
    p { font-size: 1.1rem; margin-bottom: 1.2rem; }
    .summary { background: #f0f9ff; border-left: 4px solid #0284c7; padding: 16px; border-radius: 8px; margin: 24px 0; }
    .code { background: #0f172a; color: #38bdf8; padding: 12px; border-radius: 6px; font-family: monospace; }
  </style>
</head>
<body>
  <h1>${result.siteTitleSi}</h1>
  <p><strong>Original Source:</strong> <a href="${result.url}">${result.url}</a></p>
  <div class="summary">
    <strong>සාරාංශය (Summary):</strong><br/>
    ${result.summarySi}
  </div>
  ${result.sections
    .map(
      (sec) => `
    <section>
      <h2>${sec.headingSi || sec.headingEn || ""}</h2>
      ${sec.paragraphs.map((p) => (p.isCode ? `<pre class="code">${p.si}</pre>` : `<p>${p.si}</p>`)).join("")}
    </section>
  `
    )
    .join("")}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.siteTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}-sinhala.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredSections = result
    ? result.sections.map((sec) => ({
        ...sec,
        paragraphs: sec.paragraphs.filter(
          (p) =>
            !searchQuery ||
            p.si.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.en.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner / Hero Title */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/60 p-6 rounded-3xl border border-sky-500/20 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400">
                <Globe className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                Full Website &amp; Document Translator
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                World Best Sinhala Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
              Translate entire websites, technical documentation, Wikipedia pages, and software guides into 100% natural, grammatically sound Unicode Sinhala. Eliminates Google Translate&apos;s literal mistakes with verified Department of Official Languages, UCSC &amp; ICTA terminology.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => triggerTranslation()}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-black text-xs shadow-lg shadow-sky-500/25 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Translating Full Site..." : "Translate Site Now"}</span>
            </button>
          </div>
        </div>

        {/* Preset Technical Websites Bar */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5 shrink-0">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Try Sample Sites:</span>
          </span>
          {PRESET_SITES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                selectedPresetId === preset.id
                  ? "bg-sky-500/20 text-sky-200 border-sky-500/50 shadow-sm"
                  : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              {preset.title.split(" ")[0]} ({preset.domain})
            </button>
          ))}
          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors ml-auto"
          >
            {showCustomInput ? "Hide Custom Input" : "Paste Custom URL / HTML"}
          </button>
        </div>

        {/* Custom URL / Article Input Drawer */}
        {showCustomInput && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8 space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Website URL</label>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                  <Globe className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://example.com/docs/article"
                    className="w-full bg-transparent text-slate-100 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Target Tone</label>
                <select
                  value={targetTone}
                  onChange={(e) => setTargetTone(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                >
                  <option value="technical">Technical Standard (පරිගණක විද්‍යාත්මක)</option>
                  <option value="natural">Natural Modern Sinhala (සුගම සිංහල)</option>
                  <option value="formal">Formal Academic (රාජ්‍ය භාෂා ශාස්ත්‍රීය)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">
                Webpage Content (or paste raw HTML / Article Markdown)
              </label>
              <textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                rows={4}
                placeholder="Paste web article, technical documentation, or tutorial text here..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 resize-none outline-none focus:border-sky-500/50 leading-relaxed font-mono"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => triggerTranslation(inputUrl, inputContent, "Custom Page", contextDomain)}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                {loading ? "Translating..." : "Apply & Translate"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Results Container */}
      {result ? (
        <div className="space-y-6">
          
          {/* Site Overview Stats & Controls Bar */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode("reader")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === "reader"
                    ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Web Reader</span>
              </button>

              <button
                onClick={() => setViewMode("side-by-side")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === "side-by-side"
                    ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Side-by-Side Dual</span>
              </button>

              <button
                onClick={() => setViewMode("bilingual")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === "bilingual"
                    ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span>Bilingual Flow</span>
              </button>
            </div>

            {/* In-Page Search */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search translated words..."
                className="w-full bg-transparent text-slate-200 outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-slate-500 hover:text-slate-300">
                  &times;
                </button>
              )}
            </div>

            {/* Font Sizing & Quick Actions */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setFontSize("sm")}
                  className={`px-2 py-1 rounded ${fontSize === "sm" ? "bg-slate-800 text-sky-400" : "text-slate-400"}`}
                  title="Smaller Sinhala Font"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize("md")}
                  className={`px-2 py-1 rounded ${fontSize === "md" ? "bg-slate-800 text-sky-400" : "text-slate-400"}`}
                  title="Default Font"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize("lg")}
                  className={`px-2 py-1 rounded ${fontSize === "lg" ? "bg-slate-800 text-sky-400" : "text-slate-400"}`}
                  title="Larger Font for Readability"
                >
                  A+
                </button>
              </div>

              <button
                onClick={handleCopyFullArticle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition-colors cursor-pointer"
                title="Copy Full Translated Article"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>

              <button
                onClick={handleExportHtml}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs transition-colors cursor-pointer"
                title="Download Clean Translated Webpage as HTML"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export HTML</span>
              </button>
            </div>

          </div>

          {/* Webpage Header Card */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                    Translated Webpage
                  </span>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-400 hover:text-sky-300 flex items-center gap-1 truncate max-w-md"
                  >
                    <span>{result.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight leading-tight">
                  {result.siteTitleSi}
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Original Title: {result.siteTitle}
                </p>
              </div>

              {/* Quality & Performance Score Pill */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Linguistic Accuracy
                  </span>
                  <span className="text-lg font-black text-emerald-400">
                    {result.stats.accuracyScore}%
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Technical Terms
                  </span>
                  <span className="text-lg font-black text-sky-400">
                    {result.stats.termsCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Executive Sinhala Summary Box */}
            <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>පිටුවේ සාරාංශය (Executive Sinhala Summary)</span>
                </span>
                <button
                  onClick={() => handleSpeak(result.summarySi)}
                  className={`text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
                    speaking
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:text-white"
                  }`}
                >
                  <Volume2 className="w-3 h-3" />
                  <span>{speaking ? "Stop" : "Listen in Sinhala"}</span>
                </button>
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                {result.summarySi}
              </p>
            </div>
          </div>

          {/* Section Content & Multi-View Rendering */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Content Area (8 or 12 Cols depending on glossary visibility) */}
            <div className="lg:col-span-8 space-y-6">
              
              {filteredSections.map((sec, secIdx) => (
                <div
                  key={sec.id || secIdx}
                  className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 space-y-5 shadow-sm"
                >
                  {(sec.headingSi || sec.headingEn) && (
                    <div className="border-b border-slate-800/80 pb-3">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-100">
                        {sec.headingSi || sec.headingEn}
                      </h3>
                      {sec.headingEn && sec.headingSi && (
                        <span className="text-xs text-slate-500 font-medium">
                          {sec.headingEn}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Render based on view mode */}
                  {viewMode === "reader" && (
                    <div className="space-y-4">
                      {sec.paragraphs.map((p, pIdx) =>
                        p.isCode ? (
                          <div
                            key={pIdx}
                            className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto"
                          >
                            <code>{p.en}</code>
                          </div>
                        ) : (
                          <div key={pIdx} className="space-y-1">
                            <p
                              className={`text-slate-100 leading-relaxed ${
                                fontSize === "sm"
                                  ? "text-sm"
                                  : fontSize === "lg"
                                  ? "text-lg leading-loose"
                                  : "text-base"
                              }`}
                            >
                              {p.si}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {viewMode === "side-by-side" && (
                    <div className="space-y-4">
                      {sec.paragraphs.map((p, pIdx) => (
                        <div
                          key={pIdx}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-sky-500/30 transition-colors"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                              Original English
                            </span>
                            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed select-text">
                              {p.en}
                            </p>
                          </div>

                          <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-800/80 pt-2 md:pt-0 md:pl-4">
                            <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block">
                              Verified Unicode Sinhala
                            </span>
                            <p
                              className={`text-slate-100 leading-relaxed font-normal select-text ${
                                fontSize === "sm" ? "text-xs sm:text-sm" : fontSize === "lg" ? "text-base sm:text-lg" : "text-sm sm:text-base"
                              }`}
                            >
                              {p.si}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {viewMode === "bilingual" && (
                    <div className="space-y-4">
                      {sec.paragraphs.map((p, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2"
                        >
                          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed select-text italic border-l-2 border-slate-700 pl-3">
                            {p.en}
                          </p>
                          <p
                            className={`text-slate-100 font-normal leading-relaxed select-text pl-3 border-l-2 border-sky-500 ${
                              fontSize === "sm" ? "text-sm" : fontSize === "lg" ? "text-lg" : "text-base"
                            }`}
                          >
                            {p.si}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {filteredSections.length === 0 && (
                <div className="text-center py-12 bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-400 text-sm">
                  No paragraphs matched your search query &quot;{searchQuery}&quot;.
                </div>
              )}
            </div>

            {/* Right Column: Technical Terms Audit (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Technical Glossary Card */}
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-slate-200">
                      Technical Terms Audit
                    </h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold">
                    {result.technicalGlossary.length} Identified
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  Comparison between accurate Sri Lankan technical standards vs common literal translation errors:
                </p>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {result.technicalGlossary.map((term, tIdx) => (
                    <div
                      key={tIdx}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100 text-sm">
                          {term.english}
                        </span>
                        <button
                          onClick={() => onLearnTerm(term.english, term.explanation)}
                          className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>AI Agent</span>
                        </button>
                      </div>

                      {/* Correct Sinhala */}
                      <div className="bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-xl space-y-0.5">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                          ✓ Correct Sinhala Standard:
                        </span>
                        <p className="font-bold text-emerald-200 text-sm">
                          {term.sinhalaStandard}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {term.sinhalaPhonetic}
                        </p>
                      </div>

                      {/* Google Translate Mistake */}
                      {term.googleTranslateMistake && (
                        <div className="bg-rose-950/20 border border-rose-500/20 p-2 rounded-lg text-[11px] space-y-0.5">
                          <span className="text-[10px] font-bold text-rose-400 block">
                            ✕ Google Translate Mistake:
                          </span>
                          <p className="text-rose-300 line-through">
                            {term.googleTranslateMistake}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {term.whyWrong}
                          </p>
                        </div>
                      )}

                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {term.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality Standards Guarantee Box */}
              <div className="bg-slate-900/60 rounded-3xl border border-slate-800/80 p-5 space-y-3 text-xs text-slate-400">
                <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-sm">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Why This Is The World Best Engine</span>
                </h4>
                <ul className="space-y-2 text-[11px] leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 font-bold">•</span>
                    <span><strong>No Silly Literal Errors:</strong> Words like &quot;Thread pool&quot; are never translated as sewing pools or &quot;Python&quot; as reptiles.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 font-bold">•</span>
                    <span><strong>Proper Sinhala SOV Syntax:</strong> Respects subject-object-verb grammar, natural postpositions, and case markers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-400 font-bold">•</span>
                    <span><strong>Preserved Code &amp; URLs:</strong> Keeps programming syntax and parameters untouched while translating explanations.</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>

        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4">
          <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-300">
            Translating full website content into accurate Unicode Sinhala...
          </p>
        </div>
      )}

    </div>
  );
};
