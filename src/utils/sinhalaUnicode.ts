/**
 * Accurate Singlish (Romanized Sinhala) to Unicode Sinhala Transliteration Engine
 * Adheres strictly to Sri Lanka standard Unicode range U+0D80–U+0DFF.
 *
 * Supports:
 * - Direct phonetic consonants & vowels
 * - Rakaransaya (ක්‍ර, ප්‍ර, ත්‍ර, etc.) via ZWJ (\u200D)
 * - Yansaya (ක්‍ය, ද්‍ය, ත්‍ය, etc.) via ZWJ (\u200D)
 * - Bandi Akuru & Hal Kireema (්)
 * - Sannaka consonants (ඳ, ඟ, ඹ, ඬ)
 * - Independent & Dependent vowels (පිල්ලම්)
 */

export const ZWJ = "\u200D";
export const HAL = "\u0DCA"; // ්

// Dependent vowel signs (පිල්ලම්) attached to consonants
export const VOWEL_SIGNS: Record<string, string> = {
  aae: "ෑ",
  aee: "ෑ",
  ae: "ැ",
  aa: "ා",
  Aa: "ෑ",
  A: "ා",
  a: "", // inherent vowel (no sign)
  ii: "ී",
  I: "ී",
  i: "ි",
  uu: "ූ",
  U: "ූ",
  u: "ු",
  ee: "ේ",
  E: "ේ",
  e: "ෙ",
  oo: "ෝ",
  O: "ෝ",
  o: "ො",
  au: "ෞ",
  ou: "ෞ",
  ai: "ෛ",
  ei: "ෛ",
  ruu: "ෲ",
  R: "ෘ",
};

// Independent vowels (තනි ස්වර)
export const INDEPENDENT_VOWELS: Record<string, string> = {
  aae: "ඈ",
  aee: "ඈ",
  ae: "ඇ",
  aa: "ආ",
  Aa: "ඈ",
  A: "ආ",
  a: "අ",
  ii: "ඊ",
  I: "ඊ",
  i: "ඉ",
  uu: "ඌ",
  U: "ඌ",
  u: "උ",
  ee: "ඒ",
  E: "ඒ",
  e: "එ",
  oo: "ඕ",
  O: "ඕ",
  o: "ඔ",
  au: "ඖ",
  ou: "ඖ",
  ai: "ඓ",
  ei: "ඓ",
  ruu: "ඎ",
  R: "ඍ",
};

// Consonants mapping
export const CONSONANTS: Record<string, string> = {
  // Sannaka (prenasalized)
  nvd: "ඳ",
  _d: "ඳ",
  nvg: "ඟ",
  _g: "ඟ",
  nvb: "ඹ",
  _b: "ඹ",
  nvD: "ඬ",
  _D: "ඬ",
  nvj: "ඦ",
  _j: "ඦ",

  // Multi-letter consonants
  th: "ත",
  Th: "ථ",
  dh: "ද",
  Dh: "ධ",
  sh: "ශ",
  Sh: "ෂ",
  ch: "ච",
  Ch: "ඡ",
  jh: "ඣ",
  ph: "ඵ",
  bh: "භ",
  kh: "ඛ",
  gh: "ඝ",
  kn: "ඥ",
  gn: "ඥ",
  nny: "ඤ",
  ng: "ඞ",

  // Single-letter consonants
  k: "ක",
  K: "ඛ",
  g: "ග",
  G: "ඝ",
  c: "ච",
  C: "ඡ",
  j: "ජ",
  J: "ඣ",
  t: "ට",
  T: "ඨ",
  d: "ද",
  D: "ඩ",
  n: "න",
  N: "ණ",
  p: "ප",
  P: "ඵ",
  b: "බ",
  B: "භ",
  m: "ම",
  y: "ය",
  r: "ර",
  l: "ල",
  L: "ළ",
  v: "ව",
  w: "ව",
  s: "ස",
  S: "ෂ",
  h: "හ",
  f: "ෆ",
};

// Consonant keys sorted by length descending so longer patterns match first
const CONSONANT_KEYS = Object.keys(CONSONANTS).sort((a, b) => b.length - a.length);

