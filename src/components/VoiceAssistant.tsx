import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, MicOff, Volume2, X } from 'lucide-react';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: any) => void;
  onend: (event: any) => void;
  onerror: (event: any) => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const VoiceAssistant: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processCommand(text);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        // Don't speak on error to avoid loops
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const processCommand = (text: string) => {
    const command = text.toLowerCase();
    setLastCommand(command);

    if (command.includes('dashboard') || command.includes('home')) {
      speak('Navigating to Dashboard');
      navigate('/');
    } else if (command.includes('content lab') || command.includes('create content')) {
      speak('Opening Content Lab');
      navigate('/content-lab');
    } else if (command.includes('add client') || command.includes('new client')) {
      speak('Opening Add Client page');
      navigate('/add-client');
    } else if (command.includes('templates')) {
      speak('Showing Templates');
      navigate('/templates');
    } else if (command.includes('prompt') || command.includes('guide')) {
      speak('Opening Prompt Guide');
      navigate('/prompt-guide');
    } else if (command.includes('billing') || command.includes('subscription')) {
      speak('Opening Billing');
      navigate('/billing');
    } else if (command.includes('downloads')) {
      speak('Going to Downloads');
      navigate('/downloads');
    } else if (command.includes('hello') || command.includes('hi')) {
        speak('Hello! I am your Social Stax assistant. How can I help you today?');
    } else if (command.includes('help')) {
        speak('I can help you navigate. Try saying "Go to Content Lab" or "Add Client".');
    } else {
      speak("I heard " + text + ", but I'm not sure what to do.");
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
      speak("Listening...");
    }
  };

  if (!recognitionRef.current) return null; // Don't render if not supported

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group">
      {/* Transcript Bubble */}
      {(isListening || transcript) && (
        <div className="bg-black/90 text-white px-4 py-2 rounded-xl border border-gray-800 mb-2 max-w-xs shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2">
          <p className="text-sm font-mono text-green-400">
            {isListening ? '> Listening...' : `> ${transcript}`}
          </p>
        </div>
      )}

      {/* Button */}
      <button
        onClick={toggleListening}
        className={`p-4 rounded-full shadow-2xl transition-all transform active:scale-95 ${
          isListening 
            ? 'bg-red-600 animate-pulse ring-4 ring-red-600/30' 
            : isSpeaking
              ? 'bg-blue-600 ring-4 ring-blue-600/30'
              : 'bg-gray-900 border border-gray-700 hover:bg-gray-800 hover:border-red-500/50'
        }`}
        title="Voice Assistant"
      >
        {isListening ? (
          <Mic className="text-white" size={24} />
        ) : isSpeaking ? (
          <Volume2 className="text-white" size={24} />
        ) : (
          <MicOff className="text-gray-400 group-hover:text-white transition-colors" size={24} />
        )}
      </button>
    </div>
  );
};

export default VoiceAssistant;
