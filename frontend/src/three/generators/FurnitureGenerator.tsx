import * as THREE from 'three';
import type { Furniture } from '@/types';
import { getMaterial } from '../materials/MaterialFactory';
import { useThreeStore } from '@/store/threeStore';

export default function FurnitureGenerator({ furniture }: { furniture: Furniture }) {
  const theme = useThreeStore((state) => state.theme);
  const wireframe = useThreeStore((state) => state.wireframe);

  const type = furniture.type.toLowerCase();
  
  // Pick materials based on furniture type
  const woodMat = getMaterial('wood', false, wireframe, theme);
  const fabricMat = new THREE.MeshStandardMaterial({ color: furniture.color || '#cbd5e1', roughness: 0.9, wireframe });
  const metalMat = getMaterial('metal', false, wireframe, theme);

  const { width, length, height } = furniture;

  const renderBed = () => (
    <group>
      {/* Bed Frame */}
      <mesh position={[0, 0.5, 0]} material={woodMat} castShadow receiveShadow>
        <boxGeometry args={[width, 1, length]} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 1.2, 0]} material={new THREE.MeshStandardMaterial({ color: '#ffffff', wireframe })} castShadow receiveShadow>
        <boxGeometry args={[width - 0.2, 0.4, length - 0.2]} />
      </mesh>
      {/* Headboard */}
      <mesh position={[0, height / 2, -length / 2 + 0.2]} material={woodMat} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.4]} />
      </mesh>
    </group>
  );

  const renderSofa = () => (
    <group>
      {/* Base */}
      <mesh position={[0, 0.5, 0]} material={fabricMat} castShadow receiveShadow>
        <boxGeometry args={[width, 1, length]} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, height / 2, -length / 2 + 0.5]} material={fabricMat} castShadow receiveShadow>
        <boxGeometry args={[width, height, 1]} />
      </mesh>
      {/* Armrests */}
      <mesh position={[-width / 2 + 0.5, height / 2 - 0.5, 0]} material={fabricMat} castShadow receiveShadow>
        <boxGeometry args={[1, height - 1, length]} />
      </mesh>
      <mesh position={[width / 2 - 0.5, height / 2 - 0.5, 0]} material={fabricMat} castShadow receiveShadow>
        <boxGeometry args={[1, height - 1, length]} />
      </mesh>
    </group>
  );

  const renderTable = () => (
    <group>
      {/* Top */}
      <mesh position={[0, height - 0.2, 0]} material={woodMat} castShadow receiveShadow>
        <boxGeometry args={[width, 0.4, length]} />
      </mesh>
      {/* Legs */}
      <mesh position={[-width/2 + 0.2, height/2 - 0.2, -length/2 + 0.2]} material={metalMat} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, height - 0.4]} />
      </mesh>
      <mesh position={[width/2 - 0.2, height/2 - 0.2, -length/2 + 0.2]} material={metalMat} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, height - 0.4]} />
      </mesh>
      <mesh position={[-width/2 + 0.2, height/2 - 0.2, length/2 - 0.2]} material={metalMat} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, height - 0.4]} />
      </mesh>
      <mesh position={[width/2 - 0.2, height/2 - 0.2, length/2 - 0.2]} material={metalMat} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, height - 0.4]} />
      </mesh>
    </group>
  );

  const renderWardrobe = () => (
    <group>
      <mesh position={[0, height / 2, 0]} material={woodMat} castShadow receiveShadow>
        <boxGeometry args={[width, height, length]} />
      </mesh>
    </group>
  );

  const renderDefault = () => (
    <group>
      <mesh position={[0, height / 2, 0]} material={fabricMat} castShadow receiveShadow>
        <boxGeometry args={[width, height, length]} />
      </mesh>
    </group>
  );

  let renderFunc = renderDefault;
  if (type.includes('bed')) renderFunc = renderBed;
  else if (type.includes('sofa') || type.includes('couch')) renderFunc = renderSofa;
  else if (type.includes('table') || type.includes('desk')) renderFunc = renderTable;
  else if (type.includes('wardrobe') || type.includes('cabinet') || type.includes('unit')) renderFunc = renderWardrobe;

  // The origin of the furniture is its center based on x, y coordinates from backend layout engine
  // Since 2D y is 3D z, we map accordingly.
  return (
    <group position={[furniture.x, furniture.z, furniture.y]} rotation={[0, furniture.rotation, 0]}>
      {renderFunc()}
    </group>
  );
}