// Vowel sign keys sorted by length descending
const VOWEL_SIGN_KEYS = Object.keys(VOWEL_SIGNS).sort((a, b) => b.length - a.length);

// Independent vowel keys sorted by length descending
const IND_VOWEL_KEYS = Object.keys(INDEPENDENT_VOWELS).sort((a, b) => b.length - a.length);

/**
 * Transliterate Singlish into pure Unicode Sinhala
 */
export function transliterateSinglishToSinhala(input: string): string {
  if (!input) return "";

  let result = "";
  let i = 0;
  const len = input.length;

  while (i < len) {
    const sub = input.substring(i);

    // 1. Explicit Sri Lanka prefixes & conjuncts
    if (/^(shri|sri)/i.test(sub)) {
      const match = sub.match(/^(shri|sri)/i)![0];
      // Check if followed by ii/ee (ශ්‍රී) or short i (ශ්‍රි)
      const after = sub.substring(match.length);
      if (/^(ii|ee|I)/.test(after)) {
        result += "ශ්‍රී";
        i += match.length + (after.startsWith("ii") || after.startsWith("ee") ? 2 : 1);
        continue;
      } else {
        result += "ශ්‍රී";
        i += match.length;
        continue;
      }
    }

    // 2. Ksh conjunct (ක්ෂ)
    if (/^ksha/i.test(sub)) {
      result += "ක්ෂ";
      i += 4;
      continue;
    }
    if (/^ksh/i.test(sub)) {
      result += "ක්‍ෂ්";
      i += 3;
      continue;
    }

    // 3. Special Anusvaraya (ං) for x or _m or trailing ng
    if (sub.startsWith("x") || sub.startsWith("_m")) {
      result += "ං";
      i += sub.startsWith("_m") ? 2 : 1;
      continue;
    }

    // 4. Check for Consonant match
    let matchedConsonant: string | null = null;
    let consonantKey = "";

    for (const key of CONSONANT_KEYS) {
      if (sub.startsWith(key)) {
        matchedConsonant = CONSONANTS[key];
        consonantKey = key;
        break;
      }
    }

    if (matchedConsonant) {
      let idxAfterConsonant = i + consonantKey.length;
      const remAfterConsonant = input.substring(idxAfterConsonant);

      // Check for RAKARANSAYA (්‍ර): consonant + 'r' followed by a vowel or at end of cluster
      // e.g., kra -> ක්‍ර, kri -> ක්‍රි, kramaya -> ක්‍රමය, prashna -> ප්‍රශ්න
      if (remAfterConsonant.startsWith("r") && remAfterConsonant.length > 1 && !/^[0-9\s.,!?:;]/.test(remAfterConsonant[1])) {
        // Look for vowel after 'r'
        const afterR = remAfterConsonant.substring(1);
        let matchedVowelAfterR: string | null = null;
        let vKeyLen = 0;

        for (const vKey of VOWEL_SIGN_KEYS) {
          if (afterR.startsWith(vKey)) {
            matchedVowelAfterR = VOWEL_SIGNS[vKey];
            vKeyLen = vKey.length;
            break;
          }
        }

        if (matchedVowelAfterR !== null) {
          // Rakaransaya Unicode: Consonant + Hal + ZWJ + Ra + VowelSign
          result += matchedConsonant + HAL + ZWJ + "ර" + matchedVowelAfterR;
          i = idxAfterConsonant + 1 + vKeyLen;
          continue;
        } else {
          // 'r' followed by another consonant or hal
          result += matchedConsonant + HAL + ZWJ + "ර" + HAL;
          i = idxAfterConsonant + 1;
          continue;
        }
      }

      // Check for YANSAYA (්‍ය): consonant + 'y' followed by a vowel
      // e.g., kya -> ක්‍ය, dya -> ද්‍ය (widyaawa -> විද්‍යාව), tya -> ත්‍ය (sathya -> සත්‍ය)
      if (remAfterConsonant.startsWith("y") && remAfterConsonant.length > 1 && !/^[0-9\s.,!?:;]/.test(remAfterConsonant[1])) {
        const afterY = remAfterConsonant.substring(1);
        let matchedVowelAfterY: string | null = null;
        let vKeyLen = 0;

        for (const vKey of VOWEL_SIGN_KEYS) {
          if (afterY.startsWith(vKey)) {
            matchedVowelAfterY = VOWEL_SIGNS[vKey];
            vKeyLen = vKey.length;
            break;
          }
        }

        if (matchedVowelAfterY !== null) {
          // Yansaya Unicode: Consonant + Hal + ZWJ + Ya + VowelSign
          result += matchedConsonant + HAL + ZWJ + "ය" + matchedVowelAfterY;
          i = idxAfterConsonant + 1 + vKeyLen;
          continue;
        }
      }

      // Normal consonant followed by a vowel sign
      let matchedVowel: string | null = null;
      let vowelKeyLen = 0;

      for (const vKey of VOWEL_SIGN_KEYS) {
        if (remAfterConsonant.startsWith(vKey)) {
          matchedVowel = VOWEL_SIGNS[vKey];
          vowelKeyLen = vKey.length;
          break;
        }
      }

      if (matchedVowel !== null) {
        result += matchedConsonant + matchedVowel;
        i = idxAfterConsonant + vowelKeyLen;
      } else {
        // No vowel follows: consonant gets Hal Kireema (්)
        result += matchedConsonant + HAL;
        i = idxAfterConsonant;
      }
      continue;
    }

    // 5. Check for Independent Vowels (at beginning of word or after space/punctuation)
    let matchedIndVowel: string | null = null;
    let indVowelKeyLen = 0;

    for (const vKey of IND_VOWEL_KEYS) {
      if (sub.startsWith(vKey)) {
        matchedIndVowel = INDEPENDENT_VOWELS[vKey];
        indVowelKeyLen = vKey.length;
        break;
      }
    }

    if (matchedIndVowel) {
      result += matchedIndVowel;
      i += indVowelKeyLen;
      continue;
    }

    // 6. Any other characters (spaces, numbers, symbols, already Sinhala characters)
    result += input[i];
    i++;
  }

  return result;
}

