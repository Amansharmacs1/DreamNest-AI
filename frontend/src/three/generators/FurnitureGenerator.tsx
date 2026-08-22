import * as THREE from 'three';
import type { Furniture } from '@/types';
import { getMaterial, createCustomFabricMaterial } from '../materials/MaterialFactory';
import { useThreeStore } from '@/store/threeStore';

export default function FurnitureGenerator({ furniture }: { furniture: Furniture }) {
  const theme = useThreeStore((state) => state.theme);
  const wireframe = useThreeStore((state) => state.wireframe);

  const type = furniture.type.toLowerCase();
  
  // Pick materials based on furniture type
  const woodMat = getMaterial('wood', false, wireframe, theme);
  const fabricMat = createCustomFabricMaterial(furniture.color || '#cbd5e1', wireframe);
  const metalMat = getMaterial('metal', false, wireframe, theme);
  const glassMat = getMaterial('glass', true, wireframe, theme);
  const ceramicMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.1, metalness: 0.1, wireframe });

  const { width, length, height } = furniture;

  const renderBed = () => (
    <group>
      {/* Bed Frame */}
      <mesh position={[0, 0.5, 0]} material={woodMat} castShadow receiveShadow>
        <boxGeometry args={[width, 1, length]} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 1.25, 0]} material={new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9, wireframe })} castShadow receiveShadow>
        <boxGeometry args={[width - 0.2, 0.5, length - 0.2]} />
      </mesh>
      {/* Pillows */}
      <mesh position={[-width/4, 1.6, -length/2 + 0.5]} material={fabricMat} castShadow receiveShadow>
        <boxGeometry args={[width/3, 0.2, 0.6]} />
      </mesh>
      <mesh position={[width/4, 1.6, -length/2 + 0.5]} material={fabricMat} castShadow receiveShadow>
        <boxGeometry args={[width/3, 0.2, 0.6]} />
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
      <mesh position={[0, 0.4, 0]} material={fabricMat} castShadow receiveShadow>
        <boxGeometry args={[width, 0.8, length]} />
      </mesh>
      {/* Cushions */}
      <mesh position={[0, 0.9, 0]} material={fabricMat} castShadow receiveShadow>
        <boxGeometry args={[width - 0.4, 0.2, length - 0.4]} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, height / 2, -length / 2 + 0.4]} material={fabricMat} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.8]} />
      </mesh>
      {/* Armrests */}
      <mesh position={[-width / 2 + 0.4, height / 2 - 0.4, 0]} material={fabricMat} castShadow receiveShadow>
        <boxGeometry args={[0.8, height - 0.8, length]} />
      </mesh>
      <mesh position={[width / 2 - 0.4, height / 2 - 0.4, 0]} material={fabricMat} castShadow receiveShadow>
        <boxGeometry args={[0.8, height - 0.8, length]} />
      </mesh>
    </group>
  );

  const renderTable = () => (
    <group>
      {/* Top */}
      <mesh position={[0, height - 0.1, 0]} material={woodMat} castShadow receiveShadow>
        <boxGeometry args={[width, 0.2, length]} />
      </mesh>
      {/* Legs */}
      <mesh position={[-width/2 + 0.2, height/2 - 0.1, -length/2 + 0.2]} material={metalMat} castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.05, height - 0.2]} />
      </mesh>
      <mesh position={[width/2 - 0.2, height/2 - 0.1, -length/2 + 0.2]} material={metalMat} castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.05, height - 0.2]} />
      </mesh>
      <mesh position={[-width/2 + 0.2, height/2 - 0.1, length/2 - 0.2]} material={metalMat} castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.05, height - 0.2]} />
      </mesh>
      <mesh position={[width/2 - 0.2, height/2 - 0.1, length/2 - 0.2]} material={metalMat} castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.05, height - 0.2]} />
      </mesh>
    </group>
  );

  const renderChair = () => (
    <group>
      <mesh position={[0, height/2, 0]} material={woodMat} castShadow receiveShadow>
        <boxGeometry args={[width, 0.1, length]} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, height * 0.75, -length/2 + 0.1]} material={woodMat} castShadow receiveShadow>
        <boxGeometry args={[width, height/2, 0.1]} />
      </mesh>
      {/* Legs */}
      <mesh position={[-width/2 + 0.1, height/4, -length/2 + 0.1]} material={woodMat} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, height/2]} />
      </mesh>
      <mesh position={[width/2 - 0.1, height/4, -length/2 + 0.1]} material={woodMat} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, height/2]} />
      </mesh>
      <mesh position={[-width/2 + 0.1, height/4, length/2 - 0.1]} material={woodMat} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, height/2]} />
      </mesh>
      <mesh position={[width/2 - 0.1, height/4, length/2 - 0.1]} material={woodMat} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, height/2]} />
      </mesh>
    </group>
  );

  const renderWardrobe = () => (
    <group>
      <mesh position={[0, height / 2, 0]} material={woodMat} castShadow receiveShadow>
        <boxGeometry args={[width, height, length]} />
      </mesh>
      {/* Doors/Handles */}
      <mesh position={[-width/4, height/2, length/2 + 0.05]} material={metalMat} castShadow receiveShadow>
        <boxGeometry args={[0.05, height * 0.8, 0.02]} />
      </mesh>
      <mesh position={[width/4, height/2, length/2 + 0.05]} material={metalMat} castShadow receiveShadow>
        <boxGeometry args={[0.05, height * 0.8, 0.02]} />
      </mesh>
    </group>
  );

  const renderKitchenCounter = () => (
    <group>
      {/* Base */}
      <mesh position={[0, height / 2 - 0.1, 0]} material={woodMat} castShadow receiveShadow>
        <boxGeometry args={[width, height - 0.2, length]} />
      </mesh>
      {/* Top Marble */}
      <mesh position={[0, height - 0.1, 0]} material={new THREE.MeshStandardMaterial({color: '#f8fafc', roughness: 0.1})} castShadow receiveShadow>
        <boxGeometry args={[width + 0.2, 0.2, length + 0.2]} />
      </mesh>
    </group>
  );

  const renderToilet = () => (
    <group>
      <mesh position={[0, 1.5, -length/2 + 0.4]} material={ceramicMat} castShadow receiveShadow>
        <boxGeometry args={[width, 3, 0.8]} />
      </mesh>
      <mesh position={[0, 1.2, length/4]} material={ceramicMat} castShadow receiveShadow>
        <cylinderGeometry args={[width/2, width/2.5, 1.2]} />
      </mesh>
    </group>
  );

  const renderRug = () => (
    <mesh position={[0, 0.05, 0]} material={fabricMat} receiveShadow>
      <boxGeometry args={[width, 0.05, length]} />
    </mesh>
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
  else if (type.includes('table') || type.includes('desk') || type.includes('dining')) renderFunc = renderTable;
  else if (type.includes('chair') || type.includes('seat')) renderFunc = renderChair;
  else if (type.includes('wardrobe') || type.includes('cabinet') || type.includes('unit')) renderFunc = renderWardrobe;
  else if (type.includes('counter') || type.includes('kitchen')) renderFunc = renderKitchenCounter;
  else if (type.includes('toilet') || type.includes('wc')) renderFunc = renderToilet;
  else if (type.includes('rug') || type.includes('carpet')) renderFunc = renderRug;

  return (
    <group position={[furniture.x, furniture.z, furniture.y]} rotation={[0, furniture.rotation, 0]}>
      {renderFunc()}
    </group>
  );
}
