import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // 1. Sprawdzamy sesję przy starcie
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    }).catch(() => {});

    // 2. Obsługujemy powrót z Google (wykrycie tokenu w adresie URL)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      // Jeśli token został przechwycony, czścimy brzydki hash z paska adresu
      if (window.location.hash && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin // powrót na główny adres aplikacji
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Pasek górny z panelem logowania/wylogowania */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
        <h2>Tablica Komunikacyjna AAC</h2>
        <div>
          {session ? (
            <div>
              <span style={{ marginRight: '15px' }}>Zalogowany: <strong>{session.user.email}</strong></span>
              <button onClick={handleLogout} style={{ padding: '6px 12px', cursor: 'pointer', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '4px' }}>
                Wyloguj
              </button>
            </div>
          ) : (
            <button onClick={handleGoogleLogin} style={{ padding: '6px 12px', cursor: 'pointer', background: '#4285F4', color: '#fff', border: 'none', borderRadius: '4px' }}>
              Zaloguj przez Google
            </button>
          )}
        </div>
      </div>

      {/* GŁÓWNA ZAWARTOŚĆ APLIKACJI - dostępna od razu dla gościa */}
      <div>
        <p>Aplikacja działa w trybie otwartym. Możesz korzystać z tablicy komunikacyjnej bez logowania.</p>
        {/* Tutaj znajduje się właściwa treść Twojej tablice AAC */}
      </div>
    </div>
  );
}

export default App;