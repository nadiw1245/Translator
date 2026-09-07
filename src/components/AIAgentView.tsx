import React, { useState } from "react";
import { 
  Sparkles, 
  Send, 
  BookPlus, 
  Check, 
  Loader2, 
  AlertCircle, 
  HelpCircle, 
  Lightbulb, 
  Layers,
  ArrowRight,
  BookmarkCheck,
  Bot,
  User,
  ExternalLink
} from "lucide-react";
import { DictionaryEntry, ChatMessage } from "../types";

interface AIAgentViewProps {
  onSaveToDictionary: (entry: DictionaryEntry) => void;
  savedDictionary: DictionaryEntry[];
  initialSearchTerm?: string;
}

const PRESET_NEW_TECH_TERMS = [
  "Retrieval-Augmented Generation (RAG)",
  "Prompt Injection Attack",
  "Zero-Knowledge Proof",
  "Kubernetes Pod Autoscaling",
  "Edge Computing",
  "Micro-Frontends Architecture",
  "Immutable Infrastructure",
  "Cold Start Latency",
];

export const AIAgentView: React.FC<AIAgentViewProps> = ({
  onSaveToDictionary,
  savedDictionary,
  initialSearchTerm = "",
}) => {
  // Term Analysis State
  const [termToAnalyze, setTermToAnalyze] = useState(initialSearchTerm);
  const [contextSentence, setContextSentence] = useState("");
  const [domain, setDomain] = useState("AI & Computer Science");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<Partial<DictionaryEntry> | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Chat State with Heli
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg-0",
      role: "assistant",
      text: "ආයුබෝවන්! මම හේලී (Heli) - ඔබේ සිංහල AI පාරිභාෂික නියෝජිතයා (Sinhala AI Lexicon Agent). Google Translate මඟින් වැරදියට පරිවර්තනය වන ඕනෑම නව තාක්ෂණික වචනයක් (New Technical Term), ක්‍රමලේඛන යෙදුමක් හෝ සංකල්පයක් මෙහි ඇතුළත් කර නිරවද්‍ය යුනිකෝඩ් සිංහල පාරිභාෂික පදය සහ අර්ථය ඉගෙන ගන්න.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Handle Term Analysis
  const handleAnalyzeTerm = async (termOverride?: string) => {
    const term = termOverride || termToAnalyze;
    if (!term.trim()) return;

    setAnalyzing(true);
    setAnalysisError(null);
    setSavedSuccess(false);

    try {
      const response = await fetch("/api/learn-term", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term,
          context: contextSentence,
          domain,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "Failed to analyze term with AI.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Save Analyzed Term to Dictionary
  const handleSaveTerm = () => {
    if (!analysisResult || !analysisResult.term) return;

    const newEntry: DictionaryEntry = {
      id: `ai-${Date.now()}`,
      term: analysisResult.term,
      sinhalaStandard: analysisResult.sinhalaStandard || analysisResult.term,
      sinhalaPhonetic: analysisResult.sinhalaPhonetic || analysisResult.term,
      singlish: analysisResult.singlish || "",
      partOfSpeech: analysisResult.partOfSpeech || "noun",
      category: analysisResult.category || domain,
      definitionSi: analysisResult.definitionSi || "",
      definitionEn: analysisResult.definitionEn || "",
      exampleEn: analysisResult.exampleEn || "",
      exampleSi: analysisResult.exampleSi || "",
      commonMistakes: analysisResult.commonMistakes || "",
      developerNotes: analysisResult.developerNotes || "",
      source: "ai-agent",
      createdAt: new Date().toISOString(),
      tags: analysisResult.tags || ["ai-learned"],
    };

    onSaveToDictionary(newEntry);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  // Check if term already in dictionary
  const isAlreadySaved = analysisResult?.term 
    ? savedDictionary.some(d => d.term.toLowerCase() === analysisResult.term?.toLowerCase())
    : false;

  // Handle Chat message
  const handleSendMessage = async (textOverride?: string) => {
    const text = textOverride || chatInput;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: chatMessages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!response.ok) throw new Error("Chat request failed");
      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        text: data.reply || "සමාවෙන්න, එම ගැටලුව විමර්ශනය කිරීමට නොහැකි විය.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          text: "AI සබඳතාවයේ දෝෂයක් ඇති විය. කරුණාකර මොහොතකින් නැවත උත්සාහ කරන්න.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Agent Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/60 border border-sky-900/50 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-100">
                  සිංහල AI පාරිභාෂික නියෝජිතයා (AI Lexicon Agent)
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                  Powered by Gemini
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Automatically learns cutting-edge technical terms, coins standardized Unicode Sinhala vocabulary, and saves directly to your Chrome Extension.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Synced Terms: <strong className="text-sky-300">{savedDictionary.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Term Coiner on Left, Interactive Consultation on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Term Coining and Deep Lexicography (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <BookPlus className="w-4 h-4 text-sky-400" />
                <span>Coin &amp; Learn Technical Term</span>
              </h2>
              <span className="text-[11px] text-slate-400">
                Official Dept. of Official Languages Alignment
              </span>
            </div>

            {/* Input form */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Technical Term or Concept (English / Jargon)
                </label>
                <div className="flex gap-2">
                  <input
                    id="input-learn-term"
                    type="text"
                    value={termToAnalyze}
                    onChange={(e) => setTermToAnalyze(e.target.value)}
                    placeholder="e.g. Retrieval-Augmented Generation, Kubernetes, Cold Start..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 outline-none"
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyzeTerm()}
                  />
                  <button
                    id="btn-trigger-term-analysis"
                    onClick={() => handleAnalyzeTerm()}
                    disabled={analyzing || !termToAnalyze.trim()}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    {analyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>Analyze</span>
                  </button>
                </div>
              </div>

              {/* Optional Context & Domain */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Context Sentence (Where did you see it on the web?)
                  </label>
                  <input
                    type="text"
                    value={contextSentence}
                    onChange={(e) => setContextSentence(e.target.value)}
                    placeholder="e.g. The Lambda function suffered high cold start latency..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Technical Domain
                  </label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none cursor-pointer"
                  >
                    <option value="AI & Computer Science">Artificial Intelligence &amp; LLMs</option>
                    <option value="Cloud, DevOps & Distributed Systems">Cloud &amp; DevOps</option>
                    <option value="Cybersecurity & Cryptography">Cybersecurity &amp; Crypto</option>
                    <option value="Web Development & Browsers">Web &amp; Frontend</option>
                    <option value="Database & Storage Architecture">Databases &amp; Systems</option>
                  </select>
                </div>
              </div>

              {/* Preset quick test terms */}
              <div className="pt-2">
                <span className="text-[11px] text-slate-500 font-medium block mb-1.5">
                  Popular tech words that break Google Translate:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_NEW_TECH_TERMS.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setTermToAnalyze(t);
                        handleAnalyzeTerm(t);
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-400 border border-slate-800/80 transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Analysis Result Card */}
            {analyzing ? (
              <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    AI Lexicographer formulating Sinhala terminology...
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Checking official glossaries, morphology, and phonetic readability
                  </p>
                </div>
              </div>
            ) : analysisError ? (
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Analysis Error: </span>
                  <span>{analysisError}</span>
                </div>
              </div>
            ) : analysisResult ? (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                
                {/* Header with Term & Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {analysisResult.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-100 mt-1">
                      {analysisResult.term}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Part of speech: <span className="text-slate-300">{analysisResult.partOfSpeech}</span>
                    </p>
                  </div>

                  <button
                    id="btn-save-to-custom-dict"
                    onClick={handleSaveTerm}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      savedSuccess || isAlreadySaved
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20"
                    }`}
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Saved to Extension &amp; Lexicon!</span>
                      </>
                    ) : isAlreadySaved ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>In Your Dictionary</span>
                      </>
                    ) : (
                      <>
                        <BookPlus className="w-3.5 h-3.5" />
                        <span>Add to Chrome Extension Dict</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Term Translations Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                      Standard Official Sinhala (නිල පාරිභාෂිකය)
                    </span>
                    <p className="text-base font-semibold text-sky-400">
                      {analysisResult.sinhalaStandard}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Recommended for documentation, research &amp; official textbooks
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                      Developer Phonetic Loan (ව්‍යවහාරික පදය)
                    </span>
                    <p className="text-base font-semibold text-slate-200">
                      {analysisResult.sinhalaPhonetic}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Singlish: <code className="text-sky-300">{analysisResult.singlish}</code>
                    </p>
                  </div>
                </div>

                {/* Definitions */}
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[11px] font-semibold text-slate-300 block mb-1">
                      සිංහල අර්ථ දැක්වීම (Sinhala Definition):
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {analysisResult.definitionSi}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                      English Definition:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {analysisResult.definitionEn}
                    </p>
                  </div>
                </div>

                {/* Practical Example Sentence */}
                <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-900/40 space-y-1.5">
                  <span className="text-[11px] font-semibold text-sky-300 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-sky-400" />
                    <span>Real-world Usage Sentence:</span>
                  </span>
                  <p className="text-xs text-slate-300">
                    <strong>EN:</strong> &quot;{analysisResult.exampleEn}&quot;
                  </p>
                  <p className="text-xs text-sky-200 font-medium">
                    <strong>SI:</strong> &quot;{analysisResult.exampleSi}&quot;
                  </p>
                </div>

                {/* Common Mistake Warning */}
                {analysisResult.commonMistakes && (
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-200">Google Translate Mistake to Avoid: </span>
                      <span>{analysisResult.commonMistakes}</span>
                    </div>
                  </div>
                )}

                {/* Developer Advice */}
                {analysisResult.developerNotes && (
                  <p className="text-[11px] text-slate-400 italic">
                    💡 <strong>Sri Lanka Tech Workplace Tip:</strong> {analysisResult.developerNotes}
                  </p>
                )}

              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800/80 text-center space-y-2 text-slate-500">
                <Layers className="w-8 h-8 mx-auto text-slate-700" />
                <p className="text-xs text-slate-400 font-medium">
                  Enter any complex English technical term above and click Analyze
                </p>
                <p className="text-[11px] text-slate-600 max-w-sm mx-auto">
                  The AI Agent analyzes official linguistic rules, morphological stems, and provides the exact Unicode Sinhala equivalent.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Consultation Chat with Agent Heli (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-sm h-[680px]">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-100">
                  හේලී (Heli) - Terminology Consultant
                </h3>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  AI Lexicographer Active
                </p>
              </div>
            </div>
            <span className="text-[10px] text-slate-500">Sinhala &amp; English</span>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            {chatMessages.map((msg) => {
              const isAi = msg.role === "assistant";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isAi ? "" : "flex-row-reverse"}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                    isAi 
                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" 
                      : "bg-slate-800 text-slate-300 border border-slate-700"
                  }`}>
                    {isAi ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  </div>

                  <div className={`rounded-2xl px-3.5 py-2.5 max-w-[85%] leading-relaxed ${
                    isAi
                      ? "bg-slate-950 border border-slate-800 text-slate-200"
                      : "bg-sky-600 text-white font-medium shadow-sm"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className={`block text-[9px] mt-1 ${isAi ? "text-slate-500" : "text-sky-200"}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {chatLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span>හේලී සිතමින් පවතී (Heli is thinking)...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Questions */}
          <div className="pt-2 pb-2 border-t border-slate-800/80 mt-2">
            <span className="text-[10px] text-slate-500 font-medium block mb-1">
              Ask Heli about tricky terms:
            </span>
            <div className="flex flex-wrap gap-1">
              {[
                "Why is 'Cloud Computing' translated as වළාකුළු පරිගණනය?",
                "How to say 'Microservices architecture' in Sinhala?",
                "What is the official Sinhala term for API?",
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-400 px-2 py-1 rounded-md border border-slate-800/80 text-left transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              id="input-ai-chat"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask Heli anything about Sinhala technical terms..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500"
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              id="btn-send-chat"
              onClick={() => handleSendMessage()}
              disabled={chatLoading || !chatInput.trim()}
              className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
