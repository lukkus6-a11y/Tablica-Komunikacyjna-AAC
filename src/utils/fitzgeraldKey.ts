import { FitzgeraldCategory } from '../types';

export const FITZGERALD_CONFIG: Record<
  FitzgeraldCategory,
  {
    name: string;
    bgClass: string;
    borderClass: string;
    badgeBgClass: string;
    textClass: string;
    highContrastBg: string;
    hexColor: string;
  }
> = {
  pronoun: {
    name: 'Osoby / Zaimki',
    bgClass: 'bg-amber-50 hover:bg-amber-100/90 active:bg-amber-200',
    borderClass: 'border-amber-400',
    badgeBgClass: 'bg-amber-400 text-amber-950',
    textClass: 'text-amber-950',
    highContrastBg: 'bg-yellow-300 text-black border-4 border-black',
    hexColor: '#f59e0b',
  },
  verb: {
    name: 'Czasowniki / Akcje',
    bgClass: 'bg-emerald-50 hover:bg-emerald-100/90 active:bg-emerald-200',
    borderClass: 'border-emerald-500',
    badgeBgClass: 'bg-emerald-500 text-white',
    textClass: 'text-emerald-950',
    highContrastBg: 'bg-green-400 text-black border-4 border-black',
    hexColor: '#10b981',
  },
  noun: {
    name: 'Rzeczowniki / Przedmioty',
    bgClass: 'bg-orange-50 hover:bg-orange-100/90 active:bg-orange-200',
    borderClass: 'border-orange-400',
    badgeBgClass: 'bg-orange-400 text-orange-950',
    textClass: 'text-orange-950',
    highContrastBg: 'bg-orange-300 text-black border-4 border-black',
    hexColor: '#f97316',
  },
  descriptor: {
    name: 'Opisy / Przymiotniki',
    bgClass: 'bg-sky-50 hover:bg-sky-100/90 active:bg-sky-200',
    borderClass: 'border-sky-400',
    badgeBgClass: 'bg-sky-400 text-sky-950',
    textClass: 'text-sky-950',
    highContrastBg: 'bg-cyan-300 text-black border-4 border-black',
    hexColor: '#0ea5e9',
  },
  social: {
    name: 'Zwroty grzecznościowe',
    bgClass: 'bg-pink-50 hover:bg-pink-100/90 active:bg-pink-200',
    borderClass: 'border-pink-400',
    badgeBgClass: 'bg-pink-400 text-pink-950',
    textClass: 'text-pink-950',
    highContrastBg: 'bg-pink-300 text-black border-4 border-black',
    hexColor: '#ec4899',
  },
  question: {
    name: 'Pytania / Miejsca',
    bgClass: 'bg-purple-50 hover:bg-purple-100/90 active:bg-purple-200',
    borderClass: 'border-purple-400',
    badgeBgClass: 'bg-purple-400 text-purple-950',
    textClass: 'text-purple-950',
    highContrastBg: 'bg-purple-300 text-black border-4 border-black',
    hexColor: '#a855f7',
  },
  negation: {
    name: 'Przeczenie / Ostrzeżenie',
    bgClass: 'bg-rose-50 hover:bg-rose-100/90 active:bg-rose-200',
    borderClass: 'border-rose-500',
    badgeBgClass: 'bg-rose-500 text-white',
    textClass: 'text-rose-950',
    highContrastBg: 'bg-red-400 text-black border-4 border-black',
    hexColor: '#ef4444',
  },
};

/**
 * Helpers to construct static & API ARASAC image URLs with fallback strategies
 */
export function getArasacImageUrl(id: number): string {
  if (!id) return '';
  return `https://static.arasaac.org/pictograms/${id}/${id}.svg`;
}

export function getArasacFallbackImageUrl(id: number): string {
  if (!id) return '';
  return `https://static.arasaac.org/pictograms/${id}/${id}_500.png`;
}

export function getArasacApiImageUrl(id: number): string {
  if (!id) return '';
  return `https://static.arasaac.org/pictograms/${id}/${id}_300.png`;
}
