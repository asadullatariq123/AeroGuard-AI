import React, { useState } from 'react';
import { AIAgent, AgentState } from '../types/aerospace';
import {
  Bot,
  Play,
  RotateCw,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Terminal,
  Activity,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface AgentCommandCentreProps {
  agents: AIAgent[];
  onTriggerAgent: (agentId: string) => void;
  onTriggerFullPipeline: () => void;
  isRunningPipeline: boolean;
}

export const AgentCommandCentre: React.FC<AgentCommandCentreProps> = ({
  agents,
  onTriggerAgent,
  onTriggerFullPipeline,
  isRunningPipeline,
}) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>('agent-prediction');

  const stateColors: Record<AgentState, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    Completed: {
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
    },
    Running: {
      bg: 'bg-cyan-950/40',
      text: 'text-cyan-300',
      border: 'border-cyan-500/40',
      icon: <RotateCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />,
    },
    Waiting: {
      bg: 'bg-slate-900/40',
      text: 'text-slate-400',
      border: 'border-slate-700',
      icon: <Clock className="w-3.5 h-3.5 text-slate-400" />,
    },
    Failed: {
      bg: 'bg-rose-950/40',
      text: 'text-rose-300',
      border: 'border-rose-500/40',
      icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />,
    },
  };

  return (
    <div className="space-y-6">
      {/* Command Centre Pipeline Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-lg bg-gradient-to-r from-[#07162C] via-[#0A1F3D] to-[#07111F] border border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Cpu className="w-3.5 h-3.5" />
            <span>Autonomous Aerospace Inference Pipeline</span>
            <span aria-hidden="true">·</span>
            <span>5 Specialized Agents</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1">
            AI Agent Command Centre
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Orchestrates dedicated aerospace models across Remaining Useful Life estimation, multivariate telemetry anomaly sweeps, TreeSHAP feature explanations, AMM manual retrieval, and automated maintenance planning.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onTriggerFullPipeline}
            disabled={isRunningPipeline}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunningPipeline ? 'animate-spin' : ''}`} />
            <span>{isRunningPipeline ? 'Executing Multi-Agent Pipeline...' : 'Run Full Diagnostic Sweep'}</span>
          </button>
        </div>
      </div>

      {/* Agents Pipeline Flow Graphic */}
      <div className="aerospace-card p-4 rounded-lg border border-cyan-500/15">
        <div className="text-xs font-semibold text-slate-200 mb-3 flex items-center justify-between">
          <span>Agent Execution Dependency Graph</span>
          <span className="text-[11px] font-mono text-slate-400">Sequential &amp; Parallel Orchestration</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
          {agents.map((agent, idx) => {
            const state = stateColors[agent.state];
            return (
              <div
                key={agent.id}
                className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono text-slate-400">Step 0{idx + 1}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border flex items-center gap-1 ${state.bg} ${state.text} ${state.border}`}>
                      {state.icon}
                      <span>{agent.state}</span>
                    </span>
                  </div>
                  <div className="font-semibold text-slate-200 truncate">{agent.name}</div>
                </div>

                <div className="mt-2 text-[10px] text-slate-400 font-mono truncate">
                  {agent.modelVersion.split('-')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Agent Cards Grid */}
      <div className="space-y-4">
        {agents.map(agent => {
          const state = stateColors[agent.state];
          const isExpanded = expandedLogId === agent.id;

          return (
            <div
              key={agent.id}
              className="aerospace-card p-5 rounded-lg border border-cyan-500/15 hover:border-cyan-500/30 transition-all space-y-4"
            >
              {/* Top Row: Info + State + Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded bg-slate-900 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-slate-100">{agent.name}</h2>
                      <span className="text-xs text-slate-400">· {agent.role}</span>
                      <span
                        className={`text-xs font-mono font-medium px-2 py-0.5 rounded border flex items-center gap-1.5 ${state.bg} ${state.text} ${state.border}`}
                      >
                        {state.icon}
                        <span>{agent.state}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                      {agent.description}
                    </p>
                  </div>
                </div>

                {/* Trigger Action */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => onTriggerAgent(agent.id)}
                    disabled={agent.state === 'Running'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                      agent.state === 'Failed'
                        ? 'bg-rose-950/60 text-rose-200 border border-rose-500/40 hover:bg-rose-900/60'
                        : 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900/50'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{agent.state === 'Failed' ? 'Retry Agent' : 'Execute Agent'}</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Execution Progress</span>
                  <span>{agent.progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      agent.state === 'Failed'
                        ? 'bg-rose-500'
                        : agent.state === 'Completed'
                        ? 'bg-emerald-400'
                        : 'bg-cyan-400'
                    }`}
                    style={{ width: `${agent.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Summary & Metrics Strip */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono bg-slate-900/50 p-3 rounded border border-slate-800">
                <div className="md:col-span-2 text-slate-300 font-sans text-xs">
                  <span className="text-slate-400 block text-[10px] font-mono">Latest Agent Summary</span>
                  {agent.summary}
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Model &amp; Latency</span>
                  <div className="text-slate-200 truncate">{agent.modelVersion}</div>
                  <div className="text-cyan-400 mt-0.5">{agent.latencyMs}ms inference</div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Processed Cycles</span>
                  <div className="text-slate-200 tabular-nums">
                    {agent.metrics.processedCycles.toLocaleString()} cycles
                  </div>
                  <div className="text-emerald-400 mt-0.5 font-bold">
                    {agent.metrics.accuracyScore}% accuracy
                  </div>
                </div>
              </div>

              {/* Collapsible Execution Logs */}
              <div>
                <button
                  onClick={() => setExpandedLogId(isExpanded ? null : agent.id)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Execution Stream &amp; Raw Logs ({agent.logs.length} entries)</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isExpanded && (
                  <div className="mt-2.5 p-3 rounded bg-[#050C17] border border-cyan-500/20 font-mono text-xs space-y-1.5 max-h-48 overflow-y-auto">
                    {agent.logs.map((log, i) => {
                      const levelColors = {
                        info: 'text-slate-300',
                        warn: 'text-amber-300',
                        error: 'text-rose-400 font-bold',
                        success: 'text-emerald-400 font-bold',
                      };
                      return (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-slate-500 select-none text-[11px]">{log.timestamp}</span>
                          <span className={`uppercase text-[10px] px-1 rounded bg-slate-900 ${levelColors[log.level]}`}>
                            {log.level}
                          </span>
                          <span className={levelColors[log.level]}>{log.message}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
