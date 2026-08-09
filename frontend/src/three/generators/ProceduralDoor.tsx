import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, Group } from 'three';
import { Materials } from '../materials/MaterialSystem';

interface ProceduralDoorProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  thickness?: number;
  isMain?: boolean;
}

export default function ProceduralDoor({
  position,
  rotation = [0, 0, 0],
  width = 3,
  height = 7,
  thickness = 0.15,
  isMain = false,
}: ProceduralDoorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hingeRef = useRef<Group>(null);
  
  const targetRotation = isOpen ? Math.PI / 2 : 0;
  
  useFrame((_, delta) => {
    if (hingeRef.current) {
      hingeRef.current.rotation.y = MathUtils.damp(
        hingeRef.current.rotation.y,
        targetRotation,
        5,
        delta
      );
    }
  });

  const frameThickness = 0.1;
  const frameDepth = thickness * 1.5;

  return (
    <group position={position} rotation={rotation}>
      {/* Door Frame */}
      {/* Left */}
      <mesh position={[-width / 2, height / 2, 0]} castShadow receiveShadow material={Materials.WoodLight}>
        <boxGeometry args={[frameThickness, height, frameDepth]} />
      </mesh>
      {/* Right */}
      <mesh position={[width / 2, height / 2, 0]} castShadow receiveShadow material={Materials.WoodLight}>
        <boxGeometry args={[frameThickness, height, frameDepth]} />
      </mesh>
      {/* Top */}
      <mesh position={[0, height, 0]} castShadow receiveShadow material={Materials.WoodLight}>
        <boxGeometry args={[width + frameThickness, frameThickness, frameDepth]} />
      </mesh>

      {/* Hinge & Door Panel */}
      <group ref={hingeRef} position={[-width / 2 + frameThickness/2, 0, 0]}>
        {/* The door panel is offset so it rotates around the hinge */}
        <mesh 
          position={[width / 2 - frameThickness/2, height / 2, 0]} 
          castShadow 
          receiveShadow 
          material={isMain ? Materials.WoodDark : Materials.WoodLight}
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          onPointerEnter={() => document.body.style.cursor = 'pointer'}
          onPointerLeave={() => document.body.style.cursor = 'auto'}
        >
          <boxGeometry args={[width - frameThickness, height - frameThickness, thickness]} />
        </mesh>
        
        {/* Handle */}
        <mesh position={[width - frameThickness - 0.2, height / 2, thickness / 2 + 0.05]} castShadow material={Materials.MetalChrome}>
          <cylinderGeometry args={[0.02, 0.02, 0.4]} />
        </mesh>
        <mesh position={[width - frameThickness - 0.2, height / 2, -(thickness / 2 + 0.05)]} castShadow material={Materials.MetalChrome}>
          <cylinderGeometry args={[0.02, 0.02, 0.4]} />
        </mesh>
      </group>
    </group>
  );
}
