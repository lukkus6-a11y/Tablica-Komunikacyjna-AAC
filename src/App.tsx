import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { Pictogram } from './types';
import { CORE_VOCABULARY } from './data/coreVocabulary';
import { SentenceBar } from './components/SentenceBar';
import { CoreGrid } from './components/CoreGrid';
import { ContextPanel } from './components/ContextPanel';
import { FullScreenSentenceModal } from './components/FullScreenSentenceModal';
import { AacToolbar } from './components/AacToolbar';

export default function App() {
  // Stan uwierzytelniania użytkownika
  const [user, setUser] = useState<any>(null);

  // Core Vocabulary order state
  const [coreItems, setCoreItems] = useState<Pictogram[]>(() => {
    const saved = localStorage.getItem('aac_core_vocabulary');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return CORE_VOCABULARY;
  });

  // Supabase board record ID
  const [boardId, setBoardId] = useState<string | null>(null);
  const [isSavingBoard, setIsSavingBoard] = useState(false);

  // Fetch board layout from Supabase
  const loadUserBoard = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (error) {
        console.warn('Notice loading board from Supabase:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const boardRecord = data[0];
        setBoardId(boardRecord.id);
        if (boardRecord.board_data && Array.isArray(boardRecord.board_data.core_vocabulary)) {
          setCoreItems(boardRecord.board_data.core_vocabulary);
        }
      }
    } catch (err) {
      console.error('Error fetching user board:', err);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadUserBoard(currentUser.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadUserBoard(currentUser.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserBoard]);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setBoardId(null);
    const saved = localStorage.getItem('aac_core_vocabulary');
    if (saved) {
      try { setCoreItems(JSON.parse(saved)); } catch (e) { setCoreItems(CORE_VOCABULARY); }
    } else {
      setCoreItems(CORE_VOCABULARY);
    }
  };

  // Reorder Core Vocabulary & save to Supabase / localStorage
  const handleReorderCore = async (newCoreItems: Pictogram[]) => {
    setCoreItems(newCoreItems);
    localStorage.setItem('aac_core_vocabulary', JSON.stringify(newCoreItems));

    if (user) {
      setIsSavingBoard(true);
      try {
        if (boardId) {
          await supabase
            .from('boards')
            .update({
              board_data: { core_vocabulary: newCoreItems },
              updated_at: new Date().toISOString(),
            })
            .eq('id', boardId);
        } else {
          const { data } = await supabase
            .from('boards')
            .insert([
              {
                user_id: user.id,
                board_data: { core_vocabulary: newCoreItems },
              },
            ])
            .select()
            .single();

          if (data) {
            setBoardId(data.id);
          }
        }
      } catch (err) {
        console.error('Error saving board to Supabase:', err);
      } finally {
        setIsSavingBoard(false);
      }
    }
  };

  // Reset Core Vocabulary order to default
  const handleResetCore = async () => {
    await handleReorderCore(CORE_VOCABULARY);
    localStorage.removeItem('aac_core_vocabulary');
  };

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
        
        {/* Pasek logowania i przyciski accessibility */}
        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur p-2 px-4 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700">
          <AacToolbar
            highContrast={highContrast}
            onToggleHighContrast={() => setHighContrast((prev) => !prev)}
          />

          <div>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-semibold truncate max-w-[180px] sm:max-w-none">{user.email}</span>
                <button 
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs sm:text-sm font-bold transition shadow-sm"
                >
                  Wyloguj
                </button>
              </div>
            ) : (
              <button 
                onClick={handleGoogleLogin}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-bold transition shadow-sm flex items-center gap-2"
              >
                Zaloguj przez Google
              </button>
            )}
          </div>
        </div>

        {/* Top Section - Sentence Bar (Pasek Wypowiedzi) */}
        <SentenceBar
          sentence={sentence}
          onRemoveAt={handleRemoveAt}
          onClear={handleClearSentence}
          onRemoveLast={handleRemoveLast}
          onOpenFullScreen={() => setIsFullScreenOpen(true)}
          highContrast={highContrast}
        />

        {/* Mobile View Switcher */}
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

        {/* Main Board Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 lg:overflow-hidden pb-4 lg:pb-0">
          <div
            className={`
              lg:col-span-7 xl:col-span-8 lg:h-full overflow-hidden
              ${mobileActiveView === 'context' ? 'hidden lg:block' : 'block'}
            `}
          >
            <CoreGrid
              coreItems={coreItems}
              onReorder={handleReorderCore}
              onResetOrder={handleResetCore}
              onSelectPictogram={handleSelectPictogram}
              highContrast={highContrast}
              isSaving={isSavingBoard}
            />
          </div>

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

      {/* Fullscreen Overlay Modal */}
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