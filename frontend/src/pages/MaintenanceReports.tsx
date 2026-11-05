import React, { useState } from 'react';
import { AircraftEngine, MaintenanceReport } from '../types/aerospace';
import { apiService } from '../services/api';
import {
  FileText,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Printer,
  X,
  Send,
  UserCheck,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface MaintenanceReportsProps {
  engines: AircraftEngine[];
  reports: MaintenanceReport[];
  onRefreshReports: () => void;
  onSelectEngine: (engineId: string) => void;
}

export const MaintenanceReports: React.FC<MaintenanceReportsProps> = ({
  engines,
  reports,
  onRefreshReports,
  onSelectEngine,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isCreatingModalOpen, setIsCreatingModalOpen] = useState(false);
  const [technicianNameInput, setTechnicianNameInput] = useState('');
  const [isSigning, setIsSigning] = useState(false);

  // New report form state
  const [newTitle, setNewTitle] = useState('');
  const [newEngineId, setNewEngineId] = useState(engines[0]?.id || '');
  const [newAta, setNewAta] = useState<MaintenanceReport['ataChapter']>('ATA 72 - Engine Turbine');
  const [newSeverity, setNewSeverity] = useState<MaintenanceReport['severity']>('Immediate Action');
  const [newAnalysis, setNewAnalysis] = useState('');
  const [newDownTime, setNewDownTime] = useState<number>(12);

  const activeReport = reports.find(r => r.id === selectedReportId) || reports[0];

  const filteredReports = reports.filter(r => {
    return statusFilter === 'ALL' || r.status === statusFilter;
  });

  const handleSignOff = async () => {
    if (!activeReport || !technicianNameInput.trim()) return;
    setIsSigning(true);
    try {
      await apiService.updateReportStatus(
        activeReport.id,
        'Signed Off',
        `${technicianNameInput.trim()} / Avionics Lead Insp`
      );
      setTechnicianNameInput('');
      onRefreshReports();
    } finally {
      setIsSigning(false);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEng = engines.find(eng => eng.id === newEngineId) || engines[0];
    try {
      await apiService.createMaintenanceReport({
        engineId: targetEng.id,
        engineSerial: targetEng.serialNumber,
        aircraftTail: targetEng.aircraftTail,
        ataChapter: newAta,
        severity: newSeverity,
        title: newTitle || `Targeted Inspection for ${targetEng.serialNumber}`,
        scheduledWindow: 'Next scheduled transit stop (Within 24h)',
        technicianSignoff: null,
        status: 'Approved',
        rootCauseAnalysis: newAnalysis || `Automated diagnostics flagged elevated anomaly score (${targetEng.anomalyScore.toFixed(2)}) on sensor telemetry.`,
        prescribedActions: [
          `Execute borescope inspection per ${newAta} procedures.`,
          'Perform electrical resistance check on thermocouple harness.',
          'Review post-maintenance high-idle telemetry run.',
        ],
        requiredParts: [
          { partNumber: 'LEAP-SEAL-KIT-04', description: 'Turbine Interstage Seal Ring Pack', quantity: 1, inStock: true },
          { partNumber: 'MCD-DET-KIT-GE90', description: 'Magnetic Chip Detector Plug', quantity: 2, inStock: true },
        ],
        estimatedDownTimeHours: newDownTime,
      });

      setIsCreatingModalOpen(false);
      setNewTitle('');
      setNewAnalysis('');
      onRefreshReports();
    } catch {
      // Handled
    }
  };

  const handleExportJson = () => {
    if (!activeReport) return;
    const blob = new Blob([JSON.stringify(activeReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeReport.id}_AeroGuard_WorkOrder.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/10">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>Maintenance Work Orders &amp; ATA Chapters</span>
            <span className="text-xs font-mono text-cyan-400 font-normal">
              FAA Part 145 MRO Standards
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Formal aerospace maintenance action packages, prescribed troubleshooting steps, parts requisition, and certified technician sign-offs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreatingModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded transition-all shadow-[0_0_12px_rgba(0,240,255,0.2)] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Draft New Work Order</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Report List (4 cols) & Report Viewer (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Report List (4 cols) */}
        <div className="lg:col-span-4 aerospace-card p-4 rounded-lg border border-cyan-500/15 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-cyan-500/10">
            <span className="text-xs font-semibold text-slate-200">
              Work Order Queue ({filteredReports.length})
            </span>
            <div className="flex items-center gap-1">
              {['ALL', 'Approved', 'In Progress', 'Signed Off'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredReports.map(rep => {
              const isSelected = activeReport?.id === rep.id;
              const isAOG = rep.severity.includes('AOG');
              const isImmediate = rep.severity.includes('Immediate');

              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReportId(rep.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.1)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-1">
                    <span>{rep.id}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-bold ${
                        isAOG
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                          : isImmediate
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {rep.severity.split(' ')[0]}
                    </span>
                  </div>

                  <div className="font-semibold text-slate-200 line-clamp-2">
                    {rep.title}
                  </div>

                  <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                    <span>{rep.engineSerial}</span>
                    <span className="text-cyan-400">{rep.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Work Order Document Viewer (8 cols) */}
        <div className="lg:col-span-8 aerospace-card p-6 rounded-lg border border-cyan-500/15 space-y-6">
          {activeReport ? (
            <>
              {/* Report Header Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-500/15">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
                    <span>{activeReport.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeReport.ataChapter}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-100 mt-1">
                    {activeReport.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportJson}
                    title="Export Work Order as JSON"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-cyan-200 bg-slate-900 border border-slate-700 rounded transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    title="Print Document"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-cyan-200 bg-slate-900 border border-slate-700 rounded transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Identification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono bg-slate-900/60 p-3.5 rounded border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Engine ESN</span>
                  <span className="text-slate-200 font-bold">{activeReport.engineSerial}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Aircraft Tail</span>
                  <span className="text-cyan-300 font-bold">{activeReport.aircraftTail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Created Date</span>
                  <span className="text-slate-200">{activeReport.creationDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Est. Downtime</span>
                  <span className="text-amber-300 font-bold">{activeReport.estimatedDownTimeHours} Hours</span>
                </div>
              </div>

              {/* Root Cause Analysis */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  01. Autonomous AI Diagnostic &amp; Root Cause
                </h3>
                <div className="p-3.5 rounded bg-slate-900/40 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                  {activeReport.rootCauseAnalysis}
                </div>
              </div>

              {/* Prescribed Actions Checklist */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  02. Prescribed Aviation Maintenance Procedures
                </h3>
                <div className="space-y-2">
                  {activeReport.prescribedActions.map((act, idx) => (
                    <label
                      key={idx}
                      className="p-3 rounded bg-slate-900/40 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200 cursor-pointer hover:border-cyan-500/30 transition-colors"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={idx === 0}
                        className="mt-0.5 rounded border-slate-700 text-cyan-400 focus:ring-0 accent-cyan-400"
                      />
                      <span>{act}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Required Aerospace Parts */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  03. Bill of Materials &amp; Spare Parts Requisition
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left font-mono">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800 bg-slate-900/40">
                        <th className="py-2 px-3">Part Number</th>
                        <th className="py-2 px-3 font-sans">Description</th>
                        <th className="py-2 px-3 text-right">Qty</th>
                        <th className="py-2 px-3 text-right">Stock Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {activeReport.requiredParts.map(part => (
                        <tr key={part.partNumber} className="hover:bg-slate-900/30">
                          <td className="py-2.5 px-3 font-bold text-cyan-300">
                            {part.partNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 font-sans">
                            {part.description}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-200">
                            {part.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium ${
                                part.inStock
                                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {part.inStock ? 'In MRO Hangar Stock' : 'Awaiting Parts Delivery'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Technician Sign-Off Box */}
              <div className="p-4 rounded-lg bg-slate-900/70 border border-cyan-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-100 font-mono">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>FAA Part 145 Certified Return-To-Service Sign-Off</span>
                  </div>
                  <span className="text-xs font-mono text-cyan-300">
                    Status: {activeReport.status}
                  </span>
                </div>

                {activeReport.technicianSignoff ? (
                  <div className="p-3 rounded bg-emerald-950/30 border border-emerald-500/40 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-300 font-mono">
                      <CheckCircle className="w-4 h-4" />
                      <span>Certified Sign-Off: {activeReport.technicianSignoff}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">Airworthy Dispatch Approved</span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={technicianNameInput}
                      onChange={e => setTechnicianNameInput(e.target.value)}
                      placeholder="Enter Lead Certified Inspector Name & License #..."
                      className="flex-1 w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
                    />
                    <button
                      onClick={handleSignOff}
                      disabled={!technicianNameInput.trim() || isSigning}
                      className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors disabled:opacity-40 whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{isSigning ? 'Signing...' : 'Sign Off Work Order'}</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Select a work order from the queue to inspect details.
            </div>
          )}
        </div>
      </div>

      {/* Draft New Work Order Modal */}
      {isCreatingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="aerospace-card max-w-xl w-full p-6 rounded-lg border border-cyan-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Draft Aerospace Maintenance Work Order</span>
              </h2>
              <button
                onClick={() => setIsCreatingModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Work Order Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. HPC Stage 8-10 Borescope & Thermocouple Recalibration"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Engine</label>
                  <select
                    value={newEngineId}
                    onChange={e => setNewEngineId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {engines.map(eng => (
                      <option key={eng.id} value={eng.id}>
                        {eng.serialNumber} ({eng.aircraftTail})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">ATA Chapter</label>
                  <select
                    value={newAta}
                    onChange={e => setNewAta(e.target.value as MaintenanceReport['ataChapter'])}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="ATA 71 - Power Plant">ATA 71 - Power Plant</option>
                    <option value="ATA 72 - Engine Turbine">ATA 72 - Engine Turbine</option>
                    <option value="ATA 73 - Engine Fuel & Control">ATA 73 - Engine Fuel & Control</option>
                    <option value="ATA 77 - Engine Indicating">ATA 77 - Engine Indicating</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Severity Level</label>
                  <select
                    value={newSeverity}
                    onChange={e => setNewSeverity(e.target.value as MaintenanceReport['severity'])}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="Immediate Action">Immediate Action</option>
                    <option value="AOG (Aircraft On Ground)">AOG (Aircraft On Ground)</option>
                    <option value="Scheduled Maintenance">Scheduled Maintenance</option>
                    <option value="Advisory">Advisory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Estimated Down Time (Hours)</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={newDownTime}
                    onChange={e => setNewDownTime(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Diagnostic Rationale &amp; Symptoms</label>
                <textarea
                  rows={3}
                  value={newAnalysis}
                  onChange={e => setNewAnalysis(e.target.value)}
                  placeholder="Describe sensor telemetry symptoms, EGT margin loss, or bearing vibration spike..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded cursor-pointer"
                >
                  Create &amp; Dispatch Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
