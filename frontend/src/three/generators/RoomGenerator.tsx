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
  const theme = useThreeStore((state) => state.theme);

  const roomNameLower = (room.name || '').toLowerCase();
  const isSwimmingPool = roomNameLower.includes('pool');
  const isSolarPanels = roomNameLower.includes('solar');
  const isGarden = roomNameLower.includes('garden') || roomNameLower.includes('backyard') || roomNameLower.includes('kids');
  const isParking = roomNameLower.includes('parking');

  const getFloorMaterialType = (): MaterialType => {
    if (isGarden) return 'grass';
    if (isParking) return 'concrete';
    switch (room.category) {
      case 'living': return 'floor_living';
      case 'sleeping': return 'floor_sleeping';
      case 'service': return 'floor_service';
      case 'outdoor': return 'floor_outdoor';
      default: return 'concrete';
    }
  };

  const wallMat = getMaterial('wall', transparentWalls, wireframe, theme) as THREE.MeshStandardMaterial;
  const floorMat = getMaterial(getFloorMaterialType(), false, wireframe, theme);
  const roofMat = getMaterial('roof', false, wireframe, theme);
  const poolWaterMat = getMaterial('pool_water', false, wireframe, theme);
  const poolTileMat = getMaterial('pool_tile', false, wireframe, theme);
  const solarPvMat = getMaterial('solar_pv', false, wireframe, theme);
  const solarFrameMat = getMaterial('solar_frame', false, wireframe, theme);

  // Room coordinates are top-left based (from 2D SVG layout)
  // Three.js meshes are center-based, so we shift by half width/length
  const centerX = room.x + room.width / 2;
  const centerZ = room.y + room.length / 2; // y in 2D is z in 3D
  // Elevate room based on its floor
  const floorY = (room.floor || 0) * WALL_HEIGHT;

  // Custom 3D rendering for Swimming Pool
  if (isSwimmingPool) {
    return (
      <group position={[centerX, floorY, centerZ]}>
        {/* Pool Coping Rim */}
        <mesh receiveShadow position={[0, 0.1, 0]} material={poolTileMat}>
          <boxGeometry args={[room.width, 0.2, room.length]} />
        </mesh>
        {/* Pool Water Surface */}
        <mesh receiveShadow position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]} material={poolWaterMat}>
          <planeGeometry args={[room.width - 1, room.length - 1]} />
        </mesh>
        {showLabels && (
          <Html position={[0, 1.5, 0]} center transform sprite zIndexRange={[100, 0]}>
            <div className="px-3 py-1.5 bg-blue-900/80 text-white rounded-lg whitespace-nowrap text-center text-sm font-bold shadow-lg pointer-events-none select-none border border-blue-400">
              🌊 {room.name}<br/>
              <span className="text-xs text-blue-200 font-normal">
                {Math.round(room.width)}' × {Math.round(room.length)}'
              </span>
            </div>
          </Html>
        )}
      </group>
    );
  }

  // Custom 3D rendering for Solar Panels
  if (isSolarPanels) {
    const panelsX = Math.max(1, Math.floor(room.width / 4));
    const panelsZ = Math.max(1, Math.floor(room.length / 5));
    
    return (
      <group position={[centerX, floorY, centerZ]}>
        {/* Mounting Base */}
        <mesh receiveShadow position={[0, 0.2, 0]} material={solarFrameMat}>
          <boxGeometry args={[room.width, 0.2, room.length]} />
        </mesh>
        {/* Angled Solar PV Arrays */}
        <group position={[0, 0.8, 0]} rotation={[0.2, 0, 0]}>
          {Array.from({ length: panelsX }).map((_, xi) => (
            Array.from({ length: panelsZ }).map((_, zi) => (
              <mesh 
                key={`${xi}-${zi}`} 
                castShadow 
                position={[
                  (xi - (panelsX - 1) / 2) * 3.8, 
                  0, 
                  (zi - (panelsZ - 1) / 2) * 4.5
                ]} 
                material={solarPvMat}
              >
                <boxGeometry args={[3.4, 0.1, 4.0]} />
              </mesh>
            ))
          ))}
        </group>
        {showLabels && (
          <Html position={[0, 2.5, 0]} center transform sprite zIndexRange={[100, 0]}>
            <div className="px-3 py-1.5 bg-slate-900/90 text-yellow-400 rounded-lg whitespace-nowrap text-center text-sm font-bold shadow-lg pointer-events-none select-none border border-yellow-500/50">
              ☀️ {room.name}<br/>
              <span className="text-xs text-slate-300 font-normal">
                {Math.round(room.width)}' × {Math.round(room.length)}'
              </span>
            </div>
          </Html>
        )}
      </group>
    );
  }

  // Custom 3D rendering for open Outdoor areas (Garden, Backyard, Parking, Patio)
  if (room.category === 'outdoor' && !roomNameLower.includes('balcony')) {
    return (
      <group position={[centerX, floorY, centerZ]}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} material={floorMat}>
          <planeGeometry args={[room.width, room.length]} />
        </mesh>
        {/* Low perimeter border */}
        <mesh receiveShadow position={[0, 0.2, 0]} material={solarFrameMat}>
          <boxGeometry args={[room.width + 0.2, 0.4, room.length + 0.2]} />
        </mesh>
        {showLabels && (
          <Html position={[0, 1.5, 0]} center transform sprite zIndexRange={[100, 0]}>
            <div className="px-3 py-1.5 bg-emerald-900/80 text-white rounded-lg whitespace-nowrap text-center text-sm font-bold shadow-lg pointer-events-none select-none border border-emerald-400">
              🌳 {room.name}<br/>
              <span className="text-xs text-emerald-200 font-normal">
                {Math.round(room.width)}' × {Math.round(room.length)}'
              </span>
            </div>
          </Html>
        )}
      </group>
    );
  }

  // Standard Indoor Rooms & Circulation
  return (
    <group position={[centerX, floorY, centerZ]}>
      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} material={floorMat} layers={1}>
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
        <mesh castShadow receiveShadow position={[0, 0, -room.length / 2]} material={wallMat} layers={2}>
          <boxGeometry args={[room.width + WALL_THICKNESS, WALL_HEIGHT, WALL_THICKNESS]} />
        </mesh>
        
        {/* South Wall (Bottom in 2D) */}
        <mesh castShadow receiveShadow position={[0, 0, room.length / 2]} material={wallMat} layers={2}>
          <boxGeometry args={[room.width + WALL_THICKNESS, WALL_HEIGHT, WALL_THICKNESS]} />
        </mesh>

        {/* East Wall (Right in 2D) */}
        <mesh castShadow receiveShadow position={[room.width / 2, 0, 0]} material={wallMat} layers={2}>
          <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, room.length - WALL_THICKNESS]} />
        </mesh>

        {/* West Wall (Left in 2D) */}
        <mesh castShadow receiveShadow position={[-room.width / 2, 0, 0]} material={wallMat} layers={2}>
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
