import React, { useState, useRef } from "react";
import { 
  Keyboard as KeyboardIcon, 
  Copy, 
  Check, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  Volume2, 
  BookOpen,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from "lucide-react";
import { transliterateSinglishToSinhala, PHONETIC_KEYMAP_HINTS } from "../utils/sinhalaUnicode";
import { getWijesekaraChar } from "../utils/wijesekaraMap";
import { VirtualKeyboard } from "./VirtualKeyboard";

interface SinglishTyperProps {
  onSendToTranslator: (sinhalaText: string) => void;
}

export const SinglishTyper: React.FC<SinglishTyperProps> = ({ onSendToTranslator }) => {
  const [typingMode, setTypingMode] = useState<"singlish" | "wijesekara">("singlish");
  const [singlishInput, setSinglishInput] = useState("");
  const [wijesekaraOutput, setWijesekaraOutput] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wijeRef = useRef<HTMLTextAreaElement>(null);

  // Realtime transliteration for Singlish mode
  const phoneticUnicodeOutput = transliterateSinglishToSinhala(singlishInput);

  // Active output depending on mode
  const activeUnicode = typingMode === "singlish" ? phoneticUnicodeOutput : wijesekaraOutput;

  const handleCopy = () => {
    if (!activeUnicode) return;
    navigator.clipboard.writeText(activeUnicode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!activeUnicode) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeUnicode);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Insert character from Virtual Keyboard
  const handleInsertChar = (char: string) => {
    if (typingMode === "singlish") {
      // In Singlish mode, virtual keyboard adds to singlish input or directly to output
      const el = inputRef.current;
      if (el) {
        const start = el.selectionStart ?? singlishInput.length;
        const end = el.selectionEnd ?? singlishInput.length;
        const next = singlishInput.substring(0, start) + char + singlishInput.substring(end);
        setSinglishInput(next);
        requestAnimationFrame(() => {
          el.focus();
          el.setSelectionRange(start + char.length, start + char.length);
        });
      } else {
        setSinglishInput((prev) => prev + char);
      }
    } else {
      // In Wijesekara mode, add directly to wijesekara output
      const el = wijeRef.current;
      if (el) {
        const start = el.selectionStart ?? wijesekaraOutput.length;
        const end = el.selectionEnd ?? wijesekaraOutput.length;
        const next = wijesekaraOutput.substring(0, start) + char + wijesekaraOutput.substring(end);
        setWijesekaraOutput(next);
        requestAnimationFrame(() => {
          el.focus();
          el.setSelectionRange(start + char.length, start + char.length);
        });
      } else {
        setWijesekaraOutput((prev) => prev + char);
      }
    }
  };

  const handleBackspace = () => {
    if (typingMode === "singlish") {
      const el = inputRef.current;
      if (el) {
        const start = el.selectionStart ?? singlishInput.length;
        const end = el.selectionEnd ?? singlishInput.length;
        if (start === end && start > 0) {
          const next = singlishInput.substring(0, start - 1) + singlishInput.substring(end);
          setSinglishInput(next);
          requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(start - 1, start - 1);
          });
        } else if (start !== end) {
          const next = singlishInput.substring(0, start) + singlishInput.substring(end);
          setSinglishInput(next);
          requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(start, start);
          });
        }
      } else {
        setSinglishInput((prev) => prev.slice(0, -1));
      }
    } else {
      const el = wijeRef.current;
      if (el) {
        const start = el.selectionStart ?? wijesekaraOutput.length;
        const end = el.selectionEnd ?? wijesekaraOutput.length;
        if (start === end && start > 0) {
          const next = wijesekaraOutput.substring(0, start - 1) + wijesekaraOutput.substring(end);
          setWijesekaraOutput(next);
          requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(start - 1, start - 1);
          });
        }
      } else {
        setWijesekaraOutput((prev) => prev.slice(0, -1));
      }
    }
  };

  const handleSpace = () => {
    handleInsertChar(" ");
  };

  // Intercept physical keyboard when in Wijesekara mode
  const handleWijesekaraKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ignore control, alt, meta keys
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key === "Backspace" || e.key === "Enter" || e.key === "Tab" || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Shift") {
      return;
    }

    if (e.key === " ") {
      e.preventDefault();
      handleInsertChar(" ");
      return;
    }

    // Look up Wijesekara mapping for this physical key
    const mapped = getWijesekaraChar(e.key, e.shiftKey);
    if (mapped) {
      e.preventDefault();
      handleInsertChar(mapped);
    }
  };

  const QUICK_PHRASES = [
    { label: "ආයුබෝවන්", singlish: "aayubowan" },
    { label: "ස්තූතියි", singlish: "sthuthiyi" },
    { label: "සුබ දවසක්", singlish: "suba dawasak" },
    { label: "කරුණාකර උදව් කරන්න", singlish: "karunaakara udaw karanna" },
    { label: "මම පරිගණක විද්‍යාව ඉගෙන ගන්නවා", singlish: "mama pariganaka widyaawa igena gannawa" },
    { label: "දත්ත සමුදාය යාවත්කාලීන කරන්න", singlish: "daththa samudhaaya yaawathkaaliina karanna" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Title & Mode Switcher */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <KeyboardIcon className="w-5 h-5 text-sky-400" />
              <h1 className="text-base sm:text-lg font-bold text-slate-100">
                Sinhala Keyboard &amp; Transliteration Engine (සිංහල යතුරුලියනය)
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Supports both <strong>Singlish Phonetic Typing</strong> (e.g., <code className="text-sky-300">mama</code> → <code className="text-sky-300">මම</code>) and standard <strong>Wijesekara SLS 1134</strong> on-screen &amp; physical keyboard mapping.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Keyboard mode toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setTypingMode("singlish")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  typingMode === "singlish"
                    ? "bg-sky-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Singlish Phonetic (ඉංග්‍රීසි අකුරින්)
              </button>
              <button
                type="button"
                onClick={() => setTypingMode("wijesekara")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  typingMode === "wijesekara"
                    ? "bg-sky-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Wijesekara (විජේසේකර SLS 1134)
              </button>
            </div>

            {/* Virtual Keyboard Toggle */}
            <button
              type="button"
              onClick={() => setShowKeyboard(!showKeyboard)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                showKeyboard
                  ? "bg-sky-950/60 text-sky-400 border-sky-800/60"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <KeyboardIcon className="w-3.5 h-3.5" />
              <span>Virtual Keyboard</span>
              {showKeyboard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Singlish Dual Panel */}
      {typingMode === "singlish" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Singlish Input */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between space-y-3 focus-within:border-sky-500/50 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>Type in Singlish (ඉංග්‍රීසි අකුරින්)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-normal">Physical Key Enabled</span>
              </span>
              {singlishInput && (
                <button
                  type="button"
                  onClick={() => setSinglishInput("")}
                  className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <textarea
              ref={inputRef}
              id="input-singlish-live"
              value={singlishInput}
              onChange={(e) => setSinglishInput(e.target.value)}
              placeholder="Type here naturally (e.g., mama gedara yanawa, suba dawasak, daththa samudhaaya)..."
              rows={8}
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm sm:text-base outline-none resize-none leading-relaxed"
            />

            {/* Quick Click Samples */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-500 font-medium block mb-1.5">
                Quick verified phrases:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PHRASES.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSinglishInput(p.singlish)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Unicode Output */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                Unicode Sinhala Output (පිරිසිදු සිංහල)
              </span>

              {phoneticUnicodeOutput && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSpeak}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
                    title="Speak Sinhala"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
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

            <div className="flex-1 min-h-[160px] p-2">
              {phoneticUnicodeOutput ? (
                <p className="text-lg sm:text-xl text-slate-100 font-normal leading-relaxed whitespace-pre-wrap select-text font-sans">
                  {phoneticUnicodeOutput}
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic leading-relaxed">
                  Pure Unicode characters (U+0D80–U+0DFF) render here in real-time as you type in Singlish. Rakaransaya (්‍ර), Yansaya (්‍ය), and Bandi akuru form automatically without corrupting letters.
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {phoneticUnicodeOutput.length} Sinhala chars
              </span>
              <button
                type="button"
                onClick={() => onSendToTranslator(phoneticUnicodeOutput)}
                disabled={!phoneticUnicodeOutput.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <span>Use in Translator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Mode 2: Wijesekara Single Direct Typing Panel */}
      {typingMode === "wijesekara" && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                Wijesekara Direct Input (SLS 1134 ප්‍රමිතිගත යතුරුලියනය)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Physical Keyboard Active
              </span>
            </div>

            <div className="flex items-center gap-2">
              {wijesekaraOutput && (
                <>
                  <button
                    type="button"
                    onClick={handleSpeak}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
                    title="Speak Sinhala"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
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
                  <button
                    type="button"
                    onClick={() => setWijesekaraOutput("")}
                    className="text-xs text-slate-500 hover:text-slate-300"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-1">
            <textarea
              ref={wijeRef}
              id="input-wijesekara-direct"
              value={wijesekaraOutput}
              onChange={(e) => setWijesekaraOutput(e.target.value)}
              onKeyDown={handleWijesekaraKeyDown}
              placeholder="Click here and start typing with your physical keyboard using the Wijesekara standard layout (e.g. press 'l' for 'ක', 'd' for 'ා', 'a' for '්')..."
              rows={6}
              className="w-full bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-slate-100 placeholder-slate-500 text-base sm:text-lg outline-none resize-none leading-relaxed focus:border-sky-500/50"
            />
          </div>

          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-slate-400">
              No need to install Sinhala fonts or OS keyboard layout — your English keyboard is mapped directly in the browser!
            </span>
            <button
              type="button"
              onClick={() => onSendToTranslator(wijesekaraOutput)}
              disabled={!wijesekaraOutput.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 text-xs font-semibold shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <span>Use in Translator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Virtual On-Screen Keyboard */}
      {showKeyboard && (
        <VirtualKeyboard
          onInsertChar={handleInsertChar}
          onBackspace={handleBackspace}
          onSpace={handleSpace}
          onClear={() => {
            if (typingMode === "singlish") setSinglishInput("");
            else setWijesekaraOutput("");
          }}
          onClose={() => setShowKeyboard(false)}
          defaultMode={typingMode === "wijesekara" ? "wijesekara" : "phonetic"}
        />
      )}

      {/* Phonetic Cheat Sheet */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-5 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-sky-400" />
          Singlish Phonetic Keymap Reference
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
          {PHONETIC_KEYMAP_HINTS.map((hint, idx) => (
            <div
              key={idx}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 space-y-0.5"
            >
              <div className="flex items-center justify-between">
                <code className="text-[11px] text-sky-300 font-mono font-semibold">
                  {hint.key}
                </code>
                <span className="text-xs text-slate-200 font-bold">
                  {hint.char}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">{hint.example}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
