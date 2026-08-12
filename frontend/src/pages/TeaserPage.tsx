import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowRight, Globe, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { socialLinks } from '@/config/socialLinks';
import VisitorCounter from '@/components/Teaser/VisitorCounter';

// --- Reusable Animation Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const floatingAnimation = {
  y: ['-10px', '10px'],
  transition: {
  y: {
      duration: 3,
      repeat: Infinity,
      repeatType: 'reverse' as const,
      ease: 'easeInOut' as const,
    }
  }
};

export default function TeaserPage() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* --- NAVBAR --- */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-md shadow-[0_4px_30px_rgba(37,99,235,0.05)] border-b border-blue-50/50 py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="NIVASA AI" className="w-8 h-8 rounded-full shadow-sm" />
            <div className="text-xl font-extrabold tracking-tight text-main">
              NIVASA AI
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <button onClick={scrollToBottom} className="hidden sm:inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer">
              Building
            </button>
            <button onClick={scrollToBottom} className="hover:text-primary transition-colors">
              Follow
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <motion.div style={{ y: yBg }} className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[100px] opacity-70" />
          <motion.div style={{ y: yBg }} className="absolute top-60 -left-20 w-[400px] h-[400px] bg-indigo-50/50 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 items-center">
          {/* Hero Text */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start z-10"
          >
            <motion.button 
              variants={fadeInUp} 
              onClick={scrollToBottom}
              className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-100 text-primary text-xs font-semibold uppercase tracking-wider hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Currently Building
            </motion.button>
            
            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Something is <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">taking shape.</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-slate-500 max-w-lg mb-10 leading-relaxed">
              We're building something for the way you imagine home. 
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8" onClick={scrollToBottom}>
                Follow the Journey <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 border-slate-200 hover:bg-slate-50" onClick={scrollToBottom}>
                Stay Tuned
              </Button>
            </motion.div>
          </motion.div>

          {/* Hero Visual - Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            className="relative h-[400px] sm:h-[500px] w-full flex items-center justify-center lg:justify-end perspective-1000"
          >
            <motion.div animate={floatingAnimation} className="relative w-full max-w-[550px] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/20 border border-blue-100/50 group">
              <img 
                src="/hero-robot.jpg" 
                alt="NIVASA AI - Future of Architecture" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 to-transparent pointer-events-none" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- MYSTERY SECTION --- */}
      <section className="py-32 bg-slate-50/50 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="w-12 h-12 mx-auto mb-8 relative">
              <motion.div animate={floatingAnimation} className="w-full h-full bg-blue-100 rotate-45 rounded-xl border border-blue-200" />
            </motion.div>
            
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
              Something new is being built.
            </motion.h2>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">
              We're not ready to show you everything yet. <br className="hidden sm:block" />
              <span className="text-slate-700 font-medium">But you'll want to see what's coming.</span>
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* --- MERGED TEASER & CTA SECTION --- */}
      <section className="py-32 bg-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-blue-300 font-bold tracking-widest uppercase mb-4 text-sm">
              NIVASA AI
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Coming soon. <br className="hidden sm:block" />
              <span className="text-blue-200">Follow the build.</span>
            </motion.h2>
            
            <motion.div variants={fadeInUp} className="relative w-48 h-48 mx-auto my-12">
              <motion.div 
                animate={{ borderRadius: ["20%", "40%", "30%", "50%", "20%"], rotate: [0, 90, 180, 270, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-blue-300/10 border border-blue-400/30 shadow-xl opacity-80"
              />
              <motion.div 
                animate={{ borderRadius: ["50%", "30%", "40%", "20%", "50%"], rotate: [360, 270, 180, 90, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 bg-white/5 backdrop-blur-sm border border-white/20"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" />
              </div>
            </motion.div>
            
            <motion.p variants={fadeInUp} className="text-blue-200 text-lg mb-10 max-w-xl mx-auto">
              We're not ready to show you everything yet, but the idea is taking shape in public.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-full border border-white/10 font-medium">
                <Globe className="w-5 h-5" /> LinkedIn
              </a>
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-full border border-white/10 font-medium">
                <LinkIcon className="w-5 h-5" /> Instagram
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2 mb-2">
              <img src="/logo.png" alt="NIVASA AI" className="w-6 h-6 rounded-full" />
              <span className="font-bold text-main text-base">NIVASA AI</span>
            </div>
            <span>Something new is taking shape.</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a>
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Instagram</a>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <VisitorCounter />
            <span className="hidden md:inline text-slate-300">|</span>
            <span>© 2026 NIVASA AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
