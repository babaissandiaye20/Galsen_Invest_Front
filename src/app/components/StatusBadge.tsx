import React from 'react';

type Status = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'ACTIVE' | 'REJECTED' | 'CLOSED' | 'PENDING' | 'COMPLETED' | 'FAILED';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  DRAFT: { label: 'Brouillon', className: 'bg-gray-100 text-gray-700' },
  REVIEW: { label: 'En révision', className: 'bg-blue-100 text-blue-700' },
  APPROVED: { label: 'Approuvé', className: 'bg-green-100 text-green-700' },
  ACTIVE: { label: 'Actif', className: 'bg-green-600 text-white' },
  REJECTED: { label: 'Rejeté', className: 'bg-red-100 text-red-700' },
  CLOSED: { label: 'Terminé', className: 'bg-gray-600 text-white' },
  PENDING: { label: 'En attente', className: 'bg-yellow-100 text-yellow-700' },
  COMPLETED: { label: 'Complété', className: 'bg-green-100 text-green-700' },
  FAILED: { label: 'Échoué', className: 'bg-red-100 text-red-700' }
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className} ${className}`}>
      {config.label}
    </span>
  );
}
