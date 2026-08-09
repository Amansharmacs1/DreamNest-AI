import { useState, useEffect } from 'react';
import { useLayoutStore } from '@/store/layoutStore';
import { useConstructionStore } from '@/store/constructionStore';
import { Button } from '@/components/ui/button';
import { HardHat, Calculator, Receipt, Lightbulb, X, FileDown, Layers, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConstructionWorkspace() {
  const { layout } = useLayoutStore();
  const { isConstructionModeActive, setConstructionMode, measurements, estimate, aiAnalysis, isLoading, fetchConstructionData } = useConstructionStore();
  
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isConstructionModeActive && layout && !measurements) {
      fetchConstructionData(layout);
    }
  }, [isConstructionModeActive, layout, measurements, fetchConstructionData]);

  if (!isConstructionModeActive) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="absolute inset-x-4 bottom-4 top-24 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 z-40 flex overflow-hidden"
      >
        {/* Sidebar Tabs */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center bg-white">
            <h2 className="font-bold flex items-center gap-2 text-slate-800">
              <HardHat className="w-5 h-5 text-amber-600" /> Planning
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setConstructionMode(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <nav className="p-2 space-y-1 flex-1">
            {[
              { id: 'overview', icon: Map, label: 'Measurements' },
              { id: 'boq', icon: Calculator, label: 'Bill of Quantities' },
              { id: 'cost', icon: Receipt, label: 'Cost Estimation' },
              { id: 'ai', icon: Lightbulb, label: 'AI Optimization' },
              { id: 'drawings', icon: Layers, label: 'Export Documents' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeTab === tab.id ? 'bg-amber-100 text-amber-900 font-medium' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t bg-amber-50">
            <div className="text-xs text-amber-800 font-medium flex items-start gap-2">
              <HardHat className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Disclaimer: All calculations and diagrams are estimates. Not for legal construction.
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-white p-8 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
              <p className="text-slate-600 font-medium animate-pulse">Calculating geometry and generating BOQ...</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* MEASUREMENTS TAB */}
              {activeTab === 'overview' && measurements && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-slate-800 border-b pb-2">Structural Measurements</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard title="Built-up Area" value={measurements.builtUpArea} unit="sqft" />
                    <MetricCard title="Carpet Area" value={measurements.carpetArea} unit="sqft" />
                    <MetricCard title="Total Wall Area" value={measurements.wallArea} unit="sqft" />
                    <MetricCard title="External Walls" value={measurements.totalExternalWallLength} unit="ft" />
                  </div>
                  
                  <h4 className="font-bold text-slate-700 mt-8 mb-4">Room Schedule</h4>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-600 border-b">
                        <tr>
                          <th className="px-4 py-3">Room Name</th>
                          <th className="px-4 py-3">Dimensions</th>
                          <th className="px-4 py-3">Area</th>
                          <th className="px-4 py-3">Flooring Req.</th>
                          <th className="px-4 py-3">Paint Area</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {Object.values(measurements?.roomMeasurements || {}).map((rm: any) => (
                          <tr key={rm.id}>
                            <td className="px-4 py-3 font-medium text-slate-800">{rm.name}</td>
                            <td className="px-4 py-3">{Math.round(rm.width)}' x {Math.round(rm.length)}'</td>
                            <td className="px-4 py-3">{Math.round(rm.area)} sqft</td>
                            <td className="px-4 py-3">{Math.round(rm.flooringRequired)} sqft</td>
                            <td className="px-4 py-3">{Math.round(rm.paintArea)} sqft</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* BOQ TAB */}
              {activeTab === 'boq' && estimate && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-slate-800 border-b pb-2">Bill of Quantities (BOQ)</h3>
                  <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-800 text-slate-200">
                        <tr>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Description</th>
                          <th className="px-4 py-3 text-right">Qty</th>
                          <th className="px-4 py-3">Unit</th>
                          <th className="px-4 py-3 text-right">Rate</th>
                          <th className="px-4 py-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {estimate?.items?.map((item: any) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{item.category}</td>
                            <td className="px-4 py-3 text-slate-800">{item.description}</td>
                            <td className="px-4 py-3 text-right font-mono">{item.quantity?.toLocaleString() || item.quantity}</td>
                            <td className="px-4 py-3 text-slate-500">{item.unit}</td>
                            <td className="px-4 py-3 text-right font-mono">₹{item.rate?.toLocaleString() || item.rate}</td>
                            <td className="px-4 py-3 text-right font-mono font-medium text-slate-900">₹{item.amount?.toLocaleString() || item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* COST TAB */}
              {activeTab === 'cost' && estimate && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-slate-800 border-b pb-2">Cost Estimation</h3>
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold text-slate-700 mb-4">Category Breakdown</h4>
                      <div className="space-y-3">
                        {Object.entries(estimate?.categoryBreakdown || {}).map(([category, amount]: [string, any]) => (
                          <div key={category} className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">{category}</span>
                            <span className="font-mono font-medium">₹{amount?.toLocaleString() || amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm flex flex-col justify-center space-y-4">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span className="font-mono">₹{estimate?.subtotal?.toLocaleString() || estimate?.subtotal || 0}</span>
                      </div>
                      <div className="flex justify-between text-amber-600">
                        <span>Contingency (10%)</span>
                        <span className="font-mono">₹{estimate?.contingency?.toLocaleString() || estimate?.contingency || 0}</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold text-slate-900 border-t pt-4">
                        <span>Total Estimate</span>
                        <span className="font-mono">₹{estimate?.total?.toLocaleString() || estimate?.total || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI TAB */}
              {activeTab === 'ai' && aiAnalysis && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-amber-500" /> AI Cost Analysis
                  </h3>
                  <p className="text-slate-700 leading-relaxed bg-amber-50 p-4 rounded-lg border border-amber-100">
                    {aiAnalysis.overallAssessment}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-800 mb-3">Key Cost Drivers</h4>
                      <ul className="space-y-2">
                        {aiAnalysis?.costDrivers?.map((driver: string, i: number) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span> {driver}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                      <h4 className="font-bold text-emerald-900 mb-3">Savings Recommendations</h4>
                      <ul className="space-y-3">
                        {aiAnalysis?.savingsRecommendations?.map((rec: any, i: number) => (
                          <li key={i} className="text-sm">
                            <div className="font-semibold text-emerald-800">{rec.category} <span className="text-xs bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full ml-2">Impact: {rec.potentialImpact}</span></div>
                            <div className="text-emerald-700 mt-1">{rec.suggestion}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* DRAWINGS/EXPORT TAB */}
              {activeTab === 'drawings' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-slate-800 border-b pb-2">Export Documents</h3>
                  <p className="text-slate-600 text-sm">Download professional construction documents, BOQs, and dimensioned floor plans.</p>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 border-2 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50">
                      <FileDown className="w-6 h-6" />
                      <span>Download BOQ (CSV)</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 border-2 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50">
                      <FileDown className="w-6 h-6" />
                      <span>Dimensioned Floor Plan (PDF)</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 border-2 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50">
                      <FileDown className="w-6 h-6" />
                      <span>Full Construction Report</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 border-2 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50">
                      <Layers className="w-6 h-6" />
                      <span>Export 3D Model (GLB)</span>
                    </Button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function MetricCard({ title, value, unit }: { title: string, value: number, unit: string }) {
  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div className="text-xs text-slate-500 uppercase font-semibold mb-1">{title}</div>
      <div className="text-2xl font-bold text-slate-800 font-mono">
        {Math.round(value || 0).toLocaleString()} <span className="text-sm font-normal text-slate-500">{unit}</span>
      </div>
    </div>
  );
}
