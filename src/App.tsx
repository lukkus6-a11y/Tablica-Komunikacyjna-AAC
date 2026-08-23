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
  const [user, setUser] = useState(null);
  
  // Stany formularza logowania/rejestracji
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const [coreItems, setCoreItems] = useState<Pictogram[]>(() => {
    const saved = localStorage.getItem('aac_core_vocabulary');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return CORE_VOCABULARY;
  });

  const [boardId, setBoardId] = useState<string | null>(null);
  const [isSavingBoard, setIsSavingBoard] = useState(false);

  const loadUserBoard = useCallback(async (userId: string) => {
    if (!userId) return;
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
    // Sprawdzenie aktywnej sesji przy starcie (dzięki persistSession: true aplikacja "pamięta" użytkownika)
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser?.id) {
        loadUserBoard(currentUser.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser?.id) {
        await loadUserBoard(currentUser.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserBoard]);

  // Obsługa logowania / rejestracji hasłem
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthMessage('');

    if (isRegistering) {
      // Rejestracja nowego użytkownika
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
      } else {
        setAuthMessage('Konto zostało utworzone! Możesz się teraz zalogować.');
        setIsRegistering(false);
      }
    } else {
      // Logowanie istniejącego użytkownika
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError('Błąd logowania: Nieprawidłowy e-mail lub hasło.');
      } else if (data.session?.user) {
        setUser(data.session.user);
        loadUserBoard(data.session.user.id);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setBoardId(null);
    const saved = localStorage.getItem('aac_core_vocabulary');
    if (saved) {
      try { setCoreItems(JSON.parse(saved)); } catch (e) { setCoreItems(CORE_VOCABULARY); }
    } else {
      setCoreItems(CORE_VOCABULARY);
    }
  };

  const handleReorderCore = async (newCoreItems: Pictogram[]) => {
    setCoreItems(newCoreItems);
    localStorage.setItem('aac_core_vocabulary', JSON.stringify(newCoreItems));

    if (user?.id) {
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

  const handleResetCore = async () => {
    await handleReorderCore(CORE_VOCABULARY);
    localStorage.removeItem('aac_core_vocabulary');
  };

  const [sentence, setSentence] = useState<Pictogram[]>([]);
  const [highContrast, setHighContrast] = useState(false);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [mobileActiveView, setMobileActiveView] = useState<'all' | 'core' | 'context'>('all');

  const handleSelectPictogram = (pictogram: Pictogram) => {
    setSentence((prev) => [...prev, pictogram]);
  };

  const handleRemoveAt = (index: number) => {
    setSentence((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleClearSentence = () => {
    setSentence([]);
  };

  const handleRemoveLast = () => {
    setSentence((prev) => prev.slice(0, -1));
  };

  const lastSelected = sentence.length > 0 ? sentence[sentence.length - 1] : undefined;

  return (
    <div className={`min-h-screen ${highContrast ? 'bg-black text-yellow-300' : 'bg-slate-100 text-slate-900'} p-2 sm:p-4 lg:p-6 transition-colors duration-200`}>
      <div className="max-w-[1600px] mx-auto flex flex-col lg:h-[calc(100vh-2rem)] gap-3">
        
        {/* Pasek górny: Narzędzia i panel logowania */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur p-2 px-4 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700">
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
              <form onSubmit={handleAuthSubmit} className="flex flex-wrap items-center gap-2">
                <input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="px-2.5 py-1 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  placeholder="Hasło"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="px-2.5 py-1 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-bold transition shadow-sm"
                >
                  {isRegistering ? 'Zarejestruj się' : 'Zaloguj'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-1"
                >
                  {isRegistering ? 'Masz konto? Zaloguj się' / : 'Nie masz konta? Załóż'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Informacje o błędach lub sukcesie autoryzacji */}
        {(authError || authMessage) && (
          <div className={`px-4 py-2 rounded-lg text-xs font-semibold ${authError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {authError || authMessage}
          </div>
        )}

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
              mobileActiveView === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-300/60'
            }`}
          >
            Pokaż Oba (Przewijaj)
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveView('core')}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
              mobileActiveView === 'core' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-300/60'
            }`}
          >
            Słownictwo Rdzenne
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveView('context')}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
              mobileActiveView === 'context' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-300/60'
            }`}
          >
            Panel Kontekstowy ✨
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 lg:overflow-hidden pb-4 lg:pb-0">
          <div className={`lg:col-span-7 xl:col-span-8 lg:h-full overflow-hidden ${mobileActiveView === 'context' ? 'hidden lg:block' : 'block'}`}>
            <CoreGrid
              coreItems={coreItems}
              onReorder={handleReorderCore}
              onResetOrder={handleResetCore}
              onSelectPictogram={handleSelectPictogram}
              highContrast={highContrast}
              isSaving={isSavingBoard}
            />
          </div>

          <div className={`lg:col-span-5 xl:col-span-4 lg:h-full overflow-hidden ${mobileActiveView === 'core' ? 'hidden lg:block' : 'block'}`}>
            <ContextPanel
              onSelectPictogram={handleSelectPictogram}
              lastSelectedPictogram={lastSelected}
              highContrast={highContrast}
            />
          </div>
        </div>
      </div>

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