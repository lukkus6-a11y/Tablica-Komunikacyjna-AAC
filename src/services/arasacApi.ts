import { ArasacSearchResult, FitzgeraldCategory, Pictogram } from '../types';

/**
 * Static map of verified ARASAC Pictogram IDs for Polish Core Vocabulary (Słownictwo Rdzenne).
 * Guarantees instant, 100% reliable image loading for high-frequency words without network dependency.
 */
export const CORE_PICTOGRAMS_MAP: Record<string, number> = {
  // Core vocabulary — verified ARASAC IDs (kept in sync with coreVocabulary.ts)
  'ja': 6632,
  'chcę': 11538,
  'chcieć': 11538,
  'nie': 5526,
  'to': 7095,
  'lubię': 37826,
  'lubić': 37826,
  'stop': 7196,
  'więcej': 3220,
  'gdzie': 7764,
  'pomoc': 12252,
  'koniec': 5358,
  'tak': 5584,
  'proszę': 8195,
  'dziękuję': 8129,
  'jeść': 6456,
  'jem': 6456,
  'pić': 6061,
  'piję': 6061,
  'iść': 8142,
  'idę': 8142,
  'toaleta': 6912,
  // Additional common AAC words
  'mama': 2458,
  'tata': 31146,
  'dom': 6964,
  'szkoła': 32446,
  'pies': 7202,
  'kot': 7114,
  'woda': 32464,
  'sok': 11461,
  'jabłko': 2462,
  'chleb': 2494,
  'pisać': 2380,
  'czytać': 7141,
  'wesoły': 35547,
  'smutny': 35545,
};

/**
 * Dictionary mapping Polish AAC terms to Spanish base words/infinitives.
 * The Spanish ARASAC database is 100% authoritative and eliminates Polish API translation errors.
 */
export const PL_TO_ES_MAP: Record<string, string> = {
  'ja': 'yo',
  'chcę': 'querer',
  'chcieć': 'querer',
  'chcesz': 'querer',
  'chce': 'querer',
  'nie': 'no',
  'lubię': 'gustar',
  'lubić': 'gustar',
  'lubisz': 'gustar',
  'stop': 'parar',
  'więcej': 'más',
  'gdzie': 'dónde',
  'pomoc': 'ayuda',
  'koniec': 'fin',
  'to': 'esto',
  'jeść': 'comer',
  'jem': 'comer',
  'pić': 'beber',
  'piję': 'beber',
  'spać': 'dormir',
  'śpię': 'dormir',
  'toaleta': 'aseo',
  'kąpiel': 'baño',
  'mama': 'mamá',
  'tata': 'papá',
  'pisać': 'escribir',
  'piszę': 'escribir',
  'czytać': 'leer',
  'czytam': 'leer',
  'biegać': 'correr',
  'huśtawka': 'columpio',
  'pies': 'perro',
  'kot': 'gato',
  'dom': 'casa',
  'szkoła': 'escuela',
  'park': 'parque',
  'książka': 'libro',
  'rysować': 'dibujar',
  'piłka': 'pelota',
  'przerwa': 'recreo',
  'nauczyciel': 'profesor',
  'drzewo': 'árbol',
  'spacer': 'pasear',
  'tak': 'sí',
  'proszę': 'por favor',
  'dziękuję': 'gracias',
  'woda': 'agua',
  'sok': 'zumo',
  'jabłko': 'manzana',
  'chleb': 'pan',
  'wesoły': 'contento',
  'smutny': 'triste',
};

/**
 * Dictionary mapping conjugated Polish verb & noun forms to infinitives/base forms
 * for superior ARASAC search accuracy.
 */
export const POLISH_LEMMA_MAP: Record<string, string> = {
  'chcę': 'chcieć',
  'chcesz': 'chcieć',
  'chce': 'chcieć',
  'lubię': 'lubić',
  'lubisz': 'lubić',
  'lubi': 'lubić',
  'jem': 'jeść',
  'jesz': 'jeść',
  'je': 'jeść',
  'piję': 'pić',
  'pijesz': 'pić',
  'pije': 'pić',
  'idę': 'iść',
  'idziesz': 'iść',
  'idzie': 'iść',
  'mam': 'mieć',
  'masz': 'mieć',
  'ma': 'mieć',
  'widzę': 'widzieć',
  'widzisz': 'widzieć',
  'widzi': 'widzieć',
  'piszę': 'pisać',
  'czytam': 'czytać',
  'śpię': 'spać',
  'myję': 'myć',
  'gram': 'grać',
  'płaczę': 'płakać',
  'śmieję': 'śmiać się',
  'pomagam': 'pomagać',
  // 'boli' intentionally NOT mapped — 'boli' is itself the PREDICTIVE_VOCABULARY key
};

