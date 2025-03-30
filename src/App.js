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
    { user: 'agent2', pass: 'abcd' }
  ];

  useEffect(() => {
    if (!loggedIn) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get('https://aiphonic.app.n8n.cloud/webhook/coaching-tip');
        setData({ ...res.data, timestamp: new Date().toISOString(), agent });
        setError(null);
      } catch (err) {
        setError('Keine Verbindung zum Coaching-System.');
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [loggedIn, agent]);

  const handleLogin = () => {
    const match = validUsers.find(u => u.user === username && u.pass === password);
    if (match) {
      setAgent(username);
      setLoggedIn(true);
    } else {
      setError('Falscher Benutzername oder Passwort');
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-sm">
          <h2 className="text-xl font-bold mb-4 text-center">🔐 Login für Team</h2>
          <input
            type="text"
            placeholder="Benutzername"
            className="w-full mb-3 px-3 py-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Passwort"
            className="w-full mb-4 px-3 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Einloggen
          </button>
          {error && <p className="text-red-500 text-center mt-3">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4 text-center">🎯 Live Coaching Tipp</h1>

        <p className="text-sm text-right text-gray-400">👤 Agent: {agent}</p>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {data ? (
          <div className="space-y-4 mt-4">
            <div>
              <p className="text-gray-500 text-sm">Phase:</p>
              <p className="text-lg font-semibold">{data.phase}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Stimmung:</p>
              <p className="text-lg font-semibold">{data.stimmung}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Tipp:</p>
              <p className="text-lg text-blue-700 font-bold">{data.tipp}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center">Lade Coaching-Daten...</p>
        )}
      </div>
    </div>
  );
}
