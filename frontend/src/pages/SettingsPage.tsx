import React, { useState, useEffect } from 'react';
import { apiService, BackendStatus } from '../services/api';
import {
  Settings,
  Database,
  Server,
  Activity,
  Sliders,
  CheckCircle,
  AlertTriangle,
  RotateCw,
  Cpu,
  Layers,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [apiUrl, setApiUrl] = useState<string>(apiService.getBaseUrl());
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [pollingRate, setPollingRate] = useState<number>(5);
  const [datasetProfile, setDatasetProfile] = useState<string>('FD001');
  const [egtThreshold, setEgtThreshold] = useState<number>(18);
  const [anomalyThreshold, setAnomalyThreshold] = useState<number>(0.65);
  const [disagreementThreshold, setDisagreementThreshold] = useState<number>(8);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const testConnection = async () => {
    setIsChecking(true);
    try {
      apiService.setBaseUrl(apiUrl);
      const res = await apiService.checkBackendHealth();
      setBackendStatus(res);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    apiService.setBaseUrl(apiUrl);
    setSaveToast('Aerospace system configuration and telemetry thresholds updated.');
    setTimeout(() => setSaveToast(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/10">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>AeroGuard Platform Configuration &amp; Backend Telemetry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure Google Antigravity FastAPI service connection, CMAPSS dataset models, and threshold sensitivities.
          </p>
        </div>

        {/* Status chip */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Stream Status:</span>
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-cyan-500/30 text-cyan-300 font-bold">
            {backendStatus?.mode || 'Demo Telemetry Stream'}
          </span>
        </div>
      </div>

      {saveToast && (
        <div className="p-3 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Backend Integration Panel */}
      <div className="aerospace-card p-5 rounded-lg border border-cyan-500/15 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/10">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Google Antigravity FastAPI Backend Service
              </h2>
              <div className="text-xs text-slate-400">
                Target endpoint specified via <code className="text-cyan-300">VITE_API_URL</code>
              </div>
            </div>
          </div>

          <span
            className={`text-xs font-mono font-medium px-2 py-0.5 rounded border ${
              backendStatus?.isConnected
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-950/50 text-amber-300 border-amber-500/40'
            }`}
          >
            {backendStatus?.isConnected ? 'FastAPI Connected' : 'Demo Telemetry Active'}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label htmlFor="fastapi-base-url" className="block text-slate-300 font-medium mb-1">
              API Base URL (e.g. <code className="text-slate-400">https://antigravity-fastapi-service.run.app</code> or <code className="text-slate-400">http://localhost:8000</code>)
            </label>
            <div className="flex gap-2">
              <input
                id="fastapi-base-url"
                type="text"
                value={apiUrl}
                onChange={e => setApiUrl(e.target.value)}
                placeholder="Leave blank to use integrated NASA CMAPSS high-fidelity demo simulator"
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={testConnection}
                disabled={isChecking}
                className="px-4 py-2 font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>
          </div>

          {backendStatus && (
            <div className="p-3 rounded bg-slate-900/60 border border-slate-800 space-y-1 font-mono text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Resolved Endpoint:</span>
                <span className="text-slate-200">{backendStatus.url}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Network Ping:</span>
                <span className="text-cyan-300">{backendStatus.latencyMs}ms</span>
              </div>
              <div className="text-slate-300 font-sans pt-1 border-t border-slate-800/80">
                {backendStatus.message}
              </div>
            </div>
          )}

          <div className="p-3 rounded bg-cyan-950/20 border border-cyan-500/20 text-slate-300 text-[11px] leading-relaxed">
            <strong className="text-cyan-300">Architecture Notice:</strong> The Python FastAPI backend in Antigravity runs ML inference pipelines (Random Forest, PyTorch LSTM, TreeSHAP). AeroGuard AI automatically falls back to integrated NASA CMAPSS turbofan demo data whenever the backend URL is offline or unconfigured.
          </div>
        </div>
      </div>

      {/* Dataset & Polling Configuration */}
      <form onSubmit={handleSavePreferences} className="space-y-6">
        <div className="aerospace-card p-5 rounded-lg border border-cyan-500/15 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-cyan-500/10">
            <Database className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                NASA CMAPSS Turbofan Dataset Calibration
              </h2>
              <div className="text-xs text-slate-400">
                Select baseline operating regime and degradation profiles
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label htmlFor="cmapss-dataset-profile" className="block text-slate-300 font-medium mb-1">CMAPSS Dataset Profile</label>
              <select
                id="cmapss-dataset-profile"
                value={datasetProfile}
                onChange={e => setDatasetProfile(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="FD001">FD001 · Single Operating Condition (HPC Degradation)</option>
                <option value="FD002">FD002 · Six Operating Conditions (HPC Degradation)</option>
                <option value="FD003">FD003 · Single Condition (HPC + Fan Degradation)</option>
                <option value="FD004">FD004 · Complex Flight Envelope (HPC + Combustor)</option>
              </select>
            </div>

            <div>
              <label htmlFor="telemetry-polling-interval" className="block text-slate-300 font-medium mb-1">Telemetry Polling Interval</label>
              <select
                id="telemetry-polling-interval"
                value={pollingRate}
                onChange={e => setPollingRate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value={1}>1 Second (Live High-Rate ACARS)</option>
                <option value={5}>5 Seconds (Standard Telemetry Polling)</option>
                <option value={10}>10 Seconds (Bandwidth Conservative)</option>
                <option value={30}>30 Seconds (Low Latency Satellite Link)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Anomaly & Alert Sensitivity Thresholds */}
        <div className="aerospace-card p-5 rounded-lg border border-cyan-500/15 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-cyan-500/10">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Aerospace Alert Sensitivity Thresholds
              </h2>
              <div className="text-xs text-slate-400">
                Calibrate early warning notification triggers
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Slider 1: EGT Margin */}
            <div className="bg-slate-900/40 p-3 rounded border border-slate-800 space-y-1.5">
              <div className="flex justify-between font-sans">
                <span className="text-slate-200 font-medium">EGT Redline Margin Warning Level</span>
                <span className="font-mono text-cyan-300 font-bold">&lt; {egtThreshold}°C</span>
              </div>
              <input
                type="range"
                min={10}
                max={30}
                value={egtThreshold}
                onChange={e => setEgtThreshold(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-sans">
                <span>10°C (Permissive)</span>
                <span>20°C (Standard Line Airline Policy)</span>
                <span>30°C (Conservative / ETOPs)</span>
              </div>
            </div>

            {/* Slider 2: Anomaly Threshold */}
            <div className="bg-slate-900/40 p-3 rounded border border-slate-800 space-y-1.5">
              <div className="flex justify-between font-sans">
                <span className="text-slate-200 font-medium">Multivariate Anomaly Score Limit</span>
                <span className="font-mono text-cyan-300 font-bold">&gt; {anomalyThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={0.9}
                step={0.05}
                value={anomalyThreshold}
                onChange={e => setAnomalyThreshold(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-sans">
                <span>0.50 (High Sensitivity)</span>
                <span>0.65 (Balanced Autoencoder Threshold)</span>
                <span>0.90 (Critical Outliers Only)</span>
              </div>
            </div>

            {/* Slider 3: Model Disagreement */}
            <div className="bg-slate-900/40 p-3 rounded border border-slate-800 space-y-1.5">
              <div className="flex justify-between font-sans">
                <span className="text-slate-200 font-medium">Random Forest vs LSTM Disagreement Flag</span>
                <span className="font-mono text-amber-300 font-bold">&gt; {disagreementThreshold} Cycles</span>
              </div>
              <input
                type="range"
                min={4}
                max={20}
                value={disagreementThreshold}
                onChange={e => setDisagreementThreshold(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded transition-all shadow-[0_0_12px_rgba(0,240,255,0.25)] cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
