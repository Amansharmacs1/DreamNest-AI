import { Materials, getRoomFloorMaterial, getRoomWallMaterial } from '../materials/MaterialSystem';
import { useThreeStore } from '@/store/threeStore';
import { useLayoutStore } from '@/store/layoutStore';
import { Html } from '@react-three/drei';
import FurnitureGenerator from './FurnitureGenerator';
import RoomLighting from '../lights/RoomLighting';
import ProceduralDoor from './ProceduralDoor';
import ProceduralWindow from './ProceduralWindow';

import { useMemo } from 'react';

const WALL_HEIGHT = 10;
const WALL_THICKNESS = 0.5;

export default function RoomGenerator({ room }: { room: any }) {
  const showRoof = useThreeStore((state) => state.showRoof);
  const showLabels = useThreeStore((state) => state.showLabels);
  const transparentWalls = useThreeStore((state) => state.transparentWalls);
  const setSelectedRoom = useLayoutStore((state) => state.setSelectedRoom);
  const roomNameLower = (room.name || '').toLowerCase();
  const isSwimmingPool = roomNameLower.includes('pool');
  const isSolarPanels = roomNameLower.includes('solar');

  const baseWallMat = getRoomWallMaterial(roomNameLower);
  const wallMat = useMemo(() => {
    if (!transparentWalls) return baseWallMat;
    const mat = baseWallMat.clone();
    mat.transparent = true;
    mat.opacity = 0.3;
    return mat;
  }, [baseWallMat, transparentWalls]);

  const floorMat = getRoomFloorMaterial(roomNameLower);
  const roofMat = Materials.RoofConcrete;
  const poolWaterMat = Materials.Grass; // Temporary fallback for pool
  const poolTileMat = Materials.FloorTiles;
  const solarPvMat = Materials.MetalDark;
  const solarFrameMat = Materials.AluminiumFrame;

  // Room coordinates are top-left based (from 2D SVG layout)
  // Three.js meshes are center-based, so we shift by half width/length
  const centerX = room.x + room.width / 2;
  const centerZ = room.y + room.length / 2; // y in 2D is z in 3D
  // Elevate room based on its floor
  const floorY = (room.floor || 0) * WALL_HEIGHT;

  // Use shared material
  // glassMat and woodMat removed here as they are inside Procedural models

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
      // Clamp startX and endX to avoid going outside wall bounds
      const startX = Math.max(current, op.offset - op.width / 2);
      const endX = Math.min(wallLength, op.offset + op.width / 2);
      const actualWidth = endX - startX;
      if (actualWidth <= 0) return;

      // 1. Wall segment before the opening
      if (startX > current) {
        let segLen = startX - current;
        // Extend first segment slightly for corners
        if (current === 0) segLen += WALL_THICKNESS / 2;
        const cx = current + (startX - current) / 2 - wallLength / 2;
        
        segments.push(
          <mesh key={`seg-${idx}`} castShadow receiveShadow position={[cx, 0, 0]} material={wallMat} layers={2}>
            <boxGeometry args={[segLen, WALL_HEIGHT, WALL_THICKNESS]} />
          </mesh>
        );
      }

      const cx = startX + actualWidth / 2 - wallLength / 2;

      // 2. Lintel
      const lintelHeight = WALL_HEIGHT - op.height;
      if (lintelHeight > 0) {
        const cy = (WALL_HEIGHT + op.height) / 2 - WALL_HEIGHT / 2;
        segments.push(
          <mesh key={`lintel-${idx}`} castShadow receiveShadow position={[cx, cy, 0]} material={wallMat} layers={2}>
            <boxGeometry args={[actualWidth, lintelHeight, WALL_THICKNESS]} />
          </mesh>
        );
      }

      // 3. Sill & Window Glass
      if (op.type === 'window') {
        const sillHeight = 3;
        const cy = sillHeight / 2 - WALL_HEIGHT / 2;
        segments.push(
          <mesh key={`sill-${idx}`} castShadow receiveShadow position={[cx, cy, 0]} material={wallMat} layers={2}>
            <boxGeometry args={[actualWidth, sillHeight, WALL_THICKNESS]} />
          </mesh>
        );
        
        segments.push(
          <ProceduralWindow 
            key={`win-${idx}`} 
            position={[cx, sillHeight + (op.height || 4) / 2 - WALL_HEIGHT / 2, 0]} 
            width={actualWidth} 
            height={op.height || 4} 
            thickness={WALL_THICKNESS} 
          />
        );
      } else {
        const isMain = room.category === 'outdoor' || room.name.toLowerCase().includes('main');
        segments.push(
          <ProceduralDoor 
            key={`door-${idx}`} 
            position={[cx, -WALL_HEIGHT / 2 + (op.height || 7) / 2, 0]} 
            width={actualWidth} 
            height={op.height || 7} 
            thickness={WALL_THICKNESS} 
            isMain={isMain}
          />
        );
      }

      current = endX;
    });

    if (current < wallLength) {
      let segLen = wallLength - current;
      // Extend last segment slightly for corners
      if (current < wallLength) segLen += WALL_THICKNESS / 2;
      const cx = current + (wallLength - current) / 2 - wallLength / 2;
      segments.push(
        <mesh key="final-seg" castShadow receiveShadow position={[cx, 0, 0]} material={wallMat} layers={2}>
          <boxGeometry args={[segLen, WALL_HEIGHT, WALL_THICKNESS]} />
        </mesh>
      );
    }

    return <>{segments}</>;
  };

  // Custom 3D rendering for Swimming Pool
  if (isSwimmingPool) {
    return (
      <group 
        position={[centerX, floorY, centerZ]}
        onClick={(e) => { e.stopPropagation(); setSelectedRoom(room.id); }}
      >
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
      <group 
        position={[centerX, floorY, centerZ]}
        onClick={(e) => { e.stopPropagation(); setSelectedRoom(room.id); }}
      >
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
      <group 
        position={[centerX, floorY, centerZ]}
        onClick={(e) => { e.stopPropagation(); setSelectedRoom(room.id); }}
      >
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
    <group 
      position={[centerX, floorY, centerZ]}
      onClick={(e) => { e.stopPropagation(); setSelectedRoom(room.id); }}
    >
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
        <group position={[0, 0, -room.length / 2]}>
          {renderWall('top', room.width)}
        </group>
        
        {/* South Wall (Bottom in 2D) */}
        <group position={[0, 0, room.length / 2]}>
          {renderWall('bottom', room.width)}
        </group>

        {/* East Wall (Right in 2D) */}
        <group position={[room.width / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          {renderWall('right', room.length)}
        </group>

        {/* West Wall (Left in 2D) */}
        <group position={[-room.width / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          {renderWall('left', room.length)}
        </group>
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

      {/* Interior Furniture & Lighting */}
      <group position={[-room.width / 2, 0, -room.length / 2]}>
        {room.furniture?.map((furn: any) => (
          <FurnitureGenerator key={furn.id} furniture={furn} />
        ))}
        {room.lighting && <RoomLighting lights={room.lighting} />}
      </group>
    </group>
  );
}
