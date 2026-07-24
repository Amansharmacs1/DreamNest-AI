import { useState } from 'react';
import { useLayoutStore } from '@/store/layoutStore';
import { useAIStore } from '@/store/aiStore';
import { useWizardStore } from '@/store/wizardStore';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, CheckCircle, AlertTriangle, TrendingUp, DollarSign, Send, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';

export default function SmartReportModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { layout } = useLayoutStore();
  const { provider } = useAIStore();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [cost, setCost] = useState<any>(null);
  
  const [emailAddress, setEmailAddress] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');

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
      const { preferences } = useWizardStore.getState();
      const resCost = await fetch(import.meta.env.VITE_API_URL + '/ai/cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout, budget: preferences.plot.budget, provider })
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

  const sendEmail = async () => {
    if (!emailAddress) {
      setEmailError('Please enter an email address');
      return;
    }
    
    setIsSendingEmail(true);
    setEmailError('');
    
    try {
      // Format the report as text for the email
      const reportText = `
DreamNest AI Smart Report
----------------------------------------

Estimated Cost: ₹${cost?.totalEstimatedCost?.toLocaleString()}
Civil Work: ₹${cost?.civilWork?.toLocaleString()}
Finishing: ₹${cost?.finishing?.toLocaleString()}

Strengths:
${report?.strengths?.map((s: string) => '- ' + s.replace(/\*\*/g, '')).join('\n')}

Weaknesses:
${report?.weaknesses?.map((s: string) => '- ' + s.replace(/\*\*/g, '')).join('\n')}

Suggestions:
${report?.suggestions?.map((s: string) => '- ' + s.replace(/\*\*/g, '')).join('\n')}
      `;

      // NOTE: You must create an EmailJS account and replace these with your actual keys
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'default_service';
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_id';
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'public_key';

      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: emailAddress,
          message: reportText,
          reply_to: "noreply@dreamnest.ai",
        },
        publicKey
      );

      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
      setEmailAddress('');
    } catch (err: any) {
      console.error('Failed to send email:', err);
      setEmailError('Failed to send email. Ensure EmailJS keys are set in .env');
    } finally {
      setIsSendingEmail(false);
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
          <div className="flex flex-wrap gap-2 items-center">
            {report && (
              <div className="flex items-center gap-2 mr-4 border-r border-slate-200 pr-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="email"
                    placeholder="Enter email to send"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="pl-9 pr-3 py-2 border rounded-md text-sm w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={sendEmail} 
                  disabled={isSendingEmail || emailSent}
                  className={emailSent ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
                >
                  {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                   emailSent ? <CheckCircle className="w-4 h-4 mr-2" /> : 
                   <Send className="w-4 h-4 mr-2" />}
                  {emailSent ? "Sent!" : "Email"}
                </Button>
              </div>
            )}
            {report && <Button variant="outline" size="sm" onClick={exportPDF}>Download PDF</Button>}
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          </div>
        </div>

        {emailError && (
          <div className="bg-red-50 text-red-600 text-xs text-center py-2 border-b border-red-100">
            {emailError}
          </div>
        )}

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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700 font-medium">Total Estimate</p>
                      <p className="text-2xl font-bold text-green-900">₹{cost.totalEstimatedCost?.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium">Civil Work</p>
                      <p className="text-xl font-bold text-slate-800">₹{cost.civilWork?.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium">Finishing</p>
                      <p className="text-xl font-bold text-slate-800">₹{cost.finishing?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-slate-700">Cost Saving Suggestions</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                      {cost.savingsSuggestions?.map((s: string, i: number) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: s.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>') }} />
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Analysis Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-emerald-700">
                    <CheckCircle className="w-5 h-5" /> Strengths
                  </h3>
                  <ul className="space-y-3">
                    {report.strengths?.map((s: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-600">
                        <span className="text-emerald-500 mt-0.5">•</span> 
                        <span dangerouslySetInnerHTML={{ __html: s.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>') }} />
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
                        <span className="text-amber-500 mt-0.5">•</span> 
                        <span dangerouslySetInnerHTML={{ __html: s.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>') }} />
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
                      <span className="text-blue-500 mt-0.5">•</span> 
                      <span dangerouslySetInnerHTML={{ __html: s.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>') }} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold mb-2 text-slate-800">Traffic Flow Analysis</h3>
                <p className="text-slate-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: report.trafficFlow.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>') }} />
              </div>

            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
