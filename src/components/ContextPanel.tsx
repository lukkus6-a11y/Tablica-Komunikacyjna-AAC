import React, { useState, useEffect } from 'react';
import { ContextType, Pictogram, TimeOfDay } from '../types';
import { CONTEXT_CATEGORIES, CONTEXT_VOCABULARY, PREDICTIVE_VOCABULARY, TIME_VOCABULARY } from '../data/contextPresets';
import { searchArasacPictograms, POLISH_LEMMA_MAP } from '../services/arasacApi';
import { searchOpenSymbols } from '../services/openSymbolsApi';
import { getGeoContext } from '../services/geoContext';
import { PictogramCard } from './PictogramCard';
import { 
  Sparkles, 
  MapPin, 
  Search, 
  Clock, 
  Sun, 
  SunMedium, 
  Moon, 
  Loader2, 
  Home, 
  GraduationCap, 
  Trees, 
  Utensils, 
  Smile, 
  Gamepad2, 
  HeartPulse,
  Layers
} from 'lucide-react';

interface ContextPanelProps {
  onSelectPictogram: (pictogram: Pictogram) => void;
  lastSelectedPictogram?: Pictogram;
  highContrast?: boolean;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
  onSelectPictogram,
  lastSelectedPictogram,
  highContrast = false,
}) => {
  const [activeContext, setActiveContext] = useState<ContextType>('dom');
  const [activeTabMode, setActiveTabMode] = useState<'categories' | 'time' | 'prediction' | 'search'>('categories');

  // Time context state
  const [systemTimeOfDay, setSystemTimeOfDay] = useState<TimeOfDay>('rano');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<TimeOfDay>('rano');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Pictogram[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Geo state
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [isGeoLoading, setIsGeoLoading] = useState(false);

  // Calculate system time on load
  useEffect(() => {
    const hour = new Date().getHours();
    let tod: TimeOfDay = 'rano';
    if (hour >= 6 && hour < 12) {
      tod = 'rano';
    } else if (hour >= 12 && hour < 18) {
      tod = 'popoludnie';
    } else {
      tod = 'wieczor';
    }
    setSystemTimeOfDay(tod);
    setSelectedTimeOfDay(tod);
  }, []);

  // Resolve prediction key (direct word or lemma mapping)
  const rawWordKey = lastSelectedPictogram?.word.toLowerCase().trim() || '';
  const lemmaWordKey = POLISH_LEMMA_MAP[rawWordKey] || rawWordKey;
  const activePredictionKey = PREDICTIVE_VOCABULARY[rawWordKey] 
    ? rawWordKey 
    : (PREDICTIVE_VOCABULARY[lemmaWordKey] ? lemmaWordKey : '');

  const hasPrediction = !!(activePredictionKey && PREDICTIVE_VOCABULARY[activePredictionKey]);

  // Auto-switch to prediction tab if a matching word is selected, or revert to categories if prediction turns false
  useEffect(() => {
    if (hasPrediction) {
      setActiveTabMode('prediction');
    } else if (activeTabMode === 'prediction') {
      setActiveTabMode('categories');
    }
  // activeTabMode included to avoid stale closure in the else-if branch
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPrediction, lastSelectedPictogram]);

  // Handle search submit / debounced typing (ARASAC & Open Symbols)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      
      // Query both ARASAC and Open Symbols API in parallel
      const [arasacRes, openSymbolsRes] = await Promise.all([
        searchArasacPictograms(searchQuery),
        searchOpenSymbols(searchQuery),
      ]);

      // Combine and deduplicate
      const combined = [...arasacRes];
      openSymbolsRes.forEach((osItem) => {
        if (!combined.some((item) => item.word === osItem.word && item.customImageUrl === osItem.customImageUrl)) {
          combined.push(osItem);
        }
      });

      setSearchResults(combined);
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle geolocation trigger
  const handleUseLocation = async () => {
    setIsGeoLoading(true);
    setGeoStatus('Pobieranie pozycji GPS...');
    
    const result = await getGeoContext();
    setIsGeoLoading(false);
    setGeoStatus(result.message);

    if (result.success && result.context) {
      setActiveContext(result.context);
      setActiveTabMode('categories');
    }
  };

  // Get current displayed pictograms based on tab mode
  const getDisplayedPictograms = (): Pictogram[] => {
    if (activeTabMode === 'search') {
      return searchResults;
    }
    if (activeTabMode === 'prediction' && hasPrediction) {
      return PREDICTIVE_VOCABULARY[activePredictionKey].items;
    }
    if (activeTabMode === 'time') {
      return TIME_VOCABULARY[selectedTimeOfDay].items;
    }
    return CONTEXT_VOCABULARY[activeContext] || [];
  };

  const displayedList = getDisplayedPictograms();

  // Helper icon renderer for categories
  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home': return <Home className="w-4 h-4" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4" />;
      case 'Trees': return <Trees className="w-4 h-4" />;
      case 'Utensils': return <Utensils className="w-4 h-4" />;
      case 'Smile': return <Smile className="w-4 h-4" />;
      case 'MapPin': return <MapPin className="w-4 h-4" />;
      case 'Gamepad2': return <Gamepad2 className="w-4 h-4" />;
      case 'HeartPulse': return <HeartPulse className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-300 p-3 sm:p-4 shadow-sm flex flex-col h-full">
      {/* Panel Header */}
      <div className="pb-3 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 text-purple-800 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800 leading-tight">
                Panel Kontekstowy
              </h2>
              <p className="text-xs text-slate-500">
                Dynamiczne dopasowanie słów
              </p>
            </div>
          </div>

          {/* GPS Location Button */}
          <button
            type="button"
            onClick={handleUseLocation}
            disabled={isGeoLoading}
            title="Lokalizacja GPS do automatycznego kontekstu"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-sm"
          >
            {isGeoLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            ) : (
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            )}
            <span className="hidden sm:inline">Moja Lokalizacja</span>
          </button>
        </div>

        {/* GPS Feedback Alert if any */}
        {geoStatus && (
          <div className="mt-2 p-2 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-lg text-xs font-medium flex items-center justify-between">
            <span className="truncate">{geoStatus}</span>
            <button
              onClick={() => setGeoStatus(null)}
              className="text-indigo-500 hover:text-indigo-800 font-bold ml-1"
            >
              ×
            </button>
          </div>
        )}

        {/* Navigation Tabs (Kategorie, Poran/Wieczór, Przewidywanie, Szukaj) */}
        <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTabMode('categories')}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap
              ${
                activeTabMode === 'categories'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }
            `}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Kategorie</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabMode('time')}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap
              ${
                activeTabMode === 'time'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }
            `}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Czas Dnia</span>
          </button>

          {hasPrediction && (
            <button
              type="button"
              onClick={() => setActiveTabMode('prediction')}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap animate-pulse
                ${
                  activeTabMode === 'prediction'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                }
              `}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sugestia po "{lastSelectedPictogram?.word || activePredictionKey}"</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTabMode('search')}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap
              ${
                activeTabMode === 'search'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }
            `}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Asekuracyjne Szukaj</span>
          </button>
        </div>
      </div>

      {/* Mode Specific Controls & Selectors */}
      <div className="py-2">
        {/* CATEGORIES MODE SELECTOR */}
        {activeTabMode === 'categories' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {CONTEXT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveContext(cat.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all border whitespace-nowrap
                  ${
                    activeContext === cat.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }
                `}
              >
                {renderCategoryIcon(cat.iconName)}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* TIME CONTEXT SELECTOR */}
        {activeTabMode === 'time' && (
          <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Sugerowany Czas: <u className="capitalize">{systemTimeOfDay}</u>
              </span>
              <span className="text-[10px] text-amber-700 bg-amber-200/60 px-1.5 py-0.5 rounded">
                Godzina: {new Date().getHours()}:00
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedTimeOfDay('rano')}
                className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                  selectedTimeOfDay === 'rano'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-100'
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Rano
              </button>

              <button
                type="button"
                onClick={() => setSelectedTimeOfDay('popoludnie')}
                className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                  selectedTimeOfDay === 'popoludnie'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-100'
                }`}
              >
                <SunMedium className="w-3.5 h-3.5" /> Popołudnie
              </button>

              <button
                type="button"
                onClick={() => setSelectedTimeOfDay('wieczor')}
                className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                  selectedTimeOfDay === 'wieczor'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-100'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Wieczór
              </button>
            </div>
          </div>
        )}

        {/* SEQUENTIAL PREDICTION BANNER */}
        {activeTabMode === 'prediction' && hasPrediction && (
          <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded-xl flex items-center justify-between text-emerald-950 text-xs font-bold">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>
                {PREDICTIVE_VOCABULARY[activePredictionKey].triggerLabel}
              </span>
            </div>
            <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold">
              Auto-Przewidywanie
            </span>
          </div>
        )}

        {/* ARASAC SEARCH INPUT */}
        {activeTabMode === 'search' && (
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Wpisz dowolne słowo (np. pies, strażak, jabłko)..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              {isSearching && (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin absolute right-3 top-3" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 italic">
              Wyszukuje z baz ARASAC API oraz Open Symbols (piktogramy globalne).
            </p>
          </div>
        )}
      </div>

      {/* Main Grid for Context Items */}
      <div className="flex-1 overflow-y-auto mt-2 pr-1">
        {activeTabMode === 'search' && searchResults.length === 0 && !isSearching && searchQuery.trim() && (
          <div className="py-8 text-center text-slate-400 text-sm">
            Nie znaleziono piktogramu dla: "{searchQuery}". Wypróbuj inne słowo.
          </div>
        )}

        {displayedList.length === 0 && !isSearching ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            Brak słów w wybranym kontekście.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
            {displayedList.map((pic, idx) => (
              <PictogramCard
                key={`context-${pic.id}-${pic.word}-${idx}`}
                pictogram={pic}
                onClick={onSelectPictogram}
                highContrast={highContrast}
                size="md"
                showCategoryBadge
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
