import { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/ui/button';
import { Share2, X, Copy, Check, ExternalLink, Globe, Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProjectStorageService } from '@/services/projectStorage';
import { useWizardStore } from '@/store/wizardStore';
import { useLayoutStore } from '@/store/layoutStore';

interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareProjectModal({ isOpen, onClose }: ShareProjectModalProps) {
  const { currentProjectId } = useProjectStore();
  const [isSharing, setIsSharing] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const { preferences } = useWizardStore();
  const { layout } = useLayoutStore();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateShare = async () => {
    setIsSharing(true);
    setError(null);
    try {
      let project: any;
      
      if (currentProjectId) {
        project = await ProjectStorageService.loadProject(currentProjectId);
        if (!project) throw new Error("Project not found locally");
      } else {
        if (!layout || !preferences) {
           throw new Error("No layout available to share");
        }
        project = {
          name: 'Untitled Design',
          preferences: preferences,
          layout: layout,
          thumbnail: undefined,
          updatedAt: Date.now()
        };
      }

      const res = await fetch(import.meta.env.VITE_API_URL + '/projects/share/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      
      if (!res.ok) throw new Error("Failed to create public share link");
      
      const data = await res.json();
      setShareId(data.shareId);
      
      // Save the share ID locally so we know it's shared (only if saved project)
      if (currentProjectId && project.id) {
        project.shareId = data.shareId;
        await ProjectStorageService.saveProject(project);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate share link');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = () => {
    if (!shareId) return;
    const url = `${window.location.origin}/share/${shareId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = shareId ? `${window.location.origin}/share/${shareId}` : '';

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
            <Globe className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold">Share Publicly</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isSharing}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 text-center">
          {!shareId ? (
            <>
              <div className="bg-indigo-50 text-indigo-800 p-4 rounded-lg mb-6 flex flex-col items-center">
                <Share2 className="w-8 h-8 text-indigo-400 mb-2" />
                <h3 className="font-semibold mb-1">Generate Public Link</h3>
                <p className="text-sm text-indigo-600/80">Anyone with the link will be able to view a 2D and 3D preview of this design.</p>
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4 flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {error}
                </div>
              )}

              <Button 
                onClick={handleCreateShare} 
                disabled={isSharing || !currentProjectId} 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {isSharing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
                {isSharing ? 'Generating link...' : 'Create Public Link'}
              </Button>
            </>
          ) : (
            <>
              <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6 flex flex-col items-center">
                <Check className="w-8 h-8 text-green-500 mb-2" />
                <h3 className="font-semibold mb-1">Link Generated!</h3>
                <p className="text-sm text-green-600/80">Your design is now available publicly.</p>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <input 
                  type="text" 
                  readOnly 
                  value={shareUrl}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-600 focus:outline-none"
                />
                <Button onClick={handleCopy} variant="secondary" className="min-w-[100px]">
                  {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>

              <div className="flex gap-3 justify-center">
                <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" /> View Link
                  </Button>
                </a>
                <Button variant="ghost" onClick={onClose}>Done</Button>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center gap-4">
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check out my AI-generated home design on NIVASA AI!`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#1DA1F2] transition-colors font-semibold text-sm">
                  X (Twitter)
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#4267B2] transition-colors font-semibold text-sm">
                  Facebook
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0077b5] transition-colors font-semibold text-sm">
                  LinkedIn
                </a>
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out my AI-generated home design on NIVASA AI! ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#25D366] transition-colors font-semibold text-sm">
                  WhatsApp
                </a>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
