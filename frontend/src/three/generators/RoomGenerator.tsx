import { getMaterial, type MaterialType } from '../materials/MaterialFactory';
import * as THREE from 'three';
import { useThreeStore } from '@/store/threeStore';
import { Html } from '@react-three/drei';

const WALL_HEIGHT = 10;
const WALL_THICKNESS = 0.5;

export default function RoomGenerator({ room }: { room: any }) {
  const showRoof = useThreeStore((state) => state.showRoof);
  const showLabels = useThreeStore((state) => state.showLabels);
  const transparentWalls = useThreeStore((state) => state.transparentWalls);
  const wireframe = useThreeStore((state) => state.wireframe);

  const getFloorMaterialType = (): MaterialType => {
    switch (room.category) {
      case 'living': return 'floor_living';
      case 'sleeping': return 'floor_sleeping';
      case 'service': return 'floor_service';
      case 'outdoor': return 'floor_outdoor';
      default: return 'concrete';
    }
  };

  const wallMat = getMaterial('wall', transparentWalls) as THREE.MeshStandardMaterial;
  if (wireframe) {
    wallMat.wireframe = true;
  } else {
    wallMat.wireframe = false;
  }

  const floorMat = getMaterial(getFloorMaterialType());
  const roofMat = getMaterial('roof');

  // Room coordinates are top-left based (from 2D SVG layout)
  // Three.js meshes are center-based, so we shift by half width/length
  const centerX = room.x + room.width / 2;
  const centerZ = room.y + room.length / 2; // y in 2D is z in 3D
  // Elevate room based on its floor
  const floorY = (room.floor || 0) * WALL_HEIGHT;

  return (
    <group position={[centerX, floorY, centerZ]}>
      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} material={floorMat}>
        <planeGeometry args={[room.width, room.length]} />
      </mesh>

      {/* Roof */}
      {showRoof && (
        <mesh castShadow receiveShadow position={[0, WALL_HEIGHT, 0]} rotation={[-Math.PI / 2, 0, 0]} material={roofMat}>
          <planeGeometry args={[room.width + 1, room.length + 1]} /> {/* Slight overhang */}
        </mesh>
      )}

      {/* Walls */}
      <group position={[0, WALL_HEIGHT / 2, 0]}>
        {/* North Wall (Top in 2D) */}
        <mesh castShadow receiveShadow position={[0, 0, -room.length / 2]} material={wallMat}>
          <boxGeometry args={[room.width + WALL_THICKNESS, WALL_HEIGHT, WALL_THICKNESS]} />
        </mesh>
        
        {/* South Wall (Bottom in 2D) */}
        <mesh castShadow receiveShadow position={[0, 0, room.length / 2]} material={wallMat}>
          <boxGeometry args={[room.width + WALL_THICKNESS, WALL_HEIGHT, WALL_THICKNESS]} />
        </mesh>

        {/* East Wall (Right in 2D) */}
        <mesh castShadow receiveShadow position={[room.width / 2, 0, 0]} material={wallMat}>
          <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, room.length - WALL_THICKNESS]} />
        </mesh>

        {/* West Wall (Left in 2D) */}
        <mesh castShadow receiveShadow position={[-room.width / 2, 0, 0]} material={wallMat}>
          <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, room.length - WALL_THICKNESS]} />
        </mesh>
      </group>

      {/* Labels */}
      {showLabels && (
        <Html position={[0, WALL_HEIGHT / 2, 0]} center transform sprite zIndexRange={[100, 0]}>
          <div className="px-3 py-1.5 bg-black/75 text-white rounded-lg whitespace-nowrap text-center text-sm font-bold shadow-lg pointer-events-none select-none">
            {room.name}<br/>
            <span className="text-xs text-gray-300 font-normal">
              {Math.round(room.width)}' × {Math.round(room.length)}'
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}
