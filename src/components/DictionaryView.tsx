import React, { useState, useMemo } from "react";
import { 
  Search, 
  Plus, 
  Volume2, 
  Copy, 
  Check, 
  Filter, 
  Download, 
  Trash2, 
  Sparkles, 
  BookOpen, 
  Tag, 
  ExternalLink,
  ShieldCheck,
  Cpu
} from "lucide-react";
import { DictionaryEntry } from "../types";

interface DictionaryViewProps {
  dictionary: DictionaryEntry[];
  onAddTerm: (entry: DictionaryEntry) => void;
  onDeleteTerm: (id: string) => void;
  onOpenAIAgent: (term?: string) => void;
}

export const DictionaryView: React.FC<DictionaryViewProps> = ({
  dictionary,
  onAddTerm,
  onDeleteTerm,
  onOpenAIAgent,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSource, setSelectedSource] = useState("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add custom term modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTerm, setNewTerm] = useState("");
  const [newSinhalaStandard, setNewSinhalaStandard] = useState("");
  const [newSinhalaPhonetic, setNewSinhalaPhonetic] = useState("");
  const [newSinglish, setNewSinglish] = useState("");
  const [newCategory, setNewCategory] = useState("Web Development");
  const [newDefinitionSi, setNewDefinitionSi] = useState("");
  const [newDefinitionEn, setNewDefinitionEn] = useState("");
  const [newExampleEn, setNewExampleEn] = useState("");
  const [newExampleSi, setNewExampleSi] = useState("");

  // Categories extraction
  const categories = useMemo(() => {
    const set = new Set<string>();
    dictionary.forEach((d) => set.add(d.category));
    return ["All", ...Array.from(set)];
  }, [dictionary]);

  // Filtered dictionary
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return dictionary.filter((item) => {
      const matchesSearch =
        !q ||
        item.term.toLowerCase().includes(q) ||
        item.sinhalaStandard.toLowerCase().includes(q) ||
        item.sinhalaPhonetic.toLowerCase().includes(q) ||
        item.singlish.toLowerCase().includes(q) ||
        item.definitionSi.toLowerCase().includes(q) ||
        item.definitionEn.toLowerCase().includes(q);

      const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
      const matchesSource =
        selectedSource === "All" ||
        (selectedSource === "official" && item.source === "official") ||
        (selectedSource === "ai-agent" && item.source === "ai-agent") ||
        (selectedSource === "community" && item.source === "community");

      return matchesSearch && matchesCat && matchesSource;
    });
  }, [dictionary, searchQuery, selectedCategory, selectedSource]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCreateTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newSinhalaStandard.trim()) return;

    const entry: DictionaryEntry = {
      id: `custom-${Date.now()}`,
      term: newTerm.trim(),
      sinhalaStandard: newSinhalaStandard.trim(),
      sinhalaPhonetic: newSinhalaPhonetic.trim() || newSinhalaStandard.trim(),
      singlish: newSinglish.trim() || "",
      partOfSpeech: "noun",
      category: newCategory,
      definitionSi: newDefinitionSi.trim(),
      definitionEn: newDefinitionEn.trim(),
      exampleEn: newExampleEn.trim(),
      exampleSi: newExampleSi.trim(),
      source: "community",
      createdAt: new Date().toISOString(),
      tags: ["custom"],
    };

    onAddTerm(entry);
    setIsModalOpen(false);
    // Reset
    setNewTerm("");
    setNewSinhalaStandard("");
    setNewSinhalaPhonetic("");
    setNewSinglish("");
    setNewDefinitionSi("");
    setNewDefinitionEn("");
    setNewExampleEn("");
    setNewExampleSi("");
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dictionary, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sinhala-technical-lexicon-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header & Stat bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-400" />
              <span>සිංහල තාක්ෂණික පාරිභාෂික ශබ්දකෝෂය (Tech Lexicon)</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold">
              {dictionary.length} Terms
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Searchable in English, Singlish, and Unicode Sinhala. Preloaded into the Chrome Extension.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-export-lexicon-json"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            id="btn-open-ai-learn"
            onClick={() => onOpenAIAgent()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Coin with AI Agent</span>
          </button>

          <button
            id="btn-open-add-term-modal"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Term</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-lexicon"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search (e.g. Cache, Thread, kaesh, තන්තුව)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-500">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-slate-900">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-500">Source:</span>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Sources</option>
              <option value="official" className="bg-slate-900">Official Standards</option>
              <option value="ai-agent" className="bg-slate-900">AI Learned</option>
              <option value="community" className="bg-slate-900">User Custom</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lexicon Cards Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-medium text-slate-300">No matching technical terms found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for another word or ask the AI Lexicon Agent to coin and analyze it for you.
          </p>
          <button
            onClick={() => onOpenAIAgent(searchQuery)}
            className="px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold"
          >
            Learn &quot;{searchQuery}&quot; with AI Agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const isAi = item.source === "ai-agent";
            const isOfficial = item.source === "official";

            return (
              <div
                key={item.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-slate-700 p-4 flex flex-col justify-between space-y-3 shadow-sm transition-all"
              >
                {/* Header */}
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {item.category}
                        </span>
                        {isAi ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> AI Learned
                          </span>
                        ) : isOfficial ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" /> Official
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            Custom
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-100 mt-1">
                        {item.term}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleSpeak(item.sinhalaStandard)}
                        className="p-1 rounded text-slate-500 hover:text-sky-400 transition-colors"
                        title="Pronounce Sinhala"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCopy(item.id, item.sinhalaStandard)}
                        className="p-1 rounded text-slate-500 hover:text-slate-200 transition-colors"
                        title="Copy Sinhala Term"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {!isOfficial && (
                        <button
                          onClick={() => onDeleteTerm(item.id)}
                          className="p-1 rounded text-slate-600 hover:text-rose-400 transition-colors"
                          title="Delete term"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sinhala Equivalents */}
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-slate-500 text-[10px] uppercase font-semibold">Standard:</span>
                      <span className="text-sky-400 font-bold text-sm text-right">
                        {item.sinhalaStandard}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-slate-500 text-[10px] uppercase font-semibold">Phonetic:</span>
                      <span className="text-slate-300 font-medium text-right">
                        {item.sinhalaPhonetic}
                      </span>
                    </div>
                    {item.singlish && (
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="text-slate-600 text-[10px]">Singlish:</span>
                        <code className="text-[11px] text-sky-300 font-mono">
                          {item.singlish}
                        </code>
                      </div>
                    )}
                  </div>

                  {/* Definitions */}
                  <div className="space-y-1 text-xs pt-1">
                    <p className="text-slate-300 leading-relaxed font-normal">
                      {item.definitionSi}
                    </p>
                    {item.definitionEn && (
                      <p className="text-slate-500 text-[11px] leading-relaxed italic">
                        {item.definitionEn}
                      </p>
                    )}
                  </div>

                  {/* Examples */}
                  {item.exampleSi && (
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-[11px] space-y-0.5">
                      <span className="text-[10px] font-semibold text-slate-400 block">Example:</span>
                      <p className="text-sky-200">&quot;{item.exampleSi}&quot;</p>
                      {item.exampleEn && (
                        <p className="text-slate-500">&quot;{item.exampleEn}&quot;</p>
                      )}
                    </div>
                  )}

                  {/* Common mistake note */}
                  {item.commonMistakes && (
                    <div className="text-[10px] text-amber-400/90 pt-1">
                      ⚠️ <strong>Google Translate Pitfall:</strong> {item.commonMistakes}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Part of speech: {item.partOfSpeech}</span>
                  <button
                    onClick={() => onOpenAIAgent(item.term)}
                    className="text-sky-400 hover:text-sky-300 font-medium"
                  >
                    Deep dive &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Term Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-400" />
                <span>Add Custom Technical Term</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTerm} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  English Technical Term *
                </label>
                <input
                  type="text"
                  required
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="e.g. Microfrontend, Rate Limiting..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Standard Sinhala (නිල පාරිභාෂිකය) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSinhalaStandard}
                    onChange={(e) => setNewSinhalaStandard(e.target.value)}
                    placeholder="e.g. අනුපාත සීමාකරණය"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Phonetic Loan (ව්‍යවහාරික පදය)
                  </label>
                  <input
                    type="text"
                    value={newSinhalaPhonetic}
                    onChange={(e) => setNewSinhalaPhonetic(e.target.value)}
                    placeholder="e.g. රේට් ලිමිටින්"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Singlish
                  </label>
                  <input
                    type="text"
                    value={newSinglish}
                    onChange={(e) => setNewSinglish(e.target.value)}
                    placeholder="e.g. reyt limitin"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Web Development, AI"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Sinhala Definition
                </label>
                <textarea
                  rows={2}
                  value={newDefinitionSi}
                  onChange={(e) => setNewDefinitionSi(e.target.value)}
                  placeholder="පැහැදිලි සිංහල තේරුම ලියන්න..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Example Sentence (Sinhala)
                </label>
                <input
                  type="text"
                  value={newExampleSi}
                  onChange={(e) => setNewExampleSi(e.target.value)}
                  placeholder="වාක්‍යයකින් උදාහරණයක් ලියන්න..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold"
                >
                  Save to Lexicon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
