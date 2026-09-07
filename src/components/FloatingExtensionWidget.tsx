import React, { useState } from "react";
import { 
  Search, 
  X, 
  BookOpen, 
  Copy, 
  Check, 
  Zap, 
  Settings,
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
    <aside aria-label="Floating Assistant" className="fixed bottom-6 right-6 z-40 font-sans">
      {/* Floating expanded panel (The actual Chrome Extension Popup preview!) */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-[350px] max-w-[90vw] bg-[#0c0e14] rounded-2xl p-4 border border-zinc-800 shadow-2xl space-y-3 mb-2 animate-in fade-in slide-in-from-bottom-3 duration-150 text-zinc-100">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center text-zinc-950 font-bold text-xs">
                සිං
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                  <span>Sinhala Web Extension</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                    SLS 1134
                  </span>
                </h4>
                <p className="text-[10px] text-zinc-500 font-mono">
                  {dictionary.length} technical terms synced
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tech term (e.g. cache, thread, bug)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#090a0f] border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 font-mono outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          {/* Results list */}
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-500 font-mono">
                No local term found for &quot;{searchQuery}&quot;.
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium text-xs text-zinc-200">
                      {item.term}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
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
              className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
            >
              <BookOpen className="w-3 h-3" />
              <span>Full Lexicon</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenExportModal();
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-[11px] shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Zap className="w-3 h-3 text-zinc-950" />
              <span>Get Extension</span>
            </button>
          </div>

        </div>
      )}

      {/* Floating launcher trigger pill */}
      <button
        id="btn-floating-sinhala-widget"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#0c0e14] hover:bg-zinc-900 text-zinc-100 border border-zinc-700/80 shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Live Sinhala Extension Assistant"
      >
        <span className="w-5 h-5 rounded-full bg-sky-500 text-zinc-950 flex items-center justify-center font-bold text-[10px]">
          සිං
        </span>
        <span className="font-mono text-xs font-medium text-zinc-200">
          {isOpen ? "Close" : "Sinhala Extension"}
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
      </button>
    </aside>
  );
};
