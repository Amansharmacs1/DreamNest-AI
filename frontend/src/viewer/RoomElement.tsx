import { useState } from 'react';
import { useLayoutStore } from '@/store/layoutStore';

export default function RoomElement({ room }: { room: any }) {
  const { updateRoom, layout } = useLayoutStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ mouseX: 0, mouseY: 0, roomX: 0, roomY: 0, roomWidth: 0, roomLength: 0 });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'living': return 'rgba(37, 99, 235, 0.2)';
      case 'sleeping': return 'rgba(20, 184, 166, 0.2)';
      case 'service': return 'rgba(245, 158, 11, 0.2)';
      case 'outdoor': return 'rgba(34, 197, 94, 0.2)';
      default: return 'rgba(148, 163, 184, 0.2)';
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
    setDragStart({ mouseX: e.clientX, mouseY: e.clientY, roomX: room.x, roomY: room.y, roomWidth: room.width, roomLength: room.length });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({ mouseX: e.clientX, mouseY: e.clientY, roomX: room.x, roomY: room.y, roomWidth: room.width, roomLength: room.length });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if ((!isDragging && !isResizing) || !layout) return;
    
    // Calculate total movement from the start of the drag
    const dx = (e.clientX - dragStart.mouseX) / 10;
    const dy = (e.clientY - dragStart.mouseY) / 10;
    
    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
       let newX = dragStart.roomX;
       let newY = dragStart.roomY;
       let newWidth = dragStart.roomWidth;
       let newLength = dragStart.roomLength;

       if (isDragging) {
         newX = dragStart.roomX + dx;
         newY = dragStart.roomY + dy;
       } else if (isResizing) {
         newWidth = Math.max(2, dragStart.roomWidth + dx); // min width 2 ft
         newLength = Math.max(2, dragStart.roomLength + dy); // min length 2 ft
       }

       // Check for overlaps with other rooms
       const overlaps = layout.rooms.some((otherRoom: any) => {
         // Only check collision against rooms on the same floor
         if (otherRoom.id === room.id || (otherRoom.floor || 0) !== (room.floor || 0)) return false;
         
         // Buffer to prevent float glitches
         return (
           newX + 0.05 < otherRoom.x + otherRoom.width &&
           newX + newWidth - 0.05 > otherRoom.x &&
           newY + 0.05 < otherRoom.y + otherRoom.length &&
           newY + newLength - 0.05 > otherRoom.y
         );
       });

       // Check if outside usable area boundaries
       const outOfBounds = 
           newX < layout.usableArea.startX ||
           newX + newWidth > layout.usableArea.startX + layout.usableArea.width ||
           newY < layout.usableArea.startY ||
           newY + newLength > layout.usableArea.startY + layout.usableArea.length;

       if (!overlaps && !outOfBounds) {
         if (isDragging) {
           updateRoom(room.id, { x: newX, y: newY });
         } else if (isResizing) {
           updateRoom(room.id, { width: newWidth, length: newLength });
         }
       }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  return (
    <g 
      className="room cursor-move group"
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

      {/* Resize Handle (Bottom-Right) */}
      <rect
        x={room.width - 1.5}
        y={room.length - 1.5}
        width={1.5}
        height={1.5}
        fill="#fff"
        stroke={getCategoryBorder(room.category)}
        strokeWidth="0.2"
        className="cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onMouseDown={handleResizeStart}
      />
    </g>
  );
}
