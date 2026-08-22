import { Canvas } from '@react-three/fiber';
import { Environment, Sky } from '@react-three/drei';
import { Suspense } from 'react';
import CameraController from './camera/CameraController';
import LightingManager from './lights/LightingManager';
import HouseGenerator from './generators/HouseGenerator';
import { useThreeStore } from '@/store/threeStore';
import { useWizardStore } from '@/store/wizardStore';
import { calculateSunPosition } from './utils/sunUtils';
import GLTFExporterComponent from './helpers/GLTFExporterComponent';
import ScreenshotHelper from './helpers/ScreenshotHelper';

export default function SceneEngine() {
  const timeOfDay = useThreeStore((state) => state.timeOfDay);
  const quality = useThreeStore((state) => state.quality);
  const facingDirection = useWizardStore((state) => state.preferences.plot.facingDirection);

  const getSkyTurbidityAndRayleigh = () => {
    switch (timeOfDay) {
      case 'morning': return { turbidity: 10, rayleigh: 2 };
      case 'afternoon': return { turbidity: 2, rayleigh: 0.5 };
      case 'evening': return { turbidity: 20, rayleigh: 4 };
      case 'night': return { turbidity: 5, rayleigh: 0.1 };
    }
  };

  const { turbidity, rayleigh } = getSkyTurbidityAndRayleigh() || { turbidity: 2, rayleigh: 0.5 };
  const sunPosition = calculateSunPosition(timeOfDay, facingDirection);

  const dpr = quality === 'low' ? 0.75 : quality === 'medium' ? 1 : 1.5;

  return (
    <div id="canvas-container" className="w-full h-full relative cursor-crosshair">
      <Canvas shadows camera={{ position: [20, 40, 60], fov: 60 }} dpr={dpr} gl={{ preserveDrawingBuffer: true }}>
        <color attach="background" args={['#87CEEB']} />
        
        {/* Environment & Sky */}
        <Sky 
          sunPosition={sunPosition as [number, number, number]} 
          turbidity={turbidity} 
          rayleigh={rayleigh} 
        />
        {timeOfDay === 'night' && <fog attach="fog" args={['#050510', 10, 100]} />}
        
        <LightingManager />
        <CameraController />
        
        <Suspense fallback={null}>
          {/* Main Procedural Generation */}
          <HouseGenerator />
          
          {/* Ambient environment reflections */}
          <Environment preset={timeOfDay === 'night' ? 'night' : 'city'} />
          {/* Exporters / Helpers */}
          <GLTFExporterComponent />
          <ScreenshotHelper />
        </Suspense>
      </Canvas>
      
      {/* Click overlay hint for First-Person mode */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-white/50 text-xl font-bold mix-blend-difference hidden first-person-crosshair">
        +
      </div>
    </div>
  );
}
