"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react"; // Icon

interface VoiceControlProps {
  onInput: (text: string) => void; // Ei function ta text parent-e pathabe
}

export default function VoiceControl({ onInput }: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Browser check: SpeechRecognition support kore kina
    if (typeof window !== "undefined") {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false; // Ekbar bole theme jabe
        reco.lang = "en-US";     // English-e shonbe
        reco.interimResults = false;

        reco.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          console.log("🎤 Heard:", transcript);
          onInput(transcript); // Text ta parent component-e pathiye dicchi
          setIsListening(false);
        };

        reco.onerror = (event: any) => {
          console.error("Mic Error:", event.error);
          setIsListening(false);
        };

        reco.onend = () => {
          setIsListening(false);
        };

        setRecognition(reco);
      }
    }
  }, [onInput]);

  const toggleListen = () => {
    if (!recognition) {
      alert("Browser does not support voice!");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <button
      onClick={toggleListen}
      className={`p-3 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center
        ${isListening 
          ? "bg-red-500/20 text-red-500 border border-red-500 animate-pulse scale-110" 
          : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20"
        }`}
      title="Activate Voice Command"
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
}