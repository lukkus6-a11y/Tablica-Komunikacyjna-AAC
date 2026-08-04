import React, { useState, useEffect } from 'react';
import { Pictogram } from '../types';
import { FITZGERALD_CONFIG, getArasacImageUrl, getArasacFallbackImageUrl, getArasacApiImageUrl } from '../utils/fitzgeraldKey';
import { speakText } from '../utils/speech';
import { Plus } from 'lucide-react';

interface PictogramCardProps {
  pictogram: Pictogram;
  onClick: (pictogram: Pictogram) => void;
  highContrast?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCategoryBadge?: boolean;
}

export const PictogramCard: React.FC<PictogramCardProps> = ({
  pictogram,
  onClick,
  highContrast = false,
  size = 'md',
  showCategoryBadge = false,
}) => {
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const config = FITZGERALD_CONFIG[pictogram.category] || FITZGERALD_CONFIG.noun;

  // Build candidate URL list based on fallback level
  const getImageCandidateUrl = (level: number) => {
    if (pictogram.customImageUrl) return pictogram.customImageUrl;
    if (level === 0) return getArasacImageUrl(pictogram.id);
    if (level === 1) return getArasacFallbackImageUrl(pictogram.id);
    if (level === 2) return getArasacApiImageUrl(pictogram.id);
    return '';
  };

  const currentImageUrl = getImageCandidateUrl(fallbackIndex);

  // Reset state when pictogram changes
  useEffect(() => {
    setFallbackIndex(0);
    setImageFailed(false);
    setIsLoaded(false);
  }, [pictogram.id, pictogram.customImageUrl]);

  const handleImageError = () => {
    if (pictogram.customImageUrl || fallbackIndex >= 2) {
      setImageFailed(true);
    } else {
      setFallbackIndex((prev) => prev + 1);
    }
  };

  const handleClick = () => {
    speakText(pictogram.word);
    onClick(pictogram);
  };

  // Size styles
  const sizeClasses = {
    sm: 'p-1.5 h-24 text-xs',
    md: 'p-2.5 h-32 sm:h-36 text-sm',
    lg: 'p-4 h-44 sm:h-52 text-base font-bold',
  };

  const imageSizes = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16 sm:h-20 sm:w-20',
    lg: 'h-28 w-28 sm:h-32 sm:w-32',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Dodaj piktogram: ${pictogram.word}`}
      className={`
        relative group flex flex-col items-center justify-between rounded-xl transition-all duration-150 cursor-pointer select-none
        focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-offset-2
        shadow-sm hover:shadow-md active:scale-95 touch-manipulation
        ${sizeClasses[size]}
        ${
          highContrast
            ? config.highContrastBg
            : `${config.bgClass} border-2 ${config.borderClass}`
        }
      `}
    >
      {/* Category Badge if enabled */}
      {showCategoryBadge && !highContrast && (
        <span
          className={`absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-bold rounded-md ${config.badgeBgClass}`}
        >
          {config.name.split('/')[0]}
        </span>
      )}

      {/* Pictogram Image Container */}
      <div className="flex-1 flex items-center justify-center w-full my-0.5 relative overflow-hidden">
        {!isLoaded && !imageFailed && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200/50 rounded-lg animate-pulse">
            <span className="sr-only">Ładowanie...</span>
          </div>
        )}

        {!imageFailed && currentImageUrl ? (
          <img
            key={`${pictogram.id}-${fallbackIndex}`}
            src={currentImageUrl}
            alt={pictogram.word}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setIsLoaded(true)}
            onError={handleImageError}
            className={`
              object-contain transition-transform duration-200 group-hover:scale-105
              ${imageSizes[size]}
              ${!isLoaded ? 'opacity-0' : 'opacity-100'}
            `}
          />
        ) : (
          /* Clean symbol badge fallback for AAC readability */
          <div className="flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/80 border-2 border-slate-300 shadow-inner">
            <span className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-800">
              {pictogram.word.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Polish Text Label */}
      <div className="w-full text-center px-1">
        <span
          className={`
            block truncate capitalize font-bold leading-tight tracking-wide
            ${highContrast ? 'text-black text-sm sm:text-base font-black' : `${config.textClass}`}
          `}
        >
          {pictogram.word}
        </span>
      </div>

      {/* Quick plus indicator on hover */}
      <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-500 text-white rounded-full p-0.5 shadow-sm">
        <Plus className="w-3 h-3" />
      </div>
    </button>
  );
};
