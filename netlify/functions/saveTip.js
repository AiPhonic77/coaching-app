let latestTip = '';

exports.handler = async (event, context) => {
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body);
    latestTip = body.tipp || 'Kein Tipp empfangen.';
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({ tipp: latestTip }),
    };
  }

  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
