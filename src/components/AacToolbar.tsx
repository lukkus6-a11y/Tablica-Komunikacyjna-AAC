import React, { useState } from 'react';
import { FITZGERALD_CONFIG } from '../utils/fitzgeraldKey';
import { FitzgeraldCategory } from '../types';
import { Eye, Info, HelpCircle, Palette } from 'lucide-react';

interface AacToolbarProps {
  highContrast: boolean;
  onToggleHighContrast: () => void;
}

export const AacToolbar: React.FC<AacToolbarProps> = ({
  highContrast,
  onToggleHighContrast,
}) => {
  const [showLegendModal, setShowLegendModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <>
      <div className="bg-slate-900 text-white px-3 sm:px-6 py-2.5 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3 mb-4 border border-slate-800">
        {/* Logo & App Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow">
            M
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-wide leading-none">
              Mówiące Piktogramy AAC
            </h1>
            <p className="text-[11px] text-slate-400">
              Kontekstowa Tablica ARASAC (PL)
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* High Contrast Toggle */}
          <button
            type="button"
            onClick={onToggleHighContrast}
            title="Przełącz tryb wysokiego kontrastu"
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border
              ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-500 font-extrabold shadow-sm'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700'
              }
            `}
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">
              {highContrast ? 'Wysoki Kontrast (WŁ)' : 'Wysoki Kontrast'}
            </span>
          </button>

          {/* Color Legend Button */}
          <button
            type="button"
            onClick={() => setShowLegendModal(true)}
            title="Legenda Kolorów Fitzgerald Key"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            <Palette className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Legenda Kolorów</span>
          </button>

          {/* Info & Guide Button */}
          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            title="O aplikacji i instrukcja AAC"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            <Info className="w-4 h-4 text-sky-400" />
            <span className="hidden lg:inline">Instrukcja</span>
          </button>
        </div>
      </div>

      {/* LEGEND MODAL */}
      {showLegendModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border-2 border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 text-slate-900">
                <Palette className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-black">
                  Legenda Kolorów AAC (Kod Fitzgerald Key)
                </h3>
              </div>
              <button
                onClick={() => setShowLegendModal(false)}
                className="text-slate-400 hover:text-slate-700 font-extrabold text-xl p-1"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Piktogramy są oznaczane kolorystycznie wg międzynarodowego standardu Fitzgerald Key, ułatwiając szybkie rozróżnianie części mowy:
            </p>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {(Object.keys(FITZGERALD_CONFIG) as FitzgeraldCategory[]).map((catKey) => {
                const conf = FITZGERALD_CONFIG[catKey];
                return (
                  <div
                    key={catKey}
                    className={`p-3 rounded-2xl border-2 flex items-center gap-3 ${conf.bgClass} ${conf.borderClass}`}
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-slate-400 shrink-0"
                      style={{ backgroundColor: conf.hexColor }}
                    />
                    <div>
                      <span className={`block font-extrabold text-xs sm:text-sm ${conf.textClass}`}>
                        {conf.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowLegendModal(false)}
              className="mt-5 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-sm"
            >
              Rozumiem
            </button>
          </div>
        </div>
      )}

      {/* INFO / GUIDANCE MODAL */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border-2 border-slate-200 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-slate-900">
                <HelpCircle className="w-5 h-5 text-sky-500" />
                <h3 className="text-lg font-black">
                  Jak działa Kontekstowa Tablica AAC?
                </h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-slate-700 font-extrabold text-xl p-1"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed max-h-[65vh] overflow-y-auto pr-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-extrabold text-slate-900 mb-1">
                  1. Słownictwo Rdzenne (Stała Tablica)
                </h4>
                <p>
                  Lewa/górna cześć ekranu zawiera najczęstsze słowa (ja, chcę, nie, lubię, to, gdzie, stop, więcej). Ich pozycje są stałe, co ułatwia budowanie pamięci mięśniowej.
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <h4 className="font-extrabold text-purple-950 mb-1">
                  2. Kontekstowy Panel Dynamiczny
                </h4>
                <p>
                  Prawa/dolna cześć dostosowuje proponowane piktogramy w zależności od wybranych kategorii, pory dnia (rano/wieczór), geolokalizacji GPS lub wybranych wcześniej słów.
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-extrabold text-emerald-950 mb-1">
                  3. Sekwencyjne Przewidywanie (Sugerowane Słowa)
                </h4>
                <p>
                  Kliknięcie czasownika (np. "chcę", "jeść", "iść") automatycznie ładuje do panelu pasujące rzeczowniki (np. jedzenie, miejsca, napoje).
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="font-extrabold text-amber-950 mb-1">
                  4. Oficjalne Piktogramy ARASAC
                </h4>
                <p>
                  Wszystkie symbole pochodzą z oficjalnej bezpłatnej bazy ARASAC (Pojazdy, Czynności, Emocje, Posiłki itp.).
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-sm"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}
    </>
  );
};
