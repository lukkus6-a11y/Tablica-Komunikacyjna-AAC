import React, { useState } from 'react';
import { Pictogram } from './types';
import { SentenceBar } from './components/SentenceBar';
import { CoreGrid } from './components/CoreGrid';
import { ContextPanel } from './components/ContextPanel';
import { FullScreenSentenceModal } from './components/FullScreenSentenceModal';
import { AacToolbar } from './components/AacToolbar';

export default function App() {
  // Composed sentence pictograms state
  const [sentence, setSentence] = useState<Pictogram[]>([]);

  // High contrast accessibility mode
  const [highContrast, setHighContrast] = useState(false);

  // Fullscreen presentation modal visibility
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);

  // Mobile active view tab ('all' | 'core' | 'context')
  const [mobileActiveView, setMobileActiveView] = useState<'all' | 'core' | 'context'>('all');

  // Handle adding a pictogram tile to the sentence bar
  const handleSelectPictogram = (pictogram: Pictogram) => {
    setSentence((prev) => [...prev, pictogram]);
  };

  // Remove a single item from the sentence bar at index
  const handleRemoveAt = (index: number) => {
    setSentence((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Clear all items in sentence
  const handleClearSentence = () => {
    setSentence([]);
  };

  // Remove last item (Backspace)
  const handleRemoveLast = () => {
    setSentence((prev) => prev.slice(0, -1));
  };

  // Last added pictogram for sequential prediction triggering
  const lastSelected = sentence.length > 0 ? sentence[sentence.length - 1] : undefined;

  return (
    <div className={`min-h-screen ${highContrast ? 'bg-black text-yellow-300' : 'bg-slate-100 text-slate-900'} p-2 sm:p-4 lg:p-6 transition-colors duration-200`}>
      <div className="max-w-[1600px] mx-auto flex flex-col lg:h-[calc(100vh-2rem)] gap-3">
        
        {/* Top AAC Accessibility Toolbar */}
        <AacToolbar
          highContrast={highContrast}
          onToggleHighContrast={() => setHighContrast((prev) => !prev)}
        />

        {/* Top Section - Sentence Bar (Pasek Wypowiedzi) */}
        <SentenceBar
          sentence={sentence}
          onRemoveAt={handleRemoveAt}
          onClear={handleClearSentence}
          onRemoveLast={handleRemoveLast}
          onOpenFullScreen={() => setIsFullScreenOpen(true)}
          highContrast={highContrast}
        />

        {/* Mobile View Switcher (Only visible on screens smaller than lg) */}
        <div className="flex lg:hidden items-center justify-center p-1 bg-slate-200/80 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setMobileActiveView('all')}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
              mobileActiveView === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-300/60'
            }`}
          >
            Pokaż Oba (Przewijaj)
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveView('core')}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
              mobileActiveView === 'core'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-300/60'
            }`}
          >
            Słownictwo Rdzenne
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveView('context')}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
              mobileActiveView === 'context'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-300/60'
            }`}
          >
            Panel Kontekstowy ✨
          </button>
        </div>

        {/* Main Board Layout: 70% Core Grid & 30% Dynamic Context Panel */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 lg:overflow-hidden pb-4 lg:pb-0">
          
          {/* Core Vocabulary Grid */}
          <div
            className={`
              lg:col-span-7 xl:col-span-8 lg:h-full overflow-hidden
              ${mobileActiveView === 'context' ? 'hidden lg:block' : 'block'}
            `}
          >
            <CoreGrid
              onSelectPictogram={handleSelectPictogram}
              highContrast={highContrast}
            />
          </div>

          {/* Dynamic Context Panel */}
          <div
            className={`
              lg:col-span-5 xl:col-span-4 lg:h-full overflow-hidden
              ${mobileActiveView === 'core' ? 'hidden lg:block' : 'block'}
            `}
          >
            <ContextPanel
              onSelectPictogram={handleSelectPictogram}
              lastSelectedPictogram={lastSelected}
              highContrast={highContrast}
            />
          </div>
        </div>
      </div>

      {/* Fullscreen Overlay Modal ("Powiększ") */}
      {isFullScreenOpen && (
        <FullScreenSentenceModal
          sentence={sentence}
          onClose={() => setIsFullScreenOpen(false)}
          highContrast={highContrast}
        />
      )}
    </div>
  );
}
