import React, { useState } from 'react';
import { AircraftEngine, DigitalTwinSimParams, DigitalTwinSimResult } from '../types/aerospace';
import { apiService } from '../services/api';
import {
  Layers,
  RotateCcw,
  Play,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Sliders,
  ChevronRight,
  Info,
} from 'lucide-react';

interface DigitalTwinSimulationProps {
  engines: AircraftEngine[];
  selectedEngineId: string;
  onSelectEngine: (engineId: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export const DigitalTwinSimulation: React.FC<DigitalTwinSimulationProps> = ({
  engines,
  selectedEngineId,
  onSelectEngine,
  onNavigateTab,
}) => {
  const engine = engines.find(e => e.id === selectedEngineId) || engines[0];

  const defaultParams: DigitalTwinSimParams = {
    engineId: engine?.id || '',
    egtAdjustment: 0,
    fanSpeedN1Adjustment: 0,
    coreSpeedN2Adjustment: 0,
    hpcOutletTempT30Adj: 0,
    hpcOutletPressureP30Adj: 0,
    bypassRatioAdj: 0,
    vibrationAdj: 0,
    ambientTemperature: 15,
    flightAltitude: 35000,
  };

  const [params, setParams] = useState<DigitalTwinSimParams>(defaultParams);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<DigitalTwinSimResult | null>(null);

  // Sync engineId when selectedEngineId changes
  React.useEffect(() => {
    if (engine) {
      setParams(prev => ({ ...prev, engineId: engine.id }));
    }
  }, [engine]);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await apiService.runDigitalTwinSimulation(params);
      setSimResult(res);
    } catch {
      // Error handled gracefully
    } finally {
      setIsSimulating(false);
    }
  };

