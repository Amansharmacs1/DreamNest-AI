import { Materials } from '../materials/MaterialSystem';

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
  const frameThickness = 0.1;

  return (
    <group position={position} rotation={rotation}>
      {/* Outer Frame */}
      {/* Left */}
      <mesh position={[-width / 2 + frameThickness/2, height / 2, 0]} castShadow receiveShadow material={Materials.AluminiumFrame}>
        <boxGeometry args={[frameThickness, height, thickness]} />
      </mesh>
      {/* Right */}
      <mesh position={[width / 2 - frameThickness/2, height / 2, 0]} castShadow receiveShadow material={Materials.AluminiumFrame}>
        <boxGeometry args={[frameThickness, height, thickness]} />
      </mesh>
      {/* Top */}
      <mesh position={[0, height - frameThickness/2, 0]} castShadow receiveShadow material={Materials.AluminiumFrame}>
        <boxGeometry args={[width, frameThickness, thickness]} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, frameThickness/2, 0]} castShadow receiveShadow material={Materials.AluminiumFrame}>
        <boxGeometry args={[width, frameThickness, thickness]} />
      </mesh>
      
      {/* Center Mullion */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow material={Materials.AluminiumFrame}>
        <boxGeometry args={[frameThickness, height - frameThickness*2, thickness * 0.8]} />
      </mesh>

      {/* Glass Panes */}
      <mesh position={[-width / 4, height / 2, 0]} material={Materials.GlassWindow}>
        <boxGeometry args={[width / 2 - frameThickness*1.5, height - frameThickness*2, 0.05]} />
      </mesh>
      <mesh position={[width / 4, height / 2, 0]} material={Materials.GlassWindow}>
        <boxGeometry args={[width / 2 - frameThickness*1.5, height - frameThickness*2, 0.05]} />
      </mesh>
    </group>
  );
}
