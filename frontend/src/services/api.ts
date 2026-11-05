/**
 * AeroGuard AI - Aerospace Telemetry & Prediction API Service
 * 
 * Notice: This service connects to the external Python FastAPI backend
 * running in Google Antigravity via the VITE_API_URL environment variable.
 * When VITE_API_URL is unset or offline, it provides seamless high-fidelity
 * NASA CMAPSS aerospace simulation demo data.
 */

import {
  AircraftEngine,
  AIAgent,
  AnomalyEvent,
  DigitalTwinSimParams,
  DigitalTwinSimResult,
  MaintenanceReport,
  CycleTelemetryPoint,
} from '../types/aerospace';
import {
  MOCK_ENGINES,
  MOCK_AI_AGENTS,
  MOCK_ANOMALY_EVENTS,
  MOCK_MAINTENANCE_REPORTS,
} from '../data/mockAerospaceData';

export const API_BASE_URL: string = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '';

export interface BackendStatus {
  isConfigured: boolean;
  isConnected: boolean;
  url: string;
  latencyMs: number;
  mode: 'FastAPI Live' | 'Aerospace Telemetry Simulator (Demo)';
  message: string;
}

class AeroGuardApiService {
  private baseUrl: string;
  private isDemoMode: boolean;
  private cachedEngines: AircraftEngine[];
  private cachedAgents: AIAgent[];
  private cachedReports: MaintenanceReport[];
  private cachedAnomalies: AnomalyEvent[];

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.isDemoMode = !this.baseUrl;
    this.cachedEngines = [...MOCK_ENGINES];
    this.cachedAgents = [...MOCK_AI_AGENTS];
    this.cachedReports = [...MOCK_MAINTENANCE_REPORTS];
    this.cachedAnomalies = [...MOCK_ANOMALY_EVENTS];
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.trim();
    this.isDemoMode = !this.baseUrl;
  }

  public isUsingDemoData(): boolean {
    return this.isDemoMode;
  }

  public async checkBackendHealth(): Promise<BackendStatus> {
    if (!this.baseUrl) {
      return {
        isConfigured: false,
        isConnected: false,
        url: 'None (VITE_API_URL unset)',
        latencyMs: 0,
        mode: 'Aerospace Telemetry Simulator (Demo)',
        message: 'No VITE_API_URL configured. Serving high-fidelity CMAPSS turbofan demo telemetry.',
      };
    }

    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeoutId);

      const latencyMs = Math.round(performance.now() - start);

      if (res.ok) {
        this.isDemoMode = false;
        return {
          isConfigured: true,
          isConnected: true,
          url: this.baseUrl,
          latencyMs,
          mode: 'FastAPI Live',
          message: `Connected to Antigravity FastAPI service (${latencyMs}ms latency).`,
        };
      } else {
        this.isDemoMode = true;
        return {
          isConfigured: true,
          isConnected: false,
          url: this.baseUrl,
          latencyMs,
          mode: 'Aerospace Telemetry Simulator (Demo)',
          message: `Backend returned HTTP status ${res.status}. Falling back to demo data.`,
        };
      }
    } catch (err: unknown) {
      this.isDemoMode = true;
      const latencyMs = Math.round(performance.now() - start);
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        isConfigured: true,
        isConnected: false,
        url: this.baseUrl,
        latencyMs,
        mode: 'Aerospace Telemetry Simulator (Demo)',
        message: `Connection unreachable (${errMsg}). Falling back to demo data.`,
      };
    }
  }

  // --- Fleet & Engines ---

  public async getFleetOverview(): Promise<AircraftEngine[]> {
    if (this.baseUrl && !this.isDemoMode) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/fleet`, { headers: { 'Accept': 'application/json' } });
        if (res.ok) return await res.json();
      } catch {
        // Fallback to cached demo data
      }
    }
    await this.simulateLatency(120);
    return [...this.cachedEngines];
  }

  public async getEngineById(engineId: string): Promise<AircraftEngine | null> {
    if (this.baseUrl && !this.isDemoMode) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/engines/${engineId}`);
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }
    await this.simulateLatency(80);
    const found = this.cachedEngines.find(e => e.id === engineId);
    return found ? { ...found } : null;
  }

  public async getEngineDegradation(engineId: string): Promise<CycleTelemetryPoint[]> {
    if (this.baseUrl && !this.isDemoMode) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/engines/${engineId}/degradation`);
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }
    await this.simulateLatency(100);
    const engine = this.cachedEngines.find(e => e.id === engineId);
    return engine ? [...engine.degradationHistory] : [];
  }

  // --- AI Agent Command Centre ---

  public async getAIAgents(): Promise<AIAgent[]> {
    if (this.baseUrl && !this.isDemoMode) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/agents`);
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }
    await this.simulateLatency(90);
    return [...this.cachedAgents];
  }

  public async triggerAgentRun(agentId: string): Promise<AIAgent> {
    if (this.baseUrl && !this.isDemoMode) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/agents/${agentId}/run`, { method: 'POST' });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }

    // Demo simulation of agent execution
    await this.simulateLatency(400);
    const agentIdx = this.cachedAgents.findIndex(a => a.id === agentId);
    if (agentIdx >= 0) {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      const timeShort = now.substring(11, 19);

      const target = { ...this.cachedAgents[agentIdx] };
      target.state = 'Running';
      target.progressPercent = 35;
      target.lastExecutionTime = now;
      target.logs.push({
        timestamp: timeShort,
        level: 'info',
        message: `Agent execution triggered by operator. Target telemetry stream connected.`,
      });

      this.cachedAgents[agentIdx] = target;

      // Automatically transition to Completed after 1.5 seconds in memory
      setTimeout(() => {
        target.state = 'Completed';
        target.progressPercent = 100;
        target.logs.push({
          timestamp: new Date().toISOString().substring(11, 19),
          level: 'success',
          message: `Inference pipeline completed with 0 errors. Diagnostics updated.`,
        });
      }, 1500);

      return target;
    }
    throw new Error(`Agent with id ${agentId} not found.`);
  }

  public async triggerFullPipeline(): Promise<AIAgent[]> {
    if (this.baseUrl && !this.isDemoMode) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/agents/pipeline/run`, { method: 'POST' });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }

    await this.simulateLatency(300);
    const timestamp = new Date().toISOString().substring(11, 19);
    this.cachedAgents = this.cachedAgents.map(a => ({
      ...a,
      state: 'Running',
      progressPercent: Math.floor(Math.random() * 40) + 30,
      logs: [
        ...a.logs,
        {
          timestamp,
          level: 'info',
          message: `Full automated pipeline sweep re-initiated for fleet turbofan telemetry.`,
        },
      ],
    }));

    setTimeout(() => {
      this.cachedAgents = this.cachedAgents.map(a => ({
        ...a,
        state: 'Completed',
        progressPercent: 100,
      }));
    }, 2000);

    return [...this.cachedAgents];
  }

  // --- Digital Twin Simulation ---

  public async runDigitalTwinSimulation(params: DigitalTwinSimParams): Promise<DigitalTwinSimResult> {
    if (this.baseUrl && !this.isDemoMode) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/digital-twin/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }

    await this.simulateLatency(450);

    const engine = this.cachedEngines.find(e => e.id === params.engineId) || this.cachedEngines[0];
    const originalRul = engine.rulEnsemble;
    const originalAnomaly = engine.anomalyScore;

    // Aerospace physics estimation of sensor perturbation effects:
    // Higher EGT (+ deg) significantly degrades RUL
    const egtImpact = (params.egtAdjustment / 10) * -4.2;
    // Core speed N2 over nominal increases centrifugal blade stress
    const n2Impact = (params.coreSpeedN2Adjustment / 2) * -3.1;
    // Vibration spike accelerates bearing fatigue
    const vibImpact = params.vibrationAdj * -7.5;
    // HPC outlet temp T30 degradation
    const t30Impact = (params.hpcOutletTempT30Adj / 10) * -3.8;
    // HPC pressure loss
    const p30Impact = (params.hpcOutletPressureP30Adj / 5) * 2.5;

    const totalRulDelta = Math.round(egtImpact + n2Impact + vibImpact + t30Impact + p30Impact);
    const simulatedRul = Math.max(2, originalRul + totalRulDelta);

    const simulatedAnomalyScore = Math.min(
      0.99,
      Math.max(
        0.05,
        Number((originalAnomaly + (params.vibrationAdj * 0.08) + (params.egtAdjustment * 0.004) - (p30Impact * 0.005)).toFixed(3))
      )
    );

    const stressFactor = Number((1.0 + Math.abs(totalRulDelta) / 30).toFixed(2));
    const egtRedlineCycleEstimate = Math.max(5, Math.round(simulatedRul * 0.72));

    const subsystemRisks: DigitalTwinSimResult['subsystemRisks'] = {
      hpc: params.hpcOutletTempT30Adj > 15 || params.hpcOutletPressureP30Adj < -5 ? 'High Wear' : 'Nominal',
      combustor: params.egtAdjustment > 20 ? 'Moderate Stress' : 'Nominal',
      hpt: params.egtAdjustment > 30 ? 'Severe Degradation' : params.egtAdjustment > 15 ? 'Moderate Stress' : 'Nominal',
      bearings: params.vibrationAdj > 2.0 ? 'High Wear' : 'Nominal',
    };

    const recommendations: string[] = [];
    if (simulatedRul < originalRul) {
      recommendations.push(
        `Simulation projects a ${Math.abs(totalRulDelta)} cycle reduction in Remaining Useful Life.`
      );
    } else {
      recommendations.push(
        `Simulation projects a ${totalRulDelta} cycle life extension under optimized parameters.`
      );
    }
    if (params.vibrationAdj > 1.5) {
      recommendations.push(
        `Center bearing vibration exceeds ISO 10816-4 limits; schedule borescope and oil scavenge debris check.`
      );
    }
    if (params.egtAdjustment > 20) {
      recommendations.push(
        `EGT margin falls into the caution zone (<15°C); recommend 5% takeoff thrust derate to preserve hot section.`
      );
    }
    if (recommendations.length === 1) {
      recommendations.push(`Turbofan aerothermal operating envelope remains within certified FAA Part 33 limits.`);
    }

    return {
      engineId: engine.id,
      timestamp: new Date().toISOString(),
      originalRul,
      simulatedRul,
      rulDelta: totalRulDelta,
      originalAnomalyScore: originalAnomaly,
      simulatedAnomalyScore,
      anomalyScoreDelta: Number((simulatedAnomalyScore - originalAnomaly).toFixed(3)),
      projectedStressFactor: stressFactor,
      egtRedlineCycleEstimate,
      subsystemRisks,
      recommendations,
    };
  }

  // --- AeroGuard AI Copilot ---

  public async queryCopilot(
    query: string,
    engineContext?: AircraftEngine
  ): Promise<{ answer: string; references: string[]; suggestedActions: string[] }> {
    if (this.baseUrl && !this.isDemoMode) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/copilot/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, engineId: engineContext?.id }),
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }

    await this.simulateLatency(600);

    const q = query.toLowerCase();
    const eng = engineContext || this.cachedEngines[0];

    if (q.includes('rul') || q.includes('remaining') || q.includes('cycles')) {
      return {
        answer: `For **${eng.serialNumber} (${eng.model})** mounted on **${eng.aircraftTail}**, the ensemble Remaining Useful Life is **${eng.rulEnsemble} flight cycles**.
        
The Random Forest model predicts **${eng.rulPredictedRF} cycles** while the bidirectional LSTM predicts **${eng.rulPredictedLSTM} cycles** (Model disagreement: **${eng.modelDisagreement} cycles**).
The degradation trend is principally governed by continuous HPC Stage 8-10 clearance degradation and EGT margin depletion (current margin: **${eng.currentEgtMargin}°C**). At an average flight utilization of 4.2 cycles/day, this engine will cross the mandatory line station inspection limit in approximately **10 calendar days**.`,
        references: [
          'NASA CMAPSS Dataset FD001 Turbofan Degradation Curve',
          'Rolls-Royce / CFM LEAP AMM Chapter 72-00 Engine Trend Monitoring',
          'FAA Advisory Circular AC 120-113: Flight Data Monitoring Programs',
        ],
        suggestedActions: [
          'Generate ATA 72 Borescope Work Order',
          'Run Digital Twin what-if simulation with 5% thrust derate',
          'Review SHAP waterfall feature attribution',
        ],
      };
    }

    if (q.includes('egt') || q.includes('temperature') || q.includes('heat') || q.includes('thermal')) {
      return {
        answer: `EGT (Exhaust Gas Temperature) margin analysis for **${eng.serialNumber}**:
        
The engine currently displays an EGT margin of **${eng.currentEgtMargin}°C** above the redline threshold. Sensor **T50** (LPT outlet total temperature) shows an elevated reading of **${eng.sensors.find(s => s.code === 'T50')?.value} °R**, with SHAP positive attribution of **+14.8 cycles impact**.
This thermal elevation is strongly correlated with high-pressure compressor exit heating (**T30: ${eng.sensors.find(s => s.code === 'T30')?.value} °R**), indicating that the core compressor requires extra shaft power due to aerodynamic tip rubbing and interstage seal leakage.`,
        references: [
          'Airbus A320neo / Boeing 787 FCOM Section 70: Powerplant Limits',
          'TSM Task 77-21-00-810-801: EGT High Margin Loss Diagnostic Tree',
        ],
        suggestedActions: [
          'Schedule core compressor detergent wash (AMM 72-00-00)',
          'Perform thermocouple harness resistance check (AMM 77-21-00)',
        ],
      };
    }

    if (q.includes('checklist') || q.includes('ata') || q.includes('inspect') || q.includes('work order')) {
      return {
        answer: `Generated targeted aerospace maintenance checklist for **${eng.serialNumber} (${eng.model})**:
        
1. **ATA 72-00-00 - HPC Video Borescope**: Inspect stages 7 through 10 rotor blades for leading-edge nicking, trailing-edge erosion, and tip shroud clearances.
2. **ATA 72-40-00 - Combustor & HPT 1st Stage**: Inspect fuel spray nozzles for carbon coking; examine 1st stage HPT nozzle guide vanes for thermal barrier coating (TBC) degradation.
3. **ATA 79-20-00 - Magnetic Chip Detector (MCD)**: Pull and clean #3 bearing scavenge line chip detector, check for metallic slivers.
4. **ATA 77-10-00 - Telemetry Calibration**: Verify static pressure transducer Ps30 zero-offset against ambient hangar barometric pressure.`,
        references: [
          'Aircraft Maintenance Manual (AMM) ATA Chapter 72, Section 00-02',
          'Turbofan Line Maintenance Task Card TC-AERO-2026-72',
        ],
        suggestedActions: [
          'Export checklist to Maintenance Report Draft',
          'Check MRO spare parts inventory for HPT seal kits',
        ],
      };
    }

    // Default intelligent aerospace maintenance answer
    return {
      answer: `AeroGuard AI telemetry diagnostics for **${eng.serialNumber} (${eng.model})**:
      
- **Engine State**: ${eng.status} (Operating Cycles: ${eng.operatingCycles.toLocaleString()}, Flight Hours: ${eng.flightHours.toLocaleString()})
- **Multivariate Anomaly Score**: ${eng.anomalyScore.toFixed(2)} / 1.00 (Threshold: 0.65)
- **Top Attribution Factor**: ${eng.shapFeatures[0]?.name || 'HPC Discharge Thermal State'}
- **Current Operational Recommendation**: ${eng.anomalyScore > 0.7 ? 'Immediate line maintenance inspection required prior to next ETOPs dispatch.' : 'Engine performing within certified safe parameters; continue standard flight data monitoring.'}`,
      references: [
        'AeroGuard Predictive Health Index v3.4',
        'FAA Title 14 CFR Part 33 Airworthiness Standards: Aircraft Engines',
      ],
      suggestedActions: [
        'Inspect individual sensor trends in Engine Details',
        'Adjust parameters in Digital Twin Sandbox',
        'Review Diagnostic Agent SHAP breakdown',
      ],
    };
  }

  // --- Maintenance Reports ---

  public async getMaintenanceReports(): Promise<MaintenanceReport[]> {
    if (this.baseUrl && !this.isDemoMode) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/reports`);
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }
    await this.simulateLatency(110);
    return [...this.cachedReports];
  }

  public async updateReportStatus(
    reportId: string,
    status: MaintenanceReport['status'],
    signoff?: string
  ): Promise<MaintenanceReport> {
    if (this.baseUrl && !this.isDemoMode) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/reports/${reportId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, signoff }),
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }

    await this.simulateLatency(200);
    const idx = this.cachedReports.findIndex(r => r.id === reportId);
    if (idx >= 0) {
      this.cachedReports[idx] = {
        ...this.cachedReports[idx],
        status,
        technicianSignoff: signoff || this.cachedReports[idx].technicianSignoff,
      };
      return { ...this.cachedReports[idx] };
    }
    throw new Error(`Report ${reportId} not found.`);
  }

  public async createMaintenanceReport(
    report: Omit<MaintenanceReport, 'id' | 'creationDate'>
  ): Promise<MaintenanceReport> {
    if (this.baseUrl && !this.isDemoMode) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report),
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }

    await this.simulateLatency(250);
    const newReport: MaintenanceReport = {
      ...report,
      id: `REP-2026-ATA${report.ataChapter.split(' ')[1] || '72'}-${Math.floor(1000 + Math.random() * 9000)}`,
      creationDate: new Date().toISOString().substring(0, 10),
    };
    this.cachedReports.unshift(newReport);
    return newReport;
  }

  // --- Anomalies ---

  public async getAnomalyEvents(): Promise<AnomalyEvent[]> {
    if (this.baseUrl && !this.isDemoMode) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/anomalies`);
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }
    await this.simulateLatency(90);
    return [...this.cachedAnomalies];
  }

  public async acknowledgeAnomaly(id: string): Promise<AnomalyEvent> {
    if (this.baseUrl && !this.isDemoMode) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/anomalies/${id}/ack`, { method: 'POST' });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }

    await this.simulateLatency(150);
    const idx = this.cachedAnomalies.findIndex(a => a.id === id);
    if (idx >= 0) {
      this.cachedAnomalies[idx] = {
        ...this.cachedAnomalies[idx],
        acknowledged: true,
      };
      return { ...this.cachedAnomalies[idx] };
    }
    throw new Error(`Anomaly ${id} not found.`);
  }

  private simulateLatency(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const apiService = new AeroGuardApiService();
