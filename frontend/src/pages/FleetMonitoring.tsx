import React, { useState, useMemo } from 'react';
import { AircraftEngine, EngineStatus } from '../types/aerospace';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Search,
  Filter,
  Plane,
  ChevronRight,
  Gauge,
  Layers,
  Sparkles,
  ArrowUpDown,
  AlertTriangle,
} from 'lucide-react';

interface FleetMonitoringProps {
  engines: AircraftEngine[];
  onSelectEngine: (engineId: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export const FleetMonitoring: React.FC<FleetMonitoringProps> = ({
  engines,
  onSelectEngine,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | EngineStatus>('ALL');
  const [viewMode, setViewMode] = useState<'aircraft' | 'table'>('aircraft');

  // Group engines by aircraft
  const aircraftGroups = useMemo(() => {
    const map = new Map<string, { tail: string; type: string; operator: string; engines: AircraftEngine[] }>();
    engines.forEach(eng => {
      if (!map.has(eng.aircraftTail)) {
        map.set(eng.aircraftTail, {
          tail: eng.aircraftTail,
          type: eng.aircraftType,
          operator: eng.operator,
          engines: [],
        });
      }
      map.get(eng.aircraftTail)!.engines.push(eng);
    });
    return Array.from(map.values());
  }, [engines]);

  // Filtered engines
  const filteredEngines = useMemo(() => {
    return engines.filter(eng => {
      const matchesSearch =
        eng.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eng.aircraftTail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eng.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eng.operator.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || eng.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [engines, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/10">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>Fleet Turbofan Monitoring</span>
            <span className="text-xs font-mono text-cyan-400 font-normal">
              ({filteredEngines.length} of {engines.length} Units)
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global commercial fleet telemetry tracking dual engine pairings, flight cycles, and active degradation metrics.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('aircraft')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              viewMode === 'aircraft'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Aircraft Pairings
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              viewMode === 'table'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Telemetry Grid
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Tail, ESN (e.g. 88214), Model, or Airline..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-sans"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {(['ALL', 'NOMINAL', 'WARNING', 'CRITICAL', 'MAINTENANCE'] as const).map(st => {
            const labelMap = {
              ALL: 'All Engines',
              NOMINAL: 'Nominal',
              WARNING: 'Review Required',
              CRITICAL: 'Critical',
              MAINTENANCE: 'Maintenance',
            };
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {labelMap[st]}
              </button>
            );
          })}
        </div>
      </div>

      {/* View 1: Aircraft Pairings View */}
      {viewMode === 'aircraft' ? (
        <div className="space-y-4">
          {aircraftGroups.map(ac => {
            // Check if any engine in this aircraft matches current filters
            const visibleEngines = ac.engines.filter(e => filteredEngines.some(fe => fe.id === e.id));
            if (visibleEngines.length === 0) return null;

            return (
              <div key={ac.tail} className="aerospace-card p-5 rounded-lg border border-cyan-500/15">
                {/* Aircraft Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-slate-800 flex items-center justify-center text-cyan-400">
                      <Plane className="w-5 h-5 transform -rotate-45" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-100 font-mono tracking-wide">
                          {ac.tail}
                        </span>
                        <span className="text-xs text-slate-400 font-sans">· {ac.type}</span>
                      </div>
                      <div className="text-xs text-slate-400">{ac.operator}</div>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-slate-400">
                    Dual Powerplant Configuration (2x Turbofans)
                  </div>
                </div>

                {/* Engines side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ac.engines.map(eng => (
                    <div
                      key={eng.id}
                      className="p-4 rounded-md bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-semibold text-cyan-300">
                              {eng.position}
                            </span>
                            <span className="text-[11px] text-slate-400">({eng.model})</span>
                          </div>
                          <StatusBadge status={eng.status} size="sm" />
                        </div>

                        <div className="text-sm font-bold text-slate-200 font-mono">
                          {eng.serialNumber}
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/60 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Predicted RUL</span>
                            <span className="font-bold text-cyan-300 font-mono tabular-nums text-sm">
                              {eng.rulEnsemble}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-0.5">cycles</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Anomaly Score</span>
                            <span
                              className={`font-bold font-mono tabular-nums text-sm ${
                                eng.anomalyScore > 0.8
                                  ? 'text-rose-400'
                                  : eng.anomalyScore > 0.6
                                  ? 'text-amber-300'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {eng.anomalyScore.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">EGT Margin</span>
                            <span
                              className={`font-bold font-mono tabular-nums text-sm ${
                                eng.currentEgtMargin < 15 ? 'text-rose-400' : 'text-slate-200'
                              }`}
                            >
                              {eng.currentEgtMargin}°C
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                          <span>Cycles: {eng.operatingCycles.toLocaleString()}</span>
                          <span>Flight Hrs: {eng.flightHours.toLocaleString()}h</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            onSelectEngine(eng.id);
                            onNavigateTab('twin');
                          }}
                          className="text-[11px] text-slate-300 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Layers className="w-3 h-3" />
                          <span>Simulate Twin</span>
                        </button>
                        <button
                          onClick={() => {
                            onSelectEngine(eng.id);
                            onNavigateTab('engine');
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 rounded flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Engine Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View 2: Detailed Telemetry Grid */
        <div className="aerospace-card rounded-lg overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 bg-slate-900/70">
                <th className="py-3 px-4 font-medium">Engine Serial</th>
                <th className="py-3 px-3 font-medium">Aircraft Tail</th>
                <th className="py-3 px-3 font-medium">Model</th>
                <th className="py-3 px-3 font-medium">Position</th>
                <th className="py-3 px-3 font-medium">Status</th>
                <th className="py-3 px-3 font-medium text-right">Cycles</th>
                <th className="py-3 px-3 font-medium text-right">EGT Margin</th>
                <th className="py-3 px-3 font-medium text-right">Anomaly Score</th>
                <th className="py-3 px-3 font-medium text-right">Predicted RUL</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredEngines.map(eng => (
                <tr key={eng.id} className="hover:bg-cyan-950/20 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-100">
                    {eng.serialNumber}
                  </td>
                  <td className="py-3 px-3 text-cyan-300">
                    {eng.aircraftTail}
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-sans">
                    {eng.model}
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-sans">
                    {eng.position}
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <StatusBadge status={eng.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                    {eng.operatingCycles.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    <span className={eng.currentEgtMargin < 15 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                      {eng.currentEgtMargin}°C
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums font-bold">
                    <span
                      className={
                        eng.anomalyScore > 0.8
                          ? 'text-rose-400'
                          : eng.anomalyScore > 0.6
                          ? 'text-amber-300'
                          : 'text-emerald-400'
                      }
                    >
                      {eng.anomalyScore.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-cyan-300 tabular-nums">
                    {eng.rulEnsemble} cycles
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        onSelectEngine(eng.id);
                        onNavigateTab('engine');
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-200 font-sans underline cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
