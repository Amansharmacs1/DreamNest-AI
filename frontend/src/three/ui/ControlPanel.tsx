import { useThreeStore } from '@/store/threeStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Sun, Moon, CloudSun, Sunset, 
  Eye, Orbit, Maximize
} from 'lucide-react';

export default function ControlPanel() {
  const store = useThreeStore();

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.getElementById('canvas-container')?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <Card className="absolute top-4 right-4 w-72 p-4 flex flex-col gap-4 bg-white/90 backdrop-blur shadow-2xl border-white/20 select-none z-50">
      
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Lighting</h3>
        <div className="flex gap-2">
          <Button variant={store.timeOfDay === 'morning' ? 'default' : 'outline'} size="icon" onClick={() => store.setTimeOfDay('morning')} title="Morning"><CloudSun className="w-4 h-4" /></Button>
          <Button variant={store.timeOfDay === 'afternoon' ? 'default' : 'outline'} size="icon" onClick={() => store.setTimeOfDay('afternoon')} title="Afternoon"><Sun className="w-4 h-4" /></Button>
          <Button variant={store.timeOfDay === 'evening' ? 'default' : 'outline'} size="icon" onClick={() => store.setTimeOfDay('evening')} title="Evening"><Sunset className="w-4 h-4" /></Button>
          <Button variant={store.timeOfDay === 'night' ? 'default' : 'outline'} size="icon" onClick={() => store.setTimeOfDay('night')} title="Night"><Moon className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Visualization</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant={store.showRoof ? 'default' : 'outline'} 
            className="w-full text-xs" 
            onClick={store.toggleRoof}
          >
            {store.showRoof ? 'Hide Roof' : 'Show Roof'}
          </Button>
          <Button 
            variant={store.showLabels ? 'default' : 'outline'} 
            className="w-full text-xs" 
            onClick={store.toggleLabels}
          >
            Labels {store.showLabels ? 'On' : 'Off'}
          </Button>
          <Button 
            variant={store.transparentWalls ? 'default' : 'outline'} 
            className="w-full text-xs" 
            onClick={store.toggleTransparentWalls}
          >
            X-Ray Walls
          </Button>
          <Button 
            variant={store.wireframe ? 'default' : 'outline'} 
            className="w-full text-xs" 
            onClick={store.toggleWireframe}
          >
            Wireframe
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Camera & View</h3>
        <div className="flex gap-2">
          <Button 
            variant={store.cameraMode === 'orbit' ? 'default' : 'outline'} 
            className="flex-1 text-xs flex gap-2" 
            onClick={() => store.setCameraMode('orbit')}
          >
            <Orbit className="w-3 h-3" /> Orbit
          </Button>
          <Button 
            variant={store.cameraMode === 'first-person' ? 'default' : 'outline'} 
            className="flex-1 text-xs flex gap-2" 
            onClick={() => store.setCameraMode('first-person')}
          >
            <Eye className="w-3 h-3" /> First Person
          </Button>
        </div>
        <Button variant="secondary" className="w-full text-xs flex gap-2 mt-2" onClick={handleFullscreen}>
          <Maximize className="w-3 h-3" /> Fullscreen
        </Button>
      </div>

      {store.cameraMode === 'first-person' && (
        <div className="mt-2 p-3 bg-slate-100 rounded-lg text-xs text-slate-600 space-y-1">
          <p><strong>W A S D</strong> to move</p>
          <p><strong>Mouse</strong> to look around</p>
          <p><strong>ESC</strong> to exit view</p>
          <p className="text-[10px] text-slate-400 mt-2">Click canvas to lock cursor</p>
        </div>
      )}
      
    </Card>
  );
}
