/**
 * Sri Lanka Standard SLS 1134:2004 Wijesekara Keyboard Layout
 * and Phonetic Quick-Insert Groups for Virtual Keyboard
 */

export interface VirtualKey {
  code: string;
  normal: string;
  shift: string;
  label?: string;
  width?: string;
  isModifier?: boolean;
}

// Wijesekara 4-row keyboard layout
export const WIJESEKARA_ROWS: VirtualKey[][] = [
  // Row 1 (Numbers / Symbols)
  [
    { code: "Backquote", normal: "`", shift: "~" },
    { code: "Digit1", normal: "1", shift: "!" },
    { code: "Digit2", normal: "2", shift: "@" },
    { code: "Digit3", normal: "3", shift: "#" },
    { code: "Digit4", normal: "4", shift: "$" },
    { code: "Digit5", normal: "5", shift: "%" },
    { code: "Digit6", normal: "6", shift: "^" },
    { code: "Digit7", normal: "7", shift: "&" },
    { code: "Digit8", normal: "8", shift: "*" },
    { code: "Digit9", normal: "9", shift: "(" },
    { code: "Digit0", normal: "0", shift: ")" },
    { code: "Minus", normal: "-", shift: "_" },
    { code: "Equal", normal: "=", shift: "+" },
    { code: "Backspace", normal: "Backspace", shift: "Backspace", label: "⌫ Del", width: "w-16 sm:w-20", isModifier: true },
  ],
  // Row 2 (QWERTY)
  [
    { code: "KeyQ", normal: "ෑ", shift: "ෞ" },
    { code: "KeyW", normal: "අ", shift: "උ" },
    { code: "KeyE", normal: "ැ", shift: "ඓ" },
    { code: "KeyR", normal: "ර", shift: "්‍ර" }, // Rakaransaya
    { code: "KeyT", normal: "එ", shift: "ඔ" },
    { code: "KeyY", normal: "හ", shift: "ශ" },
    { code: "KeyU", normal: "ම", shift: "ඹ" },
    { code: "KeyI", normal: "ස", shift: "ෂ" },
    { code: "KeyO", normal: "ද", shift: "ධ" },
    { code: "KeyP", normal: "ච", shift: "ඡ" },
    { code: "BracketLeft", normal: "ඤ", shift: "ඥ" },
    { code: "BracketRight", normal: ";", shift: ":" },
    { code: "Backslash", normal: "\\", shift: "|" },
  ],
  // Row 3 (ASDF)
  [
    { code: "KeyA", normal: "්", shift: "ෟ" }, // Hal kireema / Gayanukitta
    { code: "KeyS", normal: "ි", shift: "ී" },
    { code: "KeyD", normal: "ා", shift: "ෘ" },
    { code: "KeyF", normal: "ෙ", shift: "ේ" },
    { code: "KeyG", normal: "ට", shift: "ඨ" },
    { code: "KeyH", normal: "ය", shift: "්‍ය" }, // Yansaya
    { code: "KeyJ", normal: "ව", shift: "ෆ" },
    { code: "KeyK", normal: "න", shift: "ණ" },
    { code: "KeyL", normal: "ක", shift: "ඛ" },
    { code: "Semicolon", normal: "ත", shift: "ථ" },
    { code: "Quote", normal: "ල", shift: "ළ" },
    { code: "Enter", normal: "Enter", shift: "Enter", label: "↵ Enter", width: "w-16 sm:w-20", isModifier: true },
  ],
  // Row 4 (ZXCV)
  [
    { code: "ShiftLeft", normal: "Shift", shift: "Shift", label: "⇧ Shift", width: "w-14 sm:w-16", isModifier: true },
    { code: "KeyZ", normal: "ූ", shift: "ර්‍" }, // Diga paapilla / Repaya
    { code: "KeyX", normal: "ං", shift: "ඃ" }, // Anusvaraya / Visargaya
    { code: "KeyC", normal: "ජ", shift: "ඣ" },
    { code: "KeyV", normal: "ප", shift: "ඵ" },
    { code: "KeyB", normal: "ඉ", shift: "ඊ" },
    { code: "KeyN", normal: "බ", shift: "භ" },
    { code: "KeyM", normal: "ග", shift: "ඝ" },
    { code: "Comma", normal: "ල", shift: "ළ" },
    { code: "Period", normal: ".", shift: ">" },
    { code: "Slash", normal: "/", shift: "?" },
    { code: "ShiftRight", normal: "Shift", shift: "Shift", label: "⇧ Shift", width: "w-14 sm:w-16", isModifier: true },
  ],
  // Row 5 (Space)
  [
    { code: "Space", normal: " ", shift: " ", label: "Space (හිස්තැන)", width: "w-64 sm:w-80", isModifier: true },
  ],
];