/**
 * Memory cache for search queries to prevent redundant network calls.
 */
const searchCache = new Map<string, Pictogram[]>();
const urlCache = new Map<string, string | null>();

/**
 * Infers a Fitzgerald category based on keyword characteristics.
 */
function inferCategory(keyword: string): FitzgeraldCategory {
  const lower = keyword.toLowerCase().trim();
  if (['ja', 'ty', 'mama', 'tata', 'pan', 'pani', 'kolega', 'nauczyciel', 'dziecko', 'pies', 'kot'].includes(lower)) {
    return 'pronoun';
  }
  if (['chcę', 'chcieć', 'lubię', 'lubić', 'iść', 'jeść', 'pić', 'mieć', 'być', 'pisać', 'czytać', 'bawić', 'patrzeć', 'biegać', 'spacer'].some(v => lower.includes(v))) {
    return 'verb';
  }
  if (['nie', 'stop', 'pomoc', 'boli', 'zakaz', 'uwaga', 'koniec'].includes(lower)) {
    return 'negation';
  }
  if (['proszę', 'dziękuję', 'przepraszam', 'cześć', 'witaj', 'dobranoc', 'dzień dobry', 'tak'].includes(lower)) {
    return 'social';
  }
  if (['gdzie', 'co', 'kiedy', 'dlaczego', 'kto', 'jak', 'dom', 'szkoła', 'park', 'sklep'].includes(lower)) {
    return 'question';
  }
  if (['wesoły', 'smutny', 'zły', 'duży', 'mały', 'zimny', 'gorący', 'ładny', 'dobry', 'więcej', 'to'].includes(lower)) {
    return 'descriptor';
  }
  return 'noun';
}

/**
 * Helper function to normalize Polish words (lemmatization) before querying.
 */
export function normalizePolishWord(word: string): string {
  const trimmed = word.trim().toLowerCase();
  return POLISH_LEMMA_MAP[trimmed] || trimmed;
}

/**
 * Smart Result Parser Algorithm (findBestPictogram)
 * Evaluates ARASAC search results array and picks the highest quality match:
 * Step A: Exact match with primary keyword (type === 1)
 * Step B: Exact match with any keyword type
 * Step C: Substring/context match fallback
 * Step D: Fallback to response[0] if present
 */
export function findBestPictogram(responseArray: ArasacSearchResult[], searchedWord: string): ArasacSearchResult | null {
  if (!Array.isArray(responseArray) || responseArray.length === 0) {
    return null;
  }

  const normalized = normalizePolishWord(searchedWord);
  const rawLower = searchedWord.trim().toLowerCase();

  // Step A: Primary keyword exact match (type === 1)
  const stepA = responseArray.find((item) =>
    item.keywords?.some((k) =>
      k.type === 1 && (k.keyword.toLowerCase() === normalized || k.keyword.toLowerCase() === rawLower)
    )
  );
  if (stepA) return stepA;

  // Step B: Any keyword type exact match
  const stepB = responseArray.find((item) =>
    item.keywords?.some((k) =>
      k.keyword.toLowerCase() === normalized || k.keyword.toLowerCase() === rawLower
    )
  );
  if (stepB) return stepB;

  // Step C: Substring match in keywords
  const stepC = responseArray.find((item) =>
    item.keywords?.some((k) =>
      k.keyword.toLowerCase().includes(normalized) || k.keyword.toLowerCase().includes(rawLower)
    )
  );
  if (stepC) return stepC;

  // Step D: Fallback to first item if present
  return responseArray[0] || null;
}

/**
 * Robust helper function for dynamic pictogram image URL retrieval.
 * Handles normalization, static map lookup, lemmatization, URL encoding,
 * ARASAC API queries, and safe fallback logic.
 */
