import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Code, Brain, Cpu, Layers } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* Navbar */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10 bg-slate-50">
        <div className="flex items-center gap-2">
          <Home className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold tracking-tight text-main">DreamNest AI</span>
        </div>
        <div>
          <Link to="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-16"
        >
          {/* Project Section */}
          <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">About the Project</h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-3xl">
              <strong className="text-slate-800 font-semibold">DreamNest AI</strong> was built to revolutionize how people approach architectural design. 
              Traditional floor planning is expensive, slow, and inaccessible to most people. We combine a deterministic procedural generation engine with cutting-edge Large Language Models (LLMs) to instantly transform natural language requirements into mathematically accurate, interactive 2D and 3D blueprints.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <Cpu className="w-8 h-8 text-indigo-600 mb-4" />
                <h3 className="font-bold text-lg mb-2">Procedural Engine</h3>
                <p className="text-sm text-slate-600">Calculates precise geometries, spatial routing, and overlap prevention mathematically.</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <Brain className="w-8 h-8 text-indigo-600 mb-4" />
                <h3 className="font-bold text-lg mb-2">AI Architect</h3>
                <p className="text-sm text-slate-600">Provides intelligent feedback, cost estimations, and NLP parsing for requirements.</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <Layers className="w-8 h-8 text-indigo-600 mb-4" />
                <h3 className="font-bold text-lg mb-2">3D Visualization</h3>
                <p className="text-sm text-slate-600">Instantly extrudes 2D vectors into explorable 3D meshes right in the browser.</p>
              </div>
            </div>
          </section>

          {/* Owner Section */}
          <section className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/50 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
              <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 p-1">
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                  {/* Placeholder Avatar */}
                  <Code className="w-16 h-16 text-blue-200" />
                </div>
              </div>
              
              <div className="text-center md:text-left">
                <h2 className="text-sm font-bold tracking-widest text-blue-400 uppercase mb-2">The Creator</h2>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Aman Sharma</h1>
                <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mb-6">
                  Senior AI Engineer, Full Stack Developer, and Software Architect. 
                  I built DreamNest AI to explore the intersection of deterministic algorithms and generative AI, aiming to democratize complex architectural design.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="px-4 py-2 rounded-full bg-white/10 text-sm font-medium border border-white/10">Full Stack Development</span>
                  <span className="px-4 py-2 rounded-full bg-white/10 text-sm font-medium border border-white/10">AI Integration</span>
                  <span className="px-4 py-2 rounded-full bg-white/10 text-sm font-medium border border-white/10">Procedural Generation</span>
                  <span className="px-4 py-2 rounded-full bg-white/10 text-sm font-medium border border-white/10">3D Graphics</span>
                </div>
              </div>
            </div>
          </section>

        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-50 text-slate-500 py-8 text-center text-sm z-10 border-t border-slate-200 mt-auto">
        <p>© 2026 DreamNest AI. Created by Aman Sharma.</p>
      </footer>
    </div>
  );
}
