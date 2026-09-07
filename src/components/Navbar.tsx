import React from "react";
import { ActiveTab } from "../types";
import { 
  Languages, 
  BookOpen, 
  Sparkles, 
  Keyboard, 
  Chrome, 
  Download,
  Zap,
  Flame,
  Globe
} from "lucide-react";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenExport: () => void;
  dictionaryCount: number;
  siteLanguage?: "en" | "si";
  onToggleSiteLanguage?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenExport,
  dictionaryCount,
  siteLanguage = "en",
  onToggleSiteLanguage,
}) => {
  const isSi = siteLanguage === "si";

  const tabs = [
    { id: 'translator' as ActiveTab, label: isSi ? 'ස්මාර්ට් පරිවර්තකය' : 'Smart Translator', icon: Languages, badge: 'Unicode' },
    { id: 'site-translator' as ActiveTab, label: isSi ? 'වෙබ් පරිවර්තකය' : 'Site Translator', icon: Globe, badge: 'Full Site' },
    { id: 'simulator' as ActiveTab, label: isSi ? 'බ්‍රවුසර එක්ස්ටෙන්ෂන්' : 'Browser Extension', icon: Chrome, badge: 'Live' },
    { id: 'dictionary' as ActiveTab, label: isSi ? 'පාරිභාෂික ශබ්දකෝෂය' : 'Tech Lexicon', icon: BookOpen, badge: `${dictionaryCount}` },
    { id: 'ai-agent' as ActiveTab, label: isSi ? 'AI පාරිභාෂික නියෝජිතයා' : 'AI Term Agent', icon: Sparkles, badge: 'Gemini' },
    { id: 'singlish' as ActiveTab, label: isSi ? 'සිංහල යතුරුපුවරුව' : 'Sinhala Keyboard', icon: Keyboard, badge: 'Dual' },
  ];

  return (
    <header className="border-b border-white/10 bg-slate-950/85 backdrop-blur-xl sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          
          {/* Brand Identity */}
          <div 
            className="flex items-center gap-3.5 cursor-pointer group select-none" 
            onClick={() => setActiveTab('translator')}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/25 text-white font-black text-xl border border-white/20 group-hover:scale-105 transition-transform duration-200">
              සිං
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight text-base sm:text-lg font-sinhala">
                  Sinhala AI Translator
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Extension
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
                <span>Context-Aware Technical Unicode</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-sky-400">Fixes Google Translate Pitfalls</span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation Pills */}
          <nav className="hidden lg:flex items-center gap-1.5 glass-panel p-1.5 rounded-2xl border border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25 scale-[1.02]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-black/30 text-white font-bold' : 'bg-white/5 text-slate-400'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* High-Impact CTA: Install in All Browsers & Language Toggle */}
          <div className="flex items-center gap-2">
            {onToggleSiteLanguage && (
              <button
                onClick={onToggleSiteLanguage}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-sky-500/50 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
                title="Toggle Site UI Language (English ⇄ නිරවද්‍ය සිංහල)"
              >
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>{isSi ? "EN" : "සිංහල"}</span>
              </button>
            )}

            <button
              id="btn-nav-export-extension"
              onClick={onOpenExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-400 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 text-xs font-black shadow-lg shadow-sky-500/30 transition-all cursor-pointer hover:scale-105 active:scale-95 border border-white/30"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{isSi ? "එක්ස්ටෙන්ෂන් ලබාගන්න" : "Install Extension"}</span>
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-wide bg-slate-950/20 px-1.5 py-0.5 rounded text-slate-900 font-bold">
                Universal
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 gap-1.5 border-t border-white/5 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 glass-pill hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
