import { useThreeStore } from '@/store/threeStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Sun, Moon, CloudSun, Sunset, 
  Eye, Orbit, Maximize, Camera, Video, Settings2, Monitor
} from 'lucide-react';
import { useState } from 'react';

export default function ControlPanel() {
  const store = useThreeStore();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.getElementById('canvas-container')?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  if (store.presentationMode) {
    return (
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <Button variant="secondary" onClick={store.togglePresentationMode} className="bg-white/80 backdrop-blur">
          Exit Presentation
        </Button>
      </div>
    );
  }

  return (
    <Card className="absolute top-4 right-4 w-80 p-4 flex flex-col gap-4 bg-white/90 backdrop-blur shadow-2xl border-white/20 select-none z-50 max-h-[90vh] overflow-y-auto">
      
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex justify-between">
          <span>Camera & Tours</span>
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-indigo-600 hover:underline">
            <Settings2 className="w-4 h-4" />
          </button>
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant={store.cameraMode === 'orbit' && !store.cinematicMode ? 'default' : 'outline'} 
            className="w-full text-xs flex gap-2" 
            onClick={() => { store.setCameraMode('orbit'); if (store.cinematicMode) store.toggleCinematicMode(); }}
          >
            <Orbit className="w-3 h-3" /> Orbit
          </Button>
          <Button 
            variant={store.cameraMode === 'first-person' && !store.cinematicMode ? 'default' : 'outline'} 
            className="w-full text-xs flex gap-2" 
            onClick={() => { store.setCameraMode('first-person'); if (store.cinematicMode) store.toggleCinematicMode(); }}
          >
            <Eye className="w-3 h-3" /> 1st Person
          </Button>
          <Button 
            variant={store.cinematicMode ? 'default' : 'secondary'} 
            className="col-span-2 text-xs flex gap-2" 
            onClick={store.toggleCinematicMode}
          >
            <Video className="w-4 h-4" /> {store.cinematicMode ? 'Stop Cinematic Tour' : 'Start Cinematic Tour'}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Environment</h3>
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
          <Button variant={store.showRoof ? 'default' : 'outline'} className="w-full text-xs" onClick={store.toggleRoof}>
            {store.showRoof ? 'Cutaway: Off' : 'Cutaway: On'}
          </Button>
          <Button variant={store.showLabels ? 'default' : 'outline'} className="w-full text-xs" onClick={store.toggleLabels}>
            Labels {store.showLabels ? 'On' : 'Off'}
          </Button>
          <Button variant={store.transparentWalls ? 'default' : 'outline'} className="w-full text-xs" onClick={store.toggleTransparentWalls}>
            X-Ray Walls
          </Button>
          <Button variant={store.wireframe ? 'default' : 'outline'} className="w-full text-xs" onClick={store.toggleWireframe}>
            Wireframe
          </Button>
        </div>
      </div>

      {showAdvanced && (
        <div className="space-y-2 border-t pt-2">
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Quality Settings</h3>
          <div className="flex gap-2">
            <Button variant={store.quality === 'low' ? 'default' : 'outline'} className="flex-1 text-xs" onClick={() => store.setQuality('low')}>Low</Button>
            <Button variant={store.quality === 'medium' ? 'default' : 'outline'} className="flex-1 text-xs" onClick={() => store.setQuality('medium')}>Med</Button>
            <Button variant={store.quality === 'high' ? 'default' : 'outline'} className="flex-1 text-xs" onClick={() => store.setQuality('high')}>High</Button>
          </div>
        </div>
      )}

      <div className="space-y-2 border-t pt-2">
        <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" className="w-full text-xs flex gap-2" onClick={handleFullscreen}>
            <Maximize className="w-3 h-3" /> Fullscreen
          </Button>
          <Button variant="secondary" className="w-full text-xs flex gap-2" onClick={store.triggerScreenshot}>
            <Camera className="w-3 h-3" /> Screenshot
          </Button>
          <Button variant="default" className="w-full text-xs flex gap-2 col-span-2 bg-indigo-600 hover:bg-indigo-700" onClick={store.togglePresentationMode}>
            <Monitor className="w-3 h-3" /> Presentation Mode
          </Button>
        </div>
      </div>

      {store.cameraMode === 'first-person' && !store.cinematicMode && (
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
