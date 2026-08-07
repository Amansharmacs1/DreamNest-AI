import { useRef, useState } from 'react';
import { useLayoutStore } from '@/store/layoutStore';
import { Button } from '@/components/ui/button';
import { Download, RefreshCcw, Undo, Redo, Home, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useThreeStore } from '@/store/threeStore';
import { useAnalysisStore } from '@/store/analysisStore';
import jsPDF from 'jspdf';
import RoomElement from './RoomElement';
import RoomInspector from './RoomInspector';
import CustomizationPanel from './CustomizationPanel';
import SceneEngine from '../three/SceneEngine';
import ControlPanel from '../three/ui/ControlPanel';
import Minimap from '../three/ui/Minimap';
import FirstPersonHUD from '../three/ui/FirstPersonHUD';
import { Box, Sparkles } from 'lucide-react';
import SmartReportModal from '../components/ai/SmartReportModal';
import AnalysisControlPanel from './AnalysisControlPanel';
import RoomAnalysisPanel from './RoomAnalysisPanel';
import HeatmapOverlay from './HeatmapOverlay'; // 2D heatmap overlay

export default function FloorPlanViewer() {
  const { layout, undo, redo, history, future, reset } = useLayoutStore();
  const triggerExportGLTF = useThreeStore((state) => state.triggerExportGLTF);
  const { isAnalysisModeActive, setAnalysisMode } = useAnalysisStore();
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [activeFloor, setActiveFloor] = useState(0);
  const [isReportOpen, setIsReportOpen] = useState(false);

  if (!layout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No layout generated yet.</h2>
          <Button onClick={() => navigate('/wizard')}>Go to Wizard</Button>
        </div>
      </div>
    );
  }

  const getCanvasFromSVG = (): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      if (!svgRef.current) return reject(new Error('No SVG found'));
      
      const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;
      const widthPx = layout.plotDimensions.width * 10;
      const heightPx = layout.plotDimensions.length * 10;
      
      svgClone.setAttribute('width', `${widthPx}px`);
      svgClone.setAttribute('height', `${heightPx}px`);
      
      const style = document.createElement('style');
      style.textContent = `
        text { font-family: sans-serif; }
      `;
      svgClone.insertBefore(style, svgClone.firstChild);
      
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const canvas = document.createElement('canvas');
      
      const scale = 3; 
      canvas.width = widthPx * scale;
      canvas.height = heightPx * scale;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('No canvas context'));
      
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas);
      };
      img.onerror = (e) => reject(e);
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    });
  };

  const exportPDF = async () => {
    try {
      const canvas = await getCanvasFromSVG();
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('DreamNest-FloorPlan.pdf');
    } catch (e) {
      console.error('Export PDF failed', e);
      alert('Failed to export PDF.');
    }
  };

  const exportPNG = async () => {
    try {
      const canvas = await getCanvasFromSVG();
      const link = document.createElement('a');
      link.download = 'DreamNest-FloorPlan.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Export PNG failed', e);
      alert('Failed to export PNG.');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as SVGElement).tagName !== 'svg' && (e.target as SVGElement).tagName !== 'rect') return;
    if ((e.target as SVGElement).classList.contains('room')) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    if (e.deltaY < 0) setZoom(z => Math.min(z + zoomFactor, 3));
    else setZoom(z => Math.max(z - zoomFactor, 0.5));
  };

  const viewBoxWidth = layout.plotDimensions.width;
  const viewBoxHeight = layout.plotDimensions.length;

  const maxFloor = Math.max(0, ...layout.rooms.map((r: any) => r.floor || 0));
  const activeRooms = layout.rooms.filter((r: any) => (r.floor || 0) === activeFloor);

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden">
      <header className="flex flex-col md:flex-row items-center justify-between p-4 bg-white border-b shadow-sm z-20 gap-4 relative">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <Home className="w-5 h-5 text-primary" />
            </Button>
            <h1 className="text-lg md:text-xl font-bold truncate">Floor Plan Viewer</h1>
          </div>
          <div className="md:hidden flex gap-2">
            <Button variant="outline" size="icon" onClick={undo} disabled={history.length === 0} title="Undo">
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={redo} disabled={future.length === 0} title="Redo">
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-center md:justify-end">
          <Button 
            variant={isAnalysisModeActive ? "secondary" : "outline"}
            className={isAnalysisModeActive ? "bg-indigo-100 text-indigo-700 border-indigo-200" : ""}
            size="sm" 
            onClick={() => setAnalysisMode(!isAnalysisModeActive)}
          >
            <Activity className="w-4 h-4 mr-1 md:mr-2" /> 
            <span className="hidden sm:inline">{isAnalysisModeActive ? 'Exit Analysis' : 'Analyze'}</span>
          </Button>
          <div className="hidden md:flex gap-2">
            <Button variant="outline" size="sm" onClick={undo} disabled={history.length === 0}>
              <Undo className="w-4 h-4 mr-2" /> Undo
            </Button>
            <Button variant="outline" size="sm" onClick={redo} disabled={future.length === 0}>
              <Redo className="w-4 h-4 mr-2" /> Redo
            </Button>
          </div>
          
          <Button variant="outline" size="sm" onClick={reset}>
            <RefreshCcw className="w-4 h-4 mr-1 md:mr-2" /> <span className="hidden sm:inline">Reset</span>
          </Button>
          <Button variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setIsReportOpen(true)}>
            <Sparkles className="w-4 h-4 mr-1 md:mr-2" /> <span className="hidden sm:inline">Smart Report</span>
          </Button>
          <Button variant={viewMode === '3d' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode(v => v === '2d' ? '3d' : '2d')}>
            <Box className="w-4 h-4 mr-1 md:mr-2" /> {viewMode === '2d' ? 'View 3D' : 'View 2D'}
          </Button>
          
          <div className="flex gap-2 w-full sm:w-auto justify-center mt-2 sm:mt-0">
            <Button variant="secondary" size="sm" onClick={exportPNG} className="flex-1 sm:flex-none">
              <Download className="w-4 h-4 mr-1 md:mr-2" /> PNG
            </Button>
            <Button variant="secondary" size="sm" onClick={exportPDF} className="flex-1 sm:flex-none">
              <Download className="w-4 h-4 mr-1 md:mr-2" /> PDF
            </Button>
            {viewMode === '3d' && (
              <Button size="sm" onClick={triggerExportGLTF} className="flex-1 sm:flex-none">
                <Download className="w-4 h-4 mr-1 md:mr-2" /> GLTF
              </Button>
            )}
          </div>
        </div>
      </header>

      {!isAnalysisModeActive && <RoomInspector />}
      {isAnalysisModeActive && (
        <>
          <AnalysisControlPanel />
          <RoomAnalysisPanel />
        </>
      )}

      {viewMode === '2d' ? (
        <main 
          className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing bg-[#f0f0f0]"
          style={{ backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={(e) => {
            if (e.touches.length === 1) {
              setIsDragging(true);
              setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
            }
          }}
          onTouchMove={(e) => {
            if (isDragging && e.touches.length === 1) {
              setPan({
                x: e.touches[0].clientX - dragStart.x,
                y: e.touches[0].clientY - dragStart.y
              });
            }
          }}
          onTouchEnd={() => setIsDragging(false)}
        >
          <div 
            className="absolute origin-center transition-transform duration-75"
            style={{ 
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <div className="bg-white shadow-2xl relative" style={{ width: `${viewBoxWidth * 10}px`, height: `${viewBoxHeight * 10}px` }}>
              <svg 
                ref={svgRef}
                width="100%" 
                height="100%" 
                viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                className="drop-shadow-sm"
              >
                <rect x="0" y="0" width={viewBoxWidth} height={viewBoxHeight} fill="none" stroke="#2563EB" strokeWidth="0.5" strokeDasharray="2,2" />
                
                <rect 
                  x={layout.usableArea.startX} 
                  y={layout.usableArea.startY} 
                  width={layout.usableArea.width} 
                  height={layout.usableArea.length} 
                  fill="#f8fafc" 
                  stroke="#14B8A6" 
                  strokeWidth="0.5" 
                />
                
                {activeRooms.map((room: any) => (
                  <RoomElement key={room.id} room={room} />
                ))}
                
                {isAnalysisModeActive && <HeatmapOverlay />}
              </svg>
            </div>
          </div>
          
          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 flex flex-col gap-2 z-10">
            <Button variant="secondary" size="icon" onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="w-10 h-10 rounded-full shadow-md bg-white">+</Button>
            <Button variant="secondary" size="icon" onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="w-10 h-10 rounded-full shadow-md bg-white">-</Button>
            <Button variant="secondary" size="icon" onClick={() => { setZoom(1); setPan({x:0, y:0}); }} className="w-10 h-10 rounded-full shadow-md bg-white">
              <RefreshCcw className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 bg-white/90 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-md shadow-md text-xs md:text-sm font-medium border z-10">
            Scale: {Math.round(zoom * 100)}% <span className="hidden sm:inline">| 1 unit = 1 {layout.plotDimensions.unit}</span>
          </div>

          {maxFloor > 0 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-1.5 py-1.5 md:px-2 md:py-2 rounded-full shadow-lg border flex gap-1 items-center z-10">
              {Array.from({ length: maxFloor + 1 }).map((_, i) => (
                <Button 
                  key={i} 
                  variant={activeFloor === i ? 'default' : 'ghost'} 
                  size="sm"
                  className="rounded-full px-3 md:px-4 text-xs md:text-sm h-7 md:h-8"
                  onClick={() => setActiveFloor(i)}
                >
                  Floor {i}
                </Button>
              ))}
            </div>
          )}
        </main>
      ) : (
        <main className="flex-1 relative overflow-hidden bg-black z-0">
          <SceneEngine />
          {!isAnalysisModeActive && <ControlPanel />}
          <Minimap />
          <FirstPersonHUD />
          {!isAnalysisModeActive && <CustomizationPanel />}
        </main>
      )}
      <SmartReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </div>
  );
}