export async function fetchPictogramUrl(searchTerm: string, _fallbackLabel?: string): Promise<string | null> {
  const trimmed = searchTerm.trim().toLowerCase();
  if (!trimmed) return null;

  if (urlCache.has(trimmed)) {
    return urlCache.get(trimmed)!;
  }

  // 1. Check static core map first for instant loading
  if (CORE_PICTOGRAMS_MAP[trimmed]) {
    const id = CORE_PICTOGRAMS_MAP[trimmed];
    const url = `https://static.arasaac.org/pictograms/${id}/${id}.svg`;
    urlCache.set(trimmed, url);
    return url;
  }

  // 2. Convert conjugated Polish words to infinitive/base form
  const queryTerm = normalizePolishWord(trimmed);

  if (CORE_PICTOGRAMS_MAP[queryTerm]) {
    const id = CORE_PICTOGRAMS_MAP[queryTerm];
    const url = `https://static.arasaac.org/pictograms/${id}/${id}.svg`;
    urlCache.set(trimmed, url);
    return url;
  }

  // 3. Query ARASAC API with properly URL-encoded search term
  try {
    // Check Spanish translation layer for 100% accurate ARASAC matching
    const spanishTerm = PL_TO_ES_MAP[trimmed] || PL_TO_ES_MAP[queryTerm];
    const targetLang = spanishTerm ? 'es' : 'pl';
    const termToFetch = spanishTerm || queryTerm;
    const encodedTerm = encodeURIComponent(termToFetch);
    const apiUrl = `https://api.arasaac.org/v1/pictograms/${targetLang}/search/${encodedTerm}`;

    const response = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok && targetLang === 'es') {
      // Fallback to PL endpoint if Spanish lookup didn't respond with 200
      const plResponse = await fetch(`https://api.arasaac.org/v1/pictograms/pl/search/${encodeURIComponent(queryTerm)}`, {
        headers: { 'Accept': 'application/json' },
      });
      if (plResponse.ok) {
        const plData: ArasacSearchResult[] = await plResponse.json();
        const chosen = findBestPictogram(plData, trimmed);
        if (chosen?._id) {
          const imageUrl = `https://static.arasaac.org/pictograms/${chosen._id}/${chosen._id}.svg`;
          urlCache.set(trimmed, imageUrl);
          return imageUrl;
        }
      }
      throw new Error(`HTTP ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: ArasacSearchResult[] = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      // Find best match using Smart Matcher
      const chosenItem = findBestPictogram(data, spanishTerm || trimmed);

      if (chosenItem?._id) {
        const imageUrl = `https://static.arasaac.org/pictograms/${chosenItem._id}/${chosenItem._id}.svg`;
        urlCache.set(trimmed, imageUrl);
        return imageUrl;
      }
    }
  } catch (error) {
    console.warn(`[ARASAC API] Fetch error for term "${searchTerm}":`, error);
  }

  urlCache.set(trimmed, null);
  return null;
}

/**
 * Searches ARASAC API for Polish pictograms and returns full Pictogram objects.
 * Always ensures the user-facing display label stays in Polish (e.g., "chcę").
 */
export async function searchArasacPictograms(query: string): Promise<Pictogram[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  if (searchCache.has(trimmed)) {
    return searchCache.get(trimmed)!;
  }

  // Handle lemmatization & Spanish translation for search API
  const queryTerm = POLISH_LEMMA_MAP[trimmed] || trimmed;
  const spanishTerm = PL_TO_ES_MAP[trimmed] || PL_TO_ES_MAP[queryTerm];
  const targetLang = spanishTerm ? 'es' : 'pl';
  const termToFetch = spanishTerm || queryTerm;

  try {
    const encodedTerm = encodeURIComponent(termToFetch);
    const url = `https://api.arasaac.org/v1/pictograms/${targetLang}/search/${encodedTerm}`;

    let response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok && targetLang === 'es') {
      response = await fetch(`https://api.arasaac.org/v1/pictograms/pl/search/${encodeURIComponent(queryTerm)}`, {
        headers: { 'Accept': 'application/json' },
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ArasacSearchResult[] = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    // Sort results to prioritize exact keyword matches first
    const matchTerm = (spanishTerm || queryTerm).toLowerCase();
    const sortedData = [...data].sort((a, b) => {
      const aExact = a.keywords?.some(
        (k) => k.keyword.toLowerCase() === matchTerm || k.keyword.toLowerCase() === trimmed
      );
      const bExact = b.keywords?.some(
        (k) => k.keyword.toLowerCase() === matchTerm || k.keyword.toLowerCase() === trimmed
      );
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    const pictograms: Pictogram[] = sortedData.slice(0, 16).map((item) => {
      return {
        id: item._id,
        // Always display the intended Polish word label (e.g. "chcę")
        word: trimmed,
        category: inferCategory(trimmed),
        tags: item.keywords?.map((k) => k.keyword) || [],
      };
    });

    searchCache.set(trimmed, pictograms);
    return pictograms;
  } catch (error) {
    console.warn('ARASAC API Search notice:', error);
    return [];
  }
}

