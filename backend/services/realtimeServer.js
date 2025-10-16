const { WebSocketServer } = require('ws');

// Minimal realtime server scaffold. This accepts Twilio Media Streams
// and simply logs frames. Replace TODOs with ASR/LLM/TTS integrations.

function attachRealtimeServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/realtime' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const agentId = url.searchParams.get('agentId');
    const callId = url.searchParams.get('callId');
    console.log('🛰️ Realtime WS connected:', { agentId, callId });

    // Twilio Media Streams sends JSON messages & base64 audio in events
    ws.on('message', async (data) => {
      try {
        const msg = JSON.parse(data.toString());
        // Examples of events: start, media (audio), mark, stop
        switch (msg.event) {
          case 'start':
            console.log('🔊 stream started', msg.start);
            break;
          case 'media':
            // msg.media.payload is base64-encoded audio (mulaw)
            // TODO: send to streaming ASR, feed LLM, generate TTS
            break;
          case 'stop':
            console.log('🔇 stream stopped');
            break;
          default:
            break;
        }
      } catch (_) {
        // Non-JSON frames can be ignored safely
      }
    });

    ws.on('close', () => {
      console.log('🛰️ Realtime WS disconnected');
    });
  });
}

module.exports = { attachRealtimeServer };


