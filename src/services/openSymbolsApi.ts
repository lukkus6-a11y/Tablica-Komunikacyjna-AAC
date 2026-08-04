import { Pictogram, FitzgeraldCategory } from '../types';

export interface OpenSymbolItem {
  id: number;
  name: string;
  image_url: string;
  repo_key?: string;
  symbol_key?: string;
}

/**
  Infers Fitzgerald Category for search results
 */
function inferCategory(word: string): FitzgeraldCategory {
  const lower = word.toLowerCase().trim();
  if (['ja', 'ty', 'mama', 'tata', 'pan', 'pani', 'kolega', 'nauczyciel', 'dziecko', 'pies', 'kot'].includes(lower)) {
    return 'pronoun';
  }
  if (['chcę', 'chcieć', 'lubię', 'lubić', 'iść', 'jeść', 'pić', 'mieć', 'być', 'pisać', 'czytać', 'bawić', 'patrzeć', 'biegać'].some(v => lower.includes(v))) {
    return 'verb';
  }
  if (['nie', 'stop', 'pomoc', 'boli', 'zakaz', 'uwaga', 'koniec'].includes(lower)) {
    return 'negation';
  }
  if (['proszę', 'dziękuję', 'przepraszam', 'cześć', 'witaj', 'dobranoc', 'tak'].includes(lower)) {
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

const openSymbolsCache = new Map<string, Pictogram[]>();

/**
 * Searches Open Symbols API (https://www.opensymbols.org/api/v2/symbols?q=...)
 */
export async function searchOpenSymbols(query: string): Promise<Pictogram[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  if (openSymbolsCache.has(trimmed)) {
    return openSymbolsCache.get(trimmed)!;
  }

  try {
    const url = `https://www.opensymbols.org/api/v2/symbols?q=${encodeURIComponent(trimmed)}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Open Symbols HTTP error ${response.status}`);
    }

    const data: OpenSymbolItem[] = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    const results: Pictogram[] = data
      .filter((item) => item.image_url)
      .slice(0, 12)
      .map((item, idx) => ({
        id: 900000 + (item.id || idx),
        word: trimmed,
        category: inferCategory(trimmed),
        customImageUrl: item.image_url,
        isCustom: true,
        tags: [item.name, 'opensymbols']
      }));

    openSymbolsCache.set(trimmed, results);
    return results;
  } catch (err) {
    console.warn('Open Symbols API error:', err);
    return [];
  }
}
