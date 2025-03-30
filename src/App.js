// Coaching Web-App (React + TailwindCSS) mit Login und Agent-Tracking
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CoachingTips() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [agent, setAgent] = useState('');

  const validUsers = [
    { user: 'agent1', pass: '1234' },
    { user: 'agent2', pass: 'abcd' },
  ];

  // Neue Funktion: speichert Tipp per POST auf Netlify
  const saveTipToNetlify = async (tipp) => {
    try {
      await axios.post('/.netlify/functions/saveTip', { tipp });
      console.log('Tipp erfolgreich gesendet');
    } catch (err) {
      console.error('Fehler beim Senden des Tipps an Netlify:', err);
    }
  };

  // Holt regelmäßig neue Tipps von n8n
  useEffect(() => {
    if (!loggedIn) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          'https://aiphonic.app.n8n.cloud/webhook/coaching-tip'
        );

        // GPT-Antwort korrekt als JSON parsen
        let gptAntwort;
        try {
          gptAntwort = JSON.parse(res.data.message?.content || '{}');
        } catch (e) {
          gptAntwort = {};
        }

        const neuerTipp = {
          phase: gptAntwort.phase || '',
          stimmung: gptAntwort.stimmung || '',
          tipp: gptAntwort.tipp || '',
          timestamp: new Date().toISOString(),
          agent,
        };

        setData(neuerTipp);
        setError(null);
        await saveTipToNetlify(neuerTipp);
      } catch (err) {
        setError('Keine Verbindung zum Coaching-System.');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [loggedIn, agent]);

  return (
    <div className="p-4 text-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">🎯 <span className="text-black">Live Coaching Tipp</span></h1>

      {!loggedIn && (
        <div>
          <input
            type="text"
            placeholder="Benutzername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 m-1 rounded"
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 m-1 rounded"
          />
          <button
            onClick={() => {
              const found = validUsers.find(
                (u) => u.user === username && u.pass === password
              );
              if (found) {
                setLoggedIn(true);
                setAgent(username);
              } else {
                setError('Login fehlgeschlagen');
              }
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 m-1 rounded"
          >
            Login
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      )}

      {loggedIn && data && (
        <div className="bg-white shadow-xl rounded-2xl p-6 mt-6 max-w-xl mx-auto text-left transition">
          <p className="text-lg mb-2"><strong>📌 Phase:</strong> {data.phase || '–'}</p>
          <p className="text-lg mb-2"><strong>😷 Stimmung:</strong> {data.stimmung || '–'}</p>
          <p className="text-lg mb-2"><strong>💡 Tipp:</strong> {data.tipp || '–'}</p>

          <div className="text-sm text-gray-400 mt-4 flex justify-between">
            <span>👤 Agent: {agent}</span>
            <span>🕒 {data.timestamp}</span>
          </div>
        </div>
      )}
    </div>
  );
}
