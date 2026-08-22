import { getMaterial } from '../materials/MaterialFactory';
import { useThreeStore } from '@/store/threeStore';

interface ProceduralWindowProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  thickness?: number;
}

export default function ProceduralWindow({
  position,
  rotation = [0, 0, 0],
  width = 4,
  height = 4,
  thickness = 0.2,
}: ProceduralWindowProps) {
  const theme = useThreeStore((state) => state.theme);
  const wireframe = useThreeStore((state) => state.wireframe);

  const frameMat = getMaterial('metal', false, wireframe, theme);
  const glassMat = getMaterial('glass', true, wireframe, theme);

  const frameThickness = 0.1;

  return (
    <group position={position} rotation={rotation}>
      {/* Outer Frame */}
      {/* Left */}
      <mesh position={[-width / 2 + frameThickness/2, height / 2, 0]} castShadow receiveShadow material={frameMat}>
        <boxGeometry args={[frameThickness, height, thickness]} />
      </mesh>
      {/* Right */}
      <mesh position={[width / 2 - frameThickness/2, height / 2, 0]} castShadow receiveShadow material={frameMat}>
        <boxGeometry args={[frameThickness, height, thickness]} />
      </mesh>
      {/* Top */}
      <mesh position={[0, height - frameThickness/2, 0]} castShadow receiveShadow material={frameMat}>
        <boxGeometry args={[width, frameThickness, thickness]} />
      </mesh>
      {/* Bottom Sill */}
      <mesh position={[0, frameThickness/2, 0]} castShadow receiveShadow material={frameMat}>
        <boxGeometry args={[width + 0.1, frameThickness, thickness + 0.1]} />
      </mesh>
      
      {/* Center Mullion */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow material={frameMat}>
        <boxGeometry args={[frameThickness, height - frameThickness*2, thickness * 0.8]} />
      </mesh>

      {/* Glass Panes */}
      <mesh position={[-width / 4, height / 2, 0]} material={glassMat}>
        <boxGeometry args={[width / 2 - frameThickness*1.5, height - frameThickness*2, 0.05]} />
      </mesh>
      <mesh position={[width / 4, height / 2, 0]} material={glassMat}>
        <boxGeometry args={[width / 2 - frameThickness*1.5, height - frameThickness*2, 0.05]} />
      </mesh>
    </group>
  );
}
