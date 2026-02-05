import React from 'react';

interface ProgressBarProps {
  current: number;
  goal: number;
  color?: string;
  showPercentage?: boolean;
  showLabels?: boolean;
  className?: string;
}

export function ProgressBar({ 
  current, 
  goal, 
  color = '#10B981',
  showPercentage = true,
  showLabels = true,
  className = '' 
}: ProgressBarProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };
  
  return (
    <div className={className}>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className="h-2.5 rounded-full transition-all duration-500"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
      {(showPercentage || showLabels) && (
        <div className="flex justify-between items-center mt-2 text-sm">
          {showLabels ? (
            <>
              <span className="text-gray-700 font-medium">{formatAmount(current)}</span>
              <span className="text-gray-500">{formatAmount(goal)}</span>
            </>
          ) : showPercentage ? (
            <span className="text-gray-700 font-medium">{percentage.toFixed(0)}%</span>
          ) : null}
        </div>
      )}
    </div>
  );
}
