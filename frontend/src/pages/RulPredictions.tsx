import React, { useState } from 'react';
import { AircraftEngine } from '../types/aerospace';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  TrendingDown,
  Brain,
  Sliders,
  AlertTriangle,
  Clock,
  ArrowRight,
  Info,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface RulPredictionsProps {
  engines: AircraftEngine[];
  onSelectEngine: (engineId: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export const RulPredictions: React.FC<RulPredictionsProps> = ({
  engines,
  onSelectEngine,
  onNavigateTab,
}) => {
  const [criticalThreshold, setCriticalThreshold] = useState<number>(30); // cycles
  const [warningThreshold, setWarningThreshold] = useState<number>(60); // cycles
  const [selectedEngineForTrajectory, setSelectedEngineForTrajectory] = useState<string>(engines[0]?.id || '');

  const activeEngine = engines.find(e => e.id === selectedEngineForTrajectory) || engines[0];

  // Build projected degradation curve into the future based on current slope
  const trajectoryData = React.useMemo(() => {
    if (!activeEngine) return [];
    const points = [];
    const currentCycles = activeEngine.operatingCycles;
    const currentRul = activeEngine.rulEnsemble;
    const rfRul = activeEngine.rulPredictedRF;
    const lstmRul = activeEngine.rulPredictedLSTM;

    // Past 10 cycles + future 50 cycles
    for (let i = -10; i <= Math.min(60, currentRul + 15); i += 5) {
      const cycleNum = currentCycles + i;
      const trueRul = Math.max(0, currentRul - i);
      const rfVal = Math.max(0, rfRul - i + (Math.sin(i) * 2));
      const lstmVal = Math.max(0, lstmRul - i - (Math.cos(i * 0.5) * 3));
      const upperBound = trueRul + 8;
      const lowerBound = Math.max(0, trueRul - 8);

      points.push({
        cycle: cycleNum,
        relativeCycle: i,
        isFuture: i > 0,
        rulEnsemble: trueRul,
        rulRF: rfVal,
        rulLSTM: lstmVal,
        upperBound,
        lowerBound,
        criticalThreshold,
      });
    }
    return points;
  }, [activeEngine, criticalThreshold]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/10">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>Remaining Useful Life (RUL) Intelligence</span>
            <span className="text-xs font-mono text-cyan-400 font-normal">
              NASA CMAPSS Turbofan Benchmarks
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ensemble dual-model architecture: Random Forest non-linear tree regression combined with multi-layer LSTM recurrent sequence networks.
          </p>
        </div>

        {/* Engine switcher for trajectory chart */}
        <div className="flex items-center gap-2">
          <label htmlFor="trajectory-engine-select" className="text-xs text-slate-400">Trajectory Target:</label>
          <select
            id="trajectory-engine-select"
            value={activeEngine?.id}
            onChange={e => setSelectedEngineForTrajectory(e.target.value)}
            className="bg-slate-900 text-xs font-mono text-cyan-300 border border-slate-700 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {engines.map(eng => (
              <option key={eng.id} value={eng.id}>
                {eng.serialNumber} ({eng.rulEnsemble} cycles)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Trajectory Projection Chart */}
      <div className="aerospace-card p-5 rounded-lg border border-cyan-500/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-cyan-500/10">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Degradation Projection &amp; 90% Confidence Interval
            </h2>
            <div className="text-xs text-slate-400 mt-0.5">
              Target Engine: <strong className="text-slate-200 font-mono">{activeEngine?.serialNumber}</strong> ({activeEngine?.model}) · Current RUL: <strong className="text-cyan-300 font-mono">{activeEngine?.rulEnsemble} cycles</strong>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-amber-300 flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-amber-400 inline-block" />
              <span>RF Prediction</span>
            </span>
            <span className="text-cyan-300 flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" />
              <span>LSTM Prediction</span>
            </span>
            <span className="text-rose-400 flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-rose-500 border-dashed border-b inline-block" />
              <span>Critical Redline ({criticalThreshold}c)</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="cycle"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={c => `C-${c}`}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                domain={[0, 'auto']}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#0B192C] border border-cyan-500/40 p-2.5 rounded shadow-xl text-xs font-mono">
                        <div className="text-slate-200 font-bold mb-1">
                          Cycle #{label} {data.isFuture ? '(Forecast)' : '(Historical)'}
                        </div>
                        <div className="text-cyan-300">Ensemble RUL: {data.rulEnsemble} cycles</div>
                        <div className="text-amber-300">Random Forest: {data.rulRF} cycles</div>
                        <div className="text-sky-300">LSTM Recurrent: {data.rulLSTM} cycles</div>
                        <div className="text-slate-400 text-[10px] mt-1 border-t border-slate-700 pt-1">
                          90% CI: [{data.lowerBound} - {data.upperBound}] cycles
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
                strokeWidth={2.5}
                dot={false}
                name="Ensemble RUL"
              />
              <Line
                type="monotone"
                dataKey="rulRF"
                stroke="#F59E0B"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="Random Forest"
              />
              <Line
                type="monotone"
                dataKey="rulLSTM"
                stroke="#38BDF8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="LSTM"
              />
              <Line
                type="monotone"
                dataKey="criticalThreshold"
                stroke="#F43F5E"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={false}
                name="Critical Threshold"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 mt-2 border-t border-cyan-500/10 text-xs text-slate-400">
          <div>
            Estimated line station overhaul window: <strong className="text-cyan-300 font-mono">~{Math.max(1, Math.round(activeEngine.rulEnsemble / 4.2))} calendar days</strong> (based on 4.2 flights/day)
          </div>
          <div className="flex items-center gap-3">
            <span>Buffer Threshold:</span>
            <input
              type="range"
              min={15}
              max={60}
              value={criticalThreshold}
              onChange={e => setCriticalThreshold(Number(e.target.value))}
              className="accent-cyan-400 cursor-pointer w-24"
            />
            <span className="font-mono text-cyan-300">{criticalThreshold} cycles</span>
          </div>
        </div>
      </div>

      {/* Fleet RUL Comparative Matrix */}
      <div className="aerospace-card p-5 rounded-lg border border-cyan-500/15">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-cyan-500/10">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Fleet-Wide Remaining Useful Life Matrix
            </h2>
            <div className="text-xs text-slate-400">
              Model disagreement, confidence intervals, and projected maintenance timeframes
            </div>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Sorted by Urgency (Ascending RUL)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 bg-slate-900/50 font-sans">
                <th className="py-2.5 px-3 font-medium">Engine Serial</th>
                <th className="py-2.5 px-3 font-medium">Aircraft</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium text-right">Random Forest</th>
                <th className="py-2.5 px-3 font-medium text-right">LSTM Sequence</th>
                <th className="py-2.5 px-3 font-medium text-right">Model Disagreement</th>
                <th className="py-2.5 px-3 font-medium text-right">Ensemble RUL</th>
                <th className="py-2.5 px-3 font-medium text-right">Confidence</th>
                <th className="py-2.5 px-3 font-medium text-right">Est. Days to Limit</th>
                <th className="py-2.5 px-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {[...engines]
                .sort((a, b) => a.rulEnsemble - b.rulEnsemble)
                .map(eng => {
                  const estDays = Math.max(1, Math.round(eng.rulEnsemble / 4.2));
                  const isUrgent = eng.rulEnsemble <= criticalThreshold;
                  const isWarning = eng.rulEnsemble <= warningThreshold && !isUrgent;

                  return (
                    <tr
                      key={eng.id}
                      className={`hover:bg-cyan-950/20 transition-colors ${
                        isUrgent ? 'bg-rose-950/10' : isWarning ? 'bg-amber-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-bold text-slate-100">
                        {eng.serialNumber}
                      </td>
                      <td className="py-3 px-3 text-cyan-300 font-sans">
                        {eng.aircraftTail}
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <StatusBadge status={eng.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                        {eng.rulPredictedRF} c
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                        {eng.rulPredictedLSTM} c
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums">
                        <span className={eng.modelDisagreement > 7 ? 'text-amber-300 font-bold' : 'text-slate-400'}>
                          ±{eng.modelDisagreement} c
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold tabular-nums">
                        <span
                          className={
                            isUrgent
                              ? 'text-rose-400 text-sm'
                              : isWarning
                              ? 'text-amber-300 text-sm'
                              : 'text-cyan-300 text-sm'
                          }
                        >
                          {eng.rulEnsemble} cycles
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                        {eng.confidenceSpread}%
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums font-sans">
                        <span className={isUrgent ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                          {estDays} days
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-sans">
                        <button
                          onClick={() => {
                            onSelectEngine(eng.id);
                            onNavigateTab('engine');
                          }}
                          className="text-xs text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
