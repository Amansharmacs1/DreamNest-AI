import { useThreeStore } from '@/store/threeStore';
import { useRef } from 'react';
import { DirectionalLight } from 'three';

export default function LightingManager() {
  const timeOfDay = useThreeStore((state) => state.timeOfDay);
  const showShadows = useThreeStore((state) => state.showShadows);
  const dirLightRef = useRef<DirectionalLight>(null);

  // Define lighting parameters based on time of day
  const getLightConfig = () => {
    switch (timeOfDay) {
      case 'morning':
        return {
          ambientIntensity: 0.6,
          ambientColor: '#ffe5cc',
          directionalIntensity: 1.2,
          directionalColor: '#ffedd6',
          position: [50, 30, -50] as [number, number, number], // East-ish
        };
      case 'afternoon':
        return {
          ambientIntensity: 0.8,
          ambientColor: '#ffffff',
          directionalIntensity: 1.5,
          directionalColor: '#ffffff',
          position: [10, 80, 10] as [number, number, number], // High up
        };
      case 'evening':
        return {
          ambientIntensity: 0.4,
          ambientColor: '#ffcda8',
          directionalIntensity: 1.0,
          directionalColor: '#ffa057',
          position: [-50, 20, 50] as [number, number, number], // West-ish
        };
      case 'night':
        return {
          ambientIntensity: 0.1,
          ambientColor: '#455b82',
          directionalIntensity: 0.2,
          directionalColor: '#5c7fb8',
          position: [0, 50, 0] as [number, number, number], // Moonlight
        };
    }
  };

  const config = getLightConfig();

  return (
    <>
      <ambientLight intensity={config.ambientIntensity} color={config.ambientColor} />
      <directionalLight
        ref={dirLightRef}
        castShadow={showShadows}
        position={config.position}
        intensity={config.directionalIntensity}
        color={config.directionalColor}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-camera-near={1}
        shadow-camera-far={200}
        shadow-bias={-0.001}
      />
    </>
  );
}
