"use client";
import React, { useState, useEffect } from 'react';

const TextToSpeech = () => {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices; // Update voices when they are loaded
  }, []);

  const speak = () => {
    if (!text) return; // Prevent speaking if no text is entered

    const speech = new SpeechSynthesisUtterance();
    speech.text = text;
    speech.lang = 'en-US';
    speech.rate = 1; // Adjust the speech rate (1 is normal speed)
    speech.pitch = 1.2; // Adjust pitch for a more human-like sound
    speech.voice = voices.find(voice => voice.name === 'Google US English') || voices[0] || null; // Use fallback voice

    speech.onstart = () => setIsSpeaking(true);
    speech.onend = () => setIsSpeaking(false);
    speech.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(speech);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', textAlign: 'center' }}>
      <textarea 
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows="4" 
        cols="50"
        placeholder="Enter text here..."
        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '10px' }}
      />
      <div>
        <button 
          onClick={speak}
          disabled={isSpeaking} 
          style={{ marginRight: '10px', padding: '10px 20px', borderRadius: '5px', backgroundColor: '#4CAF50', color: 'white', border: 'none' }}
        >
          {isSpeaking ? 'Speaking...' : 'Speak'}
        </button>
      </div>
    </div>
  );
};

export default TextToSpeech;
