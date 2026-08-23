import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Pobranie sesji bez blokowania aplikacji
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    }).catch(() => {});

    // Nasłuchiwanie zmian logowania
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif' }}>
      {/* Górny panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Tablica Komunikacyjna AAC</h1>
        <div>
          {session ? (
            <div>
              <span style={{ marginRight: '15px' }}>Zalogowany: <strong>{session.user.email}</strong></span>
              <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}>
                Wyloguj
              </button>
            </div>
          ) : (
            <button onClick={handleGoogleLogin} style={{ padding: '8px 16px', cursor: 'pointer', background: '#4285F4', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
              Zaloguj przez Google
            </button>
          )}
        </div>
      </div>

      {/* Główna treść dostępna od razu dla gościa */}
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3>Witaj w trybie gościa!</h3>
        <p>Możesz swobodnie korzystać z tablice komunikacyjnej bez konieczności logowania.</p>
      </div>
    </div>
  );
}

export default App;