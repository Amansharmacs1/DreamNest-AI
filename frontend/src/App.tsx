import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import WizardPage from '@/pages/WizardPage';
import FloorPlanViewer from '@/viewer/FloorPlanViewer';

import AIChatPanel from '@/components/ai/AIChatPanel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/wizard" element={<WizardPage />} />
        <Route path="/viewer" element={<FloorPlanViewer />} />
      </Routes>
      <AIChatPanel />
    </Router>
  );
}

export default App;
