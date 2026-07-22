import { useLayoutStore } from '@/store/layoutStore';
import PlotGenerator from './PlotGenerator';
import RoomGenerator from './RoomGenerator';


export default function HouseGenerator() {
  const layout = useLayoutStore((state) => state.layout);

  if (!layout) return null;

  // Center the entire house around (0,0) based on usable area to make orbit controls orbit the center of the house
  const centerX = layout.usableArea.startX + layout.usableArea.width / 2;
  const centerY = layout.usableArea.startY + layout.usableArea.length / 2;

  return (
    <group position={[-centerX, 0, -centerY]}>
      {/* 1. Generate the Ground / Plot */}
      <PlotGenerator 
        width={layout.plotDimensions.width} 
        length={layout.plotDimensions.length} 
      />

      {/* 2. Generate Rooms (Walls, Floor, Roof) */}
      {layout.rooms.map((room) => (
        <RoomGenerator key={room.id} room={room} />
      ))}

      {/* 3. Generate Doors (Future task: compute overlaps and punch holes) */}
      {/* <DoorGenerator rooms={layout.rooms} /> */}
    </group>
  );
}
