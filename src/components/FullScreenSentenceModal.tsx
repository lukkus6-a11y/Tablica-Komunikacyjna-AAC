import React, { useEffect } from 'react';
import { Pictogram } from '../types';
import { FITZGERALD_CONFIG, getArasacImageUrl } from '../utils/fitzgeraldKey';
import { speakText } from '../utils/speech';
import { X, Copy, Check, MessageSquare, Volume2 } from 'lucide-react';

interface FullScreenSentenceModalProps {
  sentence: Pictogram[];
  onClose: () => void;
  highContrast?: boolean;
}

export const FullScreenSentenceModal: React.FC<FullScreenSentenceModalProps> = ({
  sentence,
  onClose,
  highContrast = false,
}) => {
  const [copied, setCopied] = React.useState(false);

  // ESC key support to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const fullSentenceText = sentence.map((p) => p.word).join(' ');

  const handleCopy = () => {
    if (!fullSentenceText) return;
    navigator.clipboard.writeText(fullSentenceText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (fullSentenceText) {
      speakText(fullSentenceText);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-8 animate-fadeIn">
      {/* Top Header Bar */}
      <div className="w-full max-w-7xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white">
          <MessageSquare className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl sm:text-2xl font-black">
            Powiększona Wypowiedź (Tryb Prezentacji)
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {fullSentenceText && (
            <button
              type="button"
              onClick={handleSpeak}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl border border-emerald-500 transition-colors shadow-md active:scale-95"
            >
              <Volume2 className="w-5 h-5 animate-pulse text-white" />
              <span>Mów (TTS)</span>
            </button>
          )}

          {fullSentenceText && (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Skopiowano' : 'Kopiuj Tekst'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij podgląd pełnoekranowy"
            className="p-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl font-extrabold transition-all transform active:scale-90 flex items-center gap-2 shadow-lg"
          >
            <X className="w-6 h-6" />
            <span className="hidden sm:inline text-base">Zamknij (ESC)</span>
          </button>
        </div>
      </div>

      {/* Main Full-Scale Pictograms Grid / Flex Row */}
      <div className="flex-1 w-full max-w-7xl my-6 flex items-center justify-center overflow-x-auto p-4">
        {sentence.length === 0 ? (
          <div className="text-center text-slate-400 text-xl font-bold">
            Brak piktogramów w zdaniu.
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 max-h-[70vh] overflow-y-auto p-2">
            {sentence.map((item, idx) => {
              const config = FITZGERALD_CONFIG[item.category] || FITZGERALD_CONFIG.noun;
              const imgUrl = item.customImageUrl || getArasacImageUrl(item.id);

              return (
                <div
                  key={`fullscreen-${item.id}-${idx}`}
                  className={`
                    flex flex-col items-center justify-between p-4 sm:p-6 rounded-3xl transition-transform
                    w-36 sm:w-48 lg:w-56 h-48 sm:h-64 lg:h-72 border-4 shadow-2xl
                    ${highContrast ? config.highContrastBg : `${config.bgClass} ${config.borderClass}`}
                  `}
                >
                  <div className="flex-1 flex items-center justify-center w-full my-2">
                    <img
                      src={imgUrl}
                      alt={item.word}
                      className="h-28 w-28 sm:h-40 sm:w-40 lg:h-48 lg:w-48 object-contain drop-shadow-md"
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
                  <span className={`text-lg sm:text-2xl lg:text-3xl font-black capitalize tracking-wide text-center truncate w-full ${config.textClass}`}>
                    {item.word}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Large Text Display */}
      {sentence.length > 0 && (
        <div className="w-full max-w-5xl bg-amber-400 text-slate-950 px-6 py-4 rounded-2xl shadow-xl text-center">
          <span className="text-2xl sm:text-4xl font-extrabold tracking-wide">
            "{fullSentenceText}"
          </span>
        </div>
      )}
    </div>
  );
};
