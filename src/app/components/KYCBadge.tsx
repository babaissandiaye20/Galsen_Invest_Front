import React from 'react';
import { AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

type KYCLevel = 'L0' | 'L1' | 'L2';

interface KYCBadgeProps {
  level: KYCLevel;
  showLabel?: boolean;
  className?: string;
}

const kycConfig: Record<KYCLevel, { label: string; icon: React.ReactNode; className: string }> = {
  L0: {
    label: 'Non vérifié',
    icon: <AlertCircle className="w-4 h-4" />,
    className: 'bg-gray-100 text-gray-700 border-gray-300'
  },
  L1: {
    label: 'Basique',
    icon: <CheckCircle className="w-4 h-4" />,
    className: 'bg-yellow-100 text-yellow-700 border-yellow-300'
  },
  L2: {
    label: 'Complet',
    icon: <ShieldCheck className="w-4 h-4" />,
    className: 'bg-green-100 text-green-700 border-green-300'
  }
};

export function KYCBadge({ level, showLabel = true, className = '' }: KYCBadgeProps) {
  const config = kycConfig[level];
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className} ${className}`}>
      {config.icon}
      {showLabel && <span>{config.label}</span>}
      <span className="font-bold">{level}</span>
    </span>
  );
}
