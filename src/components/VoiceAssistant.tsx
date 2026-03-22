import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, X, Minimize2, Maximize2, Bot, Loader2, Navigation } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { getFirebaseFunctions } from '@/config/firebase';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// App navigation map for assistant
const APP_ROUTES: Record<string, string> = {
  dashboard: '/',
  home: '/',
  clients: '/clients',
  'all clients': '/clients',
  'add client': '/add-client',
  'create client': '/add-client',
  'new client': '/add-client',
  templates: '/templates',
  'content lab': '/content-lab',
  content: '/content-lab',
  'prompt guide': '/prompt-guide',
  prompts: '/prompt-guide',
  billing: '/billing',
  subscription: '/billing',
  downloads: '/downloads',
  settings: '/settings',
  admin: '/admin',
};

const SYSTEM_CONTEXT = `You are Stax, a smart AI assistant built into the Social StaX marketing platform. You help users navigate the app and manage social media marketing.

The app has these sections:
- Dashboard (/): Overview of clients and recent posts
- Clients (/clients): List of all managed social media clients
- Add Client (/add-client): Create a new client profile
- Content Lab (/content-lab): AI-powered content generation for social media
- Templates (/templates): Pre-built content templates
- Prompt Guide (/prompt-guide): Guide to writing effective prompts
- Billing (/billing): Subscription and billing management
- Downloads (/downloads): Export and download content
- Settings (/settings): App and account settings
- Admin (/admin): Admin panel for managing users

When a user asks to go somewhere, navigate somewhere, or open a section — include a special navigation marker in your response like: [NAVIGATE:/route]
Example: "Sure! Taking you to the Content Lab now. [NAVIGATE:/content-lab]"

Always be helpful, concise, and friendly. You can help with:
- App navigation
- Social media advice
- Content strategy tips
- Feature explanations`;

const VoiceAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "Hi! I'm Stax, your AI assistant. I can help you navigate the app and answer marketing questions. Just tap the mic and speak!",
      timestamp: new Date(),
    }
  ]);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [isTTSSupported, setIsTTSSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechAPI) {
      setIsSupported(false);
    }
    if (!window.speechSynthesis) {
      setIsTTSSupported(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const speak = useCallback((text: string) => {
    if (!isTTSSupported || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // Strip navigation markers before speaking
    const cleanText = text.replace(/\[NAVIGATE:[^\]]+\]/g, '').trim();
    if (!cleanText) return;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1;
    utterance.volume = 1;
    // Prefer a high-quality voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Daniel')
    ) || voices.find(v => v.lang === 'en-US') || voices[0];
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [isTTSSupported]);

  const parseAndHandleNavigation = useCallback((text: string) => {
    const navMatch = text.match(/\[NAVIGATE:([^\]]+)\]/);
    if (navMatch) {
      const route = navMatch[1];
      setTimeout(() => navigate(route), 500);
      return true;
    }
    // Also check for natural language navigation phrases
    const lowerText = text.toLowerCase();
    for (const [keyword, route] of Object.entries(APP_ROUTES)) {
      if (lowerText.includes(`going to ${keyword}`) || lowerText.includes(`opening ${keyword}`) || lowerText.includes(`navigating to ${keyword}`)) {
        setTimeout(() => navigate(route), 500);
        return true;
      }
    }
    return false;
  }, [navigate]);

  const processUserMessage = useCallback(async (userText: string) => {
    if (!userText.trim()) return;
    setIsProcessing(true);
    setTranscript('');

    const userMsg: Message = { role: 'user', text: userText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    // Check for simple local navigation first (offline-capable)
    const lower = userText.toLowerCase();
    for (const [keyword, route] of Object.entries(APP_ROUTES)) {
      const patterns = [
        `go to ${keyword}`, `open ${keyword}`, `navigate to ${keyword}`,
        `take me to ${keyword}`, `show me ${keyword}`, `go ${keyword}`
      ];
      if (patterns.some(p => lower.includes(p))) {
        const responseText = `Sure! Taking you to ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} now. [NAVIGATE:${route}]`;
        const assistantMsg: Message = { role: 'assistant', text: responseText, timestamp: new Date() };
        setMessages(prev => [...prev, assistantMsg]);
        speak(responseText);
        parseAndHandleNavigation(responseText);
        setIsProcessing(false);
        return;
      }
    }

    // Call Gemini via cloud function
    try {
      const functions = getFirebaseFunctions();
      const geminiChat = httpsCallable(functions, 'geminiLiveChat');

      // Build conversation history for context
      const history = messages.slice(-6).map(m => ({
        role: m.role,
        text: m.text.replace(/\[NAVIGATE:[^\]]+\]/g, '').trim()
      }));

      const result = await geminiChat({
        message: userText,
        history,
        systemContext: SYSTEM_CONTEXT,
      }) as any;

      const responseText: string = result.data?.text || "I'm sorry, I didn't catch that. Could you try again?";
      const assistantMsg: Message = { role: 'assistant', text: responseText, timestamp: new Date() };
      setMessages(prev => [...prev, assistantMsg]);
      speak(responseText);
      parseAndHandleNavigation(responseText);
    } catch (error: any) {
      console.error('Gemini chat error:', error);
      const errMsg = 'Sorry, I had trouble connecting. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', text: errMsg, timestamp: new Date() }]);
      speak(errMsg);
    } finally {
      setIsProcessing(false);
    }
  }, [messages, speak, parseAndHandleNavigation]);

  const startListening = useCallback(() => {
    if (!isSupported || isProcessing || isSpeaking) return;
    const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechAPI) return;

    window.speechSynthesis?.cancel();
    const recognition = new SpeechAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      const text = lastResult[0].transcript;
      setTranscript(text);
      if (lastResult.isFinal) {
        recognition.stop();
        processUserMessage(text);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error);
      setIsListening(false);
      setTranscript('');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isSupported, isProcessing, isSpeaking, processUserMessage]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleClose = () => {
    stopListening();
    window.speechSynthesis?.cancel();
    setIsOpen(false);
  };

  // Floating button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 group"
        title="Open AI Assistant"
      >
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 shadow-lg shadow-purple-900/40 flex items-center justify-center transition-all hover:scale-110 hover:shadow-purple-900/60">
          <Bot className="w-7 h-7 text-white" />
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 opacity-30 animate-ping" />
        </div>
        <div className="absolute -top-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700">
          AI Assistant
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed z-50 transition-all duration-300 ${
      isExpanded
        ? 'bottom-4 right-4 w-96 h-[600px]'
        : 'bottom-8 right-8 w-80 h-[460px]'
    }`}>
      {/* Main panel */}
      <div className="w-full h-full flex flex-col bg-gray-950 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/30 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-950 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Stax AI</p>
              <p className="text-xs text-gray-500">
                {isListening ? '🔴 Listening...' : isProcessing ? '⏳ Thinking...' : isSpeaking ? '🔊 Speaking...' : '● Ready'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(p => !p)}
              className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              title="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                  <Bot size={12} className="text-white" />
                </div>
              )}
              <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-br-sm'
                  : 'bg-gray-800 text-gray-200 rounded-bl-sm border border-gray-700'
              }`}>
                {/* Strip navigation markers from display */}
                {msg.text.replace(/\[NAVIGATE:[^\]]+\]/g, '').trim()}
                {msg.text.includes('[NAVIGATE:') && (
                  <span className="flex items-center gap-1 mt-1 text-xs text-cyan-400">
                    <Navigation size={10} /> Navigating...
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Live transcript */}
          {transcript && (
            <div className="flex justify-end">
              <div className="max-w-[85%] px-3 py-2 rounded-xl text-sm bg-gray-800/50 text-gray-400 italic border border-dashed border-gray-700">
                {transcript}
              </div>
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && !transcript && (
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mr-2 flex-shrink-0">
                <Bot size={12} className="text-white" />
              </div>
              <div className="px-3 py-2 rounded-xl bg-gray-800 border border-gray-700">
                <div className="flex gap-1 items-center h-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Controls */}
        <div className="p-3 border-t border-white/5 bg-gray-900/50">
          <div className="flex items-center justify-center gap-3">
            {isSpeaking && (
              <button
                onClick={() => { window.speechSynthesis?.cancel(); setIsSpeaking(false); }}
                className="p-2.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
                title="Stop speaking"
              >
                <Volume2 size={16} />
              </button>
            )}

            <button
              onClick={toggleListening}
              disabled={isProcessing}
              className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-900/40'
                  : isProcessing
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-gradient-to-br from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-purple-900/40'
              }`}
              title={isListening ? 'Stop' : 'Speak to Stax'}
            >
              {isListening && (
                <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-30" />
              )}
              {isProcessing ? (
                <Loader2 size={22} className="text-white animate-spin" />
              ) : isListening ? (
                <MicOff size={22} className="text-white" />
              ) : (
                <Mic size={22} className="text-white" />
              )}
            </button>
          </div>

          <p className="text-center text-xs text-gray-600 mt-2">
            {!isSupported
              ? 'Voice not supported in this browser'
              : isListening
              ? 'Listening... tap to stop'
              : isProcessing
              ? 'Processing your request...'
              : 'Tap mic to speak · Can navigate the app'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
