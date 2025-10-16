function getIntent(transcript, keywords) {
  const lower = transcript.toLowerCase();
  for (const [intent, phrases] of Object.entries(keywords)) {
    if (phrases.some(phrase => lower.includes(phrase))) {
      return intent;
    }
  }
  return 'fallback';
}

module.exports = { getIntent };