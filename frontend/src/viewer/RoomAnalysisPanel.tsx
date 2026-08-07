import { useLayoutStore } from '@/store/layoutStore';
import { useAnalysisStore } from '@/store/analysisStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sun, Wind, Move, Ruler } from 'lucide-react';
import { useMemo } from 'react';

export default function RoomAnalysisPanel() {
  const selectedRoomId = useLayoutStore((state) => state.selectedRoomId);
  const layout = useLayoutStore((state) => state.layout);
  const { isAnalysisModeActive, analysisResult } = useAnalysisStore();

  const selectedRoom = useMemo(() => {
    if (!layout || !selectedRoomId) return null;
    return layout.rooms.find(r => r.id === selectedRoomId);
  }, [layout, selectedRoomId]);

  const roomAnalysis = useMemo(() => {
    if (!selectedRoom || !analysisResult) return null;
    return {
      sunlight: analysisResult.sunlight.rooms.find(r => r.roomId === selectedRoom.id)?.score || 0,
      ventilation: analysisResult.ventilation.rooms.find(r => r.roomId === selectedRoom.id)?.score || 0,
      issues: analysisResult.accessibility.issues.filter(i => i.roomId === selectedRoom.id)
    };
  }, [selectedRoom, analysisResult]);

  if (!isAnalysisModeActive || !selectedRoom || !roomAnalysis) return null;

  const area = selectedRoom.width * selectedRoom.length;

  return (
    <Card className="absolute top-4 right-4 z-10 w-72 shadow-xl bg-white/95 backdrop-blur border-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center justify-between">
          <span>{selectedRoom.name} Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-50 p-2 rounded border flex flex-col items-center">
            <Move className="w-4 h-4 text-gray-500 mb-1" />
            <span className="font-semibold">{area} sq {layout?.plotDimensions.unit}</span>
            <span className="text-xs text-gray-400">Area</span>
          </div>
          <div className="bg-gray-50 p-2 rounded border flex flex-col items-center">
            <Ruler className="w-4 h-4 text-gray-500 mb-1" />
            <span className="font-semibold">{selectedRoom.width} x {selectedRoom.length}</span>
            <span className="text-xs text-gray-400">Dimensions</span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="flex items-center text-amber-600 font-medium"><Sun className="w-3 h-3 mr-1" /> Sunlight</span>
              <span className="font-mono">{roomAnalysis.sunlight}/100</span>
            </div>
            <Progress value={roomAnalysis.sunlight} className="h-1.5 [&>div]:bg-amber-400" />
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="flex items-center text-cyan-600 font-medium"><Wind className="w-3 h-3 mr-1" /> Ventilation</span>
              <span className="font-mono">{roomAnalysis.ventilation}/100</span>
            </div>
            <Progress value={roomAnalysis.ventilation} className="h-1.5 [&>div]:bg-cyan-400" />
          </div>
        </div>

        {roomAnalysis.issues.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-xs font-semibold text-red-600 uppercase mb-2">Accessibility Issues</h4>
            <ul className="text-xs space-y-1">
              {roomAnalysis.issues.map((issue, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-red-500 mr-1">•</span>
                  <span className="text-gray-600">{issue.issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
