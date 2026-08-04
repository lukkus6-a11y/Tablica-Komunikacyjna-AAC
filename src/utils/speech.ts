/**
 * Utility for Web Speech API Text-to-Speech (TTS) in Polish (pl-PL).
 */

/**
 * Returns available voices, waiting for them to load if necessary.
 * Chrome/Edge load voices asynchronously — getVoices() returns [] on first call.
 */
function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    // Voices not yet loaded — wait for the event (fires once ready)
    const onVoicesChanged = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    // Fallback timeout in case the event never fires (e.g. Firefox)
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    }, 1000);
  });
}

export async function speakText(text: string): Promise<void> {
  if (!text || !('speechSynthesis' in window)) {
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pl-PL';
  utterance.rate = 0.9; // Slightly slower for clear AAC articulation
  utterance.pitch = 1.0;

  // Wait for voices to be ready, then find a Polish voice
  const voices = await getVoicesAsync();
  const plVoice = voices.find((v) => v.lang.startsWith('pl'));
  if (plVoice) {
    utterance.voice = plVoice;
  }

  window.speechSynthesis.speak(utterance);
}
