import { Pictogram } from '../types';

/**
 * Explicit, verified Core Vocabulary items for AAC (Słownictwo Rdzenne).
 * Uses static verified ARASAC Pictogram IDs for 100% reliability without API search calls.
 */
export const CORE_VOCABULARY: Pictogram[] = [
  { id: 6632, word: 'Ja', category: 'pronoun', tags: ['Osoby', 'zaimek'] },
  { id: 11538, word: 'Chcę', category: 'verb', tags: ['Czasowniki', 'chcieć'] },
  { id: 5526, word: 'Nie', category: 'negation', tags: ['Przeczenie', 'odmowa'] },
  { id: 37826, word: 'Lubię', category: 'verb', tags: ['Czasowniki', 'lubić'] },
  { id: 7095, word: 'To', category: 'descriptor', tags: ['Inne', 'wskazanie'] },
  { id: 7196, word: 'Stop', category: 'negation', tags: ['Przeczenie', 'zatrzymaj'] },
  { id: 3220, word: 'Więcej', category: 'descriptor', tags: ['Inne', 'ilość'] },
  { id: 7764, word: 'Gdzie', category: 'question', tags: ['Pytania', 'miejsce'] },
  { id: 12252, word: 'Pomoc', category: 'negation', tags: ['Przeczenie', 'wsparcie'] },
  { id: 5358, word: 'Koniec', category: 'negation', tags: ['Przeczenie', 'gotowe'] },
  { id: 5584, word: 'Tak', category: 'social', tags: ['Społeczne', 'zgoda'] },
  { id: 8195, word: 'Proszę', category: 'social', tags: ['Społeczne', 'grzeczność'] },
  { id: 8129, word: 'Dziękuję', category: 'social', tags: ['Społeczne', 'wdzięczność'] },
  { id: 6456, word: 'Jeść', category: 'verb', tags: ['Czasowniki', 'jedzenie'] },
  { id: 6061, word: 'Pić', category: 'verb', tags: ['Czasowniki', 'napój'] },
  { id: 8142, word: 'Iść', category: 'verb', tags: ['Czasowniki', 'ruch'] },
  { id: 6912, word: 'Toaleta', category: 'noun', tags: ['Rzeczowniki', 'łazienka'] },
];


