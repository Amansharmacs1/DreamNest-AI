import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import TeaserPage from '@/pages/TeaserPage';
import WizardPage from '@/pages/WizardPage';
import FloorPlanViewer from '@/viewer/FloorPlanViewer';
import AboutPage from '@/pages/AboutPage';
import DashboardPage from '@/pages/DashboardPage';

import AIChatPanel from '@/components/ai/AIChatPanel';

function AppContent() {
  const location = useLocation();
  const isTeaserPage = location.pathname === '/';

  return (
    <>
      <Routes>
        <Route path="/" element={<TeaserPage />} />
        <Route path="/preview" element={<LandingPage />} />
        <Route path="/wizard" element={<WizardPage />} />
        <Route path="/viewer" element={<FloorPlanViewer />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
      {!isTeaserPage && <AIChatPanel />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
