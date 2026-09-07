import React, { useState } from "react";
import { 
  Search, 
  X, 
  BookOpen, 
  Copy, 
  Check, 
  Zap, 
  Settings,
  Terminal,
  Cpu,
  Globe
} from "lucide-react";
import { DictionaryEntry } from "../types";

interface FloatingExtensionWidgetProps {
  dictionary: DictionaryEntry[];
  onOpenExportModal: () => void;
  onOpenDictionary: () => void;
}

export const FloatingExtensionWidget: React.FC<FloatingExtensionWidgetProps> = ({
  dictionary,
  onOpenExportModal,
  onOpenDictionary,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = searchQuery.trim()
    ? dictionary.filter(
        (d) =>
          d.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.sinhalaStandard.includes(searchQuery) ||
          (d.singlish && d.singlish.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : dictionary.slice(0, 4);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <aside aria-label="Floating Omarchy Assistant" className="fixed bottom-6 right-6 z-40 font-jetbrains">
      {/* Floating expanded panel (The actual Omarchy Chrome Extension Popup preview!) */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-[360px] max-w-[92vw] bg-[#090a0f] rounded-2xl p-4 border border-zinc-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-3 mb-2 animate-in fade-in slide-in-from-bottom-3 duration-150 text-zinc-100 font-jetbrains">
          
          {/* Omarchy Waybar-style Top Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-sky-400 font-bold text-xs shadow-inner">
                ▲
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5 font-jetbrains">
                  <span>OMARCHY TRANSLATE</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    SLS 1134
                  </span>
                </h4>
                <p className="text-[10px] text-zinc-500">
                  hypr-shell • {dictionary.length} terms synced
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                Alt+S
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Terminal-style Search */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400 text-xs font-bold">
              ❯
            </div>
            <input
              type="text"
              placeholder="query tech term (cache, thread, bug)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d0f17] border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-sky-500/60 transition-colors font-jetbrains"
            />
          </div>

          {/* Results list */}
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-500">
                no term found for &quot;{searchQuery}&quot; in SLS registry.
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-[#0d0f17]/90 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs text-sky-300">
                      {item.term}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white font-sinhala">
                      {item.sinhalaStandard}
                    </p>
                    <button
                      onClick={() => handleCopy(item.sinhalaStandard, item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-400 hover:text-white rounded"
                      title="Copy Unicode"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <p className="text-[10px] text-zinc-400 line-clamp-1 font-sinhala">
                    {item.definitionSi}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Bottom Bar: Action buttons */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenDictionary();
              }}
              className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Terminal className="w-3 h-3 text-sky-400" />
              <span>Full Lexicon</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenExportModal();
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-[11px] shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <Zap className="w-3 h-3 text-zinc-950" />
              <span>Install Extension</span>
            </button>
          </div>

        </div>
      )}

      {/* Floating launcher trigger pill in Omarchy style */}
      <button
        id="btn-floating-sinhala-widget"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#090a0f] hover:bg-[#12151e] text-zinc-100 border border-zinc-700/80 shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all hover:scale-105 active:scale-95 cursor-pointer font-jetbrains"
        title="Omarchy Sinhala Translator"
      >
        <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-700 text-sky-400 flex items-center justify-center font-bold text-[10px]">
          ▲
        </span>
        <span className="text-xs font-semibold text-zinc-200">
          {isOpen ? "close" : "omarchy::si"}
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
      </button>
    </aside>
  );
};

