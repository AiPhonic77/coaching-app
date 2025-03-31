// Coaching Web-App (React + TailwindCSS) mit Login und Agent-Tracking
import React, { useEffect, useState } from 'react';
import axios from 'axios';
// Füge jsPDF zu deiner package.json hinzu, wenn du es verwenden möchtest
// import jsPDF from 'jspdf';

export default function CoachingTipps() {
  const [tipps, setTipps] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [agent, setAgent] = useState('');
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const validUsers = [
    { user: 'agent1', pass: '1234' },
    { user: 'agent2', pass: 'abcd' },
  ];

  const saveTippToNetlify = async (tipp) => {
    try {
      // Stelle sicher, dass der Name exakt mit deiner Netlify-Funktion übereinstimmt
      await axios.post('/.netlify/functions/saveTip', { tipp });
      console.log('Tipp erfolgreich gesendet');
    } catch (err) {
      console.error('Fehler beim Senden des Tipps an Netlify:', err);
    }
  };

  useEffect(() => {
    if (!loggedIn) return;
    
    const fetchTipps = async () => {
      try {
        // Aktualisiere zu deiner korrekten n8n-Webhook-URL
        const res = await axios.get('https://aiphonic.app.n8n.cloud/webhook/coaching-tip');
        
        // Füge console.log hinzu, um die Antwort zu debuggen
        console.log('API-Antwort:', res.data);
        setLastFetchTime(new Date().toLocaleTimeString());
        
        if (res.data) {
          // Die Daten sind direkt in der Antwort, wie im n8n-Screenshot zu sehen
          const neuerTipp = {
            phase: res.data.phase || '',
            stimmung: res.data.stimmung || '',
            tipp: res.data.tipp || '',
            timestamp: new Date().toISOString(),
            agent,
          };
          
          // Nur hinzufügen, wenn der Tipp Inhalt hat
          if (neuerTipp.tipp.trim() !== '') {
            setTipps((prev) => {
              // Prüfen, ob wir bereits einen identischen Tipp haben
              const isDuplicate = prev.some(tip => tip.tipp === neuerTipp.tipp);
              if (isDuplicate) {
                return prev; // Keine Änderung, wenn es ein Duplikat ist
              }
              return [neuerTipp, ...prev]; // Neuen Tipp hinzufügen
            });
            
            await saveTippToNetlify(neuerTipp.tipp);
          }
          
          setError(null);
        }
      } catch (err) {
        console.error('API-Fehler:', err);
        setError('Keine Verbindung zum Coaching-System.');
      }
    };
    
    // Initialer Abruf
    fetchTipps();
    
    const interval = setInterval(fetchTipps, 3000);
    return () => clearInterval(interval);
  }, [loggedIn, agent]);

  const getStimmungClass = (s) => {
    if (s === 'positiv') return 'bg-green-100 border-l-4 border-green-500';
    if (s === 'neutral') return 'bg-yellow-100 border-l-4 border-yellow-500';
    if (s === 'negativ') return 'bg-red-100 border-l-4 border-red-500';
    return 'bg-gray-100';
  };

  const exportTipps = () => {
    // Wenn du jsPDF verwenden möchtest, füge es zu deiner package.json hinzu und entkommentiere den Import
    // const doc = new jsPDF();
    // tipps.forEach((t, i) => {
    //   doc.text(`Tipp #${i + 1}`, 10, 10 + i * 30);
    //   doc.text(`Phase: ${t.phase}`, 10, 15 + i * 30);
    //   doc.text(`Stimmung: ${t.stimmung}`, 10, 20 + i * 30);
    //   doc.text(`Tipp: ${t.tipp}`, 10, 25 + i * 30);
    // });
    // doc.save("coaching-tipps.pdf");
    
    // Alternativ verwende vorerst einen einfachen Export
    alert('PDF Export Funktion erfordert jsPDF Bibliothek');
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

          {/* Debug Info */}
          <div className="bg-gray-100 p-4 mb-4 text-left rounded">
            <h3 className="font-bold">Debug Info:</h3>
            <p>Agent: {agent}</p>
            <p>Anzahl Tipps: {tipps.length}</p>
            <p>Letzter API-Abruf: {lastFetchTime || 'Noch nicht abgerufen'}</p>
          </div>

          {tipps.length === 0 ? (
            <p>Warte auf Coaching-Tipps...</p>
          ) : (
            tipps.map((t, index) => (
              <div key={index} className={`rounded-xl p-4 shadow-md mb-4 text-left ${getStimmungClass(t.stimmung)}`}>
                <p><strong>📌 Phase:</strong> {t.phase}</p>
                <p><strong>😄 Stimmung:</strong> {t.stimmung}</p>
                <p><strong>💡 Tipp:</strong> {t.tipp}</p>
                <p className="text-sm text-gray-500">👤 Agent: {t.agent} | 🕒 {new Date(t.timestamp).toLocaleString()}</p>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}