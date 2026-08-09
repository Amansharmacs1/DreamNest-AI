import { useState, useEffect } from 'react';
import { useLayoutStore } from '@/store/layoutStore';
import { useConstructionStore } from '@/store/constructionStore';

export default function RoomElement({ room }: { room: any }) {
  const { updateRoom, layout, selectedRoomId, setSelectedRoom } = useLayoutStore();
  const { isConstructionModeActive } = useConstructionStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ mouseX: 0, mouseY: 0, roomX: 0, roomY: 0, roomWidth: 0, roomLength: 0 });

  const roomNameLower = (room.name || '').toLowerCase();
  const isSwimmingPool = roomNameLower.includes('pool');
  const isSolarPanels = roomNameLower.includes('solar');
  const isGarden = roomNameLower.includes('garden') || roomNameLower.includes('backyard') || roomNameLower.includes('kids');
  const isParking = roomNameLower.includes('parking');

  const getCategoryColor = (category: string) => {
    if (isSwimmingPool) return 'rgba(14, 165, 233, 0.35)';
    if (isSolarPanels) return 'rgba(30, 58, 138, 0.45)';
    if (isGarden) return 'rgba(34, 197, 94, 0.3)';
    if (isParking) return 'rgba(71, 85, 105, 0.3)';

    switch (category) {
      case 'living': return 'rgba(37, 99, 235, 0.2)';
      case 'sleeping': return 'rgba(20, 184, 166, 0.2)';
      case 'service': return 'rgba(245, 158, 11, 0.2)';
      case 'outdoor': return 'rgba(34, 197, 94, 0.2)';
      case 'circulation': return 'rgba(139, 92, 246, 0.2)';
      default: return 'rgba(148, 163, 184, 0.2)';
    }
  };
  
  const getCategoryBorder = (category: string) => {
    if (isSwimmingPool) return '#0284C7';
    if (isSolarPanels) return '#1D4ED8';
    if (isGarden) return '#15803D';
    if (isParking) return '#334155';

    switch (category) {
      case 'living': return '#2563EB';
      case 'sleeping': return '#14B8A6';
      case 'service': return '#F59E0B';
      case 'outdoor': return '#22C55E';
      case 'circulation': return '#8B5CF6';
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

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!layout) return;
      
      const dx = (e.clientX - dragStart.mouseX) / 10;
      const dy = (e.clientY - dragStart.mouseY) / 10;
      
      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        let newX = dragStart.roomX;
        let newY = dragStart.roomY;
        let newWidth = dragStart.roomWidth;
        let newLength = dragStart.roomLength;

        if (isDragging) {
          newX = Math.round(dragStart.roomX + dx);
          newY = Math.round(dragStart.roomY + dy);
        } else if (isResizing) {
          newWidth = Math.max(2, Math.round(dragStart.roomWidth + dx));
          newLength = Math.max(2, Math.round(dragStart.roomLength + dy));
        }

        // Check for overlaps with other rooms on the same floor
        const overlaps = layout.rooms.some((otherRoom: any) => {
          if (otherRoom.id === room.id || (otherRoom.floor || 0) !== (room.floor || 0)) return false;
          
          return (
            newX + 0.05 < otherRoom.x + otherRoom.width &&
            newX + newWidth - 0.05 > otherRoom.x &&
            newY + 0.05 < otherRoom.y + otherRoom.length &&
            newY + newLength - 0.05 > otherRoom.y
          );
        });

        // Check usable area boundaries
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

    const handleWindowMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging, isResizing, dragStart, layout, room.id, room.floor, updateRoom]);

  return (
    <g 
      className={`room cursor-pointer group select-none ${selectedRoomId === room.id ? 'opacity-100' : 'opacity-90'}`}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedRoom(room.id);
      }}
      transform={`translate(${room.x}, ${room.y})`}
    >
      <rect 
        className="room transition-colors duration-200 hover:fill-opacity-80"
        width={room.width} 
        height={room.length} 
        fill={getCategoryColor(room.category)}
        stroke={getCategoryBorder(room.category)}
        strokeWidth="0.5"
        rx={isSwimmingPool ? 0.8 : 0}
      />

      {/* Swimming Pool Wave Pattern */}
      {isSwimmingPool && (
        <g className="pointer-events-none" opacity="0.6">
          <rect x="0.5" y="0.5" width={room.width - 1} height={room.length - 1} fill="none" stroke="#38BDF8" strokeWidth="0.3" strokeDasharray="1,1" rx="0.5" />
          <path d={`M 1 ${room.length / 3} Q ${room.width / 2} ${room.length / 3 - 0.5} ${room.width - 1} ${room.length / 3}`} stroke="#0284C7" strokeWidth="0.2" fill="none" />
          <path d={`M 1 ${(room.length * 2) / 3} Q ${room.width / 2} ${(room.length * 2) / 3 + 0.5} ${room.width - 1} ${(room.length * 2) / 3}`} stroke="#0284C7" strokeWidth="0.2" fill="none" />
        </g>
      )}

      {/* Solar Panel Grid */}
      {isSolarPanels && (
        <g className="pointer-events-none" opacity="0.7">
          {Array.from({ length: Math.max(1, Math.floor(room.width / 3)) }).map((_, i) => (
            <line key={`x-${i}`} x1={(i + 1) * 3} y1="0.5" x2={(i + 1) * 3} y2={room.length - 0.5} stroke="#60A5FA" strokeWidth="0.15" />
          ))}
          {Array.from({ length: Math.max(1, Math.floor(room.length / 3)) }).map((_, j) => (
            <line key={`y-${j}`} x1="0.5" y1={(j + 1) * 3} x2={room.width - 0.5} y2={(j + 1) * 3} stroke="#60A5FA" strokeWidth="0.15" />
          ))}
        </g>
      )}

      {/* Garden / Backyard Grass Detail */}
      {isGarden && (
        <g className="pointer-events-none" opacity="0.5">
          <circle cx={room.width * 0.3} cy={room.length * 0.3} r="0.6" fill="#16A34A" />
          <circle cx={room.width * 0.7} cy={room.length * 0.6} r="0.8" fill="#16A34A" />
        </g>
      )}

      {/* Parking Lines */}
      {isParking && (
        <g className="pointer-events-none" opacity="0.6">
          <line x1={room.width / 2} y1="1" x2={room.width / 2} y2={room.length - 1} stroke="#FFFFFF" strokeWidth="0.3" strokeDasharray="1,1" />
        </g>
      )}

      {/* Wall thickness representation inner stroke */}
      {!isSwimmingPool && !isSolarPanels && !isGarden && (
        <rect 
          className="room pointer-events-none"
          x="0.25" y="0.25"
          width={room.width - 0.5} 
          height={room.length - 0.5} 
          fill="none"
          strokeWidth="0.1"
        />
      )}
      
      {/* Windows Overlay */}
      {room.windows?.map((win: any) => {
        let x = 0, y = 0, w = 0, h = 0;
        const thickness = 0.8;
        if (win.wall === 'top') { x = win.offset - win.width/2; y = -thickness/2; w = win.width; h = thickness; }
        if (win.wall === 'bottom') { x = win.offset - win.width/2; y = room.length - thickness/2; w = win.width; h = thickness; }
        if (win.wall === 'left') { x = -thickness/2; y = win.offset - win.width/2; w = thickness; h = win.width; }
        if (win.wall === 'right') { x = room.width - thickness/2; y = win.offset - win.width/2; w = thickness; h = win.width; }
        return <rect key={win.id} x={x} y={y} width={w} height={h} fill="#BAE6FD" stroke="#0284C7" strokeWidth="0.2" className="pointer-events-none" />;
      })}

      {/* Doors Overlay */}
      {room.doors?.map((door: any) => {
        let x = 0, y = 0, w = 0, h = 0;
        let arcPath = '';
        const thickness = 0.6; // Slightly thicker than the 0.5 stroke to hide it completely
        if (door.wall === 'top') { 
          x = door.offset - door.width/2; y = -thickness/2; w = door.width; h = thickness;
          arcPath = `M ${x},0 A ${door.width} ${door.width} 0 0 1 ${x + door.width},${-door.width} L ${x + door.width},0`;
        }
        if (door.wall === 'bottom') { 
          x = door.offset - door.width/2; y = room.length - thickness/2; w = door.width; h = thickness;
          arcPath = `M ${x},${room.length} A ${door.width} ${door.width} 0 0 0 ${x + door.width},${room.length + door.width} L ${x + door.width},${room.length}`;
        }
        if (door.wall === 'left') { 
          x = -thickness/2; y = door.offset - door.width/2; w = thickness; h = door.width;
          arcPath = `M 0,${y} A ${door.width} ${door.width} 0 0 0 ${-door.width},${y + door.width} L 0,${y + door.width}`;
        }
        if (door.wall === 'right') { 
          x = room.width - thickness/2; y = door.offset - door.width/2; w = thickness; h = door.width;
          arcPath = `M ${room.width},${y} A ${door.width} ${door.width} 0 0 1 ${room.width + door.width},${y + door.width} L ${room.width},${y + door.width}`;
        }
        
        return (
          <g key={door.id} className="pointer-events-none">
            <rect x={x} y={y} width={w} height={h} fill="#FFFFFF" />
            <path d={arcPath} fill="none" stroke="#64748b" strokeWidth="0.3" strokeDasharray="0.5,0.5" />
          </g>
        );
      })}

      
      {/* Staircase Steps Representation */}
      {room.category === 'circulation' && (
        <g className="pointer-events-none">
          {Array.from({ length: Math.floor(room.length / 1.5) }).map((_, i) => (
            <line
              key={i}
              x1="0"
              y1={i * 1.5}
              x2={room.width}
              y2={i * 1.5}
              stroke={getCategoryBorder(room.category)}
              strokeWidth="0.2"
              opacity="0.5"
            />
          ))}
          <polygon 
            points={`${room.width / 2},1 ${room.width / 2 - 1},2.5 ${room.width / 2 + 1},2.5`} 
            fill={getCategoryBorder(room.category)}
            opacity="0.8"
          />
        </g>
      )}

      {/* DIMENSION LINES & MEP OVERLAYS FOR CONSTRUCTION MODE */}
      {isConstructionModeActive && (
        <foreignObject x="0" y="0" width={room.width} height={room.length} className="pointer-events-none overflow-visible">
          <div className="relative w-full h-full">
            {/* Top Dimension */}
            <div className="absolute -top-3 left-0 w-full flex items-center justify-center text-[8px] text-amber-700">
              <div className="h-px bg-amber-700 w-full absolute top-1/2 -z-10" />
              <div className="bg-white/80 px-1 font-mono font-bold z-10 rounded">{Math.round(room.width)}'</div>
              <div className="absolute left-0 w-[2px] h-[6px] bg-amber-700 transform rotate-45" />
              <div className="absolute right-0 w-[2px] h-[6px] bg-amber-700 transform rotate-45" />
            </div>

            {/* Right Dimension */}
            <div className="absolute -right-3 top-0 h-full flex items-center justify-center text-[8px] text-amber-700 origin-center" style={{ writingMode: 'vertical-rl' }}>
              <div className="w-px bg-amber-700 h-full absolute left-1/2 -z-10" />
              <div className="bg-white/80 py-1 font-mono font-bold z-10 rounded transform rotate-180">{Math.round(room.length)}'</div>
              <div className="absolute top-0 w-[6px] h-[2px] bg-amber-700 transform rotate-45" />
              <div className="absolute bottom-0 w-[6px] h-[2px] bg-amber-700 transform rotate-45" />
            </div>
            
            {/* Electrical Point (heuristic: center light) */}
            <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 -ml-[0.75px] -mt-[0.75px] bg-amber-400 rounded-full ring-1 ring-amber-600 animate-pulse shadow-sm" />
          </div>
        </foreignObject>
      )}

      <text 
        x={room.width / 2} 
        y={room.length / 2} 
        textAnchor="middle" 
        alignmentBaseline="middle"
        fontSize={Math.min(room.width, room.length) * 0.15}
        fill={isSolarPanels ? "#FFFFFF" : "#0F172A"}
        fontWeight="bold"
        className="pointer-events-none select-none"
      >
        {isSwimmingPool ? '🌊 ' : isSolarPanels ? '☀️ ' : isGarden ? '🌳 ' : ''}{room.name}
      </text>
      <text 
        x={room.width / 2} 
        y={room.length / 2 + (Math.min(room.width, room.length) * 0.15 + 0.2)} 
        textAnchor="middle" 
        alignmentBaseline="middle"
        fontSize={Math.min(room.width, room.length) * 0.1}
        fill={isSolarPanels ? "#93C5FD" : "#64748b"}
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
