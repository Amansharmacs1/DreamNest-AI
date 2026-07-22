import { useRef, useState } from 'react';
import { useLayoutStore } from '@/store/layoutStore';
import { Button } from '@/components/ui/button';
import { Download, RefreshCcw, Undo, Redo, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import RoomElement from './RoomElement';
import SceneEngine from '../three/SceneEngine';
import ControlPanel from '../three/ui/ControlPanel';
import Minimap from '../three/ui/Minimap';
import FirstPersonHUD from '../three/ui/FirstPersonHUD';
import { Box } from 'lucide-react';

export default function FloorPlanViewer() {
  const { layout, undo, redo, history, future, reset } = useLayoutStore();
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [activeFloor, setActiveFloor] = useState(0);

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

  const exportPDF = async () => {
    if (!svgRef.current) return;
    try {
      const canvas = await html2canvas(svgRef.current.parentElement as HTMLElement);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
      });
      pdf.addImage(imgData, 'PNG', 10, 10, 277, 190);
      pdf.save('DreamNest-FloorPlan.pdf');
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  const exportPNG = async () => {
    if (!svgRef.current) return;
    try {
      const canvas = await html2canvas(svgRef.current.parentElement as HTMLElement);
      const link = document.createElement('a');
      link.download = 'DreamNest-FloorPlan.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan on background click, not on rooms
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
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-4 bg-white border-b shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <Home className="w-5 h-5 text-primary" />
          </Button>
          <h1 className="text-xl font-bold">Floor Plan Viewer</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={undo} disabled={history.length === 0}>
            <Undo className="w-4 h-4 mr-2" /> Undo
          </Button>
          <Button variant="outline" size="sm" onClick={redo} disabled={future.length === 0}>
            <Redo className="w-4 h-4 mr-2" /> Redo
          </Button>
          <Button variant="outline" size="sm" onClick={reset}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Reset
          </Button>
          <Button variant={viewMode === '3d' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode(v => v === '2d' ? '3d' : '2d')}>
            <Box className="w-4 h-4 mr-2" /> {viewMode === '2d' ? 'View 3D' : 'View 2D'}
          </Button>
          <Button variant="secondary" size="sm" onClick={exportPNG}>
            <Download className="w-4 h-4 mr-2" /> PNG
          </Button>
          <Button size="sm" onClick={exportPDF}>
            <Download className="w-4 h-4 mr-2" /> PDF
          </Button>
        </div>
      </header>

      {viewMode === '2d' ? (
        <main 
          className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing bg-[#f0f0f0]"
          style={{ backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div 
            className="absolute origin-center transition-transform duration-75"
            style={{ 
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {/* Main SVG Canvas */}
            <div className="bg-white shadow-2xl relative" style={{ width: `${viewBoxWidth * 10}px`, height: `${viewBoxHeight * 10}px` }}>
              <svg 
                ref={svgRef}
                width="100%" 
                height="100%" 
                viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                className="drop-shadow-sm"
              >
                {/* Plot boundary */}
                <rect x="0" y="0" width={viewBoxWidth} height={viewBoxHeight} fill="none" stroke="#2563EB" strokeWidth="0.5" strokeDasharray="2,2" />
                
                {/* Usable Area boundary */}
                <rect 
                  x={layout.usableArea.startX} 
                  y={layout.usableArea.startY} 
                  width={layout.usableArea.width} 
                  height={layout.usableArea.length} 
                  fill="#f8fafc" 
                  stroke="#14B8A6" 
                  strokeWidth="0.5" 
                />
                
                {/* Rooms */}
                {activeRooms.map((room: any) => (
                  <RoomElement key={room.id} room={room} />
                ))}
              </svg>
            </div>
          </div>
          
          {/* Controls Overlay */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-2">
            <Button variant="secondary" size="icon" onClick={() => setZoom(z => Math.min(z + 0.2, 3))}>+</Button>
            <Button variant="secondary" size="icon" onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}>-</Button>
            <Button variant="secondary" size="icon" onClick={() => { setZoom(1); setPan({x:0, y:0}); }}>
              <RefreshCcw className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Scale indicator */}
          <div className="absolute bottom-6 left-6 bg-white px-4 py-2 rounded-md shadow-md text-sm font-medium border">
            Scale: {Math.round(zoom * 100)}% | 1 unit = 1 {layout.plotDimensions.unit}
          </div>

          {/* Floor Selector */}
          {maxFloor > 0 && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white px-2 py-2 rounded-full shadow-lg border flex gap-1 items-center">
              {Array.from({ length: maxFloor + 1 }).map((_, i) => (
                <Button 
                  key={i} 
                  variant={activeFloor === i ? 'default' : 'ghost'} 
                  size="sm"
                  className="rounded-full px-4"
                  onClick={() => setActiveFloor(i)}
                >
                  Floor {i}
                </Button>
              ))}
            </div>
          )}
        </main>
      ) : (
        <main className="flex-1 relative overflow-hidden bg-black">
          <SceneEngine />
          <ControlPanel />
          <Minimap />
          <FirstPersonHUD />
        </main>
      )}
    </div>
  );
}
