import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import WizardPage from '@/pages/WizardPage';
import FloorPlanViewer from '@/viewer/FloorPlanViewer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/wizard" element={<WizardPage />} />
        <Route path="/viewer" element={<FloorPlanViewer />} />
      </Routes>
    </Router>
  );
}

export default App;
