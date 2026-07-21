import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home, Compass, Layers } from 'lucide-react';

const features = [
  { icon: <Compass className="w-6 h-6 text-primary" />, title: 'Smart Validation', description: 'Automatically checks for overlaps and maintains proper dimensions.' },
  { icon: <Layers className="w-6 h-6 text-primary" />, title: 'Intelligent Routing', description: 'Maintains optimal walking paths and logical room connections.' },
  { icon: <Home className="w-6 h-6 text-primary" />, title: 'Vastu & Preferences', description: 'Incorporates your custom lifestyle preferences into the blueprint.' }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      {/* Navbar */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Home className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold tracking-tight text-main">DreamNest AI</span>
        </div>
        <div className="space-x-4">
          <Button variant="ghost" className="hidden sm:inline-flex">Features</Button>
          <Button variant="ghost" className="hidden sm:inline-flex">How it Works</Button>
          <Link to="/wizard">
            <Button>Start Designing</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl -z-10" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl text-center z-10"
        >
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-main mb-6 leading-tight">
            Design your dream home <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">in minutes.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Transform your ideas into precise 2D floor plans instantly. Just tell us your plot dimensions and preferences, and let our intelligent engine do the rest.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/wizard">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 shadow-xl shadow-primary/25 rounded-full transition-all hover:scale-105">
                Start Designing
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full">
              Learn More
            </Button>
          </div>
        </motion.div>

        {/* Floating Abstract House Element */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 w-full max-w-4xl h-64 sm:h-96 relative perspective-1000"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-cards to-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden group">
            {/* Grid background to represent blueprint */}
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#f0f0f0 1px, transparent 1px), linear-gradient(90deg, #f0f0f0 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            {/* Abstract animated rooms */}
            <motion.div 
              animate={{ height: [100, 120, 100] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute bottom-10 left-10 w-32 bg-primary/20 border-2 border-primary/50 rounded-lg shadow-sm backdrop-blur-sm"
            />
            <motion.div 
              animate={{ width: [150, 170, 150] }}
              transition={{ repeat: Infinity, duration: 5 }}
              className="absolute top-10 right-10 h-40 bg-secondary/20 border-2 border-secondary/50 rounded-lg shadow-sm backdrop-blur-sm"
            />
            <motion.div 
              animate={{ rotate: [0, 2, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute bottom-20 right-32 w-40 h-32 bg-accent/20 border-2 border-accent/50 rounded-lg shadow-sm backdrop-blur-sm flex items-center justify-center"
            >
              <div className="w-8 h-8 rounded-full border-4 border-accent/50" />
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Features Section */}
      <section className="py-24 bg-white z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-main mb-4">Why choose DreamNest AI?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Our deterministic engine guarantees precise, practical, and beautiful layouts every time.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-background border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-main text-white py-12 text-center text-sm z-10">
        <p className="text-gray-400">© 2026 DreamNest AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
