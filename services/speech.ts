let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speak(text: string, onEnd: () => void) {
  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1;

  utterance.onend = () => {
    currentUtterance = null;
    onEnd();
  };

  utterance.onerror = () => {
    currentUtterance = null;
    onEnd();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (currentUtterance) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}
