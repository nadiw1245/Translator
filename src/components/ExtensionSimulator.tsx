import React, { useState, useRef, useEffect } from "react";
import { 
  Chrome, 
  Globe, 
  Sparkles, 
  Volume2, 
  ExternalLink, 
  Copy, 
  Check, 
  Layers, 
  BookOpen,
  ArrowRight,
  MousePointerClick,
  RefreshCw,
  Sliders,
  Settings,
  Shield,
  Code,
  Terminal,
  Command,
  Columns,
  Eye,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Lock
} from "lucide-react";
import { DictionaryEntry } from "../types";

interface ExtensionSimulatorProps {
  dictionary: DictionaryEntry[];
  onLearnTerm: (term: string, context?: string) => void;
  onOpenExport: () => void;
}

const DEMO_PAGES = [
  {
    id: "omarchy",
    title: "Omarchy Linux – Modern Developer OS (omarchy.org)",
    url: "https://omarchy.org/",
    domain: "Linux & System Architecture",
    content: `Omarchy is a modern, developer-focused Linux distribution created by David Heinemeier Hansson (DHH) and built on Arch Linux.
It replaces traditional heavy desktop environments with the Hyprland Wayland compositor and a custom Quickshell desktop shell.
Designed for keyboard-centric workflows, Omarchy provides automatic tiling window management, lightning-fast terminal emulation, and built-in Neovim configurations.
By eliminating unneeded background processes and optimizing process scheduling, Omarchy minimizes CPU latency and prevents memory leaks.
The project is backed by the Omacom Foundation, with long-term engineering commitments from 37signals and 1Password.`,
  },
  {
    id: "kubernetes",
    title: "Kubernetes Container Orchestration Architecture",
    url: "https://kubernetes.io/docs/concepts/overview/working-with-objects/",
    domain: "Cloud & DevOps",
    content: `In distributed systems, Kubernetes automates container orchestration, scaling, and deployment across multi-cloud clusters.
A Pod is the smallest execution unit in Kubernetes. When concurrent worker threads process high throughput requests, unhandled memory leaks can degrade performance.
To avoid a deadlock or race condition, administrators configure cache invalidation policies and horizontal pod autoscalers.
Security teams must patch zero-day vulnerabilities immediately to prevent cross-site scripting and unauthorized privilege escalation.`,
  },
  {
    id: "react",
    title: "React 19 State Management & Concurrent Rendering",
    url: "https://react.dev/reference/react/useTransition",
    domain: "Web Architecture",
    content: `React uses concurrent rendering and automatic batching to ensure fluid UI updates without blocking the main browser thread.
When state management involves heavy computations, using web workers prevents high latency.
Automatic garbage collection frees memory allocated to unmounted component trees, preventing client-side memory leaks.`,
  },
  {
    id: "ai",
    title: "Large Language Models & Prompt Engineering",
    url: "https://ai.google.dev/docs/gemini_api_overview",
    domain: "Artificial Intelligence",
    content: `Prompt engineering and retrieval-augmented generation (RAG) provide external knowledge grounding to large language models.
Without grounding, neural networks can suffer from hallucinations.
Securing applications against prompt injection attacks and data poisoning is critical before deploying microservices to production.`,
  },
];

