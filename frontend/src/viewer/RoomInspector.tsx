import { useLayoutStore } from '@/store/layoutStore';
import { useOptimizationStore } from '@/store/optimizationStore';
import { X, Lightbulb, Lamp, Gem, DollarSign, Lock, Unlock } from 'lucide-react';

export default function RoomInspector() {
  const { layout, selectedRoomId, setSelectedRoom } = useLayoutStore();
  const { isRoomLocked, toggleRoomLock } = useOptimizationStore();

  if (!selectedRoomId || !layout) return null;

  const room = layout.rooms.find(r => r.id === selectedRoomId);
  if (!room) return null;

  return (
    <div className="absolute right-4 top-24 w-80 max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-md shadow-2xl rounded-xl border border-gray-100 z-50 transition-all duration-300">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md p-4 border-b flex justify-between items-center z-10">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            {room.name}
            {isRoomLocked(room.id) && <Lock className="w-4 h-4 text-amber-500" />}
          </h2>
          <p className="text-xs text-gray-500 capitalize">{room.category} • {Math.round(room.width)}' x {Math.round(room.length)}'</p>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => toggleRoomLock(room.id)} 
            className={`p-2 rounded-full transition-colors ${isRoomLocked(room.id) ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
            title={isRoomLocked(room.id) ? "Unlock Room" : "Lock Room (Exclude from Optimization)"}
          >
            {isRoomLocked(room.id) ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
          <button onClick={() => setSelectedRoom(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Design Notes */}
        {room.designNotes && (
          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> AI Designer Notes
            </h3>
            <p className="text-sm text-blue-800 leading-relaxed">{room.designNotes}</p>
          </div>
        )}

        {/* Cost Estimate */}
        {room.costEstimate && (
          <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
            <h3 className="text-sm font-semibold text-emerald-900 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Estimated Cost
            </h3>
            <div className="space-y-1 text-sm text-emerald-800">
              <div className="flex justify-between">
                <span>Furniture</span>
                <span>${room.costEstimate.furniture.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Materials</span>
                <span>${room.costEstimate.materials.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-emerald-200 pt-1 mt-1">
                <span>Total</span>
                <span>${room.costEstimate.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Materials */}
        {room.materials && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 border-b pb-1">Materials</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 p-2 rounded border">
                <span className="block text-xs text-gray-500">Floor</span>
                <span className="font-medium capitalize">{room.materials.floor}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded border">
                <span className="block text-xs text-gray-500">Wall</span>
                <span className="font-medium capitalize">{room.materials.wall}</span>
              </div>
            </div>
          </div>
        )}

        {/* Furniture List */}
        {room.furniture && room.furniture.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 border-b pb-1 flex items-center gap-2">
              <Lamp className="w-4 h-4" /> Furniture
            </h3>
            <ul className="space-y-2">
              {room.furniture.map((furn: any) => (
                <li key={furn.id} className="text-sm flex justify-between items-center bg-gray-50 p-2 rounded border">
                  <div>
                    <span className="font-medium capitalize">{furn.type}</span>
                    <span className="block text-xs text-gray-500 capitalize">{furn.style} • {furn.color}</span>
                  </div>
                  <span className="text-xs font-mono text-gray-400 bg-white px-2 py-1 rounded border">
                    {Math.round(furn.width)}x{Math.round(furn.length)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Decorations */}
        {room.decorations && room.decorations.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 border-b pb-1 flex items-center gap-2">
              <Gem className="w-4 h-4" /> Decor
            </h3>
            <div className="flex flex-wrap gap-2">
              {room.decorations.map((dec: any) => (
                <span key={dec.id} className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded-full capitalize">
                  {dec.type}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