  // Preset scenarios
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'fouling':
        setParams({
          ...params,
          hpcOutletTempT30Adj: 24,
          hpcOutletPressureP30Adj: -8,
          egtAdjustment: 12,
          vibrationAdj: 0.5,
        });
        break;
      case 'thermal_creep':
        setParams({
          ...params,
          egtAdjustment: 32,
          hpcOutletTempT30Adj: 18,
          coreSpeedN2Adjustment: 3,
          vibrationAdj: 0.8,
        });
        break;
      case 'bearing_spall':
        setParams({
          ...params,
          vibrationAdj: 3.2,
          coreSpeedN2Adjustment: 2,
          egtAdjustment: 5,
        });
        break;
      case 'derate_extension':
        setParams({
          ...params,
          egtAdjustment: -18,
          hpcOutletTempT30Adj: -12,
          coreSpeedN2Adjustment: -2,
          vibrationAdj: 0,
        });
        break;
      case 'reset':
      default:
        setParams({
          ...defaultParams,
          engineId: engine?.id || '',
        });
        setSimResult(null);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-lg bg-gradient-to-r from-[#071930] via-[#0D2444] to-[#07111F] border border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Layers className="w-3.5 h-3.5" />
            <span>High-Fidelity Turbofan Aerodynamic Simulator</span>
            <span aria-hidden="true">·</span>
            <span>Digital Twin Sandbox</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1">
            Digital Twin Perturbation &amp; What-If Sandbox
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Simulate mechanical wear, thermodynamic variations, and flight operating envelope stress. Compare original baseline model inferences directly against perturbed digital twin projections.
          </p>
        </div>

        {/* Engine switcher */}
        <div className="flex items-center gap-2">
          <label htmlFor="digital-twin-engine" className="text-xs text-slate-400">Target Engine:</label>
          <select
            id="digital-twin-engine"
            value={engine?.id}
            onChange={e => {
              onSelectEngine(e.target.value);
              setSimResult(null);
            }}
            className="bg-slate-900 text-xs font-mono text-cyan-300 border border-slate-700 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {engines.map(eng => (
              <option key={eng.id} value={eng.id}>
                {eng.serialNumber} ({eng.model})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preset Scenarios Row */}
      <div className="aerospace-card p-4 rounded-lg border border-cyan-500/15">
        <div className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center justify-between">
          <span>Aerospace Simulation Presets</span>
          <span className="text-[11px] font-mono text-slate-400">Pre-calibrated flight conditions</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset('fouling')}
            className="px-3 py-1.5 text-xs font-medium rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
          >
            Compressor Blade Fouling
          </button>
          <button
            onClick={() => applyPreset('thermal_creep')}
            className="px-3 py-1.5 text-xs font-medium rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-rose-300 border border-slate-700 transition-colors cursor-pointer"
          >
            Turbine Thermal Creep
          </button>
          <button
            onClick={() => applyPreset('bearing_spall')}
            className="px-3 py-1.5 text-xs font-medium rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700 transition-colors cursor-pointer"
          >
            Bearing Race Micro-Wear
          </button>
          <button
            onClick={() => applyPreset('derate_extension')}
            className="px-3 py-1.5 text-xs font-medium rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-700 transition-colors cursor-pointer"
          >
            Takeoff 5% Thrust Derate
          </button>
          <button
            onClick={() => applyPreset('reset')}
            className="px-3 py-1.5 text-xs font-medium rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 ml-auto transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Main Sandbox Grid: Sliders on Left (7 cols), Comparison on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Control Panel (7 cols) */}
        <div className="lg:col-span-7 aerospace-card p-5 rounded-lg border border-cyan-500/15 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/10">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Calibrated Sensor Perturbation Sliders
              </h2>
              <div className="text-xs text-slate-400 mt-0.5">
                Adjust physical aerothermal parameters to evaluate degraded or optimized states
              </div>
            </div>
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded transition-all shadow-[0_0_12px_rgba(0,240,255,0.25)] disabled:opacity-50 cursor-pointer"
            >
              <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Computing Twin...' : 'Run Simulation'}</span>
            </button>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Slider 1: EGT */}
            <div className="space-y-1.5 bg-slate-900/40 p-3 rounded border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-sans font-semibold text-slate-200">
                  Exhaust Gas Temp (EGT / T50) Adjustment
                </span>
                <span className={`font-bold ${params.egtAdjustment > 0 ? 'text-rose-400' : params.egtAdjustment < 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {params.egtAdjustment > 0 ? `+${params.egtAdjustment}` : params.egtAdjustment} °C
                </span>
              </div>
              <input
                type="range"
                min={-50}
                max={50}
                step={2}
                value={params.egtAdjustment}
                onChange={e => setParams({ ...params, egtAdjustment: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>-50°C (Overcooled / Derated)</span>
                <span>0 (Nominal Flight Cruise)</span>
                <span>+50°C (Severe Thermal Stress)</span>
              </div>
            </div>

            {/* Slider 2: HPC Outlet Temp T30 */}
            <div className="space-y-1.5 bg-slate-900/40 p-3 rounded border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-sans font-semibold text-slate-200">
                  HPC Discharge Temp (T30) Adjustment
                </span>
                <span className={`font-bold ${params.hpcOutletTempT30Adj > 0 ? 'text-amber-300' : 'text-slate-300'}`}>
                  {params.hpcOutletTempT30Adj > 0 ? `+${params.hpcOutletTempT30Adj}` : params.hpcOutletTempT30Adj} °R
                </span>
              </div>
              <input
                type="range"
                min={-40}
                max={40}
                step={2}
                value={params.hpcOutletTempT30Adj}
                onChange={e => setParams({ ...params, hpcOutletTempT30Adj: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>-40 °R (Clean Compressor)</span>
                <span>0 °R</span>
                <span>+40 °R (Interstage Seal Bleed)</span>
              </div>
            </div>

            {/* Slider 3: HPC Outlet Pressure P30 */}
            <div className="space-y-1.5 bg-slate-900/40 p-3 rounded border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-sans font-semibold text-slate-200">
                  HPC Exit Pressure (P30) Deviation
                </span>
                <span className={`font-bold ${params.hpcOutletPressureP30Adj < 0 ? 'text-amber-300' : 'text-slate-300'}`}>
                  {params.hpcOutletPressureP30Adj > 0 ? `+${params.hpcOutletPressureP30Adj}` : params.hpcOutletPressureP30Adj} %
                </span>
              </div>
              <input
                type="range"
                min={-15}
                max={15}
                step={1}
                value={params.hpcOutletPressureP30Adj}
                onChange={e => setParams({ ...params, hpcOutletPressureP30Adj: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>-15% (Erosion / Fouling)</span>
                <span>0% Nominal</span>
                <span>+15% Peak Boost</span>
              </div>
            </div>

            {/* Slider 4: Center Bearing Vibration */}
            <div className="space-y-1.5 bg-slate-900/40 p-3 rounded border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-sans font-semibold text-slate-200">
                  Shaft Vibration Amplitude Excursion
                </span>
                <span className={`font-bold ${params.vibrationAdj > 1.5 ? 'text-rose-400' : 'text-slate-300'}`}>
                  +{params.vibrationAdj.toFixed(1)} mm/s
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.1}
                value={params.vibrationAdj}
                onChange={e => setParams({ ...params, vibrationAdj: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 mm/s (Dynamic Balance)</span>
                <span>2.5 mm/s (Alert Limit)</span>
                <span>5.0 mm/s (Mandatory Shutdown)</span>
              </div>
            </div>

            {/* Core & Fan Speed sliders row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-900/40 p-3 rounded border border-slate-800 space-y-1">
                <div className="flex justify-between font-sans text-xs">
                  <span className="text-slate-300">Core Spool Speed N2</span>
                  <span className="font-mono text-cyan-300">
                    {params.coreSpeedN2Adjustment > 0 ? `+${params.coreSpeedN2Adjustment}%` : `${params.coreSpeedN2Adjustment}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={-10}
                  max={10}
                  step={1}
                  value={params.coreSpeedN2Adjustment}
                  onChange={e => setParams({ ...params, coreSpeedN2Adjustment: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="bg-slate-900/40 p-3 rounded border border-slate-800 space-y-1">
                <div className="flex justify-between font-sans text-xs">
                  <span className="text-slate-300">Fan Spool Speed N1</span>
                  <span className="font-mono text-cyan-300">
                    {params.fanSpeedN1Adjustment > 0 ? `+${params.fanSpeedN1Adjustment}%` : `${params.fanSpeedN1Adjustment}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={-10}
                  max={10}
                  step={1}
                  value={params.fanSpeedN1Adjustment}
                  onChange={e => setParams({ ...params, fanSpeedN1Adjustment: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Comparative Output Panel (5 cols) */}
        <div className="lg:col-span-5 aerospace-card p-5 rounded-lg border border-cyan-500/15 flex flex-col justify-between space-y-4">
          <div>
            <div className="pb-3 border-b border-cyan-500/10">
              <h2 className="text-sm font-semibold text-slate-100">
                Digital Twin Model Output Comparison
              </h2>
              <div className="text-xs text-slate-400 mt-0.5">
                Baseline vs Projected Model Inferences
              </div>
            </div>

            {simResult ? (
              <div className="space-y-4 mt-4">
                {/* RUL Comparison Box */}
                <div className="bg-slate-900/70 p-4 rounded-lg border border-cyan-500/20">
                  <span className="text-xs text-slate-400 block mb-2">Remaining Useful Life (RUL)</span>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-mono block">Original Baseline</span>
                      <span className="text-2xl font-bold text-slate-200 font-mono tabular-nums">
                        {simResult.originalRul}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">cycles</span>
                    </div>

                    <div className="p-2.5 rounded bg-cyan-950/30 border border-cyan-500/30">
                      <span className="text-[10px] text-cyan-400 font-mono block">Simulated Output</span>
                      <span className="text-2xl font-bold text-cyan-200 font-mono tabular-nums">
                        {simResult.simulatedRul}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono block">cycles</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 text-xs flex items-center justify-between font-mono">
                    <span className="text-slate-400 font-sans">Projected RUL Delta:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-xs ${
                        simResult.rulDelta < 0
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                          : simResult.rulDelta > 0
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {simResult.rulDelta > 0 ? `+${simResult.rulDelta}` : simResult.rulDelta} cycles
                    </span>
                  </div>
                </div>

                {/* Anomaly Score Comparison */}
                <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans">Multivariate Anomaly Score:</span>
                    <div className="font-mono flex items-center gap-2">
                      <span className="text-slate-400">{simResult.originalAnomalyScore.toFixed(2)}</span>
                      <span className="text-cyan-400">→</span>
                      <span
                        className={`font-bold ${
                          simResult.simulatedAnomalyScore > 0.8
                            ? 'text-rose-400'
                            : simResult.simulatedAnomalyScore > 0.6
                            ? 'text-amber-300'
                            : 'text-emerald-400'
                        }`}
                      >
                        {simResult.simulatedAnomalyScore.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subsystem Health Impact */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-slate-400 font-semibold block text-[11px]">Subsystem Stress Projection:</span>
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    {Object.entries(simResult.subsystemRisks).map(([sub, risk]) => (
                      <div key={sub} className="p-2 rounded bg-slate-900/60 border border-slate-800">
                        <span className="uppercase text-[10px] text-slate-400 block">{sub}</span>
                        <span
                          className={`font-bold text-[11px] ${
                            risk === 'Nominal'
                              ? 'text-emerald-400'
                              : risk === 'Moderate Stress'
                              ? 'text-amber-300'
                              : 'text-rose-400'
                          }`}
                        >
                          {risk}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Engineering Recommendations */}
                <div className="p-3 rounded bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-1.5">
                  <span className="font-bold text-cyan-300 block">Aerospace Model Recommendations:</span>
                  <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                    {simResult.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-12 px-4 text-center text-slate-400 text-xs space-y-3">
                <Layers className="w-8 h-8 text-cyan-400/40 mx-auto" />
                <p>
                  No simulation executed yet for this parameter set. Adjust any sensor slider on the left and click <strong>Run Simulation</strong> to compute the digital twin comparison.
                </p>
                <button
                  onClick={handleRunSimulation}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-cyan-400 rounded hover:bg-cyan-300 transition-colors cursor-pointer"
                >
                  Run Baseline Simulation
                </button>
              </div>
            )}
          </div>

          {simResult && (
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Timestamp: {simResult.timestamp.substring(11, 19)} UTC</span>
              <button
                onClick={() => onNavigateTab('copilot')}
                className="text-cyan-400 hover:text-cyan-200 underline font-sans flex items-center gap-1 cursor-pointer"
              >
                <span>Ask Copilot about this result</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
