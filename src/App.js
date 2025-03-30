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

  // ✅ Funktion: speichert Tipp per POST auf Netlify
  const saveTipToNetlify = async (tipp) => {
    try {
      await axios.post('/.netlify/functions/saveTip', { tipp });
      console.log('Tipp erfolgreich an Netlify gesendet');
    } catch (err) {
      console.error('Fehler beim Senden des Tipps an Netlify:', err);
    }
  };

  // 🔁 Holt alle 3 Sekunden neue Tipps von n8n und speichert sie live
  useEffect(() => {
    if (!loggedIn) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get('https://aiphonic.app.n8n.cloud/webhook/coaching-tip');
        const parsed = JSON.parse(res.data.message.content || '{}');

        const neuerTipp = {
          tipp: parsed.tipp || 'Kein Tipp erhalten',
          timestamp: new Date().toISOString(),
          agent,
        };

        setData(neuerTipp);
        setError(null);
        await saveTipToNetlify(parsed.tipp);
      } catch (err) {
        console.error(err);
        setError('Keine Verbindung zum Coaching-System.');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [loggedIn, agent]);

  return (
    <div className="p-4 text-center">
      <h1 className="text-xl font-bold mb-4">🎯 Live Coaching Tipp</h1>

      {!loggedIn && (
        <div>
          <input
            type="text"
            placeholder="Benutzername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 m-1"
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 m-1"
          />
          <button
            onClick={() => {
              const found = validUsers.find(u => u.user === username && u.pass === password);
              if (found) {
                setLoggedIn(true);
                setAgent(username);
              } else {
                setError('Login fehlgeschlagen');
              }
            }}
            className="bg-blue-500 text-white p-2 m-1"
          >
            Login
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      )}

      {loggedIn && data && (
        <div className="bg-white shadow rounded p-4 mt-4 max-w-xl mx-auto">
          <p className="text-gray-800 text-lg">{data.tipp}</p>
          <p className="text-sm text-gray-400 mt-2">👤 Agent: {agent}</p>
          <p className="text-sm text-gray-400">🕒 {data.timestamp}</p>
        </div>
      )}

      {loggedIn && !data && (
        <p className="text-red-500 mt-4">Lade Coaching-Daten...</p>
      )}
    </div>
  );
}
