import React from 'react';
import {
  AircraftEngine,
  AIAgent,
  AnomalyEvent,
} from '../types/aerospace';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  ShieldAlert,
  Clock,
  Activity,
  Layers,
  ArrowRight,
  TrendingDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  RotateCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface OverviewDashboardProps {
  engines: AircraftEngine[];
  agents: AIAgent[];
  anomalies: AnomalyEvent[];
  onSelectEngine: (engineId: string) => void;
  onNavigateTab: (tabId: string) => void;
  onTriggerAgent: (agentId: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  engines,
  agents,
  anomalies,
  onSelectEngine,
  onNavigateTab,
  onTriggerAgent,
}) => {
  // KPI computations
  const totalMonitored = engines.length;
  const requiringReview = engines.filter(e => e.status === 'WARNING' || e.status === 'CRITICAL').length;
  const criticalCount = engines.filter(e => e.status === 'CRITICAL').length;
  const avgRul = Math.round(engines.reduce((acc, e) => acc + e.rulEnsemble, 0) / (engines.length || 1));
  const activeAlertsCount = anomalies.filter(a => !a.acknowledged).length;

  // Fleet health distribution data
  const statusCounts = {
    Nominal: engines.filter(e => e.status === 'NOMINAL').length,
    Warning: engines.filter(e => e.status === 'WARNING').length,
    Critical: engines.filter(e => e.status === 'CRITICAL').length,
    Maintenance: engines.filter(e => e.status === 'MAINTENANCE').length,
  };

  const pieData = [
    { name: 'Nominal', value: statusCounts.Nominal, color: '#10B981' },
    { name: 'Warning', value: statusCounts.Warning, color: '#F59E0B' },
    { name: 'Critical', value: statusCounts.Critical, color: '#F43F5E' },
    { name: 'Maintenance', value: statusCounts.Maintenance, color: '#38BDF8' },
  ];

  // Primary degraded engine for sensor trend telemetry spotlight
  const focusEngine = engines.find(e => e.id === 'ENG-CFM-8821') || engines[0];
  const trendHistory = focusEngine ? focusEngine.degradationHistory.slice(-25) : [];

  return (
    <div className="space-y-6">
      {/* Top Banner: Mission Command Overview */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-lg bg-gradient-to-r from-[#0B1D35] via-[#0E2442] to-[#081528] border border-cyan-500/20 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>CMAPSS Flight Telemetry Bus</span>
            <span aria-hidden="true">·</span>
            <span>Active Fleet: 8 Turbofan Units</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Stream</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mt-1">
            Aerospace Fleet Maintenance Command
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Autonomous multi-agent intelligence analyzing continuous high-bypass turbofan sensor degradation,
            forecasting Remaining Useful Life (RUL), and isolating thermal precursors before redline exceedance.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => onNavigateTab('copilot')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 rounded transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>Query Copilot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigateTab('twin')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>Digital Twin Sandbox</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="aerospace-card p-4 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Engines Monitored</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-slate-100 tabular-nums">
              {totalMonitored}
            </span>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-400 font-mono">100%</span>
              <span>telemetry stream link active</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="aerospace-card p-4 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Engines Requiring Review</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-amber-300 tabular-nums">
                {requiringReview}
              </span>
              <span className="text-xs text-rose-400 font-medium font-mono">
                ({criticalCount} critical)
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              <span>Low EGT margin or vibration drift</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="aerospace-card p-4 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Average Predicted RUL</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-cyan-200 tabular-nums">
                {avgRul}
              </span>
              <span className="text-xs text-cyan-400 font-mono">cycles</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              <span>Ensemble RF + LSTM forecast</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="aerospace-card p-4 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Anomaly Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-rose-300 tabular-nums">
                {activeAlertsCount}
              </span>
              <span className="text-xs text-slate-400 font-mono">unacknowledged</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              <span>Isolation Forest threshold &gt; 0.65</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row: Fleet Health Distribution & Telemetry Sensor Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sensor Trend Chart (8 Cols) */}
        <div className="lg:col-span-8 aerospace-card p-5 rounded-lg flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-cyan-500/10">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span>Sensor Telemetry Trend Over Flight Cycles</span>
                <span className="text-xs text-cyan-400 font-mono">({focusEngine?.serialNumber})</span>
              </h2>
              <div className="text-xs text-slate-400 mt-0.5">
                Multi-channel tracking: Exhaust Gas Temp (T50) &amp; Compressor Exit Pressure (P30)
              </div>
            </div>
            <button
              onClick={() => {
                if (focusEngine) {
                  onSelectEngine(focusEngine.id);
                  onNavigateTab('engine');
                }
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>Inspect Full Telemetry</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 sm:h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="egtGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="p30Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="cycle"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={c => `C-${c}`}
                />
                <YAxis
                  yAxisId="left"
                  domain={['dataMin - 10', 'dataMax + 10']}
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0B192C] border border-cyan-500/30 p-2.5 rounded shadow-xl text-xs font-mono">
                          <div className="text-slate-300 font-bold mb-1">Cycle #{label}</div>
                          <div className="text-cyan-300">
                            T50 (EGT): {payload[0]?.value} °R
                          </div>
                          <div className="text-sky-300">
                            P30 Pressure: {payload[1]?.value} psia
                          </div>
                          <div className="text-amber-300">
                            Predicted RUL: {payload[0]?.payload?.rulEnsemble} cycles
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="T50"
                  stroke="#00F0FF"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#egtGrad)"
                  name="T50 (EGT °R)"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="P30"
                  stroke="#38BDF8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#p30Grad)"
                  name="P30 (psia)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-cyan-500/10 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-cyan-400 inline-block" />
                <span>T50 (LPT Exit / EGT °R)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-sky-400 inline-block" />
                <span>P30 (HPC Exit Pressure psia)</span>
              </span>
            </div>
            <span className="font-mono text-cyan-300/80">EGT Margin: 14.2°C (Warning Threshold: &lt; 20°C)</span>
          </div>
        </div>

        {/* Right: Fleet Health Distribution (4 Cols) */}
        <div className="lg:col-span-4 aerospace-card p-5 rounded-lg flex flex-col justify-between">
          <div className="pb-3 border-b border-cyan-500/10">
            <h2 className="text-sm font-semibold text-slate-100">Fleet Health Distribution</h2>
            <div className="text-xs text-slate-400 mt-0.5">8 active aircraft turbofan engines</div>
          </div>

          <div className="h-52 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#07111F" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      return (
                        <div className="bg-[#0B192C] border border-cyan-500/30 p-2 rounded text-xs font-mono">
                          <span className="text-slate-200 font-bold">{data.name}: </span>
                          <span className="text-cyan-300">{data.value} engines</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-mono tabular-nums text-slate-200">
                  {item.value} ({Math.round((item.value / totalMonitored) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Prediction Activity & AI Agent Execution Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Prediction Activity (7 Cols) */}
        <div className="lg:col-span-7 aerospace-card p-5 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/10">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Recent RUL Prediction Activity</h2>
              <div className="text-xs text-slate-400 mt-0.5">Ensemble Random Forest + LSTM results across fleet</div>
            </div>
            <button
              onClick={() => onNavigateTab('rul')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>View RUL Analysis</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="py-2 pr-3 font-medium">Engine Serial</th>
                  <th className="py-2 px-3 font-medium">Aircraft</th>
                  <th className="py-2 px-3 font-medium">Status</th>
                  <th className="py-2 px-3 font-medium text-right">RUL (RF)</th>
                  <th className="py-2 px-3 font-medium text-right">RUL (LSTM)</th>
                  <th className="py-2 px-3 font-medium text-right">Ensemble</th>
                  <th className="py-2 pl-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {engines.slice(0, 5).map(eng => (
                  <tr key={eng.id} className="hover:bg-cyan-950/20 transition-colors">
                    <td className="py-2.5 pr-3 font-semibold text-slate-200">
                      {eng.serialNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans">
                      {eng.aircraftTail}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <StatusBadge status={eng.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 tabular-nums">
                      {eng.rulPredictedRF} c
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 tabular-nums">
                      {eng.rulPredictedLSTM} c
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-cyan-300 tabular-nums">
                      {eng.rulEnsemble} c
                    </td>
                    <td className="py-2.5 pl-3 text-right">
                      <button
                        onClick={() => {
                          onSelectEngine(eng.id);
                          onNavigateTab('engine');
                        }}
                        className="text-[11px] text-cyan-400 hover:text-cyan-200 underline font-sans cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: AI Agent Execution Timeline (5 Cols) */}
        <div className="lg:col-span-5 aerospace-card p-5 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/10">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">AI Agent Command States</h2>
              <div className="text-xs text-slate-400 mt-0.5">Live execution state across 5 specialized agents</div>
            </div>
            <button
              onClick={() => onNavigateTab('agents')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>Command Centre</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 mt-3">
            {agents.map(agent => {
              const stateIcons = {
                Completed: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
                Running: <RotateCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />,
                Waiting: <Clock className="w-3.5 h-3.5 text-slate-400" />,
                Failed: <XCircle className="w-3.5 h-3.5 text-rose-400" />,
              };

              const stateStyles = {
                Completed: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30',
                Running: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/40',
                Waiting: 'text-slate-400 border-slate-700 bg-slate-900/40',
                Failed: 'text-rose-400 border-rose-500/40 bg-rose-950/40',
              };

              return (
                <div
                  key={agent.id}
                  className="p-2.5 rounded bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {stateIcons[agent.state]}
                    <div className="truncate">
                      <div className="font-semibold text-slate-200 truncate">{agent.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{agent.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                        stateStyles[agent.state]
                      }`}
                    >
                      {agent.state}
                    </span>
                    <button
                      onClick={() => onTriggerAgent(agent.id)}
                      title={`Run ${agent.name}`}
                      className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
