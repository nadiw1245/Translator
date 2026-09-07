import React, { useState } from "react";
import { 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Volume2, 
  Sparkles, 
  AlertTriangle, 
  BookOpen, 
  Lightbulb, 
  Loader2, 
  Zap,
  Info,
  Layers,
  Keyboard as KeyboardIcon
} from "lucide-react";
import { TranslationResult, TechnicalTerm } from "../types";
import { transliterateSinglishToSinhala } from "../utils/sinhalaUnicode";
import { MistakesShowcase } from "./MistakesShowcase";
import { VirtualKeyboard } from "./VirtualKeyboard";

interface TranslatorViewProps {
  onLearnTerm: (term: string, context?: string) => void;
  onOpenDictionary: () => void;
  initialText?: string;
}

const SAMPLE_TECH_TEXTS = [
  {
    title: "Cloud & Containers",
    text: "Kubernetes manages container orchestration and prevents memory leaks during high traffic spikes.",
  },
  {
    title: "AI & LLM",
    text: "Prompt engineering requires few-shot examples to eliminate hallucinations in large language models.",
  },
  {
    title: "Cybersecurity",
    text: "The security patch fixed a critical zero-day vulnerability preventing cross-site scripting attacks.",
  },
  {
    title: "Operating Systems",
    text: "A race condition caused a deadlock when concurrent threads accessed the uninitialized cache.",
  },
];

