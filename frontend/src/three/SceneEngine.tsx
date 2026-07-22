import { Canvas } from '@react-three/fiber';
import { Environment, Sky } from '@react-three/drei';
import { Suspense } from 'react';
import CameraController from './camera/CameraController';
import LightingManager from './lights/LightingManager';
import HouseGenerator from './generators/HouseGenerator';
import { useThreeStore } from '@/store/threeStore';

export default function SceneEngine() {
  const timeOfDay = useThreeStore((state) => state.timeOfDay);

  const getSkyConfig = () => {
    switch (timeOfDay) {
      case 'morning': return { sunPosition: [50, 10, -50], turbidity: 10, rayleigh: 2 };
      case 'afternoon': return { sunPosition: [10, 80, 10], turbidity: 2, rayleigh: 0.5 };
      case 'evening': return { sunPosition: [-50, 5, 50], turbidity: 20, rayleigh: 4 };
      case 'night': return { sunPosition: [0, -50, 0], turbidity: 5, rayleigh: 0.1 };
    }
  };

  const skyConfig = getSkyConfig();

  return (
    <div id="canvas-container" className="w-full h-full relative cursor-crosshair">
      <Canvas shadows camera={{ position: [20, 40, 60], fov: 60 }}>
        <color attach="background" args={['#87CEEB']} />
        
        {/* Environment & Sky */}
        <Sky 
          sunPosition={skyConfig.sunPosition as [number, number, number]} 
          turbidity={skyConfig.turbidity} 
          rayleigh={skyConfig.rayleigh} 
        />
        {timeOfDay === 'night' && <fog attach="fog" args={['#050510', 10, 100]} />}
        
        <LightingManager />
        <CameraController />
        
        <Suspense fallback={null}>
          {/* Main Procedural Generation */}
          <HouseGenerator />
          
          {/* Ambient environment reflections */}
          <Environment preset={timeOfDay === 'night' ? 'night' : 'city'} />
        </Suspense>
      </Canvas>
      
      {/* Click overlay hint for First-Person mode */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-white/50 text-xl font-bold mix-blend-difference hidden first-person-crosshair">
        +
      </div>
    </div>
  );
}
