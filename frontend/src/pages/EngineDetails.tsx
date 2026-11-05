import React, { useState } from 'react';
import { AircraftEngine, SensorReading, ShapFeature } from '../types/aerospace';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Activity,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Sliders,
  ChevronDown,
  Info,
  Maximize2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface EngineDetailsProps {
  engines: AircraftEngine[];
  selectedEngineId: string;
  onSelectEngine: (engineId: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export const EngineDetails: React.FC<EngineDetailsProps> = ({
  engines,
  selectedEngineId,
  onSelectEngine,
  onNavigateTab,
}) => {
  const engine = engines.find(e => e.id === selectedEngineId) || engines[0];
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('All');
  const [highlightedSensor, setHighlightedSensor] = useState<string | null>(null);

  if (!engine) {
    return (
      <div className="p-8 text-center text-slate-400">
        No engine telemetry record found. Please select an engine from the Fleet page.
      </div>
    );
  }

  // Filter sensors based on subsystem tab
  const filteredSensors = selectedSubsystem === 'All'
    ? engine.sensors
    : engine.sensors.filter(s => s.subsystem === selectedSubsystem);

  // Degradation series
  const degradationData = engine.degradationHistory.slice(-40);

  // SHAP features sorted by magnitude of impact
  const sortedShap = [...engine.shapFeatures].sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue));

  const subsystems = ['All', 'Fan', 'LPC', 'HPC', 'Combustor', 'LPT'];

  return (
    <div className="space-y-6">
      {/* Top Selector & Identification Banner */}
      <div className="aerospace-card p-5 rounded-lg border border-cyan-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label htmlFor="engine-select" className="text-xs text-slate-400 font-medium">
                Active Telemetry Node:
              </label>
              <div className="relative inline-block">
                <select
                  id="engine-select"
                  value={engine.id}
                  onChange={e => onSelectEngine(e.target.value)}
                  className="bg-[#07111F] text-cyan-300 font-mono font-bold text-sm px-3 py-1 pr-8 rounded border border-cyan-500/30 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
                >
                  {engines.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.serialNumber} ({e.aircraftTail} - {e.model})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <StatusBadge status={engine.status} size="sm" />
            </div>

            <div className="text-xl sm:text-2xl font-bold text-slate-100 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{engine.model}</span>
              <span className="text-xs font-mono text-cyan-400 font-normal">
                [{engine.position} · Tail {engine.aircraftTail}]
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Operator: <strong className="text-slate-300 font-normal">{engine.operator}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Aircraft: <strong className="text-slate-300 font-normal">{engine.aircraftType}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Last Insp: <strong className="text-slate-300 font-normal font-mono">{engine.lastInspectionDate}</strong></span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('twin')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/30 rounded transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Simulate Twin Sandbox</span>
            </button>
            <button
              onClick={() => onNavigateTab('copilot')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Copilot Diagnosis</span>
            </button>
          </div>
        </div>

        {/* Metric Badges Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs font-mono">
          <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800">
            <span className="text-slate-400 block text-[11px] font-sans">Operating Cycles</span>
            <span className="text-base font-bold text-slate-200 tabular-nums">
              {engine.operatingCycles.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800">
            <span className="text-slate-400 block text-[11px] font-sans">Flight Hours</span>
            <span className="text-base font-bold text-slate-200 tabular-nums">
              {engine.flightHours.toLocaleString()}h
            </span>
          </div>
          <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800">
            <span className="text-slate-400 block text-[11px] font-sans">Time Since Overhaul</span>
            <span className="text-base font-bold text-slate-200 tabular-nums">
              {engine.totalTimeSinceOverhaul.toLocaleString()}h
            </span>
          </div>
          <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800">
            <span className="text-slate-400 block text-[11px] font-sans">EGT Margin to Redline</span>
            <span
              className={`text-base font-bold tabular-nums ${
                engine.currentEgtMargin < 15 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {engine.currentEgtMargin}°C
            </span>
          </div>
        </div>
      </div>

      {/* RUL & AI Model Metrics Row: Random Forest, LSTM, Disagreement, Anomaly Score */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Random Forest RUL */}
        <div className="aerospace-card p-4 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Random Forest RUL</span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20">
              500 Trees
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-100 font-mono tabular-nums">
                {engine.rulPredictedRF}
              </span>
              <span className="text-xs text-slate-400 font-mono">cycles</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Non-linear regression on 21 sensor features</div>
          </div>
        </div>

        {/* Card 2: LSTM Sequence RUL */}
        <div className="aerospace-card p-4 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">LSTM Recurrent RUL</span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20">
              60-Cycle Window
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-100 font-mono tabular-nums">
                {engine.rulPredictedLSTM}
              </span>
              <span className="text-xs text-slate-400 font-mono">cycles</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Bi-directional temporal degradation model</div>
          </div>
        </div>

        {/* Card 3: Model Disagreement & Ensemble */}
        <div className="aerospace-card p-4 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Model Disagreement</span>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20">
              ±{engine.modelDisagreement} Cycles
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-cyan-300 font-mono tabular-nums">
                {engine.rulEnsemble}
              </span>
              <span className="text-xs text-cyan-400 font-mono font-bold">Ensemble RUL</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Confidence Spread: <strong className="text-slate-200 font-mono">{engine.confidenceSpread}%</strong>
            </div>
          </div>
        </div>

        {/* Card 4: Anomaly Score */}
        <div className="aerospace-card p-4 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Multivariate Anomaly</span>
            <span className="text-[10px] font-mono text-slate-400">Limit: 0.65</span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-bold font-mono tabular-nums ${
                  engine.anomalyScore > 0.8
                    ? 'text-rose-400'
                    : engine.anomalyScore > 0.6
                    ? 'text-amber-300'
                    : 'text-emerald-400'
                }`}
              >
                {engine.anomalyScore.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 1.00</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded mt-2 overflow-hidden">
              <div
                className={`h-full ${
                  engine.anomalyScore > 0.8
                    ? 'bg-rose-500'
                    : engine.anomalyScore > 0.6
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, engine.anomalyScore * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Turbofan Cutaway Visualizer & Sensor Telemetry Map */}
      <div className="aerospace-card p-5 rounded-lg border border-cyan-500/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-cyan-500/10">
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>Turbofan Component Architecture &amp; Telemetry Hotspots</span>
              <span className="text-xs text-cyan-400 font-mono">({engine.model})</span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive high-bypass engine cutaway showing sensor taps, compressor stages, and turbine expansion paths.
            </p>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            AeroGuard Sensor Bus v3.4
          </div>
        </div>

        {/* Engine Cutaway Image with Subsystem Overlay */}
        <div className="relative rounded-lg overflow-hidden border border-cyan-500/20 bg-slate-950">
          <img
            src="/src/assets/images/aerospace_turbofan_engine_1793726589125.jpg"
            alt="Aerospace Turbofan Engine Technical Cutaway"
            referrerPolicy="no-referrer"
            className="w-full h-auto max-h-[460px] object-cover object-center opacity-90"
          />

          {/* Subsystem Hotspot Pills overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2 p-2 rounded bg-[#07111F]/80 backdrop-blur-md border border-cyan-500/20 text-xs">
            <span className="text-slate-400 text-[11px] font-mono mr-1">Filter Telemetry by Stage:</span>
            {subsystems.map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubsystem(sub)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  selectedSubsystem === sub
                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sensor Readings Grid */}
      <div className="aerospace-card p-5 rounded-lg border border-cyan-500/15">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-cyan-500/10">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Live Turbofan Sensor Readings</h2>
            <div className="text-xs text-slate-400">
              Displaying {filteredSensors.length} calibrated sensor telemetry channels ({selectedSubsystem})
            </div>
          </div>
          <div className="text-xs font-mono text-slate-400">
            ISA Standard Corrected
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {filteredSensors.map(sensor => {
            const isWarning = sensor.status === 'warning';
            const isCritical = sensor.status === 'critical';

            return (
              <div
                key={sensor.code}
                onMouseEnter={() => setHighlightedSensor(sensor.code)}
                onMouseLeave={() => setHighlightedSensor(null)}
                className={`p-3 rounded-lg border transition-all ${
                  isCritical
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                    : isWarning
                    ? 'bg-amber-950/20 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.08)]'
                    : 'bg-slate-900/50 border-slate-800 hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-cyan-400">{sensor.code}</span>
                  <span
                    className={`text-[10px] font-mono px-1 rounded ${
                      isCritical
                        ? 'text-rose-300 bg-rose-950/60'
                        : isWarning
                        ? 'text-amber-300 bg-amber-950/60'
                        : 'text-emerald-400 bg-emerald-950/60'
                    }`}
                  >
                    {sensor.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-xs text-slate-300 truncate" title={sensor.name}>
                  {sensor.name}
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-slate-100 tabular-nums">
                    {sensor.value}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{sensor.unit}</span>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                  <span>Nom: {sensor.nominalMin}</span>
                  <span>- {sensor.nominalMax}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: SHAP Feature Importance & Degradation History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: SHAP Feature Importance (7 Cols) */}
        <div className="lg:col-span-7 aerospace-card p-5 rounded-lg flex flex-col justify-between">
          <div className="pb-3 border-b border-cyan-500/10">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-100">
                SHAP Explainable AI Feature Attribution
              </h2>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                TreeSHAP Vector
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Decomposing model output into physical contributions: positive values accelerate failure risk &amp; reduce RUL.
            </p>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedShap}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  dataKey="feature"
                  type="category"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ShapFeature;
                      return (
                        <div className="bg-[#0B192C] border border-cyan-500/40 p-2.5 rounded shadow-xl text-xs max-w-xs font-sans">
                          <div className="font-bold text-slate-200">{data.name}</div>
                          <div className="text-cyan-300 font-mono mt-0.5">
                            SHAP Value: {data.shapValue > 0 ? `+${data.shapValue}` : data.shapValue} cycles
                          </div>
                          <div className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                            {data.rationale}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="shapValue" radius={[0, 4, 4, 0]}>
                  {sortedShap.map((entry, index) => (
                    <Cell
                      key={`shap-${index}`}
                      fill={entry.shapValue > 0 ? '#F43F5E' : '#10B981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-3 pt-3 border-t border-cyan-500/10 text-xs">
            {sortedShap.slice(0, 3).map(f => (
              <div key={f.feature} className="p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{f.name}</span>
                  <span
                    className={`font-mono font-bold ${
                      f.shapValue > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {f.shapValue > 0 ? `+${f.shapValue}` : f.shapValue} SHAP
                  </span>
                </div>
                <p className="text-slate-400 mt-0.5">{f.rationale}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Degradation History Chart (5 Cols) */}
        <div className="lg:col-span-5 aerospace-card p-5 rounded-lg flex flex-col justify-between">
          <div className="pb-3 border-b border-cyan-500/10">
            <h2 className="text-sm font-semibold text-slate-100">
              Operating Cycle RUL Trajectory
            </h2>
            <div className="text-xs text-slate-400 mt-0.5">
              Historical cycles vs predicted degradation slope
            </div>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={degradationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="cycle"
                  stroke="#64748B"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={c => `C-${c}`}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={10}
                  tickLine={false}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0B192C] border border-cyan-500/30 p-2 rounded text-xs font-mono">
                          <div className="text-slate-200 font-bold">Cycle #{label}</div>
                          <div className="text-cyan-300">
                            Ensemble RUL: {payload[0]?.value} cycles
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            RF: {payload[0]?.payload?.rulPredictedRF} | LSTM: {payload[0]?.payload?.rulPredictedLSTM}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rulEnsemble"
                  stroke="#00F0FF"
                  strokeWidth={2}
                  dot={false}
                  name="Ensemble RUL"
                />
                <Line
                  type="monotone"
                  dataKey="rulPredictedRF"
                  stroke="#38BDF8"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                  name="Random Forest"
                />
                <Line
                  type="monotone"
                  dataKey="rulPredictedLSTM"
                  stroke="#F59E0B"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                  name="LSTM"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-cyan-500/10 text-xs text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>Current Degradation Rate:</span>
              <span className="font-mono text-slate-200">-1.14 cycles / flight</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Threshold Redline Projection:</span>
              <span className="font-mono text-cyan-300">{engine.rulEnsemble} flight cycles remaining</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
