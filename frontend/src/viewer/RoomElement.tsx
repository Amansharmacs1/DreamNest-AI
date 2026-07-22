import { useState } from 'react';
import { useLayoutStore } from '@/store/layoutStore';

export default function RoomElement({ room }: { room: any }) {
  const { updateRoom, layout } = useLayoutStore();
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'living': return 'rgba(37, 99, 235, 0.2)'; // Primary blue
      case 'sleeping': return 'rgba(20, 184, 166, 0.2)'; // Secondary teal
      case 'service': return 'rgba(245, 158, 11, 0.2)'; // Accent orange
      case 'outdoor': return 'rgba(34, 197, 94, 0.2)'; // Green
      default: return 'rgba(148, 163, 184, 0.2)'; // Gray
    }
  };
  
  const getCategoryBorder = (category: string) => {
    switch (category) {
      case 'living': return '#2563EB';
      case 'sleeping': return '#14B8A6';
      case 'service': return '#F59E0B';
      case 'outdoor': return '#22C55E';
      default: return '#94A3B8';
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !layout) return;
    
    const dx = (e.clientX - startPos.x) / 10;
    const dy = (e.clientY - startPos.y) / 10;
    
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
       const newX = room.x + dx;
       const newY = room.y + dy;

       // Check for overlaps with other rooms
       const overlaps = layout.rooms.some((otherRoom: any) => {
         if (otherRoom.id === room.id) return false;
         // Add a small 0.1 buffer to prevent floating point edge glitches
         return (
           newX + 0.1 < otherRoom.x + otherRoom.width &&
           newX + room.width - 0.1 > otherRoom.x &&
           newY + 0.1 < otherRoom.y + otherRoom.length &&
           newY + room.length - 0.1 > otherRoom.y
         );
       });

       // Check if outside usable area boundaries
       const outOfBounds = 
           newX < layout.usableArea.startX ||
           newX + room.width > layout.usableArea.startX + layout.usableArea.width ||
           newY < layout.usableArea.startY ||
           newY + room.length > layout.usableArea.startY + layout.usableArea.length;

       if (!overlaps && !outOfBounds) {
         updateRoom(room.id, { x: newX, y: newY });
       }
       
       // Always update startPos so the mouse can slip along the boundary without snapping
       setStartPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <g 
      className="room cursor-move"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      transform={`translate(${room.x}, ${room.y})`}
    >
      <rect 
        className="room transition-colors duration-200 hover:fill-opacity-80"
        width={room.width} 
        height={room.length} 
        fill={getCategoryColor(room.category)}
        stroke={getCategoryBorder(room.category)}
        strokeWidth="0.5"
      />
      {/* Wall thickness representation inner stroke */}
      <rect 
        className="room pointer-events-none"
        x="0.25" y="0.25"
        width={room.width - 0.5} 
        height={room.length - 0.5} 
        fill="none"
        stroke="#333"
        strokeWidth="0.1"
      />
      <text 
        x={room.width / 2} 
        y={room.length / 2} 
        textAnchor="middle" 
        alignmentBaseline="middle"
        fontSize={Math.min(room.width, room.length) * 0.15}
        fill="#0F172A"
        fontWeight="bold"
        className="pointer-events-none select-none"
      >
        {room.name}
      </text>
      <text 
        x={room.width / 2} 
        y={room.length / 2 + (Math.min(room.width, room.length) * 0.15 + 0.2)} 
        textAnchor="middle" 
        alignmentBaseline="middle"
        fontSize={Math.min(room.width, room.length) * 0.1}
        fill="#64748b"
        className="pointer-events-none select-none"
      >
        {Math.round(room.width)}' x {Math.round(room.length)}'
      </text>
    </g>
  );
}
