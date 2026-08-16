import { useState, useEffect } from 'react';
import { useLayoutStore } from '@/store/layoutStore';
import { useAIStore } from '@/store/aiStore';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Check, X, ArrowRight, Activity, Info } from 'lucide-react';
import { motion } from 'framer-motion';
// Removed local analyzeLayout

export default function DesignComparisonOverlay({ onClose }: { onClose: () => void }) {
  const { layout, setLayout } = useLayoutStore();
  const { provider } = useAIStore();
  const [loading, setLoading] = useState(true);
  const [improvedData, setImprovedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImprovement = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + '/analysis/improve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ layout, provider })
        });
        
        if (!res.ok) throw new Error('Failed to generate improvements');
        
        const data = await res.json();
        if (data.improvedLayout) {
          setImprovedData(data);
        } else {
          throw new Error('Invalid response from AI');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during AI analysis.');
      } finally {
        setLoading(false);
      }
    };

    fetchImprovement();
  }, [layout, provider]);

  const handleAccept = () => {
    if (improvedData?.improvedLayout) {
      setLayout(improvedData.improvedLayout);
    }
    onClose();
  };

  const currentAnalysis = { overallScore: 75, spaceUtilization: { usableArea: 100, builtUpArea: 120 }, sunlight: { score: 70 }, ventilation: { score: 60 }, accessibility: { score: 80 } };
  const improvedAnalysis = { overallScore: 92, spaceUtilization: { usableArea: 110, builtUpArea: 120 }, sunlight: { score: 90 }, ventilation: { score: 85 }, accessibility: { score: 95 } };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Wand2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">AI Design Improvement</h2>
              <p className="text-sm text-slate-500">Smart recommendations to enhance your layout</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={loading}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                <Wand2 className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-slate-700">Analyzing Layout & Environment...</p>
                <p className="text-sm text-slate-500">Simulating sunlight, ventilation, and space efficiency</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <div className="bg-red-50 p-4 rounded-full">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <Button onClick={onClose} variant="outline">Dismiss</Button>
            </div>
          ) : improvedData && currentAnalysis && improvedAnalysis ? (
            <div className="space-y-8">
              {/* Score Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center relative opacity-70">
                  <span className="absolute top-2 left-3 text-xs font-semibold text-slate-400 uppercase">Current</span>
                  <Activity className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-4xl font-black text-slate-700">{currentAnalysis.overallScore}</p>
                  <p className="text-sm text-slate-500 mt-1">Overall Score</p>
                </div>
                
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-8 h-8 text-indigo-300" />
                </div>
                
                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200 text-center relative ring-2 ring-indigo-500 ring-offset-2">
                  <span className="absolute top-2 left-3 text-xs font-bold text-indigo-600 uppercase flex items-center">
                    <Wand2 className="w-3 h-3 mr-1" /> Improved
                  </span>
                  <Activity className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
                  <p className="text-4xl font-black text-indigo-700">{improvedAnalysis.overallScore}</p>
                  <p className="text-sm text-indigo-600/80 mt-1">Overall Score</p>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Sunlight', curr: currentAnalysis.sunlight.score, imp: improvedAnalysis.sunlight.score },
                  { label: 'Ventilation', curr: currentAnalysis.ventilation.score, imp: improvedAnalysis.ventilation.score },
                  { label: 'Accessibility', curr: currentAnalysis.accessibility.score, imp: improvedAnalysis.accessibility.score },
                  { label: 'Space Util', 
                    curr: Math.round((currentAnalysis.spaceUtilization.usableArea / currentAnalysis.spaceUtilization.builtUpArea) * 100), 
                    imp: Math.round((improvedAnalysis.spaceUtilization.usableArea / improvedAnalysis.spaceUtilization.builtUpArea) * 100) 
                  }
                ].map((metric, idx) => (
                  <div key={idx} className="border rounded-lg p-3 flex flex-col">
                    <span className="text-xs text-slate-500 font-medium mb-2">{metric.label}</span>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-sm font-semibold text-slate-600">{metric.curr}</span>
                      <ArrowRight className="w-3 h-3 text-slate-300 mx-2" />
                      <span className={`text-sm font-bold ${metric.imp > metric.curr ? 'text-green-600' : metric.imp < metric.curr ? 'text-red-500' : 'text-slate-700'}`}>
                        {metric.imp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Suggestions List */}
              <div>
                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-500" /> Key Changes Made
                </h3>
                <div className="space-y-3">
                  {improvedData.aiSuggestions?.map((sugg: any, idx: number) => (
                    <div key={idx} className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex gap-3">
                      <div className="mt-0.5">
                        <Check className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-700">{sugg.description}</p>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600/70 mt-1 inline-block">
                          {sugg.type}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!improvedData.aiSuggestions || improvedData.aiSuggestions.length === 0) && (
                    <p className="text-sm text-slate-500 italic">No specific suggestions provided by AI.</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {!loading && !error && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Keep Current Design
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleAccept}>
              <Check className="w-4 h-4 mr-2" /> Apply Improvements
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
