import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCloudProjectStore } from '@/store/cloudProjectStore';
import { Button } from '@/components/ui/button';
import { FolderOpen, Plus, Trash2, Share2, Search, LogOut } from 'lucide-react';

interface ProjectStub {
  _id: string;
  name: string;
  updatedAt: string;
  thumbnail: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, token } = useAuthStore();
  const { setCurrentProjectId } = useCloudProjectStore();
  const [projects, setProjects] = useState<ProjectStub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    const fetchProjects = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + '/projects', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (e) {
        console.error('Failed to fetch projects', e);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isAuthenticated, navigate, token]);

  const handleOpenProject = (id: string) => {
    setCurrentProjectId(id);
    navigate('/viewer');
  };

  const handleCreateNew = () => {
    setCurrentProjectId(null);
    navigate('/wizard');
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProjects(projects.filter(p => p._id !== id));
      }
    } catch (e) {
      console.error('Failed to delete project', e);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl leading-none">D</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">DreamNest AI</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-slate-600">
            Welcome, {user?.name || user?.email}
          </div>
          <Button variant="outline" size="sm" onClick={() => { logout(); navigate('/'); }}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">My Projects</h2>
            <p className="text-slate-500 mt-1">Manage your architectural designs and concepts.</p>
          </div>
          <Button onClick={handleCreateNew} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl h-64 border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center">
            <FolderOpen className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">No projects yet</h3>
            <p className="text-slate-500 max-w-sm mb-6">Get started by creating your first AI-powered architectural floor plan.</p>
            <Button onClick={handleCreateNew}>Create New Project</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {projects.map((project) => (
              <div key={project._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
                <div 
                  className="h-40 bg-slate-100 flex items-center justify-center cursor-pointer border-b border-slate-100 relative"
                  onClick={() => handleOpenProject(project._id)}
                >
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 font-medium">No Thumbnail</span>
                  )}
                  <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 truncate" title={project.name}>{project.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">Edited {new Date(project.updatedAt).toLocaleDateString()}</p>
                </div>
                
                {/* Actions overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 backdrop-blur hover:bg-white shadow-sm text-blue-600" title="Share">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 backdrop-blur hover:bg-white shadow-sm text-red-600" title="Delete" onClick={(e) => { e.stopPropagation(); handleDelete(project._id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
