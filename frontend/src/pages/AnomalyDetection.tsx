import React, { useState } from 'react';
import { AircraftEngine, AnomalyEvent } from '../types/aerospace';
import { StatusBadge } from '../components/common/StatusBadge';
import { apiService } from '../services/api';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  FileText,
  Sliders,
  Filter,
  Activity,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface AnomalyDetectionProps {
  engines: AircraftEngine[];
  anomalies: AnomalyEvent[];
  onAcknowledge: (eventId: string) => void;
  onSelectEngine: (engineId: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export const AnomalyDetection: React.FC<AnomalyDetectionProps> = ({
  engines,
  anomalies,
  onAcknowledge,
  onSelectEngine,
  onNavigateTab,
}) => {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'Critical' | 'High' | 'Medium' | 'Low'>('ALL');
  const [showAcknowledged, setShowAcknowledged] = useState<boolean>(true);

  const filteredEvents = anomalies.filter(ev => {
    const matchesSev = severityFilter === 'ALL' || ev.severity === severityFilter;
    const matchesAck = showAcknowledged ? true : !ev.acknowledged;
    return matchesSev && matchesAck;
  });

  const criticalEvents = anomalies.filter(a => a.severity === 'Critical' && !a.acknowledged);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/10">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>Multivariate Anomaly Detection Console</span>
            <span className="text-xs font-mono text-rose-400 font-normal">
              Deep Autoencoder &amp; Isolation Forest
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Detects subtle multidimensional sensor coupling deviations across turbine thermodynamic parameters before single-channel redlines are breached.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono">Unresolved Critical Alerts:</span>
          <span className="px-2.5 py-1 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold font-mono">
            {criticalEvents.length} Active
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="aerospace-card p-4 rounded-lg">
          <span className="text-xs text-slate-400">Total Anomaly Events</span>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-1 tabular-nums">
            {anomalies.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Logged across last 72 hours</div>
        </div>

        <div className="aerospace-card p-4 rounded-lg">
          <span className="text-xs text-slate-400">Unacknowledged Warnings</span>
          <div className="text-2xl font-bold text-amber-300 font-mono mt-1 tabular-nums">
            {anomalies.filter(a => !a.acknowledged).length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting chief engineer review</div>
        </div>

        <div className="aerospace-card p-4 rounded-lg">
          <span className="text-xs text-slate-400">Autoencoder Threshold</span>
          <div className="text-2xl font-bold text-cyan-300 font-mono mt-1 tabular-nums">
            0.65
          </div>
          <div className="text-[11px] text-slate-400 mt-1">99th percentile baseline limit</div>
        </div>

        <div className="aerospace-card p-4 rounded-lg">
          <span className="text-xs text-slate-400">False Positive Rate</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1 tabular-nums">
            0.42%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Validated on CMAPSS FD001-FD004</div>
        </div>
      </div>

      {/* Filter and Feed Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['ALL', 'Critical', 'High', 'Medium', 'Low'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                severityFilter === sev
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {sev === 'ALL' ? 'All Severities' : `${sev} Severity`}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={showAcknowledged}
            onChange={e => setShowAcknowledged(e.target.checked)}
            className="rounded border-slate-700 text-cyan-400 focus:ring-0 accent-cyan-400"
          />
          <span>Include Acknowledged Events</span>
        </label>
      </div>

      {/* Anomaly Events Feed */}
      <div className="space-y-3">
        {filteredEvents.map(event => {
          const isCritical = event.severity === 'Critical';
          const isHigh = event.severity === 'High';
          const isMedium = event.severity === 'Medium';

          const borderStyle = isCritical
            ? 'border-rose-500/40 bg-rose-950/10'
            : isHigh
            ? 'border-amber-500/40 bg-amber-950/10'
            : 'border-slate-800 bg-slate-900/40';

          return (
            <div
              key={event.id}
              className={`aerospace-card p-4 rounded-lg border ${borderStyle} transition-all hover:border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      isCritical
                        ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                        : isHigh
                        ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                        : isMedium
                        ? 'bg-sky-950/60 text-sky-300 border-sky-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {event.severity.toUpperCase()}
                  </span>

                  <span className="text-xs font-mono font-bold text-slate-200">
                    {event.engineSerial}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    · Aircraft {event.aircraftTail}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    · {event.timestamp}
                  </span>
                </div>

                <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <span>{event.anomalyType}</span>
                  <span className="text-xs font-mono text-cyan-300 font-normal">
                    (Reconstruction Error: {event.score.toFixed(2)})
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {event.notes}
                </p>

                {/* Triggering Sensors */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono">
                  <span className="text-slate-400">Triggering Channels:</span>
                  {event.triggeringSensors.map(sen => (
                    <span
                      key={sen}
                      className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-cyan-300"
                    >
                      {sen}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {!event.acknowledged ? (
                  <button
                    onClick={() => onAcknowledge(event.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 rounded transition-colors cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Acknowledge</span>
                  </button>
                ) : (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 px-2 py-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Acknowledged</span>
                  </span>
                )}

                <button
                  onClick={() => {
                    onSelectEngine(event.engineId);
                    onNavigateTab('reports');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 rounded transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Create Work Order</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
