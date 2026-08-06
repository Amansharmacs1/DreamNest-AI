import { useThreeStore } from '@/store/threeStore';
import { Palette, Layers } from 'lucide-react';

export default function CustomizationPanel() {
  const { theme, setTheme, transparentWalls, toggleTransparentWalls, wireframe, toggleWireframe, showRoof, toggleRoof } = useThreeStore();

  const themes = ['modern', 'minimal', 'luxury', 'industrial', 'scandinavian', 'japandi', 'traditional'] as const;

  return (
    <div className="absolute left-4 top-24 w-64 bg-white/95 backdrop-blur-md shadow-2xl rounded-xl border border-gray-100 z-50 p-4 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4" /> Interior Theme
        </h3>
        <div className="space-y-2">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                theme === t 
                  ? 'bg-primary text-primary-foreground font-medium' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4" /> View Options
        </h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
            <input 
              type="checkbox" 
              checked={showRoof} 
              onChange={toggleRoof}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>Show Roof</span>
          </label>
          <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
            <input 
              type="checkbox" 
              checked={transparentWalls} 
              onChange={toggleTransparentWalls}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>Transparent Walls</span>
          </label>
          <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
            <input 
              type="checkbox" 
              checked={wireframe} 
              onChange={toggleWireframe}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>Wireframe Mode</span>
          </label>
        </div>
      </div>
    </div>
  );
}
