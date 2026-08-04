import React from 'react';
import { Pictogram } from '../types';
import { CORE_VOCABULARY } from '../data/coreVocabulary';
import { PictogramCard } from './PictogramCard';
import { Lock, ShieldAlert } from 'lucide-react';

interface CoreGridProps {
  onSelectPictogram: (pictogram: Pictogram) => void;
  highContrast?: boolean;
}

export const CoreGrid: React.FC<CoreGridProps> = ({
  onSelectPictogram,
  highContrast = false,
}) => {
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-300 p-3 sm:p-4 shadow-sm flex flex-col h-full">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 leading-tight">
              Słownictwo Rdzenne (Stały Układ)
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">
              Niezmienne pozycje kluczowych słów chroniące pamięć ruchową
            </p>
          </div>
        </div>

        <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          Stała Tablica
        </span>
      </div>

      {/* Grid of Fixed Core Words */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-3 flex-1 overflow-y-auto pr-1">
        {CORE_VOCABULARY.map((pic) => (
          <PictogramCard
            key={`core-${pic.id}-${pic.word}`}
            pictogram={pic}
            onClick={onSelectPictogram}
            highContrast={highContrast}
            size="md"
            showCategoryBadge
          />
        ))}
      </div>
    </div>
  );
};
