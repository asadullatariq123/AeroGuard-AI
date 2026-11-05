import React from 'react';
import {
  LayoutDashboard,
  PlaneTakeoff,
  Gauge,
  TrendingDown,
  AlertTriangle,
  Bot,
  Layers,
  Sparkles,
  FileText,
  Settings as SettingsIcon,
} from 'lucide-react';

export type PageTabId =
  | 'overview'
  | 'fleet'
  | 'engine'
  | 'rul'
  | 'anomaly'
  | 'agents'
  | 'twin'
  | 'copilot'
  | 'reports'
  | 'settings';

interface NavigationTabsProps {
  activeTab: PageTabId;
  onSelectTab: (tab: PageTabId) => void;
  selectedEngineSerial?: string;
  anomalyCount: number;
  criticalCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  selectedEngineSerial,
  anomalyCount,
  criticalCount,
}) => {
  const tabs: { id: PageTabId; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    { id: 'overview', label: 'Overview Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'fleet', label: 'Fleet Monitoring', icon: <PlaneTakeoff className="w-4 h-4" /> },
    {
      id: 'engine',
      label: selectedEngineSerial ? `Engine Details (${selectedEngineSerial})` : 'Engine Details',
      icon: <Gauge className="w-4 h-4" />,
    },
    { id: 'rul', label: 'RUL Predictions', icon: <TrendingDown className="w-4 h-4" /> },
    {
      id: 'anomaly',
      label: 'Anomaly Detection',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      badge: anomalyCount > 0 ? anomalyCount : undefined,
    },
    {
      id: 'agents',
      label: 'AI Agent Command Centre',
      icon: <Bot className="w-4 h-4 text-cyan-400" />,
      badge: '5 Active',
    },
    { id: 'twin', label: 'Digital Twin Simulation', icon: <Layers className="w-4 h-4" /> },
    { id: 'copilot', label: 'AeroGuard AI Copilot', icon: <Sparkles className="w-4 h-4 text-cyan-400" /> },
    { id: 'reports', label: 'Maintenance Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full bg-[#081528] border-b border-cyan-500/10 overflow-x-auto scrollbar-none">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 py-1.5 min-w-max">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-400/30 shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    typeof tab.badge === 'number'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