export const TranslatorView: React.FC<TranslatorViewProps> = ({
  onLearnTerm,
  onOpenDictionary,
  initialText,
}) => {
  const [sourceText, setSourceText] = useState(initialText || "");

  // Update sourceText if initialText changes
  React.useEffect(() => {
    if (initialText) {
      setSourceText(initialText);
    }
  }, [initialText]);
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetTone, setTargetTone] = useState<"technical" | "natural" | "formal">("technical");
  const [contextDomain, setContextDomain] = useState("Computer Science & Web");
  const [singlishMode, setSinglishMode] = useState(false);
  const [singlishInput, setSinglishInput] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<TechnicalTerm | null>(null);

  const handleTranslate = async (textToTranslate?: string) => {
    const text = textToTranslate || sourceText;
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          sourceLang,
          targetTone,
          contextDomain,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: TranslationResult = await response.json();
      setResult(data);
      if (data.technicalTerms && data.technicalTerms.length > 0) {
        setSelectedTerm(data.technicalTerms[0]);
      } else {
        setSelectedTerm(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to complete translation. Check API connectivity.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.translatedText) {
      navigator.clipboard.writeText(result.translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSpeak = () => {
    if (!result?.translatedText) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(result.translatedText);
      // Try to find Sinhala voice if available, else standard fallback
      const voices = window.speechSynthesis.getVoices();
      const siVoice = voices.find((v) => v.lang.startsWith("si") || v.lang.startsWith("sin"));
      if (siVoice) utterance.voice = siVoice;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceText(e.target.value);
  };

  const handleSinglishInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSinglishInput(val);
    const converted = transliterateSinglishToSinhala(val);
    setSourceText(converted);
  };

  const handleInsertChar = (char: string) => {
    const textarea = document.getElementById("input-translation-source") as HTMLTextAreaElement | null;
    if (textarea) {
      const start = textarea.selectionStart ?? sourceText.length;
      const end = textarea.selectionEnd ?? sourceText.length;
      const updated = sourceText.substring(0, start) + char + sourceText.substring(end);
      setSourceText(updated);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start + char.length, start + char.length);
      });
    } else {
      setSourceText((prev) => prev + char);
    }
  };

  const handleBackspace = () => {
    const textarea = document.getElementById("input-translation-source") as HTMLTextAreaElement | null;
    if (textarea) {
      const start = textarea.selectionStart ?? sourceText.length;
      const end = textarea.selectionEnd ?? sourceText.length;
      if (start === end && start > 0) {
        const updated = sourceText.substring(0, start - 1) + sourceText.substring(end);
        setSourceText(updated);
        requestAnimationFrame(() => {
          textarea.focus();
          textarea.setSelectionRange(start - 1, start - 1);
        });
      } else if (start !== end) {
        const updated = sourceText.substring(0, start) + sourceText.substring(end);
        setSourceText(updated);
        requestAnimationFrame(() => {
          textarea.focus();
          textarea.setSelectionRange(start, start);
        });
      }
    } else {
      setSourceText((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Banner: Why Google Translate Fails on Technical Sites */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/60 border border-slate-800 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-3.5 h-3.5" />
                Problem Solved
              </span>
              <h2 className="text-sm sm:text-base font-semibold text-slate-100">
                Stop Broken Machine Translations on Technical Websites
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
              Generic translators turn technical jargon into literal nonsense (e.g., translating <code className="text-amber-300">Python script</code> to &quot;පිඹුරාගේ පිටපත&quot; or <code className="text-amber-300">Memory Leak</code> to &quot;මතක කාන්දුවක්&quot;). Our engine uses official Sri Lankan technical terminology and developer phonetic standards.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-quick-open-lexicon"
              onClick={onOpenDictionary}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>Browse Tech Lexicon</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Tone, Domain, Singlish toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Source Language */}
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">From:</span>
            <select
              id="select-source-lang"
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="bg-transparent text-slate-200 font-medium outline-none cursor-pointer"
            >
              <option value="auto" className="bg-slate-900">Auto-Detect</option>
              <option value="English" className="bg-slate-900">English (ඉංග්‍රීසි)</option>
              <option value="Japanese" className="bg-slate-900">Japanese (ජපන්)</option>
              <option value="Tamil" className="bg-slate-900">Tamil (දෙමළ)</option>
              <option value="German" className="bg-slate-900">German (ජර්මන්)</option>
              <option value="French" className="bg-slate-900">French (ප්‍රංශ)</option>
              <option value="Chinese" className="bg-slate-900">Chinese (චීන)</option>
            </select>
          </div>

          <div className="text-slate-600">→</div>

          {/* Target Language */}
          <div className="flex items-center gap-1.5 bg-sky-950/40 text-sky-300 px-2.5 py-1.5 rounded-lg border border-sky-800/40 font-semibold">
            <span>To: Unicode Sinhala (සිංහල)</span>
          </div>

          {/* Tone Selector */}
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Tone:</span>
            <select
              id="select-target-tone"
              value={targetTone}
              onChange={(e) => setTargetTone(e.target.value as any)}
              className="bg-transparent text-sky-400 font-medium outline-none cursor-pointer"
            >
              <option value="technical" className="bg-slate-900">Technical &amp; Developer (පාරිභාෂික)</option>
              <option value="natural" className="bg-slate-900">Natural &amp; Conversational (ව්‍යවහාරික)</option>
              <option value="formal" className="bg-slate-900">Official &amp; Academic (රාජ්‍ය භාෂා)</option>
            </select>
          </div>

          {/* Domain */}
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 hidden sm:flex">
            <span className="text-slate-400">Domain:</span>
            <select
              id="select-domain"
              value={contextDomain}
              onChange={(e) => setContextDomain(e.target.value)}
              className="bg-transparent text-slate-200 font-medium outline-none cursor-pointer text-xs"
            >
              <option value="Computer Science & Web" className="bg-slate-900">Computer Science &amp; Web</option>
              <option value="Cloud, DevOps & Linux" className="bg-slate-900">Cloud &amp; DevOps</option>
              <option value="Artificial Intelligence & ML" className="bg-slate-900">AI &amp; Data Science</option>
              <option value="Cybersecurity & Networks" className="bg-slate-900">Cybersecurity</option>
              <option value="General Science & Medicine" className="bg-slate-900">Science &amp; Tech</option>
            </select>
          </div>
        </div>

        {/* Singlish phonetic & Virtual Keyboard controls */}
        <div className="flex items-center gap-2">
          <button
            id="toggle-virtual-keyboard"
            type="button"
            onClick={() => setShowKeyboard(!showKeyboard)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showKeyboard
                ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
            title="Open on-screen Sinhala virtual keyboard"
          >
            <KeyboardIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>Virtual Keyboard: {showKeyboard ? "ON" : "OFF"}</span>
          </button>

          <button
            id="toggle-singlish-mode"
            type="button"
            onClick={() => setSinglishMode(!singlishMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              singlishMode
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
            title="Type phonetically in Singlish (e.g., mama -> මම)"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Singlish Converter: {singlishMode ? "ON" : "OFF"}</span>
          </button>
        </div>
      </div>

      {/* Main Translation Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Source Text Box */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col p-4 shadow-sm focus-within:border-sky-500/50 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Source Text ({sourceLang === "auto" ? "Detected Language" : sourceLang})
            </span>
            <div className="flex items-center gap-2">
              {sourceText && (
                <button
                  onClick={() => { setSourceText(""); setResult(null); setSinglishInput(""); }}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Clear
                </button>
              )}
              <span className="text-[11px] text-slate-500">
                {sourceText.length} chars
              </span>
            </div>
          </div>

          {/* Singlish live input bar when enabled */}
          {singlishMode && (
            <div className="mb-3 p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-300 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Type in Singlish (ඉංග්‍රීසි අකුරින්)</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  Real-time Unicode conversion
                </span>
              </div>
              <input
                type="text"
                value={singlishInput}
                onChange={handleSinglishInputChange}
                placeholder="Type here (e.g., mama gedara yanawa, api data base eka hadanawa)..."
                className="w-full bg-slate-900 px-3 py-2 rounded-lg text-sm text-slate-100 placeholder-slate-500 border border-slate-800 outline-none focus:border-amber-500/50"
              />
            </div>
          )}

          <textarea
            id="input-translation-source"
            value={sourceText}
            onChange={handleSourceChange}
            placeholder={
              singlishMode 
                ? "Unicode Sinhala appears here as you type in the Singlish box above, or click Virtual Keyboard below..."
                : "Enter technical article snippet, error log, code comment, or website sentence..."
            }
            className="w-full flex-1 min-h-[220px] bg-transparent text-slate-100 placeholder-slate-500 text-sm sm:text-base leading-relaxed resize-none outline-none font-normal"
          />

          {/* Quick sample chips */}
          <div className="pt-3 border-t border-slate-800/80 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[11px] font-medium text-slate-400">
                Try complex tech samples that fail on Google Translate:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_TECH_TEXTS.map((sample, idx) => (
                <button
                  key={idx}
                  id={`btn-sample-tech-${idx}`}
                  onClick={() => {
                    setSourceText(sample.text);
                    handleTranslate(sample.text);
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors text-left"
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          {/* Translate CTA Button */}
          <div className="pt-4 flex items-center justify-end">
            <button
              id="btn-execute-translation"
              onClick={() => handleTranslate()}
              disabled={loading || !sourceText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold text-xs sm:text-sm shadow-md shadow-sky-500/20 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Analyzing &amp; Translating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Translate to Unicode Sinhala</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Target Translated Text Box */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col p-4 shadow-sm relative">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                Unicode Sinhala (ප්‍රමිතිගත සිංහල)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
                UTF-8 Block U+0D80
              </span>
            </div>

            {result && (
              <div className="flex items-center gap-2">
                <button
                  id="btn-tts-speak"
                  onClick={handleSpeak}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
                  title="Speak Sinhala"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  id="btn-copy-result"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-[220px] flex flex-col justify-start">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3 py-10">
                <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
                <p className="text-xs font-medium text-slate-300">
                  Parsing technical terms &amp; generating Unicode Sinhala...
                </p>
                <p className="text-[11px] text-slate-500">
                  Cross-referencing official Department of Official Languages lexicon
                </p>
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2">
                <AlertTriangle className="w-8 h-8 text-rose-400" />
                <p className="text-sm font-medium text-rose-300">Translation Notice</p>
                <p className="text-xs text-slate-400 max-w-md">{error}</p>
                <button
                  onClick={() => handleTranslate()}
                  className="mt-2 text-xs text-sky-400 underline"
                >
                  Retry Translation
                </button>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <p className="text-slate-100 text-base sm:text-lg leading-relaxed font-normal select-text">
                  {result.translatedText}
                </p>

                {/* Linguistic rationale note */}
                {result.translationRationale && (
                  <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-900/40 text-xs text-sky-300 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-sky-200">Linguistic Precision: </span>
                      <span>{result.translationRationale}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12 space-y-2">
                <Layers className="w-8 h-8 text-slate-700" />
                <p className="text-xs text-slate-400 font-medium">
                  Enter or paste text and click &quot;Translate to Unicode Sinhala&quot;
                </p>
                <p className="text-[11px] text-slate-600 max-w-sm text-center">
                  Technical jargon is translated using standard Sri Lankan IT terminology instead of erroneous word-for-word translation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* On-Screen Virtual Keyboard */}
      {showKeyboard && (
        <div className="transition-all animate-in fade-in duration-200">
          <VirtualKeyboard
            onInsertChar={handleInsertChar}
            onBackspace={handleBackspace}
            onSpace={() => handleInsertChar(" ")}
            onClear={() => { setSourceText(""); setSinglishInput(""); }}
            onClose={() => setShowKeyboard(false)}
            defaultMode="wijesekara"
          />
        </div>
      )}

      {/* Technical Terms Breakdown (If any terms detected in result) */}
      {result && result.technicalTerms && result.technicalTerms.length > 0 && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-sky-500/10 text-sky-400">
                <BookOpen className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-semibold text-slate-100">
                Technical Terms Detected in Text ({result.technicalTerms.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Click term for deep explanation or to save in dictionary
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {result.technicalTerms.map((term, i) => {
              const isSelected = selectedTerm?.english === term.english;
              return (
                <button
                  key={i}
                  id={`btn-tech-term-${i}`}
                  onClick={() => setSelectedTerm(term)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-sky-500 text-slate-950 font-semibold shadow-sm"
                      : "bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  <span>{term.english}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? "bg-sky-600 text-white" : "bg-slate-800 text-sky-400"
                  }`}>
                    {term.sinhalaStandard}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Term Detail Card */}
          {selectedTerm && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                  Official Sinhala Term (නිල පාරිභාෂිකය)
                </span>
                <p className="text-base font-semibold text-sky-400">
                  {selectedTerm.sinhalaStandard}
                </p>
                <p className="text-slate-400">
                  Phonetic loan: <span className="text-slate-200">{selectedTerm.sinhalaPhonetic}</span>
                </p>
              </div>

              <div className="space-y-1 md:col-span-2 flex flex-col justify-between">
                <div>
                  <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                    Linguistic Context &amp; Meaning
                  </span>
                  <p className="text-slate-300 leading-relaxed mt-0.5">
                    {selectedTerm.explanation}
                  </p>
                </div>
                
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    id="btn-learn-deep-term"
                    onClick={() => onLearnTerm(selectedTerm.english, result.translatedText)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-medium cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Learn &amp; Coin with AI Agent</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Google Translate vs Sinhala Smart Translator Proof Showcase */}
      <MistakesShowcase
        onTryPhrase={(phrase) => {
          setSourceText(phrase);
          handleTranslate(phrase);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

    </div>
  );
};
