// Text-to-Speech, Speech Recognition, and Web Audio synthesizers for accessible elder care

export function speakText(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88; // Slightly slower, calm cadence for elderly clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn("Speech synthesis error:", e);
  }
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function playSuccessChime() {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Pleasant three-tone chime (C5 -> E5 -> G5)
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    };

    playTone(523.25, now, 0.25);        // C5
    playTone(659.25, now + 0.12, 0.25); // E5
    playTone(783.99, now + 0.24, 0.4);  // G5
  } catch (e) {
    console.warn("Audio chime error:", e);
  }
}

export function playEmergencyAlarm() {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Siren warble
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.25);
    osc.frequency.linearRampToValueAtTime(800, now + 0.5);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.75);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.0);
  } catch (e) {
    console.warn("Emergency sound error:", e);
  }
}

// Two-way Voice Recognition Listener
export interface VoiceCommandHandlers {
  onTakeNextDose?: () => void;
  onReadSchedule?: () => void;
  onLogWater?: () => void;
  onTriggerSOS?: () => void;
  onTranscript?: (text: string) => void;
  onError?: (err: string) => void;
  onEnd?: () => void;
}

export function startVoiceRecognition(handlers: VoiceCommandHandlers) {
  if (typeof window === "undefined") return null;

  // Type definitions for SpeechRecognition API
  const SpeechRec =
    (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any })
      .SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;

  if (!SpeechRec) {
    handlers.onError?.("Voice speech recognition is not supported in this browser.");
    return null;
  }

  try {
    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      handlers.onTranscript?.(transcript);

      // Natural language command parser
      if (
        transcript.includes("took") ||
        transcript.includes("take") ||
        transcript.includes("done") ||
        transcript.includes("finished pills")
      ) {
        speakText("Marking your medication as taken. Good job!");
        handlers.onTakeNextDose?.();
      } else if (
        transcript.includes("what") ||
        transcript.includes("schedule") ||
        transcript.includes("next") ||
        transcript.includes("today")
      ) {
        handlers.onReadSchedule?.();
      } else if (
        transcript.includes("water") ||
        transcript.includes("drink") ||
        transcript.includes("hydrated")
      ) {
        speakText("Great job staying hydrated! Recording a glass of water.");
        handlers.onLogWater?.();
      } else if (
        transcript.includes("emergency") ||
        transcript.includes("help") ||
        transcript.includes("call doctor") ||
        transcript.includes("sos")
      ) {
        speakText("Activating Emergency Assistance beacon now!");
        handlers.onTriggerSOS?.();
      } else {
        speakText(`I heard: ${transcript}. You can say 'I took my medicine', 'What is next', 'Water', or 'Emergency'.`);
      }
    };

    recognition.onerror = (event: any) => {
      handlers.onError?.(event.error || "Speech recognition error");
    };

    recognition.onend = () => {
      handlers.onEnd?.();
    };

    recognition.start();
    return recognition;
  } catch (e) {
    handlers.onError?.("Failed to start voice listener.");
    return null;
  }
}
