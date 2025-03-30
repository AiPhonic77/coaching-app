// Coaching Web-App (React + TailwindCSS) mit Login und Agent-Tracking
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';

export default function CoachingTipps() {
  const [tipps, setTipps] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [agent, setAgent] = useState('');
  const [error, setError] = useState(null);

  const validUsers = [
    { user: 'agent1', pass: '1234' },
    { user: 'agent2', pass: 'abcd' },
  ];

  const saveTippToNetlify = async (tipp) => {
    try {
      await axios.post('/.netlify/functions/saveTipp', { tipp });
      console.log('Tipp erfolgreich gesendet');
    } catch (err) {
      console.error('Fehler beim Senden des Tipps an Netlify:', err);
    }
  };

  useEffect(() => {
    if (!loggedIn) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get('https://aiphonic.app.n8n.cloud/webhook/coaching-tip');
        const neuerTipp = {
          phase: res.data.phase || '',
          stimmung: res.data.stimmung || '',
          tipp: res.data.tipp || res.data.message?.content || '',
          timestamp: new Date().toISOString(),
          agent,
        };
        setTipps((prev) => [neuerTipp, ...prev]);
        await saveTippToNetlify(neuerTipp);
        setError(null);
      } catch (err) {
        setError('Keine Verbindung zum Coaching-System.');
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [loggedIn, agent]);

  const getStimmungClass = (s) => {
    if (s === 'positiv') return 'bg-green-100 border-l-4 border-green-500';
    if (s === 'neutral') return 'bg-yellow-100 border-l-4 border-yellow-500';
    if (s === 'negativ') return 'bg-red-100 border-l-4 border-red-500';
    return 'bg-gray-100';
  };

  const exportTipps = () => {
    const doc = new jsPDF();
    tipps.forEach((t, i) => {
      doc.text(`Tipp #${i + 1}`, 10, 10 + i * 30);
      doc.text(`Phase: ${t.phase}`, 10, 15 + i * 30);
      doc.text(`Stimmung: ${t.stimmung}`, 10, 20 + i * 30);
      doc.text(`Tipp: ${t.tipp}`, 10, 25 + i * 30);
    });
    doc.save("coaching-tipps.pdf");
  };

  // UI Bereich
  return (
    <div className="p-4 min-h-screen bg-gray-50 text-center">
      <h1 className="text-2xl font-bold mb-6">🎯 Live Coaching Tipp</h1>

      {!loggedIn && (
        <div className="max-w-sm mx-auto">
          <input
            type="text"
            placeholder="Benutzername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 mb-2 w-full rounded"
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 mb-4 w-full rounded"
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            onClick={() => {
              const found = validUsers.find((u) => u.user === username && u.pass === password);
              if (found) {
                setLoggedIn(true);
                setAgent(username);
              } else {
                alert('Ungültige Zugangsdaten');
              }
            }}
          >
            Login
          </button>
        </div>
      )}

      {loggedIn && (
        <>
          <button
            onClick={exportTipps}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4"
          >
            📤 Export als PDF
          </button>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          {tipps.map((t, index) => (
            <div key={index} className={`rounded-xl p-4 shadow-md mb-4 text-left ${getStimmungClass(t.stimmung)}`}>
              <p><strong>📌 Phase:</strong> {t.phase}</p>
              <p><strong>😄 Stimmung:</strong> {t.stimmung}</p>
              <p><strong>💡 Tipp:</strong> {t.tipp}</p>
              <p className="text-sm text-gray-500">👤 Agent: {t.agent} | 🕒 {new Date(t.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