export interface PhoneticKeyHint {
  key: string;
  char: string;
  example: string;
}

export const PHONETIC_KEYMAP_HINTS: PhoneticKeyHint[] = [
  { key: "a / aa", char: "අ / ආ", example: "amma -> අම්මා" },
  { key: "ae / aae", char: "ඇ / ඈ", example: "aepal -> ඇපල්" },
  { key: "i / ii", char: "ඉ / ඊ", example: "igena -> ඉගෙන" },
  { key: "u / uu", char: "උ / ඌ", example: "udaw -> උදව්" },
  { key: "e / ee", char: "එ / ඒ", example: "eka -> එක" },
  { key: "o / oo", char: "ඔ / ඕ", example: "onna -> ඔන්න" },
  { key: "k / g", char: "ක / ග", example: "kamak na -> කමක් නෑ" },
  { key: "th / dh", char: "ත / ද", example: "tharuwa -> තරුව" },
  { key: "d / D", char: "ද / ඩ", example: "dawasak -> දවසක්" },
  { key: "t / T", char: "ට / ඨ", example: "tika -> ටික" },
  { key: "sh / Sh", char: "ශ / ෂ", example: "shabdaya -> ශබ්දය" },
  { key: "sri", char: "ශ්‍රී", example: "sri lanka -> ශ්‍රී ලංකා" },
  { key: "kra / tra", char: "ක්‍ර / ත්‍ර", example: "kramaya -> ක්‍රමය" },
  { key: "dya", char: "ද්‍ය", example: "widyaawa -> විද්‍යාව" },
  { key: "ksha", char: "ක්ෂ", example: "kshanika -> ක්ෂණික" },
  { key: "nd", char: "න්ද", example: "sindu -> සින්දු" },
  { key: "_d / nvd", char: "ඳ", example: "_d -> ඳ (සඤ්ඤක)" },
  { key: "x / _m", char: "ං", example: "sinhadweepa -> සිංහ..." },
];
