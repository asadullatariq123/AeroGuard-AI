import React from 'react';
import { Plane, Activity, ShieldCheck, Database, RefreshCw, Cpu } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tabId: string) => void;
  isDemoMode: boolean;
  onTriggerScan: () => void;
  isScanning: boolean;
  selectedEngineSerial?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  isDemoMode,
  onTriggerScan,
  isScanning,
  selectedEngineSerial,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#07111F]/90 backdrop-blur-md border-b border-cyan-500/15">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, single line */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange('overview')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
          >
            <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Plane className="w-4 h-4 text-slate-950 transform -rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-wider text-slate-100 flex items-center gap-1.5">
                AEROGUARD <span className="text-cyan-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-tight hidden sm:block">
                Predict · Detect · Explain · Prevent
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Primary nav shortcuts (single line, whitespace-nowrap) */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-300">
          <button
            onClick={() => onTabChange('overview')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'overview'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onTabChange('fleet')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'fleet'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
            }`}
          >
            Fleet
          </button>
          <button
            onClick={() => onTabChange('rul')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'rul'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
            }`}
          >
            RUL Predictions
          </button>
          <button
            onClick={() => onTabChange('anomaly')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'anomaly'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
            }`}
          >
            Anomalies
          </button>
          <button
            onClick={() => onTabChange('agents')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'agents'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
            }`}
          >
            AI Agents
          </button>
          <button
            onClick={() => onTabChange('twin')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'twin'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
            }`}
          >
            Digital Twin
          </button>
          <button
            onClick={() => onTabChange('copilot')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'copilot'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
            }`}
          >
            Copilot
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Backend stream indicator */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Clearly marked Demo Data indicator */}
          <button
            onClick={() => onTabChange('settings')}
            title="Configure FastAPI backend or inspect simulation stream"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:border-cyan-500/40 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isDemoMode ? 'Demo Telemetry Stream' : 'FastAPI Connected'}</span>
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onTriggerScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 rounded hover:from-cyan-300 hover:to-cyan-200 transition-all shadow-[0_0_12px_rgba(0,240,255,0.25)] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-950 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning Telemetry...' : 'Run Fleet Diagnostics'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