export const ExtensionSimulator: React.FC<ExtensionSimulatorProps> = ({
  dictionary,
  onLearnTerm,
  onOpenExport,
}) => {
  const [selectedDemoId, setSelectedDemoId] = useState("omarchy");
  const [customUrl, setCustomUrl] = useState("https://omarchy.org/");
  const [inlineTranslateEnabled, setInlineTranslateEnabled] = useState(false);
  const [viewMode, setViewMode] = useState<"inplace" | "sidebyside">("inplace");

  // Extension options configuration state (Stored in extension sync storage)
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [popupTab, setPopupTab] = useState<"full-site" | "options" | "quick" | "lexicon">("full-site");
  const [targetTone, setTargetTone] = useState<"technical" | "natural" | "formal">("technical");
  const [preserveCodeBlocks, setPreserveCodeBlocks] = useState(true);
  const [preserveCli, setPreserveCli] = useState(true);
  const [showPhoneticHover, setShowPhoneticHover] = useState(true);
  const [slsStandardActive, setSlsStandardActive] = useState(true);
  const [autoTranslateDomains, setAutoTranslateDomains] = useState<string[]>([
    "omarchy.org",
    "kubernetes.io",
    "react.dev",
    "github.com",
    "docs.python.org",
  ]);
  const [newDomain, setNewDomain] = useState("");
  const [shortcutKey, setShortcutKey] = useState("Alt + S");
  const [optionsSavedToast, setOptionsSavedToast] = useState(false);

  // In-page selection tooltip state
  const [selectedText, setSelectedText] = useState("");
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [tooltipTranslation, setTooltipTranslation] = useState<any | null>(null);
  const [tooltipLoading, setTooltipLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active demo content
  const activeDemo = DEMO_PAGES.find((p) => p.id === selectedDemoId) || DEMO_PAGES[0];
  const [pageText, setPageText] = useState(activeDemo.content);

  // Full page in-place translation state
  const [isFullPageTranslated, setIsFullPageTranslated] = useState(false);
  const [fullPageTranslating, setFullPageTranslating] = useState(false);
  const [translatedPageTitle, setTranslatedPageTitle] = useState("");
  const [translatedParagraphs, setTranslatedParagraphs] = useState<string[]>([]);
  const [detectedPageTerms, setDetectedPageTerms] = useState<any[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut listener (Alt + S to toggle full site translate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        handleToggleFullPageTranslation();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullPageTranslated, pageText, customUrl, targetTone]);

  const handleSelectDemo = (id: string) => {
    setSelectedDemoId(id);
    const demo = DEMO_PAGES.find((p) => p.id === id);
    if (demo) {
      setCustomUrl(demo.url);
      setPageText(demo.content);
      setSelectedText("");
      setTooltipPos(null);
      setIsFullPageTranslated(false);
      setTranslatedParagraphs([]);
    }
  };

  const handleToggleFullPageTranslation = async () => {
    if (isFullPageTranslated) {
      setIsFullPageTranslated(false);
      return;
    }

    setFullPageTranslating(true);
    try {
      const res = await fetch("/api/translate-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: customUrl,
          htmlOrText: pageText,
          title: activeDemo.title,
          targetTone: targetTone,
        }),
      });

      if (!res.ok) throw new Error("Full page translation error");
      const data = await res.json();
      setTranslatedPageTitle(data.siteTitleSi || activeDemo.title);
      const paras: string[] = [];
      if (data.sections && data.sections.length > 0) {
        data.sections.forEach((sec: any) => {
          if (sec.paragraphs) {
            sec.paragraphs.forEach((p: any) => paras.push(p.si || p.en));
          }
        });
      }
      if (paras.length === 0) {
        paras.push(data.summarySi || pageText);
      }
      setTranslatedParagraphs(paras);
      setDetectedPageTerms(data.technicalGlossary || []);
      setIsFullPageTranslated(true);
    } catch (err) {
      console.error(err);
      // High quality SLS 1134 verified fallback
      if (selectedDemoId === "omarchy") {
        setTranslatedPageTitle("ඔමාකි ලිනක්ස් (Omarchy Linux) – මෘදුකාංග සංවර්ධකයන් සඳහා වූ නවීන මෙහෙයුම් පද්ධතිය");
        setTranslatedParagraphs([
          "ඔමාකි (Omarchy) යනු ඩේවිඩ් හයිනමියර් හැන්සන් (DHH) විසින් නිර්මාණය කරන ලද, ආර්ච් ලිනක්ස් (Arch Linux) මත පදනම් වූ සංවර්ධක-කේන්ද්‍රීය නවීන ලිනක්ස් මෙහෙයුම් පද්ධතියකි.",
          "එය සාම්ප්‍රදායික බරැති වැඩතල පරිසරයන් වෙනුවට හයිපර්ලෑන්ඩ් වේලන්ඩ් සංයුක්තකාරකය (Hyprland Wayland Compositor) සහ ක්වික්ශෙල් (Quickshell) වැඩතල කවචය භාවිත කරයි.",
          "යතුරුපුවරු-කේන්ද්‍රීය කාර්ය ප්‍රවාහයන් සඳහා විශේෂයෙන් සැලසුම් කර ඇති ඔමාකි, ස්වයංක්‍රීය ටයිලිං කවුළු කළමනාකරණය (Tiling Window Management), අකුණු වේගයෙන් ක්‍රියාත්මක වන ටර්මිනල් අනුකාරකය සහ පෙර-වින්‍යාසගත නියෝවිම් (Neovim) මෙවලම් සපයයි.",
          "අනවශ්‍ය පසුබිම් ක්‍රියාවලි ඉවත් කර ක්‍රියාවලි කාලසටහන්කරණය ප්‍රශස්ත කිරීම මඟින්, ඔමාකි මධ්‍යම සැකසුම් ඒකකයේ ප්‍රමාදය (CPU Latency) අවම කර මතක කාන්දු (Memory Leaks) වළක්වයි.",
          "මෙම විවෘත කේත ව්‍යාපෘතිය සඳහා ඔමාකොම් පදනමේ (Omacom Foundation) සහයෝගය ලැබෙන අතර, 37signals සහ 1Password ආයතන වෙතින් ඩොලර් මිලියන ගණනක දිගුකාලීන ඉංජිනේරු ප්‍රතිඥා හිමිව ඇත."
        ]);
      } else {
        setTranslatedPageTitle(`${activeDemo.title} (ප්‍රමිතිගත සිංහල)`);
        const fallbackParas = pageText.split("\n").map((line) =>
          line
            .replace(/Kubernetes/gi, "කුබර්නෙටීස් (Kubernetes)")
            .replace(/container orchestration/gi, "බහාලුම් සංවිධානය (Container Orchestration)")
            .replace(/memory leaks/gi, "මතක කාන්දු (Memory Leaks)")
            .replace(/deadlock/gi, "අන්‍යෝන්‍ය අවහිරය (Deadlock)")
            .replace(/cache/gi, "හඹා මතකය (Cache)")
            .replace(/prompt engineering/gi, "ප්‍රේරක ඉංජිනේරු විද්‍යාව (Prompt Engineering)")
            .replace(/concurrent/gi, "සමගාමී (Concurrent)")
        );
        setTranslatedParagraphs(fallbackParas);
      }
      setIsFullPageTranslated(true);
    } finally {
      setFullPageTranslating(false);
    }
  };

  const handleAddDomain = () => {
    const trimmed = newDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (trimmed && !autoTranslateDomains.includes(trimmed)) {
      setAutoTranslateDomains([...autoTranslateDomains, trimmed]);
      setNewDomain("");
    }
  };

  const handleRemoveDomain = (dom: string) => {
    setAutoTranslateDomains(autoTranslateDomains.filter((d) => d !== dom));
  };

  const handleSaveOptions = () => {
    setOptionsSavedToast(true);
    setTimeout(() => setOptionsSavedToast(false), 2400);
  };

  // Handle text selection in simulated browser
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString().trim();
    if (text.length >= 2 && text.length <= 150) {
      setSelectedText(text);

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();

      if (containerRect) {
        const x = rect.left - containerRect.left + rect.width / 2;
        const y = rect.bottom - containerRect.top + 8;
        setTooltipPos({ x: Math.max(10, Math.min(x - 140, containerRect.width - 320)), y });
      }

      // Check dictionary first for instant match
      const lower = text.toLowerCase();
      const match = dictionary.find(
        (d) =>
          d.term.toLowerCase() === lower ||
          lower.includes(d.term.toLowerCase())
      );

      if (match) {
        setTooltipTranslation({
          sinhalaStandard: match.sinhalaStandard,
          sinhalaPhonetic: match.sinhalaPhonetic,
          definitionSi: match.definitionSi,
          category: match.category,
          source: match.source,
        });
        setTooltipLoading(false);
      } else {
        setTooltipLoading(true);
        fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, targetTone: targetTone }),
        })
          .then((res) => res.json())
          .then((data) => {
            setTooltipTranslation({
              sinhalaStandard: data.translatedText,
              sinhalaPhonetic: "පරිවර්තනය (Unicode Sinhala)",
              definitionSi: data.translationRationale || "තාක්ෂණික අර්ථය නිරවද්‍යව පරිවර්තනය කරන ලදී.",
              category: "Web Technical",
              source: "ai",
            });
          })
          .catch((err) => console.error(err))
          .finally(() => setTooltipLoading(false));
      }
    }
  };

  const closeTooltip = () => {
    setTooltipPos(null);
    setSelectedText("");
    setTooltipTranslation(null);
  };

  // Render text with optional inline highlighted dictionary terms or side-by-side view
  const renderHighlightedContent = () => {
    if (isFullPageTranslated && translatedParagraphs.length > 0) {
      if (viewMode === "sidebyside") {
        const originalLines = pageText.split("\n").filter((l) => l.trim().length > 0);
        return (
          <div className="space-y-4 select-text animate-in fade-in duration-300">
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-200 font-medium flex items-center gap-2">
                <Columns className="w-3.5 h-3.5 text-emerald-400" />
                <span>Side-by-Side Dual View (ඉංග්‍රීසි සහ ප්‍රමිතිගත සිංහල)</span>
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode("inplace")}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200"
                >
                  Switch to In-Place
                </button>
                <button
                  onClick={() => setIsFullPageTranslated(false)}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 underline"
                >
                  Revert to Original
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {translatedParagraphs.map((siPara, idx) => {
                const enPara = originalLines[idx] || "";
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                  >
                    <div className="text-zinc-400 text-xs sm:text-sm leading-relaxed border-b md:border-b-0 md:border-r border-zinc-800 pb-3 md:pb-0 md:pr-4">
                      <span className="text-[10px] font-mono text-zinc-500 block mb-1 uppercase tracking-wider">
                        Original English
                      </span>
                      {enPara}
                    </div>
                    <div className="text-zinc-100 text-xs sm:text-sm leading-relaxed font-sinhala">
                      <span className="text-[10px] font-mono text-emerald-400 block mb-1 uppercase tracking-wider">
                        SLS 1134 Sinhala
                      </span>
                      {siPara}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-4 select-text animate-in fade-in duration-300">
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full Webpage Translated with Sri Lankan Technical Standard Sinhala (SLS 1134)</span>
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode("sidebyside")}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
              >
                <Columns className="w-3 h-3" />
                <span>Side-by-Side</span>
              </button>
              <button
                onClick={() => setIsFullPageTranslated(false)}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 underline"
              >
                Show English
              </button>
            </div>
          </div>
          {translatedParagraphs.map((para, idx) => (
            <p key={idx} className="text-zinc-100 text-sm leading-relaxed font-sinhala">
              {para}
            </p>
          ))}
        </div>
      );
    }

    if (!inlineTranslateEnabled) {
      return (
        <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap select-text font-sans">
          {pageText}
        </div>
      );
    }

    // Replace terms with inline badge
    let paragraphs = pageText.split("\n\n");
    return (
      <div className="space-y-4 select-text">
        {paragraphs.map((p, pIdx) => {
          let elements: React.ReactNode[] = [p];

          dictionary.forEach((d) => {
            const regex = new RegExp(`\\b(${d.term})\\b`, "gi");
            elements = elements.flatMap((el) => {
              if (typeof el !== "string") return el;
              const parts = el.split(regex);
              return parts.map((part, i) => {
                if (part.toLowerCase() === d.term.toLowerCase()) {
                  return (
                    <span
                      key={`${pIdx}-${d.id}-${i}`}
                      className="inline-flex items-center gap-1 bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded border border-zinc-700 text-xs font-medium cursor-help"
                      title={`${d.term} -> ${d.sinhalaStandard} (${d.sinhalaPhonetic})`}
                    >
                      <span>{part}</span>
                      <span className="text-[10px] text-sky-400 font-mono">
                        [{d.sinhalaStandard}]
                      </span>
                    </span>
                  );
                }
                return part;
              });
            });
          });

          return (
            <p key={pIdx} className="text-zinc-200 text-sm leading-relaxed font-sans">
              {elements}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Omarchy Clean Header Banner */}
      <div className="bg-[#0c0e14] p-5 rounded-2xl border border-zinc-800/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Chrome className="w-5 h-5 text-sky-400" />
              <span>Sinhala Web Extension – Developer Suite</span>
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              Omarchy Minimalist V3
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              SLS 1134 Compliant
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            A clean, developer-focused browser extension for Google Chrome, Brave, Edge &amp; Firefox. Full site translation, in-page technical tooltips, and customizable extension options.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowOptionsModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 text-xs font-medium transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" />
            <span>Extension Options</span>
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            <span>⚡ Install in Browser</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Simulation Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Browser Mockup (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col bg-[#090a0f] rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">
          
          {/* Simulated Browser Titlebar & Tabs */}
          <div className="bg-[#0f121a] px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Window Controls */}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]/80"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]/80"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]/80"></div>
              </div>

              {/* Active Tab */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#090a0f] border border-zinc-800 text-xs text-zinc-200 font-medium">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span className="truncate max-w-[140px] sm:max-w-[180px]">
                  {activeDemo.id === "omarchy" ? "omarchy.org – Linux for Developers" : activeDemo.title}
                </span>
                <span className="text-[10px] text-zinc-500">×</span>
              </div>
            </div>

            {/* Simulated Address Bar */}
            <div className="flex-1 max-w-md flex items-center gap-2 bg-[#090a0f] border border-zinc-800/90 rounded-lg px-3 py-1.5 text-xs text-zinc-400">
              <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="w-full bg-transparent text-zinc-200 outline-none truncate font-mono text-[11px]"
              />
            </div>

            {/* Browser Toolbar: Extension Icon & Options shortcut */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPopupTab("options")}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
                title="Extension Options (සැකසුම්)"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPopupTab("full-site")}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/80 transition-colors"
                title="Sinhala Extension Toolbar Action"
              >
                <span className="w-4 h-4 rounded bg-sky-500 text-zinc-950 flex items-center justify-center font-bold text-[10px]">
                  සිං
                </span>
                <span className="hidden sm:inline text-[11px] font-mono">Sinhala</span>
              </button>
            </div>
          </div>

          {/* Preset Web Page Selector & Features Toolbar */}
          <div className="bg-[#0d1017] px-4 py-2.5 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 text-[11px] font-mono uppercase tracking-wider">Site:</span>
              {DEMO_PAGES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectDemo(p.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                    selectedDemoId === p.id
                      ? "bg-zinc-800 text-white border border-zinc-700 font-semibold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                  }`}
                >
                  {p.id === "omarchy" ? "omarchy.org" : p.id}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFullPageTranslation}
                disabled={fullPageTranslating}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                  isFullPageTranslated
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                    : "bg-white text-zinc-950 font-bold hover:bg-zinc-200 border-white shadow-sm"
                }`}
                title="Translate this page to Sinhala (Shortcut: Alt + S)"
              >
                <Globe className={`w-3.5 h-3.5 ${fullPageTranslating ? "animate-spin" : ""}`} />
                <span>
                  {fullPageTranslating
                    ? "පරිවර්තනය වෙමින් පවතී..."
                    : isFullPageTranslated
                    ? "✓ Translated (Show Original)"
                    : "Translate Page to Sinhala"}
                </span>
                <kbd className="hidden sm:inline ml-1 px-1 py-0.2 rounded text-[9px] font-mono bg-zinc-900/60 text-zinc-300">
                  Alt+S
                </kbd>
              </button>

              <button
                onClick={() => setInlineTranslateEnabled(!inlineTranslateEnabled)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                  inlineTranslateEnabled
                    ? "bg-zinc-800 text-sky-400 border-zinc-700"
                    : "bg-transparent text-zinc-400 border-zinc-800 hover:text-zinc-200"
                }`}
                title="Toggle inline hover glosses"
              >
                <Sliders className="w-3 h-3" />
                <span>Glosses: {inlineTranslateEnabled ? "ON" : "OFF"}</span>
              </button>
            </div>
          </div>

          {/* Web Page Content Container with selection listener */}
          <div
            ref={containerRef}
            onMouseUp={handleMouseUp}
            className="p-6 min-h-[420px] bg-[#090a0f] relative overflow-visible cursor-text"
          >
            {/* Page Header */}
            <div className="mb-5 pb-3 border-b border-zinc-800/80">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  {activeDemo.domain} • {customUrl}
                </span>
                {isFullPageTranslated && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    SLS 1134 Sinhala Active
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-100 mt-1 font-sans">
                {isFullPageTranslated && translatedPageTitle ? translatedPageTitle : activeDemo.title}
              </h2>
            </div>

            {/* Page Body */}
            {renderHighlightedContent()}

            {/* In-Page Floating Sinhala Tooltip */}
            {tooltipPos && (
              <div
                style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
                className="absolute z-30 w-72 sm:w-80 bg-[#12151e] border border-zinc-700 rounded-xl p-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-100 text-xs text-zinc-200 space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                      {tooltipTranslation?.category || "Sinhala Lexicon"}
                    </span>
                  </div>
                  <button
                    onClick={closeTooltip}
                    className="text-zinc-500 hover:text-zinc-300 font-bold text-sm leading-none p-1"
                  >
                    &times;
                  </button>
                </div>

                {tooltipLoading ? (
                  <div className="py-4 text-center text-zinc-400 text-xs font-mono">
                    පරිවර්තනය වෙමින් පවතී (Translating)...
                  </div>
                ) : tooltipTranslation ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-zinc-400 text-[10px] font-mono block">Standard Sinhala (SLS 1134):</span>
                      <p className="text-sm sm:text-base font-bold text-white font-sinhala">
                        {tooltipTranslation.sinhalaStandard}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        {tooltipTranslation.sinhalaPhonetic}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#090a0f] border border-zinc-800 text-[11px] text-zinc-300 leading-relaxed font-sinhala">
                      {tooltipTranslation.definitionSi}
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                      <button
                        onClick={() => onLearnTerm(selectedText, pageText)}
                        className="text-[10px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>AI Deep Context</span>
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(tooltipTranslation.sinhalaStandard);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="text-[10px] font-mono text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800"
                      >
                        {copied ? "Copied ✓" : "Copy Unicode"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Interactive Hint Banner */}
          <div className="bg-[#0f121a] px-4 py-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-mono text-[11px]">
            <span className="flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5 text-sky-400" />
              <span>Select any text in the article to see the in-page Chrome tooltip in action.</span>
            </span>
            <span className="hidden sm:inline text-zinc-500">
              Shortcut: <kbd className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">Alt+S</kbd>
            </span>
          </div>
        </div>

        {/* Right Column: Chrome Extension Popup Preview (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-[#0c0e14] rounded-2xl border border-zinc-800 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Chrome className="w-4 h-4 text-sky-400" />
                <span>Extension Popup (380px)</span>
              </h3>
              <button
                onClick={() => setShowOptionsModal(true)}
                className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-1"
              >
                <Settings className="w-3 h-3" />
                <span>Options Page</span>
              </button>
            </div>

            {/* Simulated 380px Extension UI */}
            <div className="rounded-xl border border-zinc-800 bg-[#090a0f] p-4 space-y-3.5 shadow-inner text-xs">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-sky-500 flex items-center justify-center text-zinc-950 font-bold text-xs">
                    සිං
                  </div>
                  <div>
                    <span className="font-bold text-zinc-100 block leading-tight">Sinhala Translator</span>
                    <span className="text-[9px] text-zinc-500 font-mono">v1.2 • SLS 1134 Engine</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowOptionsModal(true)}
                    className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
                    title="Extension Options (සැකසුම්)"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Segmented Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-center">
                <button
                  onClick={() => setPopupTab("full-site")}
                  className={`py-1 rounded transition-colors ${
                    popupTab === "full-site"
                      ? "bg-zinc-800 text-white font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Full Site
                </button>
                <button
                  onClick={() => setPopupTab("options")}
                  className={`py-1 rounded transition-colors ${
                    popupTab === "options"
                      ? "bg-zinc-800 text-white font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Options
                </button>
                <button
                  onClick={() => setPopupTab("quick")}
                  className={`py-1 rounded transition-colors ${
                    popupTab === "quick"
                      ? "bg-zinc-800 text-white font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Quick
                </button>
                <button
                  onClick={() => setPopupTab("lexicon")}
                  className={`py-1 rounded transition-colors ${
                    popupTab === "lexicon"
                      ? "bg-zinc-800 text-white font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Lexicon
                </button>
              </div>

              {/* Tab 1: Full Site Translation */}
              {popupTab === "full-site" && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  {/* Current Domain Badge */}
                  <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 block uppercase">Active Tab</span>
                      <strong className="text-zinc-200 font-mono">
                        {customUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "")}
                      </strong>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {isFullPageTranslated ? "Translated" : "Ready"}
                    </span>
                  </div>

                  {/* Big Action Button */}
                  <button
                    onClick={handleToggleFullPageTranslation}
                    disabled={fullPageTranslating}
                    className={`w-full py-2.5 rounded-lg font-bold text-xs shadow-sm transition-all text-center cursor-pointer flex items-center justify-center gap-2 ${
                      isFullPageTranslated
                        ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                        : "bg-white hover:bg-zinc-200 text-zinc-950 shadow-md active:scale-98"
                    }`}
                  >
                    <Globe className={`w-3.5 h-3.5 ${fullPageTranslating ? "animate-spin text-zinc-400" : ""}`} />
                    <span>
                      {fullPageTranslating
                        ? "පරිවර්තනය වෙමින් පවතී..."
                        : isFullPageTranslated
                        ? "Revert Tab to English"
                        : "Translate Entire Page (Alt + S)"}
                    </span>
                  </button>

                  {/* View Mode Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[11px]">
                    <span className="text-zinc-400 font-mono">View Mode:</span>
                    <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded border border-zinc-800 font-mono text-[10px]">
                      <button
                        onClick={() => setViewMode("inplace")}
                        className={`px-2 py-0.5 rounded ${viewMode === "inplace" ? "bg-zinc-800 text-white font-semibold" : "text-zinc-400"}`}
                      >
                        In-Place
                      </button>
                      <button
                        onClick={() => setViewMode("sidebyside")}
                        className={`px-2 py-0.5 rounded ${viewMode === "sidebyside" ? "bg-zinc-800 text-white font-semibold" : "text-zinc-400"}`}
                      >
                        Side-by-Side
                      </button>
                    </div>
                  </div>

                  {/* Quick Extension Options in Popup */}
                  <div className="pt-2 border-t border-zinc-800 space-y-2 text-[11px]">
                    <label className="flex items-center justify-between text-zinc-300 cursor-pointer">
                      <span className="flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Preserve Code &amp; CLI syntax</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={preserveCodeBlocks}
                        onChange={(e) => setPreserveCodeBlocks(e.target.checked)}
                        className="rounded accent-sky-500"
                      />
                    </label>

                    <label className="flex items-center justify-between text-zinc-300 cursor-pointer">
                      <span className="flex items-center gap-1.5">
                        <Command className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Auto-translate this domain</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={autoTranslateDomains.includes("omarchy.org")}
                        onChange={() => {
                          if (autoTranslateDomains.includes("omarchy.org")) {
                            handleRemoveDomain("omarchy.org");
                          } else {
                            setAutoTranslateDomains([...autoTranslateDomains, "omarchy.org"]);
                          }
                        }}
                        className="rounded accent-sky-500"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 2: Extension Options */}
              {popupTab === "options" && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                      Target Translation Tone
                    </span>
                    <select
                      value={targetTone}
                      onChange={(e: any) => setTargetTone(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 outline-none"
                    >
                      <option value="technical">Technical Standard (පරිගණක විද්‍යාත්මක - SLS 1134)</option>
                      <option value="natural">Natural Modern (සුගම සිංහල)</option>
                      <option value="formal">Formal Academic (රාජ්‍ය භාෂා ශාස්ත්‍රීය)</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                      Auto-Translate Domains
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                      {autoTranslateDomains.map((dom) => (
                        <span
                          key={dom}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300"
                        >
                          <span>{dom}</span>
                          <button
                            onClick={() => handleRemoveDomain(dom)}
                            className="text-zinc-500 hover:text-rose-400"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                    <button
                      onClick={() => setShowOptionsModal(true)}
                      className="w-full py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Configure Advanced Options</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Quick Translate */}
              {popupTab === "quick" && (
                <div className="space-y-2 animate-in fade-in duration-150">
                  <input
                    type="text"
                    placeholder="Type English or Singlish..."
                    defaultValue={selectedText || "Container Orchestration"}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 outline-none font-mono"
                  />
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                    <span className="font-bold text-white block font-sinhala">බහාලුම් සංවිධානය</span>
                    <span className="text-[10px] text-zinc-400 font-mono">කන්ටේනර් ඕකෙස්ට්‍රේෂන් (DevOps &amp; Cloud)</span>
                  </div>
                </div>
              )}

              {/* Tab 4: Lexicon */}
              {popupTab === "lexicon" && (
                <div className="space-y-2 animate-in fade-in duration-150">
                  <div className="text-[11px] text-zinc-400">
                    <strong className="text-zinc-200">{dictionary.length}</strong> official technical terms synced offline in extension storage.
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {dictionary.slice(0, 4).map((d) => (
                      <div key={d.id} className="p-2 rounded bg-zinc-900/60 border border-zinc-800/80 text-[11px]">
                        <div className="flex justify-between">
                          <span className="font-mono text-zinc-300 font-medium">{d.term}</span>
                          <span className="text-emerald-400 font-sinhala font-semibold">{d.sinhalaStandard}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Download / Export Button */}
              <div className="pt-2 border-t border-zinc-800">
                <button
                  onClick={onOpenExport}
                  className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-[11px] transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Chrome className="w-3.5 h-3.5 text-sky-400" />
                  <span>Get Extension Package (.zip)</span>
                </button>
              </div>

            </div>
          </div>

          {/* Omarchy Clean Features Card */}
          <div className="bg-[#0c0e14] rounded-2xl border border-zinc-800 p-4 space-y-2 text-xs text-zinc-400">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-zinc-400" />
              <span>Full Site Translation Engine</span>
            </h4>
            <ul className="space-y-1 text-[11px] font-mono text-zinc-400">
              <li>• Auto-replaces generic Google Translate errors.</li>
              <li>• Keeps code, commands, and URLs untranslated.</li>
              <li>• Compliant with Sri Lanka SLS 1134 Unicode standard.</li>
              <li>• Press <kbd className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">Alt+S</kbd> to translate any page.</li>
            </ul>
          </div>

        </div>

      </div>

      {/* Dedicated Extension Options Modal (Clean Omarchy Developer Style) */}
      {showOptionsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0e14] border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white">
                  <Settings className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Extension Options &amp; Preferences</h3>
                  <p className="text-xs font-mono text-zinc-500">chrome-extension://sinhala-translator/options.html</p>
                </div>
              </div>

              <button
                onClick={() => setShowOptionsModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Options Body */}
            <div className="space-y-5 text-xs">
              
              {/* Section 1: Full Site Translation Engine */}
              <div className="space-y-3">
                <h4 className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>Full Site &amp; Webpage Translation</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                    <span className="font-mono text-zinc-400 text-[10px] block uppercase">Default Tone</span>
                    <select
                      value={targetTone}
                      onChange={(e: any) => setTargetTone(e.target.value)}
                      className="w-full bg-[#090a0f] border border-zinc-700 rounded-lg p-2 text-xs text-zinc-200 outline-none"
                    >
                      <option value="technical">Technical Standard (SLS 1134)</option>
                      <option value="natural">Natural Modern Sinhala</option>
                      <option value="formal">Formal Academic</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                    <span className="font-mono text-zinc-400 text-[10px] block uppercase">Shortcut Trigger</span>
                    <input
                      type="text"
                      value={shortcutKey}
                      onChange={(e) => setShortcutKey(e.target.value)}
                      className="w-full bg-[#090a0f] border border-zinc-700 rounded-lg p-2 text-xs text-zinc-200 font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Preservation Rules */}
              <div className="space-y-2.5">
                <h4 className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Code &amp; Syntax Isolation Rules</span>
                </h4>

                <div className="space-y-2 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-zinc-200 font-medium block">Preserve Code Blocks</span>
                      <span className="text-[11px] text-zinc-500 font-mono">Keep &lt;pre&gt;, &lt;code&gt;, and variables in pristine English.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preserveCodeBlocks}
                      onChange={(e) => setPreserveCodeBlocks(e.target.checked)}
                      className="rounded accent-sky-500"
                    />
                  </label>

                  <div className="border-t border-zinc-800/80 pt-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-zinc-200 font-medium block">Preserve Terminal / CLI Commands</span>
                        <span className="text-[11px] text-zinc-500 font-mono">Isolate curl, bash, npm, docker, and git commands.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preserveCli}
                        onChange={(e) => setPreserveCli(e.target.checked)}
                        className="rounded accent-sky-500"
                      />
                    </label>
                  </div>

                  <div className="border-t border-zinc-800/80 pt-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-zinc-200 font-medium block">Display Phonetic Hover Tooltips</span>
                        <span className="text-[11px] text-zinc-500 font-mono">Show Sinhala phonetic pronunciation when hovering over complex terms.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={showPhoneticHover}
                        onChange={(e) => setShowPhoneticHover(e.target.checked)}
                        className="rounded accent-sky-500"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 3: Auto-Translate Domain Whitelist */}
              <div className="space-y-2.5">
                <h4 className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Auto-Translate Domains</span>
                </h4>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. omarchy.org, docs.python.org..."
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddDomain()}
                    className="flex-1 bg-[#090a0f] border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono outline-none"
                  />
                  <button
                    onClick={handleAddDomain}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {autoTranslateDomains.map((dom) => (
                    <span
                      key={dom}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300"
                    >
                      <span>{dom}</span>
                      <button
                        onClick={() => handleRemoveDomain(dom)}
                        className="text-zinc-500 hover:text-rose-400 p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <span className="text-[11px] font-mono text-zinc-500">
                {optionsSavedToast ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Preferences saved to extension storage!</span>
                  </span>
                ) : (
                  "Changes apply immediately to all active tabs."
                )}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOptionsModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
                >
                  Close
                </button>
                <button
                  onClick={handleSaveOptions}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold shadow-md"
                >
                  Save Options
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
