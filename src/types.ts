export interface TechnicalTerm {
  english: string;
  sinhalaStandard: string;
  sinhalaPhonetic: string;
  explanation: string;
}

export interface TranslationResult {
  translatedText: string;
  sourceLanguageDetected: string;
  technicalTerms: TechnicalTerm[];
  translationRationale: string;
  alternativePhrasings?: string[];
}

export interface DictionaryEntry {
  id: string;
  term: string;
  sinhalaStandard: string;
  sinhalaPhonetic: string;
  singlish: string;
  partOfSpeech: string;
  category: string;
  definitionSi: string;
  definitionEn: string;
  exampleEn: string;
  exampleSi: string;
  commonMistakes?: string;
  developerNotes?: string;
  source: 'official' | 'ai-agent' | 'community';
  createdAt: string;
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  termAnalysis?: Partial<DictionaryEntry>;
}

export interface ExtensionSettings {
  autoTranslateTechnicalTerms: boolean;
  showFloatingIconOnSelect: boolean;
  preferredTone: 'technical' | 'natural' | 'formal';
  targetDomain: string;
  hotkeyEnabled: boolean;
  syncWithAIDictionary: boolean;
}

export interface SiteParagraph {
  en: string;
  si: string;
  isCode?: boolean;
}

export interface SiteSection {
  id: string;
  headingEn?: string;
  headingSi?: string;
  paragraphs: SiteParagraph[];
}

export interface SiteGlossaryTerm {
  english: string;
  sinhalaStandard: string;
  sinhalaPhonetic: string;
  googleTranslateMistake: string;
  whyWrong: string;
  explanation: string;
}

export interface SiteTranslationResult {
  siteTitle: string;
  siteTitleSi: string;
  url: string;
  summarySi: string;
  sections: SiteSection[];
  technicalGlossary: SiteGlossaryTerm[];
  stats: {
    wordCount: number;
    termsCount: number;
    readingTimeMinutes: number;
    accuracyScore: number;
  };
}

export type ActiveTab = 'translator' | 'site-translator' | 'simulator' | 'dictionary' | 'ai-agent' | 'singlish' | 'extension-export';