// Look up Wijesekara character by physical key event
export function getWijesekaraChar(key: string, isShift: boolean): string | null {
  for (const row of WIJESEKARA_ROWS) {
    for (const k of row) {
      // Check if key matches code or normal letter
      if (k.normal.toLowerCase() === key.toLowerCase() || (k.code && k.code.toLowerCase().endsWith(key.toLowerCase()))) {
        if (k.isModifier) return null;
        return isShift ? k.shift : k.normal;
      }
    }
  }
  return null;
}

// Categorized Sinhala characters for phonetic click-to-type palettes
export const SINHALA_CHAR_PALETTE = {
  vowels: [
    { char: "අ", roman: "a" },
    { char: "ආ", roman: "aa" },
    { char: "ඇ", roman: "ae" },
    { char: "ඈ", roman: "aae" },
    { char: "ඉ", roman: "i" },
    { char: "ඊ", roman: "ii" },
    { char: "උ", roman: "u" },
    { char: "ඌ", roman: "uu" },
    { char: "එ", roman: "e" },
    { char: "ඒ", roman: "ee" },
    { char: "ඓ", roman: "ai" },
    { char: "ඔ", roman: "o" },
    { char: "ඕ", roman: "oo" },
    { char: "ඖ", roman: "au" },
    { char: "ඍ", roman: "R" },
  ],
  pillam: [
    { char: "්", name: "හල් කිරීම (Hal)" },
    { char: "ා", name: "ඇලපිල්ල (aa)" },
    { char: "ැ", name: "ඇදපිල්ල (ae)" },
    { char: "ෑ", name: "දිග ඇදපිල්ල (aae)" },
    { char: "ි", name: "ඉස්පිල්ල (i)" },
    { char: "ී", name: "දිග ඉස්පිල්ල (ii)" },
    { char: "ු", name: "පාපිල්ල (u)" },
    { char: "ූ", name: "දිග පාපිල්ල (uu)" },
    { char: "ෙ", name: "කොම්බුව (e)" },
    { char: "ේ", name: "දිග කොම්බුව (ee)" },
    { char: "ෛ", name: "කොම්බු දෙක (ai)" },
    { char: "ො", name: "කොම්බුව හා ඇලපිල්ල (o)" },
    { char: "ෝ", name: "කොම්බුව හා දිග ඇලපිල්ල (oo)" },
    { char: "ෞ", name: "ගයනුකිත්ත (au)" },
    { char: "ෘ", name: "ගැටපිල්ල (R)" },
  ],
  consonants: [
    { char: "ක", roman: "k" },
    { char: "ඛ", roman: "K" },
    { char: "ග", roman: "g" },
    { char: "ඝ", roman: "G" },
    { char: "ඞ", roman: "ng" },
    { char: "ඟ", roman: "_g" },
    { char: "ච", roman: "ch" },
    { char: "ඡ", roman: "Ch" },
    { char: "ජ", roman: "j" },
    { char: "ඣ", roman: "J" },
    { char: "ඤ", roman: "kn" },
    { char: "ඥ", roman: "gn" },
    { char: "ට", roman: "t" },
    { char: "ඨ", roman: "T" },
    { char: "ඩ", roman: "D" },
    { char: "ඪ", roman: "Dh" },
    { char: "ණ", roman: "N" },
    { char: "ඬ", roman: "_D" },
    { char: "ත", roman: "th" },
    { char: "ථ", roman: "Th" },
    { char: "ද", roman: "d" },
    { char: "ධ", roman: "dh" },
    { char: "න", roman: "n" },
    { char: "ඳ", roman: "_d" },
    { char: "ප", roman: "p" },
    { char: "ඵ", roman: "P" },
    { char: "බ", roman: "b" },
    { char: "භ", roman: "B" },
    { char: "ම", roman: "m" },
    { char: "ඹ", roman: "_b" },
    { char: "ය", roman: "y" },
    { char: "ර", roman: "r" },
    { char: "ල", roman: "l" },
    { char: "ව", roman: "v/w" },
    { char: "ශ", roman: "sh" },
    { char: "ෂ", roman: "Sh" },
    { char: "ස", roman: "s" },
    { char: "හ", roman: "h" },
    { char: "ළ", roman: "L" },
    { char: "ෆ", roman: "f" },
  ],
  conjuncts: [
    { char: "්‍ර", name: "රකාරාංශය (Rakaransaya)", roman: "kra, tra, pra..." },
    { char: "්‍ය", name: "යංසය (Yansaya)", roman: "kya, dya, vya..." },
    { char: "ර්‍", name: "රේපය (Repaya)", roman: "rma..." },
    { char: "න්ද", name: "බැඳි අකුරු (nd)", roman: "sindu, banda" },
    { char: "ක්ෂ", name: "ක්ෂ (ksha)", roman: "kshanika" },
    { char: "ශ්‍රී", name: "ශ්‍රී (shri)", roman: "sri lanka" },
    { char: "ං", name: "අනුස්වාරය (Anusvaraya)", roman: "x, _m" },
    { char: "ඃ", name: "විසර්ගය (Visargaya)", roman: "X" },
  ],
};
