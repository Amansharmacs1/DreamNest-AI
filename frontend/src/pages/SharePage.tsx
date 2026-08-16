import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Box, Activity, Share2, Check } from 'lucide-react';
import RoomElement from '@/viewer/RoomElement';

export default function SharePage() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const fetchSharedProject = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/share/${shareId}`);
        if (!res.ok) {
          throw new Error('Design not found or no longer available.');
        }
        const data = await res.json();
        setProject(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchSharedProject();
    }
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Loading Design...</h2>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-6" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Design Unavailable</h2>
        <p className="text-slate-600 text-center max-w-md mb-8">{error}</p>
        <Button onClick={() => navigate('/')} className="bg-indigo-600 hover:bg-indigo-700">
          Create Your Own Design
        </Button>
      </div>
    );
  }

  const { layout, analysis, name } = project;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-4 sm:mb-0 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xl leading-none">D</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Nivasa AI</h1>
            <p className="text-xs text-slate-500 font-medium">Shared Design</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
          }}>
            <Share2 className="w-4 h-4 mr-2" /> Copy Link
          </Button>
          <Button onClick={() => navigate('/')} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
            Create Your Own
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{name}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
              <span>Created with NIVASA AI</span>
              <span>•</span>
              <span>{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>

            {analysis && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    Overall Score
                  </h3>
                  <span className={`text-2xl font-bold ${
                    analysis.overallScore >= 80 ? 'text-green-600' : 
                    analysis.overallScore >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {analysis.overallScore}/100
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full ${
                      analysis.overallScore >= 80 ? 'bg-green-500' : 
                      analysis.overallScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`} 
                    style={{ width: `${analysis.overallScore}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 border-b pb-2">Design Highlights</h3>
              {project.preferences && (
                <ul className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{project.preferences.building.numberOfFloors} Floor(s) - {project.preferences.building.houseStyle} Style</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{project.preferences.rooms.bedrooms} Bedrooms, {project.preferences.rooms.bathrooms} Baths</span>
                  </li>
                  {project.preferences.outdoor.garden && (
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>Includes Garden Area</span>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
          
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-center">
            <h3 className="font-bold text-indigo-900 mb-2">Build Your Dream Home</h3>
            <p className="text-sm text-indigo-700 mb-4">
              NIVASA AI uses generative architecture to design practical, optimized floor plans based on your exact needs.
            </p>
            <Button onClick={() => navigate('/wizard')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              Start Generating Free
            </Button>
          </div>
        </div>

        {/* Right Column: 2D Viewer */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 min-h-[500px] flex flex-col relative">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <Box className="w-4 h-4 text-slate-500" />
                Floor Plan Preview
              </h3>
            </div>
            
            {layout ? (
              <div className="flex-1 w-full h-full relative bg-[#f8f9fa] overflow-auto flex items-center justify-center p-8" style={{ backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                <div style={{ transform: 'scale(1.5)', transformOrigin: 'center center' }}>
                  <svg 
                    ref={svgRef}
                    width={layout.plotDimensions.width * 10} 
                    height={layout.plotDimensions.length * 10} 
                    viewBox={`0 0 ${layout.plotDimensions.width} ${layout.plotDimensions.length}`}
                    className="shadow-xl bg-white"
                  >
                    {/* Plot Boundary */}
                    <rect 
                      width={layout.plotDimensions.width} 
                      height={layout.plotDimensions.length} 
                      fill="none" 
                      stroke="#94a3b8" 
                      strokeWidth="0.5" 
                      strokeDasharray="2,2" 
                    />
                    
                    {/* Rooms */}
                    {layout.rooms.filter((r: any) => r.floor === 0).map((room: any) => (
                      <RoomElement key={room.id} room={room} />
                    ))}
                  </svg>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                Preview not available
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
