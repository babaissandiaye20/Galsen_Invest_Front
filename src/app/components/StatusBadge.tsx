import React from 'react';

export type Status =
  | 'DRAFT' | 'REVIEW' | 'APPROVED' | 'ACTIVE' | 'REJECTED' | 'CLOSED'
  | 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'FUNDED';

interface StatusBadgeProps {
  status: Status | string; // Allow string to be more flexible with API types
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Brouillon', className: 'bg-gray-100 text-gray-700' },
  REVIEW: { label: 'En révision', className: 'bg-blue-100 text-blue-700' },
  APPROVED: { label: 'Approuvé', className: 'bg-green-100 text-green-700' },
  ACTIVE: { label: 'Actif', className: 'bg-green-600 text-white' },
  REJECTED: { label: 'Rejeté', className: 'bg-red-100 text-red-700' },
  CLOSED: { label: 'Terminé', className: 'bg-gray-600 text-white' },
  PENDING: { label: 'En attente', className: 'bg-yellow-100 text-yellow-700' },
  COMPLETED: { label: 'Complété', className: 'bg-green-100 text-green-700' },
  FAILED: { label: 'Échoué', className: 'bg-red-100 text-red-700' },
  CANCELLED: { label: 'Annulé', className: 'bg-gray-200 text-gray-500' },
  FUNDED: { label: 'Financé', className: 'bg-purple-100 text-purple-700' }
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className} ${className}`}>
      {config.label}
    </span>
  );
}
