import React, { useState, useEffect } from "react";
import { ActiveTab, DictionaryEntry } from "./types";
import { INITIAL_TECHNICAL_DICTIONARY } from "./data/initialDictionary";
import { Navbar } from "./components/Navbar";
import { TranslatorView } from "./components/TranslatorView";
import { AIAgentView } from "./components/AIAgentView";
import { DictionaryView } from "./components/DictionaryView";
import { SinglishTyper } from "./components/SinglishTyper";
import { ExtensionSimulator } from "./components/ExtensionSimulator";
import { ExtensionExportModal } from "./components/ExtensionExportModal";
import { FloatingExtensionWidget } from "./components/FloatingExtensionWidget";
import { SiteTranslatorView } from "./components/SiteTranslatorView";

const LOCAL_STORAGE_KEY = "sinhala_tech_dictionary_custom_v1";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("translator");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [siteLanguage, setSiteLanguage] = useState<"en" | "si">("en");

  // Initialize dictionary with local storage + initial preset
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge initial and saved unique
          const map = new Map<string, DictionaryEntry>();
          INITIAL_TECHNICAL_DICTIONARY.forEach((d) => map.set(d.term.toLowerCase(), d));
          parsed.forEach((d) => map.set(d.term.toLowerCase(), d));
          return Array.from(map.values());
        }
      }
    } catch (e) {
      console.warn("Failed to load custom dictionary from localStorage", e);
    }
    return INITIAL_TECHNICAL_DICTIONARY;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dictionary));
    } catch (e) {
      console.warn("Failed to persist dictionary to localStorage", e);
    }
  }, [dictionary]);

  // AI Agent initial query term state
  const [aiInitialTerm, setAiInitialTerm] = useState<string>("");
  const [translatorPrefillText, setTranslatorPrefillText] = useState<string>("");

  const handleAddTerm = (entry: DictionaryEntry) => {
    setDictionary((prev) => {
      const filtered = prev.filter((item) => item.term.toLowerCase() !== entry.term.toLowerCase());
      return [entry, ...filtered];
    });
  };

  const handleDeleteTerm = (id: string) => {
    setDictionary((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLearnTerm = (term: string, context?: string) => {
    setAiInitialTerm(term);
    setActiveTab("ai-agent");
  };

  const handleSendToTranslator = (text: string) => {
    setTranslatorPrefillText(text);
    setActiveTab("translator");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setExportModalOpen(true)}
        dictionaryCount={dictionary.length}
        siteLanguage={siteLanguage}
        onToggleSiteLanguage={() => setSiteLanguage((prev) => (prev === "en" ? "si" : "en"))}
      />

      {/* Main Content Router */}
      <main className="flex-1 pb-12">
        {activeTab === "translator" && (
          <TranslatorView
            onLearnTerm={handleLearnTerm}
            onOpenDictionary={() => setActiveTab("dictionary")}
            initialText={translatorPrefillText}
          />
        )}

        {activeTab === "site-translator" && (
          <SiteTranslatorView
            onLearnTerm={handleLearnTerm}
            onAddTermToDictionary={handleAddTerm}
          />
        )}

        {activeTab === "simulator" && (
          <ExtensionSimulator
            dictionary={dictionary}
            onLearnTerm={handleLearnTerm}
            onOpenExport={() => setExportModalOpen(true)}
          />
        )}

        {activeTab === "dictionary" && (
          <DictionaryView
            dictionary={dictionary}
            onAddTerm={handleAddTerm}
            onDeleteTerm={handleDeleteTerm}
            onOpenAIAgent={(term) => {
              if (term) setAiInitialTerm(term);
              setActiveTab("ai-agent");
            }}
          />
        )}

        {activeTab === "ai-agent" && (
          <AIAgentView
            onSaveToDictionary={handleAddTerm}
            savedDictionary={dictionary}
            initialSearchTerm={aiInitialTerm}
          />
        )}

        {activeTab === "singlish" && (
          <SinglishTyper onSendToTranslator={handleSendToTranslator} />
        )}
      </main>

      {/* Chrome Extension Export Modal */}
      <ExtensionExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        dictionary={dictionary}
      />

      {/* Floating In-App Assistant Widget */}
      <FloatingExtensionWidget
        dictionary={dictionary}
        onOpenExportModal={() => setExportModalOpen(true)}
        onOpenDictionary={() => setActiveTab("dictionary")}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/90 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Sinhala Smart Translator &amp; Tech Lexicon</span>
            <span>&bull;</span>
            <span className="text-sky-400 font-mono text-[11px]">Unicode Standard U+0D80–U+0DFF</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={() => setExportModalOpen(true)}
              className="text-sky-400 hover:text-sky-300 underline font-semibold transition-colors cursor-pointer"
            >
              ⚡ Install in Any Browser (No Zip / Universal)
            </button>
            <span>&bull;</span>
            <span>Department of Official Languages Terminology Reference</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
