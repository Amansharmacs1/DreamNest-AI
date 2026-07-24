import { useState } from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { useAIStore } from '@/store/aiStore';
import { Button } from '@/components/ui/button';
import { Bot, Mic, Send, Loader2 } from 'lucide-react';

export default function AIPromptBar() {
  const { provider } = useAIStore();
  const { updatePreferences } = useWizardStore();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please try Chrome.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleProcess(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const handleProcess = async (textToProcess: string = input) => {
    if (!textToProcess.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/ai/parse-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToProcess, provider })
      });

      const parsedData = await response.json();
      
      // Merge parsed data deeply into Wizard store
      if (parsedData.plot) {
        updatePreferences('plot', parsedData.plot);
      }
      if (parsedData.building) {
        updatePreferences('building', parsedData.building);
      }
      if (parsedData.rooms) {
        updatePreferences('rooms', parsedData.rooms);
      }
      if (parsedData.outdoor) {
        updatePreferences('outdoor', parsedData.outdoor);
      }

      setInput('');
      alert('AI updated your preferences successfully!');

    } catch (error) {
      console.error('AI Processing error:', error);
      alert('Failed to process request.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex gap-3 shadow-sm items-center">
      <Bot className="w-6 h-6 text-blue-600 shrink-0" />
      <input 
        className="flex-1 bg-white border border-blue-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type or say 'I want a 2 floor house with 3 bedrooms and parking...'"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
        disabled={isProcessing}
      />
      <Button 
        variant="outline" 
        size="icon" 
        className={`rounded-full shrink-0 ${isListening ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : ''}`}
        onClick={startListening}
        disabled={isProcessing}
      >
        <Mic className="w-4 h-4" />
      </Button>
      <Button 
        size="icon" 
        className="rounded-full shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => handleProcess()}
        disabled={isProcessing || !input.trim()}
      >
        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </Button>
    </div>
  );
}
