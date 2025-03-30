import React, { useEffect, useState } from 'react';

const LiveTippBox = () => {
  const [coachingTip, setCoachingTip] = useState('Lade Coaching-Daten...');

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const response = await fetch('/.netlify/functions/saveTip');
        const data = await response.json();
        setCoachingTip(data.tipp || 'Kein Coaching-Tipp erhalten');
      } catch (error) {
        setCoachingTip('Verbindung zum Coaching-System fehlgeschlagen');
        console.error('Fehler beim Abrufen des Tipps:', error);
      }
    };

    fetchTip(); // beim Start sofort Tipp laden
    const interval = setInterval(fetchTip, 3000); // dann alle 3 Sekunden

    return () => clearInterval(interval); // Aufräumen, wenn Komponente verschwindet
  }, []);

  return (
    <div className="p-4 bg-white text-center shadow-md rounded-xl mt-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-2">🎯 Live Coaching Tipp</h2>
      <p className="text-gray-700">{coachingTip}</p>
    </div>
  );
};

export default LiveTippBox;
