import { useState, useRef, useEffect } from 'react';
import { useLayoutStore } from '@/store/layoutStore';
import { useOptimizationStore } from '@/store/optimizationStore';
import { Button } from '@/components/ui/button';
import { Settings2, Zap, Play, X, Loader2, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OptimizationPanel() {
  const { layout } = useLayoutStore();
  const { lockedRooms } = useOptimizationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progressMessages, setProgressMessages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [weights, setWeights] = useState({
    spaceEfficiency: 0.2,
    lighting: 0.2,
    privacy: 0.2,
    ventilation: 0.15,
    energy: 0.15,
    accessibility: 0.1,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [progressMessages]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof weights) => {
    setWeights(prev => ({ ...prev, [key]: parseFloat(e.target.value) }));
  };

  const handleOptimize = async () => {
    if (!layout) return;
    setIsOptimizing(true);
    setProgressMessages(['Starting optimization engine...']);

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/optimization/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layout,
          weights,
          prompt,
          constraints: lockedRooms.map(id => ({ id, locked: true }))
        }),
      });

      if (!response.body) throw new Error('No readable stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\\n\\n').filter(line => line.trim().startsWith('data: '));

        for (const line of lines) {
          const dataStr = line.replace(/^data: /, '');
          try {
            const data = JSON.parse(dataStr);
            if (data.type === 'progress') {
              setProgressMessages(prev => [...prev, data.message]);
            } else if (data.type === 'complete') {
              setProgressMessages(prev => [...prev, 'Optimization complete! Select an alternative.']);
              // Here we would dispatch to the store to show OptimizationComparisonOverlay
              // For now, we just stop loading
              setTimeout(() => {
                setIsOptimizing(false);
                setIsOpen(false);
                // Trigger an event or update store with candidates
                window.dispatchEvent(new CustomEvent('optimization-complete', { detail: data.candidates }));
              }, 1500);
            } else if (data.type === 'error') {
              setProgressMessages(prev => [...prev, 'Error: ' + data.error]);
              setIsOptimizing(false);
            }
          } catch (e) {
            console.warn('Failed to parse stream chunk', dataStr);
          }
        }
      }
    } catch (e: any) {
      setProgressMessages(prev => [...prev, 'Fatal error: ' + e.message]);
      setIsOptimizing(false);
    }
  };

  return (
    <>
      <div className="absolute left-4 top-24 z-10">
        <Button 
          onClick={() => setIsOpen(!isOpen)} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
        >
          <Zap className="w-4 h-4 mr-2" /> Optimize Design
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute left-4 top-36 w-80 bg-white/95 backdrop-blur-md shadow-2xl rounded-xl border border-indigo-100 z-50 overflow-hidden flex flex-col max-h-[70vh]"
          >
            <div className="p-4 border-b bg-indigo-50/50 flex justify-between items-center">
              <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                <Settings2 className="w-5 h-5" /> Optimization Goals
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} disabled={isOptimizing}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">Natural Language Prompt</label>
                  <textarea 
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="e.g. Make the kitchen bigger, ensure all bedrooms have windows..."
                    className="w-full text-sm p-2 border rounded-md resize-none h-20 outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isOptimizing}
                  />
                </div>

                <div className="border-t pt-4">
                  <label className="text-xs font-semibold text-gray-600 uppercase mb-4 block">Priority Weights</label>
                  
                  {Object.entries(weights).map(([key, value]) => (
                    <div key={key} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="capitalize text-gray-700">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-indigo-600 font-medium">{Math.round(value * 100)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" max="1" step="0.05"
                        value={value}
                        onChange={(e) => handleSliderChange(e, key as keyof typeof weights)}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        disabled={isOptimizing}
                      />
                    </div>
                  ))}
                </div>

                {lockedRooms.length > 0 && (
                  <div className="border-t pt-4">
                    <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block flex items-center gap-1">
                      <Target className="w-3 h-3" /> Hard Constraints (Locked)
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {lockedRooms.map(id => {
                        const room = layout?.rooms.find(r => r.id === id);
                        return room ? (
                          <span key={id} className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded border border-amber-200 truncate max-w-[120px]">
                            {room.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex flex-col gap-2">
              {isOptimizing ? (
                <div className="flex flex-col gap-2">
                  <div 
                    ref={scrollRef}
                    className="h-24 bg-black/90 rounded-md p-2 overflow-y-auto font-mono text-[10px] text-green-400 space-y-1"
                  >
                    {progressMessages.map((msg, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>
                        <span>{msg}</span>
                      </div>
                    ))}
                    <div className="animate-pulse">_</div>
                  </div>
                  <Button disabled className="w-full bg-indigo-600/50">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Optimizing...
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleOptimize} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" /> Run Optimizer
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
