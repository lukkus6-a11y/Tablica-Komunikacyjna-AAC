import React, { useState } from 'react';
import { Pictogram } from '../types';
import { PictogramCard } from './PictogramCard';
import { Move, Check, RotateCcw, Sparkles, Loader2 } from 'lucide-react';

interface CoreGridProps {
  coreItems: Pictogram[];
  onReorder: (newItems: Pictogram[]) => void;
  onResetOrder?: () => void;
  onSelectPictogram: (pictogram: Pictogram) => void;
  highContrast?: boolean;
  isSaving?: boolean;
}

export const CoreGrid: React.FC<CoreGridProps> = ({
  coreItems,
  onReorder,
  onResetOrder,
  onSelectPictogram,
  highContrast = false,
  isSaving = false,
}) => {
  const [isReordering, setIsReordering] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Swap / Move item to index
  const moveItem = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= coreItems.length) return;
    const updated = [...coreItems];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    onReorder(updated);
  };

  // Drag and Drop handlers
  const handleDragStart = (idx: number) => (e: React.DragEvent) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetIdx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== targetIdx) {
      moveItem(draggedIdx, targetIdx);
    }
    setDraggedIdx(null);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-300 p-3 sm:p-4 shadow-sm flex flex-col h-full">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center">
            <Move className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 leading-tight flex items-center gap-2">
              <span>Słownictwo Rdzenne</span>
              {isSaving && (
                <span className="text-xs text-blue-600 font-normal flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Zapisywanie...
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">
              {isReordering
                ? 'Przeciągnij piktogramy lub użyj strzałek, aby zmienić ich pozycję'
                : 'Przytrzymaj piktogram (500ms), aby włączyć tryb przesuwania'}
            </p>
          </div>
        </div>

        {/* Action Controls: Toggle Reorder & Reset */}
        <div className="flex items-center gap-1.5">
          {onResetOrder && (
            <button
              type="button"
              onClick={onResetOrder}
              title="Przywróć domyślny układ Słownictwa Rdzennego"
              className="p-1.5 sm:px-2.5 sm:py-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Resetuj</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsReordering((prev) => !prev)}
            title={isReordering ? 'Zakończ tryb edycji' : 'Zmień kolejność słów'}
            className={`
              flex items-center gap-1 px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all shadow-sm active:scale-95 border
              ${
                isReordering
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-md'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200'
              }
            `}
          >
            {isReordering ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Gotowe</span>
              </>
            ) : (
              <>
                <Move className="w-3.5 h-3.5" />
                <span>Edytuj Układ</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Banner when in Reorder Mode */}
      {isReordering && (
        <div className="mb-3 p-2.5 bg-blue-50 border border-blue-200 text-blue-950 rounded-xl text-xs font-bold flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            Tryb zmiany kolejności aktywny. Przeciągaj kafelki lub klikaj strzałki &lt; / &gt;
          </span>
          <button
            onClick={() => setIsReordering(false)}
            className="text-blue-700 hover:text-blue-900 font-extrabold px-2 py-0.5 bg-blue-200/60 rounded"
          >
            Zamknij
          </button>
        </div>
      )}

      {/* Grid of Core Words */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-3 flex-1 overflow-y-auto pr-1">
        {coreItems.map((pic, idx) => (
          <PictogramCard
            key={`core-${pic.id}-${pic.word}-${idx}`}
            pictogram={pic}
            onClick={onSelectPictogram}
            highContrast={highContrast}
            size="md"
            showCategoryBadge
            isReordering={isReordering}
            onLongPress={() => setIsReordering(true)}
            draggable={isReordering}
            onDragStart={handleDragStart(idx)}
            onDragOver={handleDragOver}
            onDrop={handleDrop(idx)}
            onMoveLeft={idx > 0 ? () => moveItem(idx, idx - 1) : undefined}
            onMoveRight={idx < coreItems.length - 1 ? () => moveItem(idx, idx + 1) : undefined}
          />
        ))}
      </div>
    </div>
  );
};
