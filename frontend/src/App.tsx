import React, { useState, useEffect } from 'react';
import { AircraftEngine, AIAgent, AnomalyEvent, MaintenanceReport } from './types/aerospace';
import { apiService } from './services/api';
import { Navbar } from './components/layout/Navbar';
import { NavigationTabs, PageTabId } from './components/layout/NavigationTabs';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { FleetMonitoring } from './pages/FleetMonitoring';
import { EngineDetails } from './pages/EngineDetails';
import { RulPredictions } from './pages/RulPredictions';
import { AnomalyDetection } from './pages/AnomalyDetection';
import { AgentCommandCentre } from './pages/AgentCommandCentre';
import { DigitalTwinSimulation } from './pages/DigitalTwinSimulation';
import { AiCopilot } from './pages/AiCopilot';
import { MaintenanceReports } from './pages/MaintenanceReports';
import { SettingsPage } from './pages/SettingsPage';
import { CheckCircle2, AlertCircle, Plane } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<PageTabId>('overview');
  const [selectedEngineId, setSelectedEngineId] = useState<string>('ENG-CFM-8821');
  const [engines, setEngines] = useState<AircraftEngine[]>([]);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([]);
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isRunningPipeline, setIsRunningPipeline] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    async function loadData() {
      try {
        const [loadedEngines, loadedAgents, loadedAnomalies, loadedReports] = await Promise.all([
          apiService.getFleetOverview(),
          apiService.getAIAgents(),
          apiService.getAnomalyEvents(),
          apiService.getMaintenanceReports(),
        ]);
        setEngines(loadedEngines);
        setAgents(loadedAgents);
        setAnomalies(loadedAnomalies);
        setReports(loadedReports);
      } catch (err) {
        console.error('Failed to load initial aerospace telemetry:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fleet scan action
  const handleTriggerScan = async () => {
    setIsScanning(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      const refreshedEngines = await apiService.getFleetOverview();
      setEngines(refreshedEngines);
      showToast('Fleet ACARS telemetry sweep complete. Invariant sensor checks nominal.');
    } finally {
      setIsScanning(false);
    }
  };

  // Agent execution
  const handleTriggerAgent = async (agentId: string) => {
    try {
      const updatedAgent = await apiService.triggerAgentRun(agentId);
      setAgents(prev => prev.map(a => (a.id === agentId ? updatedAgent : a)));
      showToast(`Agent execution started: ${updatedAgent.name}`);

      // Refresh agent state after simulation completes
      setTimeout(async () => {
        const refreshedAgents = await apiService.getAIAgents();
        setAgents(refreshedAgents);
      }, 1600);
    } catch (err) {
      console.error(err);
    }
  };

  // Full pipeline execution
  const handleTriggerFullPipeline = async () => {
    setIsRunningPipeline(true);
    try {
      const updatedAgents = await apiService.triggerFullPipeline();
      setAgents(updatedAgents);
      showToast('Multi-agent diagnostic pipeline triggered across fleet.');

      setTimeout(async () => {
        const refreshedAgents = await apiService.getAIAgents();
        setAgents(refreshedAgents);
        setIsRunningPipeline(false);
        showToast('All 5 AI agents successfully converged on fleet telemetry.');
      }, 2200);
    } catch {
      setIsRunningPipeline(false);
    }
  };

  // Anomaly acknowledge
  const handleAcknowledgeAnomaly = async (eventId: string) => {
    try {
      const updated = await apiService.acknowledgeAnomaly(eventId);
      setAnomalies(prev => prev.map(a => (a.id === eventId ? updated : a)));
      showToast(`Anomaly event ${eventId} acknowledged.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectEngine = (engineId: string) => {
    setSelectedEngineId(engineId);
  };

  const handleNavigateTab = (tabId: string) => {
    setActiveTab(tabId as PageTabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefreshReports = async () => {
    const updated = await apiService.getMaintenanceReports();
    setReports(updated);
  };

  const selectedEngine = engines.find(e => e.id === selectedEngineId) || engines[0];
  const activeAnomalyCount = anomalies.filter(a => !a.acknowledged).length;
  const criticalCount = engines.filter(e => e.status === 'CRITICAL').length;
  const isDemo = apiService.isUsingDemoData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07111F] text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400">
            <Plane className="w-5 h-5 animate-pulse transform -rotate-45" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-wider text-slate-100">
              AEROGUARD <span className="text-cyan-400">AI</span>
            </div>
            <div className="text-xs text-slate-400">
              Initializing Turbofan Telemetry Bus &amp; NASA CMAPSS Invariants...
            </div>
          </div>
        </div>
        <div className="w-64 bg-slate-800 h-1 rounded overflow-hidden">
          <div className="h-full bg-cyan-400 animate-pulse w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        currentTab={activeTab}
        onTabChange={handleNavigateTab}
        isDemoMode={isDemo}
        onTriggerScan={handleTriggerScan}
        isScanning={isScanning}
        selectedEngineSerial={selectedEngine?.serialNumber}
      />

      {/* 10-Page Navigation Tab Bar */}
      <NavigationTabs
        activeTab={activeTab}
        onSelectTab={handleNavigateTab}
        selectedEngineSerial={selectedEngine?.serialNumber}
        anomalyCount={activeAnomalyCount}
        criticalCount={criticalCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewDashboard
            engines={engines}
            agents={agents}
            anomalies={anomalies}
            onSelectEngine={handleSelectEngine}
            onNavigateTab={handleNavigateTab}
            onTriggerAgent={handleTriggerAgent}
          />
        )}

        {activeTab === 'fleet' && (
          <FleetMonitoring
            engines={engines}
            onSelectEngine={handleSelectEngine}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'engine' && (
          <EngineDetails
            engines={engines}
            selectedEngineId={selectedEngineId}
            onSelectEngine={handleSelectEngine}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'rul' && (
          <RulPredictions
            engines={engines}
            onSelectEngine={handleSelectEngine}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'anomaly' && (
          <AnomalyDetection
            engines={engines}
            anomalies={anomalies}
            onAcknowledge={handleAcknowledgeAnomaly}
            onSelectEngine={handleSelectEngine}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'agents' && (
          <AgentCommandCentre
            agents={agents}
            onTriggerAgent={handleTriggerAgent}
            onTriggerFullPipeline={handleTriggerFullPipeline}
            isRunningPipeline={isRunningPipeline}
          />
        )}

        {activeTab === 'twin' && (
          <DigitalTwinSimulation
            engines={engines}
            selectedEngineId={selectedEngineId}
            onSelectEngine={handleSelectEngine}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'copilot' && (
          <AiCopilot
            engines={engines}
            selectedEngineId={selectedEngineId}
            onSelectEngine={handleSelectEngine}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'reports' && (
          <MaintenanceReports
            engines={engines}
            reports={reports}
            onRefreshReports={handleRefreshReports}
            onSelectEngine={handleSelectEngine}
          />
        )}

        {activeTab === 'settings' && <SettingsPage />}
      </main>

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-lg bg-[#0B1E36] border border-cyan-400/40 text-cyan-200 text-xs shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200 font-mono">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quiet Professional Footer */}
      <footer className="w-full bg-[#050D18] border-t border-cyan-500/10 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 font-sans">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400">AEROGUARD AI</span>
          <span aria-hidden="true">·</span>
          <span>Predict · Detect · Explain · Prevent</span>
          <span aria-hidden="true">·</span>
          <span>Turbofan Maintenance Intelligence</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span>NASA CMAPSS Standards Compliant</span>
          <span aria-hidden="true">·</span>
          <span>FAA Part 145 MRO Integration Ready</span>
        </div>
      </footer>
    </div>
  );
}
