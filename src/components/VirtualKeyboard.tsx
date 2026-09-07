import React, { useState, useEffect } from "react";
import { 
  Keyboard as KeyboardIcon, 
  Delete, 
  CornerDownLeft, 
  Space, 
  X, 
  SlidersHorizontal,
  Sparkles,
  HelpCircle
} from "lucide-react";
import { 
  WIJESEKARA_ROWS, 
  SINHALA_CHAR_PALETTE, 
  VirtualKey 
} from "../utils/wijesekaraMap";

interface VirtualKeyboardProps {
  onInsertChar: (char: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  onClear?: () => void;
  onClose?: () => void;
  defaultMode?: "wijesekara" | "phonetic";
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onInsertChar,
  onBackspace,
  onSpace,
  onClear,
  onClose,
  defaultMode = "wijesekara",
}) => {
  const [layoutMode, setLayoutMode] = useState<"wijesekara" | "phonetic">(defaultMode);
  const [isShift, setIsShift] = useState(false);
  const [activePaletteTab, setActivePaletteTab] = useState<"vowels" | "pillam" | "consonants" | "conjuncts">("pillam");
  const [activeKeyCode, setActiveKeyCode] = useState<string | null>(null);

  // Listen for physical keyboard events to highlight virtual keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setActiveKeyCode(e.code);
      if (e.key === "Shift") {
        setIsShift(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setActiveKeyCode(null);
      if (e.key === "Shift") {
        setIsShift(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleKeyClick = (key: VirtualKey) => {
    if (key.code === "Backspace") {
      onBackspace();
    } else if (key.code === "Space") {
      onSpace();
    } else if (key.code === "ShiftLeft" || key.code === "ShiftRight") {
      setIsShift(!isShift);
    } else if (key.code === "Enter") {
      onInsertChar("\n");
    } else {
      const charToInsert = isShift ? key.shift : key.normal;
      onInsertChar(charToInsert);
    }
  };

  return (
    <div className="w-full bg-slate-950/95 border border-slate-800/90 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md space-y-3 transition-all">
      {/* Top Bar / Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <KeyboardIcon className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Sinhala Virtual Keyboard (සිංහල යතුරුපුවරුව)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout Mode Selector */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setLayoutMode("wijesekara")}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                layoutMode === "wijesekara"
                  ? "bg-sky-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Wijesekara (SLS 1134)
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("phonetic")}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                layoutMode === "phonetic"
                  ? "bg-sky-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Character Palette (ස්වර / පිල්ලම්)
            </button>
          </div>

          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="text-[11px] px-2.5 py-1 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
              title="Clear text"
            >
              Clear
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-900 rounded-lg transition-colors"
              title="Close keyboard"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mode 1: Wijesekara Layout */}
      {layoutMode === "wijesekara" && (
        <div className="space-y-1.5 select-none overflow-x-auto pb-1">
          {WIJESEKARA_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className="flex items-center justify-center gap-1 sm:gap-1.5 min-w-[620px]">
              {row.map((k) => {
                const isActive = activeKeyCode === k.code;
                const isShiftKey = k.code === "ShiftLeft" || k.code === "ShiftRight";
                const isShiftActive = isShiftKey && isShift;

                return (
                  <button
                    key={k.code}
                    type="button"
                    onClick={() => handleKeyClick(k)}
                    className={`h-10 sm:h-11 rounded-lg flex flex-col items-center justify-center px-1 sm:px-2 text-xs transition-all active:scale-95 cursor-pointer ${
                      k.width ? k.width : "flex-1 min-w-[36px] sm:min-w-[42px]"
                    } ${
                      isActive || isShiftActive
                        ? "bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/30 scale-95"
                        : k.isModifier
                        ? "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-medium"
                        : "bg-slate-900/90 hover:bg-slate-800/90 text-slate-100 border border-slate-800/80 hover:border-sky-500/40"
                    }`}
                  >
                    {k.label ? (
                      <span className="text-[11px] font-semibold">{k.label}</span>
                    ) : (
                      <>
                        <span className="text-[13px] sm:text-[15px] font-bold leading-none">
                          {isShift ? k.shift : k.normal}
                        </span>
                        <span className="text-[9px] text-slate-500 leading-none mt-0.5">
                          {isShift ? k.normal : k.shift}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Quick tips below Wijesekara */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-400 border-t border-slate-800/60">
            <span className="flex items-center gap-1">
              <span className="text-sky-400 font-semibold">Tip:</span>
              <span>Physical keyboard is mapped! Press keys on your keyboard or click on screen.</span>
            </span>
            <div className="flex items-center gap-3">
              <span>Shift: <strong className={isShift ? "text-sky-400" : "text-slate-500"}>{isShift ? "LOCKED" : "OFF"}</strong></span>
              <span>Rakaransaya: <code className="text-sky-300">Shift + R</code> (්‍ර)</span>
              <span>Yansaya: <code className="text-sky-300">Shift + H</code> (්‍ය)</span>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Categorized Character Palette */}
      {layoutMode === "phonetic" && (
        <div className="space-y-3">
          {/* Palette sub-tabs */}
          <div className="flex items-center gap-1 border-b border-slate-800/80 pb-2">
            {[
              { id: "pillam", label: "පිල්ලම් (Vowel Signs)" },
              { id: "vowels", label: "ස්වර (Vowels)" },
              { id: "consonants", label: "ව්‍යංජන (Consonants)" },
              { id: "conjuncts", label: "බැඳි අකුරු / සංයුක්ත (Conjuncts)" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivePaletteTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activePaletteTab === tab.id
                    ? "bg-slate-800 text-sky-400 border border-sky-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Vowel Signs (පිල්ලම්) */}
          {activePaletteTab === "pillam" && (
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2">
              {SINHALA_CHAR_PALETTE.pillam.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onInsertChar(p.char)}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 text-center transition-all group flex flex-col items-center justify-center cursor-pointer"
                >
                  <span className="text-xl text-slate-100 group-hover:text-sky-400 font-bold">
                    ක{p.char}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 truncate max-w-full">
                    {p.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Independent Vowels (ස්වර) */}
          {activePaletteTab === "vowels" && (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-2">
              {SINHALA_CHAR_PALETTE.vowels.map((v, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onInsertChar(v.char)}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 text-center transition-all group flex flex-col items-center justify-center cursor-pointer"
                >
                  <span className="text-xl text-slate-100 group-hover:text-sky-400 font-bold">
                    {v.char}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 font-mono">
                    {v.roman}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Consonants (ව්‍යංජන) */}
          {activePaletteTab === "consonants" && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-1.5 max-h-56 overflow-y-auto pr-1">
              {SINHALA_CHAR_PALETTE.consonants.map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onInsertChar(c.char)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 text-center transition-all group flex flex-col items-center justify-center cursor-pointer"
                >
                  <span className="text-lg text-slate-100 group-hover:text-sky-400 font-bold">
                    {c.char}
                  </span>
                  <span className="text-[9px] text-slate-500 mt-0.5 font-mono">
                    {c.roman}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Conjuncts & Modifiers */}
          {activePaletteTab === "conjuncts" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SINHALA_CHAR_PALETTE.conjuncts.map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onInsertChar(c.char)}
                  className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 text-left transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl text-sky-400 font-bold">
                      {c.char}
                    </span>
                    <code className="text-[10px] text-slate-400 font-mono">
                      {c.roman}
                    </code>
                  </div>
                  <span className="text-[11px] text-slate-300 font-medium mt-1">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Space & Backspace row */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onSpace}
              className="flex-1 max-w-xs py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Space className="w-4 h-4" />
              <span>Space (හිස්තැන)</span>
            </button>
            <button
              type="button"
              onClick={onBackspace}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-red-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Delete className="w-4 h-4" />
              <span>Backspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
