import { useThreeStore } from '@/store/threeStore';
import { getMaterial } from '../../materials/MaterialFactory';

const WALL_HEIGHT = 10;
const STEP_HEIGHT = 0.58; // Approx 7 inches
const STEP_DEPTH = 1.0;   // Approx 12 inches

export default function StairGenerator({ room }: { room: any }) {
  const theme = useThreeStore((state) => state.theme);
  const stairMat = getMaterial('wood', false, theme);
  const railMat = getMaterial('metal', false, theme);

  const centerX = room.x + room.width / 2;
  const centerZ = room.y + room.length / 2;
  const floorY = (room.floor || 0) * WALL_HEIGHT;
  
  const numSteps = Math.ceil(WALL_HEIGHT / STEP_HEIGHT);
  
  const style = room.stairStyle || 'U Shape';
  
  const generateSteps = () => {
    const steps = [];
    
    if (style === 'Straight') {
      // Straight flight
      for (let i = 0; i < numSteps; i++) {
        steps.push(
          <mesh 
            key={i} 
            castShadow 
            receiveShadow 
            position={[0, i * STEP_HEIGHT + STEP_HEIGHT/2, -room.length/2 + i * STEP_DEPTH + STEP_DEPTH/2]} 
            material={stairMat}
            layers={1}
          >
            <boxGeometry args={[room.width - 1, STEP_HEIGHT, STEP_DEPTH]} />
          </mesh>
        );
        // Handrails
        steps.push(
          <mesh 
            key={`rail1-${i}`} 
            position={[-room.width/2 + 0.6, i * STEP_HEIGHT + STEP_HEIGHT + 1, -room.length/2 + i * STEP_DEPTH + STEP_DEPTH/2]}
            material={railMat}
          >
            <boxGeometry args={[0.1, 2, STEP_DEPTH]} />
          </mesh>,
          <mesh 
            key={`rail2-${i}`} 
            position={[room.width/2 - 0.6, i * STEP_HEIGHT + STEP_HEIGHT + 1, -room.length/2 + i * STEP_DEPTH + STEP_DEPTH/2]}
            material={railMat}
          >
            <boxGeometry args={[0.1, 2, STEP_DEPTH]} />
          </mesh>
        );
      }
    } else if (style === 'U Shape') {
      // U-Shape: Half up, landing, half back
      const halfSteps = Math.floor(numSteps / 2);
      const stairW = room.width / 2 - 0.2;
      
      // First Flight
      for (let i = 0; i < halfSteps; i++) {
        steps.push(
          <mesh 
            key={`f1-${i}`} 
            castShadow 
            receiveShadow 
            position={[-room.width/4, i * STEP_HEIGHT + STEP_HEIGHT/2, room.length/2 - i * STEP_DEPTH - STEP_DEPTH/2]} 
            material={stairMat}
            layers={1}
          >
            <boxGeometry args={[stairW, STEP_HEIGHT, STEP_DEPTH]} />
          </mesh>
        );
      }
      
      // Landing
      const landingHeight = halfSteps * STEP_HEIGHT;
      steps.push(
        <mesh 
          key="landing" 
          castShadow 
          receiveShadow 
          position={[0, landingHeight, -room.length/2 + 2]} 
          material={stairMat}
          layers={1}
        >
          <boxGeometry args={[room.width - 0.4, STEP_HEIGHT, 4]} />
        </mesh>
      );
      
      // Second Flight
      for (let i = halfSteps; i < numSteps; i++) {
        const stepIdx = i - halfSteps;
        steps.push(
          <mesh 
            key={`f2-${i}`} 
            castShadow 
            receiveShadow 
            position={[room.width/4, i * STEP_HEIGHT + STEP_HEIGHT/2, -room.length/2 + 4 + stepIdx * STEP_DEPTH + STEP_DEPTH/2]} 
            material={stairMat}
            layers={1}
          >
            <boxGeometry args={[stairW, STEP_HEIGHT, STEP_DEPTH]} />
          </mesh>
        );
      }
    } else {
      // L Shape fallback (simplified as Straight for now to fit time)
      for (let i = 0; i < numSteps; i++) {
        steps.push(
          <mesh 
            key={i} 
            castShadow 
            receiveShadow 
            position={[0, i * STEP_HEIGHT + STEP_HEIGHT/2, -room.length/2 + i * STEP_DEPTH + STEP_DEPTH/2]} 
            material={stairMat}
            layers={1}
          >
            <boxGeometry args={[room.width - 1, STEP_HEIGHT, STEP_DEPTH]} />
          </mesh>
        );
      }
    }
    
    return steps;
  };

  return (
    <group position={[centerX, floorY, centerZ]}>
      {generateSteps()}
    </group>
  );
}
