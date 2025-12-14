import React from 'react';
import { Flame, Trophy, CalendarCheck } from 'lucide-react';
import { UserStats } from '../types';

interface StatsCardProps {
  stats: UserStats | null;
  isLoading: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50" />
        ))}
      </div>
    );
  }

  const items = [
    {
      label: 'Current Streak',
      value: stats?.currentStreak || 0,
      icon: Flame,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      shadow: 'shadow-orange-500/10'
    },
    {
      label: 'Max Streak',
      value: stats?.maxStreak || 0,
      icon: Trophy,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      shadow: 'shadow-yellow-500/10'
    },
    {
      label: 'Total Check-ins',
      value: stats?.totalCheckins || 0,
      icon: CalendarCheck,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      shadow: 'shadow-purple-500/10'
    }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item, idx) => (
        <div 
          key={idx}
          className={`relative overflow-hidden rounded-xl border ${item.border} bg-slate-900/50 p-6 backdrop-blur transition-all hover:border-opacity-50 hover:shadow-lg ${item.shadow}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">{item.label}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-100">{item.value}</span>
                {item.label === 'Current Streak' && (
                   <span className="text-xs font-medium text-slate-500">days</span>
                )}
              </div>
            </div>
            <div className={`rounded-lg p-3 ${item.bg}`}>
              <item.icon className={`h-6 w-6 ${item.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};