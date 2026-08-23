import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Bezpieczne pobranie sesji z obsługą błędów (ignoruje brak zalogowania / status 401)
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (!error) {
          setSession(session);
        }
      })
      .catch(() => {
        // Ignorujemy błędy braku autoryzacji dla niezalogowanego użytkownika
      })
      .finally(() => {
        setLoading(false);
      });

    // Nasłuchiwanie zmian stanu logowania w czasie rzeczywistym
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Ładowanie...</div>;
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Tablica Komunikacyjna AAC</h1>
      {session ? (
        <div>
          <p>Zalogowano jako: <strong>{session.user.email}</strong></p>
          <button 
            onClick={handleLogout}
            style={{ padding: '10px 20px', cursor: 'pointer', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '5px' }}
          >
            Wyloguj się
          </button>
        </div>
      ) : (
        <div>
          <p>Nie jesteś zalogowany.</p>
          <button 
            onClick={handleGoogleLogin}
            style={{ padding: '10px 20px', cursor: 'pointer', background: '#4285F4', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '16px' }}
          >
            Zaloguj przez Google
          </button>
        </div>
      )}
    </div>
  );
}

export default App;