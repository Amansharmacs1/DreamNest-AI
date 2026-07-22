import { useThreeStore } from '@/store/threeStore';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, X } from 'lucide-react';


export default function FirstPersonHUD() {
  const cameraMode = useThreeStore((state) => state.cameraMode);
  const setCameraMode = useThreeStore((state) => state.setCameraMode);

  if (cameraMode !== 'first-person') return null;

  const handleMovement = (key: string, isDown: boolean) => {
    const eventType = isDown ? 'keydown' : 'keyup';
    window.dispatchEvent(new KeyboardEvent(eventType, { code: key }));
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex flex-col justify-between p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-start pointer-events-auto">
        <Button 
          variant="destructive" 
          onClick={() => setCameraMode('orbit')}
          className="shadow-lg flex gap-2"
        >
          <X className="w-4 h-4" /> Exit First Person
        </Button>

        <div className="bg-black/50 text-white p-3 rounded-lg text-sm backdrop-blur">
          <p><strong>Click canvas</strong> to look around (locks mouse)</p>
          <p><strong>Press ESC</strong> to unlock mouse</p>
          <p><strong>W A S D</strong> or <strong>Buttons</strong> to move</p>
        </div>
      </div>

      {/* Movement D-Pad */}
      <div className="pointer-events-auto flex flex-col items-center gap-2 self-start bg-white/20 p-4 rounded-xl backdrop-blur mb-8">
        <Button 
          variant="secondary" 
          size="icon" 
          className="w-12 h-12 shadow-lg"
          onMouseDown={() => handleMovement('KeyW', true)}
          onMouseUp={() => handleMovement('KeyW', false)}
          onMouseLeave={() => handleMovement('KeyW', false)}
          onTouchStart={(e) => { e.preventDefault(); handleMovement('KeyW', true); }}
          onTouchEnd={(e) => { e.preventDefault(); handleMovement('KeyW', false); }}
        >
          <ArrowUp className="w-6 h-6" />
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            size="icon" 
            className="w-12 h-12 shadow-lg"
            onMouseDown={() => handleMovement('KeyA', true)}
            onMouseUp={() => handleMovement('KeyA', false)}
            onMouseLeave={() => handleMovement('KeyA', false)}
            onTouchStart={(e) => { e.preventDefault(); handleMovement('KeyA', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleMovement('KeyA', false); }}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <Button 
            variant="secondary" 
            size="icon" 
            className="w-12 h-12 shadow-lg"
            onMouseDown={() => handleMovement('KeyS', true)}
            onMouseUp={() => handleMovement('KeyS', false)}
            onMouseLeave={() => handleMovement('KeyS', false)}
            onTouchStart={(e) => { e.preventDefault(); handleMovement('KeyS', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleMovement('KeyS', false); }}
          >
            <ArrowDown className="w-6 h-6" />
          </Button>
          <Button 
            variant="secondary" 
            size="icon" 
            className="w-12 h-12 shadow-lg"
            onMouseDown={() => handleMovement('KeyD', true)}
            onMouseUp={() => handleMovement('KeyD', false)}
            onMouseLeave={() => handleMovement('KeyD', false)}
            onTouchStart={(e) => { e.preventDefault(); handleMovement('KeyD', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleMovement('KeyD', false); }}
          >
            <ArrowRight className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
