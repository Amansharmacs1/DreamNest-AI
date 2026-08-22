import { getMaterial } from '../materials/MaterialFactory';
import { useThreeStore } from '@/store/threeStore';
import { useLayoutStore } from '@/store/layoutStore';
import { Html } from '@react-three/drei';
import FurnitureGenerator from './FurnitureGenerator';
import ProceduralDoor from './ProceduralDoor';
import ProceduralWindow from './ProceduralWindow';
import RoomLighting from '../lights/RoomLighting';
import { useMemo } from 'react';

const WALL_HEIGHT = 10;
const WALL_THICKNESS = 0.5;

export default function RoomGenerator({ room }: { room: any }) {
  const showRoof = useThreeStore((state) => state.showRoof);
  const showLabels = useThreeStore((state) => state.showLabels);
  const transparentWalls = useThreeStore((state) => state.transparentWalls);
  const theme = useThreeStore((state) => state.theme);
  const wireframe = useThreeStore((state) => state.wireframe);
  const timeOfDay = useThreeStore((state) => state.timeOfDay);
  const setSelectedRoom = useLayoutStore((state) => state.setSelectedRoom);

  const roomNameLower = (room.name || '').toLowerCase();
  const isSwimmingPool = roomNameLower.includes('pool');
  const isSolarPanels = roomNameLower.includes('solar');
  const isParking = roomNameLower.includes('parking') || roomNameLower.includes('garage');

  // Assign base material type based on room function
  const getFloorType = () => {
    if (roomNameLower.includes('bath') || roomNameLower.includes('kitchen') || roomNameLower.includes('utility')) return 'floor_service';
    if (roomNameLower.includes('living') || roomNameLower.includes('dining')) return 'floor_living';
    if (roomNameLower.includes('bed')) return 'floor_sleeping';
    if (isParking) return 'concrete';
    return 'floor_living';
  };

  const baseWallMat = getMaterial('wall', false, wireframe, theme);
  const wallMat = useMemo(() => {
    if (!transparentWalls) return baseWallMat;
    const mat = baseWallMat.clone();
    mat.transparent = true;
    mat.opacity = 0.3;
    return mat;
  }, [baseWallMat, transparentWalls]);

  const floorMat = getMaterial(getFloorType(), false, wireframe, theme);
  const roofMat = getMaterial('roof', false, wireframe, theme);
  const poolWaterMat = getMaterial('pool_water', true, wireframe, theme);
  const poolTileMat = getMaterial('pool_tile', false, wireframe, theme);
  const solarPvMat = getMaterial('solar_pv', false, wireframe, theme);
  const solarFrameMat = getMaterial('solar_frame', false, wireframe, theme);

  // Room coordinates are top-left based (from 2D SVG layout)
  // Three.js meshes are center-based, so we shift by half width/length
  const centerX = room.x + room.width / 2;
  const centerZ = room.y + room.length / 2; // y in 2D is z in 3D
  const floorY = (room.floor || 0) * WALL_HEIGHT;

  const renderWall = (wallType: 'top' | 'bottom' | 'left' | 'right', wallLength: number) => {
    const openings = [
      ...(room.doors?.filter((d: any) => d.wall === wallType) || []),
      ...(room.windows?.filter((w: any) => w.wall === wallType) || [])
    ];

    if (openings.length === 0) {
      return (
        <mesh castShadow receiveShadow material={wallMat} layers={2}>
          <boxGeometry args={[wallLength + WALL_THICKNESS, WALL_HEIGHT, WALL_THICKNESS]} />
        </mesh>
      );
    }

    const segments: any[] = [];
    let current = 0;
    const sorted = [...openings].sort((a, b) => a.offset - b.offset);

    sorted.forEach((op, idx) => {
      const startX = Math.max(current, op.offset - op.width / 2);
      const endX = Math.min(wallLength, op.offset + op.width / 2);
      const actualWidth = endX - startX;
      if (actualWidth <= 0) return;

      if (startX > current) {
        let segLen = startX - current;
        if (current === 0) segLen += WALL_THICKNESS / 2;
        const cx = current + (startX - current) / 2 - wallLength / 2;
        
        segments.push(
          <mesh key={`seg-${idx}`} castShadow receiveShadow position={[cx, 0, 0]} material={wallMat} layers={2}>
            <boxGeometry args={[segLen, WALL_HEIGHT, WALL_THICKNESS]} />
          </mesh>
        );
      }

      const cx = startX + actualWidth / 2 - wallLength / 2;
      const lintelHeight = WALL_HEIGHT - op.height;
      if (lintelHeight > 0) {
        const cy = (WALL_HEIGHT + op.height) / 2 - WALL_HEIGHT / 2;
        segments.push(
          <mesh key={`lintel-${idx}`} castShadow receiveShadow position={[cx, cy, 0]} material={wallMat} layers={2}>
            <boxGeometry args={[actualWidth, lintelHeight, WALL_THICKNESS]} />
          </mesh>
        );
      }

      const isDoor = op.type === 'door';
      if (!isDoor) {
        const sillHeight = WALL_HEIGHT - lintelHeight - op.height;
        if (sillHeight > 0) {
          const cy = sillHeight / 2 - WALL_HEIGHT / 2;
          segments.push(
            <mesh key={`sill-${idx}`} castShadow receiveShadow position={[cx, cy, 0]} material={wallMat} layers={2}>
              <boxGeometry args={[actualWidth, sillHeight, WALL_THICKNESS]} />
            </mesh>
          );
        }
      }

      if (isDoor) {
        segments.push(
          <ProceduralDoor
            key={`door-${idx}`}
            position={[cx, -WALL_HEIGHT / 2 + op.height / 2, 0]}
            width={op.width}
            height={op.height}
            thickness={WALL_THICKNESS}
            isMain={op.isMain}
          />
        );
      } else {
        const sillHeight = WALL_HEIGHT - lintelHeight - op.height;
        segments.push(
          <ProceduralWindow
            key={`win-${idx}`}
            position={[cx, -WALL_HEIGHT / 2 + sillHeight + op.height / 2, 0]}
            width={op.width}
            height={op.height}
            thickness={WALL_THICKNESS}
          />
        );
      }

      current = endX;
    });

    if (current < wallLength) {
      let segLen = wallLength - current;
      segLen += WALL_THICKNESS / 2;
      const cx = current + (wallLength - current) / 2 - wallLength / 2;
      segments.push(
        <mesh key={`seg-end`} castShadow receiveShadow position={[cx, 0, 0]} material={wallMat} layers={2}>
          <boxGeometry args={[segLen, WALL_HEIGHT, WALL_THICKNESS]} />
        </mesh>
      );
    }

    return <>{segments}</>;
  };

  const isNight = timeOfDay === 'evening' || timeOfDay === 'night';
  const roomLightIntensity = isNight ? 1.5 : 0.2; // Add realistic ceiling lights when dark

  return (
    <group 
      position={[centerX, floorY, centerZ]}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedRoom(room.id);
      }}
    >
      {/* Interior Ceiling Light (Only enabled based on timeOfDay if no explicit lights) */}
      {!isSolarPanels && !isSwimmingPool && !isParking && (!room.lights || room.lights.length === 0) && (
        <pointLight position={[0, WALL_HEIGHT - 1, 0]} intensity={roomLightIntensity} color="#fdf4dc" distance={30} decay={2} castShadow={isNight} />
      )}

      {/* Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={floorMat} layers={1}>
        <planeGeometry args={[room.width, room.length]} />
      </mesh>

      {/* Swimming Pool specific logic */}
      {isSwimmingPool && (
        <group>
          <mesh position={[0, -2, 0]} receiveShadow material={poolTileMat}>
            <boxGeometry args={[room.width, 4, room.length]} />
          </mesh>
          <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={poolWaterMat}>
            <planeGeometry args={[room.width, room.length]} />
          </mesh>
        </group>
      )}

      {/* Solar Panels specific logic */}
      {isSolarPanels && (
        <group position={[0, 1, 0]}>
          <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 6, 0, 0]} castShadow receiveShadow material={solarPvMat}>
            <boxGeometry args={[room.width * 0.8, 0.1, room.length * 0.8]} />
          </mesh>
          <mesh position={[0, 0, 0]} castShadow receiveShadow material={solarFrameMat}>
            <boxGeometry args={[room.width * 0.85, 0.2, room.length * 0.85]} />
          </mesh>
        </group>
      )}

      {/* Roof */}
      {showRoof && !isSwimmingPool && !isSolarPanels && (
        <mesh position={[0, WALL_HEIGHT, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow material={roofMat}>
          <planeGeometry args={[room.width + WALL_THICKNESS, room.length + WALL_THICKNESS]} />
        </mesh>
      )}

      {/* Walls */}
      {!isSwimmingPool && !isSolarPanels && (
        <group position={[0, WALL_HEIGHT / 2, 0]}>
          <group position={[0, 0, -room.length / 2]}>
            {renderWall('top', room.width)}
          </group>
          <group position={[0, 0, room.length / 2]}>
            {renderWall('bottom', room.width)}
          </group>
          <group position={[-room.width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            {renderWall('left', room.length)}
          </group>
          <group position={[room.width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            {renderWall('right', room.length)}
          </group>
        </group>
      )}

      {/* Label */}
      {showLabels && !isSwimmingPool && !isSolarPanels && (
        <Html position={[0, WALL_HEIGHT / 2, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-white/80 backdrop-blur px-2 py-1 rounded text-xs font-semibold text-slate-800 shadow-sm whitespace-nowrap border border-white pointer-events-none">
            {room.name}
          </div>
        </Html>
      )}

      {/* Interior Furniture & Lighting */}
      <group position={[-room.width / 2, 0, -room.length / 2]}>
        {room.furniture?.map((furn: any, idx: number) => (
          <FurnitureGenerator key={`furn-${idx}`} furniture={furn} />
        ))}
        {room.lights && room.lights.length > 0 && <RoomLighting lights={room.lights} />}
      </group>
    </group>
  );
}
