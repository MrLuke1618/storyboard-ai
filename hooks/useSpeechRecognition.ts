import { useState, useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Check for browser support once, outside the hook, for immediate and consistent results.
const SpeechRecognitionAPI = typeof window !== 'undefined' 
    ? window.SpeechRecognition || window.webkitSpeechRecognition 
    : null;

export const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<any>(null);
    
    // isSupported is a constant for the hook's lifecycle, derived from the check above.
    const isSupported = !!SpeechRecognitionAPI;

    useEffect(() => {
        // Don't setup anything if the browser doesn't support the API.
        if (!isSupported) {
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognitionRef.current = recognition;
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript;
            setTranscript(text);
        };
        
        recognition.onend = () => {
            setIsListening(false);
        };
        
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        // When the component unmounts, abort any ongoing recognition.
        // This is safer than 'stop()' for cleanup, especially in React Strict Mode.
        return () => {
            recognition.abort();
        };
    }, [isSupported]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening && isSupported) {
            setTranscript('');
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error("Could not start speech recognition", e);
                setIsListening(false);
            }
        }
    }, [isListening, isSupported]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop(); // stop() is the correct user action. It will trigger 'onend'.
        }
    }, [isListening]);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        isSupported,
    };
};
