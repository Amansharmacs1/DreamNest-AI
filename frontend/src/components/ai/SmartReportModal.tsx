import { useState } from 'react';
import { useAnalysisStore } from '@/store/analysisStore';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Mail, Activity, AlertTriangle, ShieldCheck, Zap, Sun, Wind, Move, Eye, Grid, Send, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import type { MetricCategory } from '@/types';

export default function SmartReportModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { analysisResult, isAnalyzing } = useAnalysisStore();
  const [emailAddress, setEmailAddress] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'issues'>('overview');

  const exportPDF = async () => {
    const reportElement = document.getElementById('smart-report-content');
    if (!reportElement) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({ orientation: canvas.width > canvas.height ? 'l' : 'p', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Nivasa-Smart-Analysis-Report.pdf');
    } catch (e) {
      console.error('PDF Export failed', e);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const sendEmail = async () => {
    if (!emailAddress || !emailAddress.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setIsSendingEmail(true);
    setEmailError('');
    
    try {
      const reportText = `
Nivasa AI Smart Environmental Analysis
----------------------------------------
Overall Design Score: ${analysisResult?.overallScore}/100

Gemini Architect Summary:
${analysisResult?.explanation || 'No summary available.'}

Recommendations:
${analysisResult?.recommendations?.map(r => '• ' + r).join('\n') || 'None'}
      `;

      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_qw5lcol';
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'audit_results';
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'TK1IeNxZIvDCm3Wa9';

      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: emailAddress,
          user_email: emailAddress,
          email: emailAddress,
          to_name: emailAddress.split('@')[0],
          message: reportText,
          report: reportText,
          summary: reportText,
          reply_to: "noreply@nivasa.ai",
        },
        publicKey
      );

      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 4000);
      setEmailAddress('');
    } catch (err: any) {
      console.error('Failed to send email:', err);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 4000);
      setEmailAddress('');
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'moderate': return 'text-amber-600 bg-amber-50';
      default: return 'text-red-600 bg-red-50';
    }
  };

  const renderMetricCard = (title: string, icon: any, metric: MetricCategory) => {
    const Icon = icon;
    return (
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg"><Icon className="w-5 h-5 text-slate-600" /></div>
          <div>
            <h4 className="font-semibold text-sm text-slate-800">{title}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full uppercase font-medium ${getStatusColor(metric.status)}`}>
              {metric.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-800">{metric.score}</div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Nivasa Smart Analysis Dashboard</h2>
              <p className="text-sm text-slate-500">Environmental & Architectural Insights</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {analysisResult && (
              <div className="flex items-center gap-2 mr-4 border-r border-slate-200 pr-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="email"
                    placeholder="Enter email to send"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="pl-9 pr-3 py-2 border rounded-md text-sm w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <Button size="sm" onClick={sendEmail} disabled={isSendingEmail || emailSent} className={emailSent ? "bg-green-600" : "bg-indigo-600"}>
                  {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : emailSent ? <CheckCircle className="w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  {emailSent ? "Sent!" : "Email"}
                </Button>
              </div>
            )}
            {analysisResult && <Button variant="outline" size="sm" onClick={exportPDF}>Export PDF</Button>}
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          </div>
        </div>

        {emailError && <div className="bg-red-50 text-red-600 text-xs text-center py-2 border-b border-red-100">{emailError}</div>}

        <div id="smart-report-content" className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-slate-500">Running full deterministic environmental analysis...</p>
            </div>
          ) : !analysisResult ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <p className="text-slate-500">Please enable Smart Analysis in the viewer to see results here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Score Banner */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-xl p-6 text-white flex flex-col md:flex-row gap-6 items-center">
                <div className="text-center md:text-left md:border-r md:border-white/20 md:pr-8">
                  <div className="text-sm font-medium text-indigo-100 uppercase tracking-wider mb-1">Overall Design Score</div>
                  <div className="text-5xl font-bold">{analysisResult.overallScore}<span className="text-2xl text-indigo-200">/100</span></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><Wand2 className="w-5 h-5" /> AI Architect's Summary</h3>
                  <p className="text-indigo-50 leading-relaxed text-sm">{analysisResult.explanation}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-slate-200">
                <Button variant={activeTab === 'overview' ? 'default' : 'ghost'} onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'bg-indigo-600' : ''}>Overview</Button>
                <Button variant={activeTab === 'rooms' ? 'default' : 'ghost'} onClick={() => setActiveTab('rooms')} className={activeTab === 'rooms' ? 'bg-indigo-600' : ''}>Room Analysis</Button>
                <Button variant={activeTab === 'issues' ? 'default' : 'ghost'} onClick={() => setActiveTab('issues')} className={activeTab === 'issues' ? 'bg-indigo-600' : ''}>
                  Issues <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{analysisResult.issues.filter(i => i.severity === 'High').length} High</span>
                </Button>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {renderMetricCard("Space Efficiency", Grid, analysisResult.spaceEfficiency)}
                    {renderMetricCard("Natural Lighting", Sun, analysisResult.naturalLighting)}
                    {renderMetricCard("Ventilation", Wind, analysisResult.ventilation)}
                    {renderMetricCard("Circulation", Move, analysisResult.circulation)}
                    {renderMetricCard("Privacy", Eye, analysisResult.privacy)}
                    {renderMetricCard("Energy Efficiency", Zap, analysisResult.energyEfficiency)}
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">AI Recommendations</h3>
                    <ul className="space-y-2">
                      {analysisResult.recommendations?.map((rec, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> <span>{rec}</span></li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'rooms' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.naturalLighting.rooms?.map((room, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="font-bold text-slate-800 mb-2">{room.name}</h4>
                      <div className="text-sm space-y-1 text-slate-600">
                        <div className="flex justify-between"><span>Lighting Score:</span> <span className="font-semibold text-slate-800">{room.score}/100</span></div>
                        <div className="flex justify-between"><span>Exposed Edges:</span> <span>{room.exposedEdges}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'issues' && (
                <div className="space-y-4">
                  {analysisResult.issues.length === 0 ? (
                    <div className="text-center p-8 bg-green-50 rounded-xl border border-green-100">
                      <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-green-800">No Critical Issues Detected</h3>
                      <p className="text-green-600 mt-1">This layout is highly optimized.</p>
                    </div>
                  ) : (
                    analysisResult.issues.sort((a, _) => a.severity === 'High' ? -1 : 1).map((issue, i) => (
                      <div key={i} className={`p-4 rounded-xl border flex gap-4 ${issue.severity === 'High' ? 'bg-red-50 border-red-100' : issue.severity === 'Medium' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'}`}>
                        <div className="mt-1">
                          {issue.severity === 'High' ? <AlertTriangle className="w-6 h-6 text-red-500" /> : <AlertTriangle className="w-6 h-6 text-amber-500" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${issue.severity === 'High' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'}`}>{issue.severity}</span>
                            <span className="text-sm font-semibold text-slate-800">{issue.category}</span>
                          </div>
                          <p className="text-sm text-slate-700 font-medium mb-1">{issue.description}</p>
                          <p className="text-sm text-slate-600"><strong>Recommendation:</strong> {issue.recommendation}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
// Using lucide-react 'Send' inside component but importing 'Wand2' for AI. Need to add Wand2 to imports.
