import React from 'react';
import { EngineStatus } from '../../types/aerospace';

interface StatusBadgeProps {
  status: EngineStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  // Follows Zero-Pill & Metadata Discipline: clean, crisp text with subtle surface indicator
  const styles: Record<EngineStatus, { bg: string; text: string; border: string; label: string }> = {
    NOMINAL: {
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      label: 'Nominal',
    },
    WARNING: {
      bg: 'bg-amber-950/40',
      text: 'text-amber-300',
      border: 'border-amber-500/30',
      label: 'Review Required',
    },
    CRITICAL: {
      bg: 'bg-rose-950/40',
      text: 'text-rose-300',
      border: 'border-rose-500/40',
      label: 'Critical Alert',
    },
    MAINTENANCE: {
      bg: 'bg-sky-950/40',
      text: 'text-sky-300',
      border: 'border-sky-500/30',
      label: 'In Maintenance',
    },
  };

  const current = styles[status] || styles.NOMINAL;
  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded border ${current.bg} ${current.text} ${current.border} ${paddingClass} whitespace-nowrap`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
      <span>{current.label}</span>
    </span>
  );
};
