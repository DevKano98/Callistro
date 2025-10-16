require('dotenv').config();
const app = require('./app');
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Callisto backend running on http://localhost:${PORT}`);
});

// Optional: initialize WebSocket realtime server for Twilio Media Streams
if (process.env.REALTIME_ENABLED === 'true') {
  try {
    const { attachRealtimeServer } = require('./services/realtimeServer');
    attachRealtimeServer(server);
    console.log('✅ Realtime WebSocket server attached');
  } catch (err) {
    console.warn('⚠️ Failed to attach realtime server:', err.message);
  }
}