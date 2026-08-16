import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import { ProjectStorageService } from '@/services/projectStorage';
import type { Project } from '@/types/project';
import { Button } from '@/components/ui/button';
import { FolderOpen, Plus, Trash2, Share2, Search, Copy, Edit2, Download, Upload } from 'lucide-react';
import { useWizardStore } from '@/store/wizardStore';
import { useLayoutStore } from '@/store/layoutStore';
import { useAnalysisStore } from '@/store/analysisStore';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { setCurrentProjectId, setCurrentProjectName } = useProjectStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadProjects = async () => {
    setLoading(true);
    try {
      const allProjects = await ProjectStorageService.listProjects();
      setProjects(allProjects);
    } catch (e) {
      console.error('Failed to fetch projects from IndexedDB', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleOpenProject = async (project: Project) => {
    // Restore states
    setCurrentProjectId(project.id);
    setCurrentProjectName(project.name);
    
    if (project.preferences) useWizardStore.setState({ preferences: project.preferences as any });
    if (project.layout) useLayoutStore.getState().setLayout(project.layout);
    if (project.analysis) useAnalysisStore.getState().setAnalysisResult(project.analysis);
    
    navigate('/viewer');
  };

  const handleCreateNew = () => {
    setCurrentProjectId(null);
    setCurrentProjectName('Untitled Design');
    useWizardStore.getState().resetWizard();
    useLayoutStore.getState().reset();
    useAnalysisStore.getState().resetAnalysis();
    navigate('/wizard');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this project? It cannot be undone.")) {
      await ProjectStorageService.deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const handleDuplicate = async (id: string) => {
    await ProjectStorageService.duplicateProject(id);
    await loadProjects();
  };

  const handleRename = async (project: Project) => {
    const newName = window.prompt("Enter new project name:", project.name);
    if (newName && newName.trim() !== "" && newName !== project.name) {
      const updated = { ...project, name: newName.trim(), updatedAt: Date.now() };
      await ProjectStorageService.saveProject(updated);
      setProjects(projects.map(p => p.id === project.id ? updated : p));
    }
  };

  const handleExport = (project: Project) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `nivasa-${project.name.replace(/\s+/g, '-').toLowerCase()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // Basic validation
        if (!json.id || !json.name || typeof json.createdAt !== 'number') {
          alert('Invalid NIVASA project file.');
          return;
        }
        
        // Generate new ID to avoid collisions
        json.id = crypto.randomUUID();
        json.name = json.name + ' (Imported)';
        json.updatedAt = Date.now();
        json.shareId = undefined; // Don't carry over share IDs
        
        await ProjectStorageService.saveProject(json);
        await loadProjects();
      } catch (err) {
        alert('Failed to parse the project file.');
      }
    };
    reader.readAsText(file);
  };

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl leading-none">D</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">Nivasa AI</h1>
        </div>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center">
            <Upload className="w-4 h-4 mr-2" /> Import JSON
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">My Designs</h2>
            <p className="text-slate-500 mt-1">Manage your architectural concepts saved locally in this browser.</p>
          </div>
          <Button onClick={handleCreateNew} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl h-64 border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center">
            <FolderOpen className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">No designs yet</h3>
            <p className="text-slate-500 max-w-sm mb-6">Start your first AI-powered architectural floor plan.</p>
            <Button onClick={handleCreateNew}>Start Designing</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
                <div 
                  className="h-40 bg-slate-100 flex items-center justify-center cursor-pointer border-b border-slate-100 relative"
                  onClick={() => handleOpenProject(project)}
                >
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 font-medium">No Thumbnail</span>
                  )}
                  <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors" />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-800 truncate" title={project.name}>{project.name}</h3>
                    <div title="Shared publicly"><Share2 className="w-4 h-4 text-green-500 shrink-0 ml-2 mt-1" /></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Edited {new Date(project.updatedAt).toLocaleDateString()}</p>
                  
                  <div className="flex gap-2 mt-3 text-xs text-slate-600 font-medium">
                    {project.preferences && <span>{project.preferences.building.numberOfFloors} Floor(s)</span>}
                    {project.analysis && <span>• Score: {project.analysis.overallScore}</span>}
                  </div>
                </div>
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 flex-wrap justify-end w-32">
                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 backdrop-blur hover:bg-white shadow-sm text-slate-600" title="Rename" onClick={(e) => { e.stopPropagation(); handleRename(project); }}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 backdrop-blur hover:bg-white shadow-sm text-slate-600" title="Duplicate" onClick={(e) => { e.stopPropagation(); handleDuplicate(project.id); }}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 backdrop-blur hover:bg-white shadow-sm text-slate-600" title="Export" onClick={(e) => { e.stopPropagation(); handleExport(project); }}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 backdrop-blur hover:bg-white shadow-sm text-red-600" title="Delete" onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}>
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
