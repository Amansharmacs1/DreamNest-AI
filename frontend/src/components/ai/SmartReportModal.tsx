import { useState } from 'react';
import { useLayoutStore } from '@/store/layoutStore';
import { useAIStore } from '@/store/aiStore';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, CheckCircle, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SmartReportModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { layout } = useLayoutStore();
  const { provider } = useAIStore();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [cost, setCost] = useState<any>(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Fetch Analysis
      const resAnalysis = await fetch(import.meta.env.VITE_API_URL + '/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout, provider })
      });
      const analysisData = await resAnalysis.json();
      setReport(analysisData);

      // Fetch Cost
      const resCost = await fetch(import.meta.env.VITE_API_URL + '/ai/cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout, budget: 150000, provider })
      });
      const costData = await resCost.json();
      setCost(costData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    const reportElement = document.getElementById('smart-report-content');
    if (!reportElement) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF with exact dimensions of the captured canvas to prevent squashing/cutoff
      const pdf = new jsPDF({ 
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait', 
        unit: 'px', 
        format: [canvas.width, canvas.height] 
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('DreamNest-Smart-Report.pdf');
    } catch (e) {
      console.error('PDF Export failed', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Smart Design Report</h2>
              <p className="text-sm text-slate-500">AI-generated architectural analysis & cost estimation</p>
            </div>
          </div>
          <div className="flex gap-2">
            {report && <Button variant="outline" onClick={exportPDF}>Download PDF</Button>}
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </div>

        <div id="smart-report-content" className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {!report && !loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <p className="text-slate-500">Generate a comprehensive report for your current layout.</p>
              <Button size="lg" onClick={generateReport}>Generate Report</Button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-slate-500">Analyzing architecture and estimating costs...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Cost Section */}
              {cost && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-green-600" /> Estimated Construction Cost
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700 font-medium">Total Estimate</p>
                      <p className="text-2xl font-bold text-green-900">${cost.totalEstimatedCost?.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium">Civil Work</p>
                      <p className="text-xl font-bold text-slate-800">${cost.civilWork?.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium">Finishing</p>
                      <p className="text-xl font-bold text-slate-800">${cost.finishing?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-slate-700">Cost Saving Suggestions</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                      {cost.savingsSuggestions?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {/* Analysis Section */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-emerald-700">
                    <CheckCircle className="w-5 h-5" /> Strengths
                  </h3>
                  <ul className="space-y-3">
                    {report.strengths?.map((s: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-600">
                        <span className="text-emerald-500 mt-0.5">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-amber-700">
                    <AlertTriangle className="w-5 h-5" /> Weaknesses
                  </h3>
                  <ul className="space-y-3">
                    {report.weaknesses?.map((s: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-600">
                        <span className="text-amber-500 mt-0.5">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-blue-700">
                  <TrendingUp className="w-5 h-5" /> Optimization Suggestions
                </h3>
                <ul className="space-y-3">
                  {report.suggestions?.map((s: string, i: number) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600">
                      <span className="text-blue-500 mt-0.5">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold mb-2 text-slate-800">Traffic Flow Analysis</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{report.trafficFlow}</p>
              </div>

            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
