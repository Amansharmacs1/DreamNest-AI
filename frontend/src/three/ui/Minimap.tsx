import { useLayoutStore } from '@/store/layoutStore';

export default function Minimap() {
  const layout = useLayoutStore((state) => state.layout);

  if (!layout) return null;

  // Render a simplified top-down view of the layout

  return (
    <div className="absolute bottom-4 left-4 w-48 h-48 bg-white/90 backdrop-blur shadow-2xl rounded-lg border-2 border-slate-200 overflow-hidden pointer-events-none z-50">
      <div className="absolute inset-0 p-2">
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${layout.plotDimensions.width} ${layout.plotDimensions.length}`}
        >
          {/* Plot Background */}
          <rect 
            width={layout.plotDimensions.width} 
            height={layout.plotDimensions.length} 
            fill="#e2e8f0" 
          />
          
          {/* Rooms */}
          {layout.rooms.map((room) => (
            <g key={room.id}>
              <rect
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.length}
                fill="#94a3b8"
                stroke="#475569"
                strokeWidth="0.5"
              />
              <text
                x={room.x + room.width / 2}
                y={room.y + room.length / 2}
                fontSize="2"
                fill="white"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {room.name.substring(0, 3)}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="absolute bottom-1 right-2 text-[8px] font-bold text-slate-400 uppercase">
        Minimap
      </div>
    </div>
  );
}
