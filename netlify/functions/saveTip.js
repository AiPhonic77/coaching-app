let latestTip = '';

exports.handler = async (event, context) => {
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);
      // Akzeptiere entweder 'tipp' (aus deinem Frontend-Code) oder 'tip' (häufigere Schreibweise)
      latestTip = body.tipp || body.tip || 'Kein Tipp empfangen.';
      
      console.log('Tipp in Netlify-Funktion empfangen:', latestTip);
      
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Tipp erfolgreich gespeichert' }),
      };
    } catch (error) {
      console.error('Fehler bei der Verarbeitung der Anfrage:', error);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Ungültiger Request-Body' }),
      };
    }
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        tipp: latestTip,
        timestamp: new Date().toISOString() 
      }),
    };
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Methode nicht erlaubt' }),
  };
};