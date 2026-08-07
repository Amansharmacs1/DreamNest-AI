import { useAnalysisStore, type HeatmapType } from '@/store/analysisStore';
import { useLayoutStore } from '@/store/layoutStore';
import { analyzeLayout } from '@/services/analysisSimulation';
import { Button } from '@/components/ui/button';
import { Sun, Wind, Activity, Zap, Box, X, Play, Wand2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import DesignComparisonOverlay from './DesignComparisonOverlay';

export default function AnalysisControlPanel() {
  const { 
    isAnalysisModeActive, 
    setAnalysisMode, 
    activeHeatmap, 
    setActiveHeatmap,
    timeOfDayMinutes,
    setEnvironment,
    setAnalysisResult
  } = useAnalysisStore();

  const layout = useLayoutStore((state) => state.layout);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    if (isAnalysisModeActive && layout) {
      const result = analyzeLayout(layout as any);
      setAnalysisResult(result);
    }
  }, [isAnalysisModeActive, layout, setAnalysisResult]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setEnvironment({ timeOfDayMinutes: (useAnalysisStore.getState().timeOfDayMinutes + 15) % 1440 });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, setEnvironment]);

  if (!isAnalysisModeActive) {
    return (
      <div className="absolute top-4 left-4 z-10">
        <Button variant="secondary" className="shadow-lg bg-white/90 backdrop-blur" onClick={() => setAnalysisMode(true)}>
          <Activity className="w-4 h-4 mr-2 text-indigo-600" /> Enable Smart Analysis
        </Button>
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const heatmaps: { id: HeatmapType; label: string; icon: any; color: string }[] = [
    { id: 'sunlight', label: 'Sunlight', icon: Sun, color: 'text-amber-500' },
    { id: 'ventilation', label: 'Ventilation', icon: Wind, color: 'text-cyan-500' },
    { id: 'energy', label: 'Energy', icon: Zap, color: 'text-green-500' },
    { id: 'none', label: 'None', icon: Box, color: 'text-gray-500' },
  ];

  return (
    <>
      <div className="absolute top-4 left-4 z-10 w-72 bg-white/95 backdrop-blur shadow-xl rounded-xl border p-4 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-indigo-600" /> Smart Analysis
          </h3>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setAnalysisMode(false)}>
            <X className="w-3 h-3" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Sun Simulation */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Sun Simulation</span>
              <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">{formatTime(timeOfDayMinutes)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <X className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <input 
                type="range"
                value={timeOfDayMinutes} 
                min={0} 
                max={1439} 
                step={15} 
                onChange={(e) => setEnvironment({ timeOfDayMinutes: Number(e.target.value) })}
                className="flex-1"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <span className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Heatmap Overlays</span>
            <div className="grid grid-cols-2 gap-2">
              {heatmaps.map((hm) => {
                const Icon = hm.icon;
                const isActive = activeHeatmap === hm.id;
                return (
                  <Button
                    key={hm.id}
                    variant={(isActive ? 'default' : 'outline') as any}
                    size="sm"
                    className={`justify-start text-xs ${isActive ? '' : 'hover:bg-gray-100'}`}
                    onClick={() => setActiveHeatmap(hm.id)}
                  >
                    <Icon className={`w-3 h-3 mr-2 ${isActive ? 'text-white' : hm.color}`} />
                    {hm.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="border-t pt-4">
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" 
              onClick={() => setShowComparison(true)}
            >
              <Wand2 className="w-4 h-4 mr-2" /> Improve My Design
            </Button>
          </div>
        </div>
      </div>
      {showComparison && <DesignComparisonOverlay onClose={() => setShowComparison(false)} />}
    </>
  );
}
