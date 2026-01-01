import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, MicOff, Volume2, X, AlertTriangle } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: any) => void;
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
  const [isSupported, setIsSupported] = useState(true);
  const [showSupportWarning, setShowSupportWarning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setShowSupportWarning(true);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setIsListening(false);
      
      // Call the Cloud Function with the audio
      await processVoiceCommand(text);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const processVoiceCommand = async (audioData: string) => {
    try {
      setIsProcessing(true);
      const functions = getFunctions();
      const geminiVoiceAssistant = httpsCallable(functions, 'geminiVoiceAssistant');

      // Send the voice input to the backend
      const response = await geminiVoiceAssistant({
        audioContent: audioData,
        mimeType: 'audio/webm'
      });

      const result = response.data as any;
      
      if (result.success && result.audio) {
        setLastCommand(result.text);
        // Play the response audio
        playAudio(result.audio, result.mimeType);
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = (audioBase64: string, mimeType: string) => {
    try {
      const audio = new Audio(`data:${mimeType};base64,${audioBase64}`);
      setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.play().catch(err => console.error('Error playing audio:', err));
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const toggleListening = () => {
    if (!isSupported || isProcessing) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setLastCommand('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  if (!isSupported && showSupportWarning) {
    return (
      <div className="fixed bottom-8 right-8 bg-red-900 text-white p-4 rounded-lg shadow-lg max-w-xs flex items-start gap-3 z-50">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Voice Assistant Not Supported</p>
          <p className="text-sm mt-1">Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.</p>
          <button
            onClick={() => setShowSupportWarning(false)}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={toggleListening}
        disabled={isProcessing || isSpeaking}
        className={`rounded-full p-4 shadow-lg transition-all ${
          isListening
            ? 'bg-red-600 hover:bg-red-700 animate-pulse'
            : isProcessing || isSpeaking
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-cyan-500 hover:bg-cyan-600'
        } text-white`}
        title={isListening ? 'Stop listening' : isProcessing ? 'Processing...' : 'Start voice assistant'}
      >
        {isListening ? (
          <MicOff className="w-6 h-6" />
        ) : isProcessing ? (
          <Mic className="w-6 h-6 opacity-50" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>

      {transcript && (
        <div className="absolute bottom-20 right-0 bg-white text-gray-800 p-3 rounded-lg shadow-lg max-w-xs text-sm">
          <p className="font-semibold mb-1">You said:</p>
          <p>{transcript}</p>
        </div>
      )}

      {lastCommand && (
        <div className="absolute bottom-20 right-0 bg-blue-50 text-blue-900 p-3 rounded-lg shadow-lg max-w-xs text-sm">
          <p className="font-semibold mb-1">Assistant:</p>
          <p>{lastCommand}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
