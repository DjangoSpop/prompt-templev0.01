import { BarChart3, Download, Trash2 } from "lucide-react";

const AnalyticsPanel = ({ 
  analytics, 
  onExportReport, 
  onClearData 
}: {
  analytics: {
    totalMessages: number;
    totalTokens: number;
    averageResponseTime: number;
    satisfactionScore: number;
    modelUsage: Record<string, number>;
    slashCommandUsage: Record<string, number>;
    dailyUsage: {
      date: string;
      messages: number;
      tokens: number;
      sessions: number;
      avgResponseTime: number;
    }[];
  };
  onExportReport: () => void;
  onClearData: () => void;
}) => (
  <div className="w-80 bg-sand-50/50 border-l-2 border-sand-200 p-4 flex flex-col h-full">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-display font-bold text-stone-800 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-sun" />
        Analytics
      </h2>
      <div className="flex gap-1">
        <button
          onClick={onExportReport}
          className="p-1.5 text-stone-600 hover:bg-stone-200 rounded"
          title="Export Report"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          onClick={onClearData}
          className="p-1.5 text-red-500 hover:bg-red-100 rounded"
          title="Clear Data"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>

    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-cartouche border border-sand-200">
          <div className="text-xs text-stone-600">Messages</div>
          <div className="text-lg font-bold text-stone-800">{analytics.totalMessages}</div>
        </div>
        <div className="bg-white p-3 rounded-cartouche border border-sand-200">
          <div className="text-xs text-stone-600">Tokens</div>
          <div className="text-lg font-bold text-stone-800">{analytics.totalTokens.toLocaleString()}</div>
        </div>
        <div className="bg-white p-3 rounded-cartouche border border-sand-200">
          <div className="text-xs text-stone-600">Avg Response</div>
          <div className="text-lg font-bold text-stone-800">{Math.round(analytics.averageResponseTime)}ms</div>
        </div>
        <div className="bg-white p-3 rounded-cartouche border border-sand-200">
          <div className="text-xs text-stone-600">Satisfaction</div>
          <div className="text-lg font-bold text-stone-800">{analytics.satisfactionScore.toFixed(1)}/5</div>
        </div>
      </div>

      {/* Model Usage */}
      {Object.keys(analytics.modelUsage).length > 0 && (
        <div className="bg-white p-3 rounded-cartouche border border-sand-200">
          <h3 className="text-sm font-semibold text-stone-800 mb-2">Model Usage</h3>
          <div className="space-y-1">
            {Object.entries(analytics.modelUsage).map(([model, tokens]) => (
              <div key={model} className="flex justify-between text-xs">
                <span className="text-stone-600">{model}</span>
                <span className="font-mono text-stone-800">{(tokens as number).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slash Commands */}
      {Object.keys(analytics.slashCommandUsage).length > 0 && (
        <div className="bg-white p-3 rounded-cartouche border border-sand-200">
          <h3 className="text-sm font-semibold text-stone-800 mb-2">Command Usage</h3>
          <div className="space-y-1">
            {Object.entries(analytics.slashCommandUsage).map(([cmd, count]) => (
              <div key={cmd} className="flex justify-between text-xs">
                <span className="text-stone-600">/{cmd}</span>
                <span className="font-mono text-stone-800">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Usage Chart (simplified) */}
      {analytics.dailyUsage.length > 0 && (
        <div className="bg-white p-3 rounded-cartouche border border-sand-200">
          <h3 className="text-sm font-semibold text-stone-800 mb-2">Daily Usage (7 days)</h3>
          <div className="space-y-1">
            {analytics.dailyUsage.slice(0, 7).map((day) => (
              <div key={day.date} className="flex justify-between text-xs">
                <span className="text-stone-600">{new Date(day.date).toISOString().slice(0, 10)}</span>
                <span className="font-mono text-stone-800">{day.messages}msg</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);



export default AnalyticsPanel;