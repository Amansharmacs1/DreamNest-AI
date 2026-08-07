import { useThreeStore } from '@/store/threeStore';
import { useWizardStore } from '@/store/wizardStore';
import { useAnalysisStore } from '@/store/analysisStore';
import { useRef } from 'react';
import { DirectionalLight } from 'three';
import { calculateSunPosition } from '../utils/sunUtils';
import { getSunPosition } from '@/services/analysisSimulation';

export default function LightingManager() {
  const timeOfDay = useThreeStore((state) => state.timeOfDay);
  const showShadows = useThreeStore((state) => state.showShadows);
  const facingDirection = useWizardStore((state) => state.preferences.plot.facingDirection);
  
  const { isAnalysisModeActive, latitude, longitude, date, timeOfDayMinutes, plotOrientation } = useAnalysisStore();
  
  const dirLightRef = useRef<DirectionalLight>(null);

  const getLightConfig = () => {
    switch (timeOfDay) {
      case 'morning':
        return { ambientIntensity: 0.5, ambientColor: '#ffe5cc', directionalIntensity: 1.5, directionalColor: '#ffedd6' };
      case 'afternoon':
        return { ambientIntensity: 0.8, ambientColor: '#ffffff', directionalIntensity: 2.0, directionalColor: '#ffffff' };
      case 'evening':
        return { ambientIntensity: 0.4, ambientColor: '#ffcda8', directionalIntensity: 1.2, directionalColor: '#ffa057' };
      case 'night':
        return { ambientIntensity: 0.1, ambientColor: '#455b82', directionalIntensity: 0.2, directionalColor: '#5c7fb8' };
    }
  };

  const config = getLightConfig();
  
  let sunPos: [number, number, number];
  
  if (isAnalysisModeActive) {
    // Use precise solar simulation
    const { altitude, azimuth } = getSunPosition(date, latitude, longitude, timeOfDayMinutes);
    const distance = 100;
    const finalAzimuth = azimuth + (plotOrientation * Math.PI / 180);
    const y = distance * Math.sin(altitude);
    const x = distance * Math.cos(altitude) * Math.sin(finalAzimuth);
    const z = distance * Math.cos(altitude) * Math.cos(finalAzimuth);
    sunPos = [x, y, z];
  } else {
    // Use simple timeOfDay from store
    sunPos = calculateSunPosition(timeOfDay, facingDirection);
  }

  return (
    <>
      <ambientLight intensity={config.ambientIntensity} color={config.ambientColor} />
      <directionalLight
        ref={dirLightRef}
        castShadow={showShadows}
        position={sunPos}
        intensity={config.directionalIntensity}
        color={config.directionalColor}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-camera-near={1}
        shadow-camera-far={300}
        shadow-bias={-0.0005}
      />
    </>
  );
}
