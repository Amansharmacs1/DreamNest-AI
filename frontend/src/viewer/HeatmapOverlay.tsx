import { useAnalysisStore } from '@/store/analysisStore';
import { useLayoutStore } from '@/store/layoutStore';
import { useMemo } from 'react';

export default function HeatmapOverlay() {
  const { activeHeatmap, analysisResult } = useAnalysisStore();
  const layout = useLayoutStore((state) => state.layout);

  const overlays = useMemo(() => {
    if (!layout || !analysisResult || activeHeatmap === 'none' || activeHeatmap === 'accessibility') return [];

    return layout.rooms.map(room => {
      let opacity = 0;
      let color = 'transparent';

      if (activeHeatmap === 'sunlight') {
        const score = analysisResult.sunlight.rooms.find(r => r.roomId === room.id)?.score || 0;
        opacity = 0.2 + (score / 100) * 0.5;
        color = '#f59e0b'; // amber-500
      } else if (activeHeatmap === 'ventilation') {
        const score = analysisResult.ventilation.rooms.find(r => r.roomId === room.id)?.score || 0;
        opacity = 0.2 + (score / 100) * 0.5;
        color = '#06b6d4'; // cyan-500
      } else if (activeHeatmap === 'energy') {
        const sunScore = analysisResult.sunlight.rooms.find(r => r.roomId === room.id)?.score || 0;
        const ventScore = analysisResult.ventilation.rooms.find(r => r.roomId === room.id)?.score || 0;
        const score = (sunScore + ventScore) / 2;
        opacity = 0.2 + (score / 100) * 0.5;
        color = '#22c55e'; // green-500
      }

      return (
        <rect
          key={`heatmap-${room.id}`}
          x={room.x}
          y={room.y}
          width={room.width}
          height={room.length}
          fill={color}
          opacity={opacity}
          pointerEvents="none"
        />
      );
    });
  }, [layout, analysisResult, activeHeatmap]);

  return <>{overlays}</>;
}
