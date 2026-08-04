import React from 'react';
import { Pictogram } from '../types';
import { FITZGERALD_CONFIG, getArasacImageUrl } from '../utils/fitzgeraldKey';
import { speakText } from '../utils/speech';
import { Trash2, CornerUpLeft, Maximize2, Copy, Check, MessageSquare, Volume2 } from 'lucide-react';

interface SentenceBarProps {
  sentence: Pictogram[];
  onRemoveAt: (index: number) => void;
  onClear: () => void;
  onRemoveLast: () => void;
  onOpenFullScreen: () => void;
  highContrast?: boolean;
}

export const SentenceBar: React.FC<SentenceBarProps> = ({
  sentence,
  onRemoveAt,
  onClear,
  onRemoveLast,
  onOpenFullScreen,
  highContrast = false,
}) => {
  const [copied, setCopied] = React.useState(false);

  const fullSentenceText = sentence.map((p) => p.word).join(' ');

  const handleCopyText = () => {
    if (!fullSentenceText) return;
    navigator.clipboard.writeText(fullSentenceText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeakSentence = () => {
    if (fullSentenceText) {
      speakText(fullSentenceText);
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-300 p-3 sm:p-4 shadow-md transition-all">
      {/* Top Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 leading-tight">
              Pasek Wypowiedzi
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">
              {sentence.length === 0
                ? 'Kliknij piktogramy poniżej, aby ułożyć zdanie'
                : `Słów w zdaniu: ${sentence.length}`}
            </p>
          </div>
        </div>

        {/* Control Buttons: Mów, Powiększ, Usuń ostatni, Wyczyść */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {fullSentenceText && (
            <button
              type="button"
              onClick={handleSpeakSentence}
              title="Odtwórz zdanie na głos (Syntetyzator Mowy)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all border border-emerald-700 shadow-sm active:scale-95"
            >
              <Volume2 className="w-4 h-4 animate-pulse" />
              <span>Mów</span>
            </button>
          )}

          {fullSentenceText && (
            <button
              type="button"
              onClick={handleCopyText}
              title="Kopiuj tekst zdania"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{copied ? 'Skopiowano!' : 'Kopiuj'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRemoveLast}
            disabled={sentence.length === 0}
            title="Usuń ostatni element (Backspace)"
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all border
              ${
                sentence.length === 0
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 active:scale-95 shadow-sm'
              }
            `}
          >
            <CornerUpLeft className="w-4 h-4" />
            <span>Usuń ostatni</span>
          </button>

          <button
            type="button"
            onClick={onClear}
            disabled={sentence.length === 0}
            title="Wyczyść całe zdanie"
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all border
              ${
                sentence.length === 0
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300 active:scale-95 shadow-sm'
              }
            `}
          >
            <Trash2 className="w-4 h-4" />
            <span>Wyczyść</span>
          </button>

          <button
            type="button"
            onClick={onOpenFullScreen}
            disabled={sentence.length === 0}
            title="Powiększ na cały ekran (Pełny Widok)"
            className={`
              inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all border
              ${
                sentence.length === 0
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                  : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 active:scale-95 shadow-md hover:shadow-lg'
              }
            `}
          >
            <Maximize2 className="w-4 h-4" />
            <span className="font-extrabold">Powiększ</span>
          </button>
        </div>
      </div>

      {/* Main Selected Pictograms Container */}
      <div className="min-h-[96px] sm:min-h-[110px] w-full bg-slate-50/80 rounded-xl p-2.5 sm:p-3 border-2 border-dashed border-slate-300 flex items-center overflow-x-auto gap-2 scrollbar-thin scrollbar-thumb-slate-300">
        {sentence.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center py-4 text-slate-400">
            <p className="text-sm sm:text-base font-semibold text-center">
              Pasek jest pusty. Wybierz piktogramy z tablicy poniżej.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-max py-1">
            {sentence.map((item, idx) => {
              const config = FITZGERALD_CONFIG[item.category] || FITZGERALD_CONFIG.noun;
              const imgUrl = item.customImageUrl || getArasacImageUrl(item.id);

              return (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => onRemoveAt(idx)}
                  title="Kliknij, aby usunąć to słowo"
                  className={`
                    relative group flex flex-col items-center justify-between p-2 rounded-xl transition-all cursor-pointer select-none
                    w-20 sm:w-24 h-24 sm:h-28 border-2 shadow-sm hover:shadow-md hover:scale-105 active:scale-95
                    ${highContrast ? config.highContrastBg : `${config.bgClass} ${config.borderClass}`}
                  `}
                >
                  <div className="flex-1 flex items-center justify-center w-full my-0.5">
                    <img
                      src={imgUrl}
                      alt={item.word}
                      className="h-12 w-12 sm:h-14 sm:w-14 object-contain"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!item.customImageUrl && target.src.endsWith('.svg')) {
                          target.src = `https://static.arasaac.org/pictograms/${item.id}/${item.id}_500.png`;
                        } else {
                          target.onerror = null;
                          target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23f1f5f9"/><text x="50" y="58" font-family="sans-serif" font-size="36" font-weight="bold" fill="%23334155" text-anchor="middle">${encodeURIComponent((item.word || '?').charAt(0).toUpperCase())}</text></svg>`;
                        }
                      }}
                    />
                  </div>
                  <span className={`text-xs sm:text-sm font-black truncate w-full text-center ${config.textClass}`}>
                    {item.word}
                  </span>

                  {/* Remove indicator on hover */}
                  <div className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                    <Trash2 className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Text Banner */}
      {sentence.length > 0 && (
        <div className="mt-2.5 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between text-xs sm:text-sm font-bold text-amber-950">
          <div className="flex items-center gap-2 truncate">
            <span className="text-amber-600 uppercase tracking-wider text-[10px] bg-amber-200/80 px-1.5 py-0.5 rounded">
              Wypowiedź:
            </span>
            <span className="truncate italic font-serif text-base font-semibold">
              "{fullSentenceText}"
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
