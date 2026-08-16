import { useState, useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/ui/button';
import { FolderPlus, X, Loader2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface SaveProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // Trigger the actual save logic in parent
}

export default function SaveProjectModal({ isOpen, onClose, onSave }: SaveProjectModalProps) {
  const { currentProjectName, setCurrentProjectName, syncStatus } = useProjectStore();
  const [name, setName] = useState(currentProjectName);

  useEffect(() => {
    if (isOpen) setName(currentProjectName);
  }, [isOpen, currentProjectName]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim()) {
      setCurrentProjectName(name.trim());
      onSave();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2 text-slate-800">
            <FolderPlus className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold">Save Design</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={syncStatus === 'saving'}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Project Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g. Modern 3BHK"
            autoFocus
          />
          <p className="text-xs text-slate-500 mt-2">
            Your design will be securely saved in your browser's local storage.
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={syncStatus === 'saving'}>Cancel</Button>
            <Button onClick={handleSave} disabled={syncStatus === 'saving' || !name.trim()} className="bg-indigo-600 hover:bg-indigo-700 min-w-[100px]">
              {syncStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : syncStatus === 'saved' ? <Check className="w-4 h-4 mr-2" /> : null}
              {syncStatus === 'saved' ? 'Saved!' : 'Save Design'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
