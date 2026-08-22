import { useAIStore } from '@/store/aiStore';
import { useLayoutStore } from '@/store/layoutStore';
import { Button } from '@/components/ui/button';
import { Bot, X, Send, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatPanel() {
  const { isOpen, toggleChat, provider } = useAIStore();
  const { layout } = useLayoutStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Hi! I'm NIVA ROBO, your personal AI Architectural Assistant. How can I help you refine your DreamNest today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          provider,
          layout,
        }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let assistantText = '';
      let buffer = '';

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: '' }]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // keep the last incomplete line
          
          let updated = false;
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const text = JSON.parse(line.substring(2));
                assistantText += text;
                updated = true;
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
          
          // Only trigger a React re-render once per network chunk, instead of per token
          if (updated) {
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = {
                ...newMessages[newMessages.length - 1],
                content: assistantText
              };
              return newMessages;
            });
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "How can I improve this layout?",
    "Is this Vastu friendly?",
    "How much will this cost?",
    "Suggest some furniture for the living room."
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 transition-transform z-50 flex items-center justify-center"
      >
        <Bot className="w-6 h-6 text-white" />
      </Button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed bottom-20 right-4 md:bottom-24 md:right-6 bg-white border border-slate-200 shadow-2xl rounded-2xl flex flex-col overflow-hidden z-50 transition-all duration-300 ${
              isExpanded ? 'w-[calc(100vw-2rem)] md:w-[600px] h-[80vh]' : 'w-[calc(100vw-2rem)] md:w-[400px] h-[600px] max-h-[70vh]'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-lg">NIVA ROBO</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsExpanded(!isExpanded)} className="hover:bg-white/10 p-1 rounded">
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button onClick={toggleChat} className="hover:bg-white/10 p-1 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 mt-10 space-y-6">
                  <Bot className="w-12 h-12 mx-auto text-slate-300" />
                  <p>Hi! I'm NIVA ROBO. How can I help you design your dream home?</p>
                  
                  {/* Suggestions */}
                  <div className="flex flex-wrap justify-center gap-2 px-4">
                    {suggestions.map((suggestion, i) => (
                      <button 
                        key={i}
                        onClick={() => setInput(suggestion)}
                        className="text-xs bg-white border border-slate-200 shadow-sm rounded-full px-3 py-1.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                        m.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                      }`}
                    >
                      <div className={`prose prose-sm max-w-none ${m.role === 'user' ? 'prose-invert' : ''}`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm as any]}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input
                className="flex-1 border border-slate-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                value={input}
                placeholder="Ask about your floor plan..."
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="rounded-full shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
