import { useState, useEffect } from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { PlotStep } from '@/forms/PlotStep';
import { BuildingStep } from '@/forms/BuildingStep';
import { RoomsStep } from '@/forms/RoomsStep';
import { OutdoorStep } from '@/forms/OutdoorStep';
import { PreferencesStep } from '@/forms/PreferencesStep';
import { generateLayoutAPI } from '@/services/api';
import { useLayoutStore } from '@/store/layoutStore';
import AIPromptBar from '@/components/ai/AIPromptBar';

const steps = ['Plot', 'Building', 'Rooms', 'Outdoor', 'Preferences'];

export default function WizardPage() {
  const { step, setStep, preferences } = useWizardStore();
  const { setLayout } = useLayoutStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);

  const loadingMessages = [
    "Analyzing plot dimensions...",
    "Planning room relationships...",
    "Optimizing dimensions and circulation...",
    "Validating geometric boundaries...",
    "Preparing your AI-architected floor plan..."
  ];

  // Rotate through loading messages while backend processes
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStage((prev) => Math.min(prev + 1, loadingMessages.length - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleNext = () => setStep(Math.min(step + 1, 5));
  const handlePrev = () => setStep(Math.max(step - 1, 1));

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setLoadingStage(0);
      const layout = await generateLayoutAPI(preferences);
      setLayout(layout);
      navigate('/viewer');
    } catch (error: any) {
      console.error('Failed to generate layout', error);
      alert(error.response?.data?.error || 'Failed to generate layout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <PlotStep onNext={handleNext} />;
      case 2: return <BuildingStep onNext={handleNext} />;
      case 3: return <RoomsStep onNext={handleNext} />;
      case 4: return <OutdoorStep onNext={handleNext} />;
      case 5: return <PreferencesStep onNext={handleGenerate} loading={loading} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <Home className="w-6 h-6 text-primary" />
          <span className="font-bold text-main">Nivasa AI</span>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          Step {step} of 5
        </div>
      </header>
      
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-12">
        <div className="mb-8">
          <AIPromptBar />
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((label, index) => (
              <div key={label} className={`text-xs font-semibold ${step >= index + 1 ? 'text-primary' : 'text-gray-400'}`}>
                {label}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 mt-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Home className="w-6 h-6 text-blue-600 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Designing your home...</h3>
                <p className="text-blue-600 font-medium animate-pulse">{loadingMessages[loadingStage]}</p>
                <p className="text-sm text-gray-500 max-w-sm mt-2">NIVASA AI is evaluating hundreds of architectural parameters to create the perfect layout.</p>
              </div>
            </div>
          ) : (
            <Card className="shadow-lg border-gray-100">
              <CardContent className="p-6 md:p-10">
                {renderStep()}
              </CardContent>
            </Card>
          )}
        </div>
        <div className="mt-6 flex justify-start">
          <Button variant="outline" onClick={handlePrev} disabled={step === 1 || loading}>
            Back
          </Button>
        </div>
      </main>
    </div>
  );
}
