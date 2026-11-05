/**
 * Aerospace & Engine Telemetry Types for AEROGUARD AI
 * Based on NASA CMAPSS Turbofan Engine Degradation & Commercial Turbofan Standards
 */

export type EngineStatus = 'NOMINAL' | 'WARNING' | 'CRITICAL' | 'MAINTENANCE';

export type AgentState = 'Waiting' | 'Running' | 'Completed' | 'Failed';

export interface SensorReading {
  name: string;
  code: string;
  value: number;
  unit: string;
  nominalMin: number;
  nominalMax: number;
  status: 'nominal' | 'warning' | 'critical';
  description: string;
  subsystem: 'Fan' | 'LPC' | 'HPC' | 'Combustor' | 'HPT' | 'LPT' | 'Exhaust';
}

export interface CycleTelemetryPoint {
  cycle: number;
  altitude: number; // ft
  machNumber: number; // Mach
  throttleResolverAngle: number; // deg TRA
  T24: number; // Total temp at LPC outlet (°R)
  T30: number; // Total temp at HPC outlet (°R)
  T50: number; // Total temp at LPT outlet / EGT (°R)
  P30: number; // Total pressure at HPC outlet (psia)
  Nf: number; // Physical fan speed (rpm)
  Nc: number; // Physical core speed (rpm)
  Ps30: number; // Static pressure at HPC outlet (psia)
  phi: number; // Ratio of fuel flow to Ps30 (pps/psi)
  BPR: number; // Bypass ratio
  vibration: number; // mm/s
  anomalyScore: number;
  rulActual?: number;
  rulPredictedRF: number;
  rulPredictedLSTM: number;
  rulEnsemble: number;
}

export interface ShapFeature {
  feature: string;
  name: string;
  value: number;
  unit: string;
  shapValue: number; // positive increases failure risk / reduces RUL, negative increases health
  impact: 'high' | 'medium' | 'low';
  subsystem: string;
  rationale: string;
}

export interface AircraftEngine {
  id: string;
  serialNumber: string;
  model: 'CFM LEAP-1A26' | 'Rolls-Royce Trent 1000' | 'GE90-115B' | 'Pratt & Whitney PW1100G' | 'CFM56-7B27';
  aircraftTail: string;
  aircraftType: 'Airbus A320neo' | 'Boeing 787-9' | 'Boeing 777-300ER' | 'Airbus A350-900' | 'Boeing 737-800';
  position: 'ENG 1 (Left)' | 'ENG 2 (Right)';
  operator: string;
  status: EngineStatus;
  operatingCycles: number;
  flightHours: number;
  totalTimeSinceOverhaul: number; // hours
  lastInspectionDate: string;
  currentEgtMargin: number; // °C margin before redline
  rulPredictedRF: number;
  rulPredictedLSTM: number;
  rulEnsemble: number;
  modelDisagreement: number; // difference in cycles
  anomalyScore: number; // 0 to 1.0 (threshold > 0.65 warning, > 0.85 critical)
  confidenceSpread: number; // percentage confidence
  sensors: SensorReading[];
  shapFeatures: ShapFeature[];
  degradationHistory: CycleTelemetryPoint[];
}

export interface AgentExecutionLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  details?: Record<string, unknown>;
}

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  state: AgentState;
  progressPercent: number;
  lastExecutionTime: string;
  latencyMs: number;
  modelVersion: string;
  targetEngineId: string;
  summary: string;
  logs: AgentExecutionLog[];
  metrics: {
    processedCycles: number;
    accuracyScore: number;
    anomaliesFlagged: number;
  };
}

export interface DigitalTwinSimParams {
  engineId: string;
  egtAdjustment: number; // -50 to +50 °C
  fanSpeedN1Adjustment: number; // -10% to +10%
  coreSpeedN2Adjustment: number; // -10% to +10%
  hpcOutletTempT30Adj: number; // -40 to +40 °R
  hpcOutletPressureP30Adj: number; // -15% to +15%
  bypassRatioAdj: number; // -1.0 to +1.0
  vibrationAdj: number; // 0 to +5 mm/s
  ambientTemperature: number; // °C
  flightAltitude: number; // ft
}

export interface DigitalTwinSimResult {
  engineId: string;
  timestamp: string;
  originalRul: number;
  simulatedRul: number;
  rulDelta: number;
  originalAnomalyScore: number;
  simulatedAnomalyScore: number;
  anomalyScoreDelta: number;
  projectedStressFactor: number;
  egtRedlineCycleEstimate: number;
  subsystemRisks: {
    hpc: 'Nominal' | 'Moderate Stress' | 'High Wear' | 'Severe Degradation';
    combustor: 'Nominal' | 'Moderate Stress' | 'High Wear' | 'Severe Degradation';
    hpt: 'Nominal' | 'Moderate Stress' | 'High Wear' | 'Severe Degradation';
    bearings: 'Nominal' | 'Moderate Stress' | 'High Wear' | 'Severe Degradation';
  };
  recommendations: string[];
}

export interface MaintenanceReport {
  id: string;
  engineId: string;
  engineSerial: string;
  aircraftTail: string;
  ataChapter: 'ATA 71 - Power Plant' | 'ATA 72 - Engine Turbine' | 'ATA 73 - Engine Fuel & Control' | 'ATA 77 - Engine Indicating';
  severity: 'AOG (Aircraft On Ground)' | 'Immediate Action' | 'Scheduled Maintenance' | 'Advisory';
  title: string;
  creationDate: string;
  scheduledWindow: string;
  technicianSignoff: string | null;
  status: 'Draft' | 'Approved' | 'In Progress' | 'Signed Off';
  rootCauseAnalysis: string;
  prescribedActions: string[];
  requiredParts: { partNumber: string; description: string; quantity: number; inStock: boolean }[];
  estimatedDownTimeHours: number;
}

export interface AnomalyEvent {
  id: string;
  engineId: string;
  engineSerial: string;
  aircraftTail: string;
  timestamp: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  anomalyType: 'EGT Thermal Runaway' | 'HPC Compressor Stall Precursor' | 'Bearing Micro-Vibration' | 'Fuel Metering Valve Drift' | 'Bypass Ratio Anomaly';
  score: number;
  triggeringSensors: string[];
  acknowledged: boolean;
  notes?: string;
}
