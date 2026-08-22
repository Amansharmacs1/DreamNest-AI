import { useThreeStore } from '@/store/threeStore';
import { useWizardStore } from '@/store/wizardStore';
import { useAnalysisStore } from '@/store/analysisStore';
import { useRef } from 'react';
import { DirectionalLight } from 'three';
import { calculateSunPosition } from '../utils/sunUtils';
// Simple mock for sun position
function getSunPosition(_date: Date, _latitude: number, _longitude: number, timeOfDayMinutes: number) {
  const hours = timeOfDayMinutes / 60;
  const hourAngle = 15 * (hours - 12);
  const azimuth = (180 + hourAngle) * (Math.PI / 180);
  const altitude = (90 - Math.abs(hours - 12) * 15) * (Math.PI / 180);
  return { azimuth, altitude: Math.max(0, altitude) };
}

export default function LightingManager() {
  const timeOfDay = useThreeStore((state) => state.timeOfDay);
  const showShadows = useThreeStore((state) => state.showShadows);
  const facingDirection = useWizardStore((state) => state.preferences.plot.facingDirection);
  
  const { isAnalysisModeActive, latitude, longitude, date, timeOfDayMinutes, plotOrientation } = useAnalysisStore();
  
  const quality = useThreeStore((state) => state.quality);
  
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
    const { altitude, azimuth } = getSunPosition(date, latitude, longitude, timeOfDayMinutes);
    const distance = 100;
    const finalAzimuth = azimuth + (plotOrientation * Math.PI / 180);
    const y = distance * Math.sin(altitude);
    const x = distance * Math.cos(altitude) * Math.sin(finalAzimuth);
    const z = distance * Math.cos(altitude) * Math.cos(finalAzimuth);
    sunPos = [x, y, z];
  } else {
    sunPos = calculateSunPosition(timeOfDay, facingDirection);
  }

  const shadowMapSize = quality === 'low' ? 512 : quality === 'medium' ? 1024 : 2048;

  return (
    <>
      <hemisphereLight 
        intensity={config.ambientIntensity * 1.5} 
        color={config.ambientColor} 
        groundColor={timeOfDay === 'night' ? '#111111' : '#4a7c36'}
      />
      
      <directionalLight
        ref={dirLightRef}
        castShadow={showShadows && quality !== 'low'}
        position={sunPos}
        intensity={config.directionalIntensity}
        color={config.directionalColor}
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-camera-near={1}
        shadow-camera-far={300}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />
    </>
  );
}
