import { useLayoutStore } from '@/store/layoutStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Info } from 'lucide-react';

export default function AIDesignInsights() {
  const { layout } = useLayoutStore();

  if (!layout?.metadata?.explanation) {
    return null;
  }

  const { metadata } = layout;

  return (
    <Card className="absolute top-20 left-4 w-72 md:w-80 shadow-lg bg-white/95 backdrop-blur z-20 pointer-events-auto max-h-[80vh] overflow-y-auto">
      <CardHeader className="py-3 px-4 border-b bg-indigo-50/50 flex flex-row items-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-600" />
        <CardTitle className="text-sm font-semibold text-indigo-900 m-0">AI Design Insights</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {metadata.variantName && (
          <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            {metadata.variantName}
          </div>
        )}
        <div className="text-sm text-gray-700 leading-relaxed">
          {metadata.explanation}
        </div>
        
        {metadata.score && (
          <div className="space-y-2 mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700 flex items-center gap-1">
                <Info className="w-3 h-3" /> Design Score
              </span>
              <span className="font-bold text-indigo-600">{metadata.score.overall}/100</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="text-xs flex justify-between bg-gray-50 p-1.5 rounded">
                <span className="text-gray-500">Space</span>
                <span className="font-medium">{metadata.score.spaceEfficiency}%</span>
              </div>
              <div className="text-xs flex justify-between bg-gray-50 p-1.5 rounded">
                <span className="text-gray-500">Flow</span>
                <span className="font-medium">{metadata.score.circulation}%</span>
              </div>
              <div className="text-xs flex justify-between bg-gray-50 p-1.5 rounded">
                <span className="text-gray-500">Light</span>
                <span className="font-medium">{metadata.score.lighting}%</span>
              </div>
              <div className="text-xs flex justify-between bg-gray-50 p-1.5 rounded">
                <span className="text-gray-500">Privacy</span>
                <span className="font-medium">{metadata.score.privacy}%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
