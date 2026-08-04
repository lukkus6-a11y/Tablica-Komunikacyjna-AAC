export type FitzgeraldCategory = 
  | 'pronoun'      // Osoby / Zaimki (żółty / gold)
  | 'verb'         // Czasowniki / Akcje (zielony / green)
  | 'noun'         // Rzeczowniki / Przedmioty (pomarańczowy / orange)
  | 'descriptor'   // Przymiotniki / Opisy (niebieski / blue)
  | 'social'       // Zwroty grzecznościowe / Społeczne (różowy / pink)
  | 'question'     // Pytania / Miejsca (fioletowy / purple)
  | 'negation';    // Przeczenie / Ostrzeżenia (czerwony / red)

export interface Pictogram {
  id: number;
  word: string;
  category: FitzgeraldCategory;
  customImageUrl?: string;
  isCustom?: boolean;
  tags?: string[];
}

export type ContextType = 
  | 'dom' 
  | 'skola' 
  | 'park' 
  | 'jedzenie' 
  | 'emocje' 
  | 'miejsca' 
  | 'zabawa' 
  | 'zdrowie';

export type TimeOfDay = 'rano' | 'popoludnie' | 'wieczor';

export interface ContextInfo {
  id: ContextType;
  label: string;
  iconName: string;
  description: string;
  color: string;
}

export interface ArasacSearchResult {
  _id: number;
  keywords: Array<{
    keyword: string;
    meaning?: string;
    type?: number;
  }>;
}
