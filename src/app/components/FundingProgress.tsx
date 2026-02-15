import React from 'react';

interface FundingProgressProps {
  raisedAmount: number;
  targetAmount: number;
  devise?: string;
  /** 'full' = barre + montants + pourcentage, 'compact' = barre + pourcentage, 'bar' = barre seule */
  variant?: 'full' | 'compact' | 'bar';
  /** Couleur de la barre (défaut: galsen-green) */
  color?: string;
  className?: string;
}

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

export function FundingProgress({
  raisedAmount,
  targetAmount,
  devise = 'XOF',
  variant = 'full',
  color,
  className = '',
}: FundingProgressProps) {
  const percentage = targetAmount > 0
    ? Math.min((raisedAmount / targetAmount) * 100, 100)
    : 0;

  return (
    <div className={className}>
      {/* Ligne du haut : pourcentage + montants selon la variante */}
      {variant !== 'bar' && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-semibold text-galsen-green">
            {percentage.toFixed(1)}%
          </span>
          {variant === 'full' && (
            <span className="text-xs text-galsen-blue/60">
              {fmt(raisedAmount)} / {fmt(targetAmount)} {devise}
            </span>
          )}
        </div>
      )}

      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-2.5 rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color || 'var(--color-galsen-green, #10B981)',
          }}
        />
      </div>

      {/* Ligne du bas : montant collecté pour variant full */}
      {variant === 'full' && (
        <p className="text-xs text-galsen-blue/60 mt-1.5">
          <span className="font-medium text-galsen-blue">{fmt(raisedAmount)} {devise}</span> collectés
          sur {fmt(targetAmount)} {devise}
        </p>
      )}
    </div>
  );
}
