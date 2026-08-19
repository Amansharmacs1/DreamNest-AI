import { useState, useEffect, useRef } from 'react';
import { useLayoutStore } from '@/store/layoutStore';
import { useProjectStore } from '@/store/projectStore';
import { ProjectStorageService } from '@/services/projectStorage';
import { Button } from '@/components/ui/button';
import { X, CheckCircle2, ChevronRight, BarChart2, Lightbulb, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RoomElement from '@/viewer/RoomElement';

interface Candidate {
  id: string;
  name: string;
  layout: any;
  score: number;
  scores: any;
  baseScores?: any;
  explanation: string;
}

export default function OptimizationComparisonOverlay() {
  const { layout, setLayout } = useLayoutStore();
  const { currentProjectId, saveCurrentProject } = useProjectStore();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [show2D, setShow2D] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const handleOptimizationComplete = (e: any) => {
      setCandidates(e.detail);
      setSelectedIdx(0);
    };

    window.addEventListener('optimization-complete', handleOptimizationComplete);
    return () => window.removeEventListener('optimization-complete', handleOptimizationComplete);
  }, []);

  if (candidates.length === 0) return null;

  const currentCandidate = candidates[selectedIdx];

  const handleApply = async () => {
    if (currentProjectId) {
      // Save original as a version before overwriting
      await ProjectStorageService.saveVersion(currentProjectId, 'Before AI Optimization');
    }
    setLayout(currentCandidate.layout);
    if (currentProjectId) {
      await saveCurrentProject({ layout: currentCandidate.layout });
    }
    setCandidates([]);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden relative flex flex-col md:flex-row max-h-[85vh]"
        >
          {/* Sidebar */}
          <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-200 flex flex-col">
            <div className="p-4 border-b bg-white flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Optimized Alternatives</h2>
              <Button variant="ghost" size="icon" onClick={() => setCandidates([])}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {candidates.map((cand, idx) => (
                <div 
                  key={cand.id}
                  onClick={() => setSelectedIdx(idx)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedIdx === idx ? 'bg-indigo-50 border-indigo-500 shadow-md ring-1 ring-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-800 text-sm">{cand.name}</h3>
                    <div className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <BarChart2 className="w-3 h-3" /> {cand.score}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{cand.explanation}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t bg-white">
              <Button onClick={handleApply} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Apply Selected Design
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white p-6 overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{currentCandidate.name}</h2>
                <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                  {currentCandidate.explanation}
                </p>
              </div>
              <Button 
                variant="outline" 
                className="ml-4 flex-shrink-0"
                onClick={() => setShow2D(!show2D)}
              >
                <Map className="w-4 h-4 mr-2" /> {show2D ? 'Hide 2D Preview' : 'Show 2D Preview'}
              </Button>
            </div>

            {show2D && (
              <div className="mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider text-center">2D Preview</h3>
                <div className="flex justify-center w-full h-64 overflow-hidden relative" style={{ backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                  <svg 
                    ref={svgRef}
                    width="100%" 
                    height="100%" 
                    viewBox={`0 0 ${currentCandidate.layout.plotDimensions.width} ${currentCandidate.layout.plotDimensions.length}`}
                  >
                    <rect 
                      width={currentCandidate.layout.plotDimensions.width} 
                      height={currentCandidate.layout.plotDimensions.length} 
                      fill="none" 
                      stroke="#94a3b8" 
                      strokeWidth="0.5" 
                      strokeDasharray="2,2" 
                    />
                    {currentCandidate.layout.rooms.filter((r: any) => r.floor === 0).map((room: any) => (
                      <RoomElement key={room.id} room={room} />
                    ))}
                  </svg>
                </div>
              </div>
            )}

            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Metrics Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {Object.entries(currentCandidate.scores).filter(([k]) => k !== 'overall').map(([key, value]) => {
                const oldVal = currentCandidate.baseScores ? currentCandidate.baseScores[key] : value;
                const diff = (value as number) - (oldVal as number);
                return (
                <div key={key} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-xs text-slate-500 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-xs font-bold text-slate-500 line-through">{String(oldVal)}</span>
                     <ChevronRight className="w-3 h-3 text-indigo-400 mx-1" />
                     <span className={`text-sm font-bold ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-slate-700'}`}>
                        {String(value)}
                     </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                </div>
              )})}
            </div>

            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Modified Rooms</h3>
            <div className="space-y-2">
              {currentCandidate.layout.rooms.map((room: any) => {
                const oldRoom = layout?.rooms.find(r => r.id === room.id);
                if (!oldRoom) return null;
                
                const changedSize = room.width !== oldRoom.width || room.length !== oldRoom.length;
                const changedPos = room.x !== oldRoom.x || room.y !== oldRoom.y;
                
                if (!changedSize && !changedPos) return null;

                return (
                  <div key={room.id} className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex-1 text-sm font-medium text-slate-800">{room.name}</div>
                    
                    {changedPos && (
                      <div className="text-xs flex items-center gap-2 text-slate-500">
                        <span className="line-through opacity-70">X:{oldRoom.x}, Y:{oldRoom.y}</span>
                        <ChevronRight className="w-3 h-3 text-indigo-500" />
                        <span className="text-indigo-700 font-medium">X:{room.x}, Y:{room.y}</span>
                      </div>
                    )}
                    
                    {changedSize && (
                      <div className="text-xs flex items-center gap-2 text-slate-500 border-l border-slate-300 pl-4">
                        <span className="line-through opacity-70">{oldRoom.width}x{oldRoom.length}</span>
                        <ChevronRight className="w-3 h-3 text-indigo-500" />
                        <span className="text-indigo-700 font-medium">{room.width}x{room.length}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 text-sm flex items-start gap-3">
              <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
              <p>Applying this design will replace your current floor plan. You can use the Undo button in the viewer to revert to your previous layout if needed.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
