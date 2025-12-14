import React from 'react';
import { LeaderboardEntry } from '../types';
import { Medal, User, Flame, Loader2 } from 'lucide-react';

interface LeaderboardProps {
  data: LeaderboardEntry[];
  isLoading: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ data, isLoading }) => {
  
  if (isLoading && data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-8 text-center backdrop-blur">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-orange-500" />
        <p className="mt-2 text-slate-400">Loading on-chain rankings...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 backdrop-blur">
      <div className="border-b border-slate-800 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Medal className="h-5 w-5 text-yellow-500" />
          Live Leaderboard
        </h2>
        <p className="mt-1 text-sm text-slate-400">Top streakers (Real-time On-chain Data).</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-medium uppercase text-slate-500">
              <th className="px-6 py-4">Rank</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4 text-right">Streak</th>
              <th className="px-6 py-4 text-right">Total Check-ins</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.map((entry) => (
              <tr 
                key={entry.address} 
                className={`transition-colors hover:bg-slate-900/50 ${entry.isCurrentUser ? 'bg-orange-500/5 hover:bg-orange-500/10' : ''}`}
              >
                <td className="px-6 py-4">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-bold 
                    ${entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' : 
                      entry.rank === 2 ? 'bg-slate-400/20 text-slate-400' : 
                      entry.rank === 3 ? 'bg-amber-700/20 text-amber-700' : 'text-slate-500'}`}>
                    {entry.rank}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-slate-300">
                  <div className="flex items-center gap-2">
                    {entry.isCurrentUser && <User className="h-3 w-3 text-orange-500" />}
                    <span className={entry.isCurrentUser ? 'text-orange-400' : ''}>
                      {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                      {entry.isCurrentUser && " (You)"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-200">
                   <div className="flex items-center justify-end gap-1">
                      {entry.streak}
                      <Flame className="h-3 w-3 text-orange-500 fill-orange-500" />
                   </div>
                </td>
                <td className="px-6 py-4 text-right text-slate-400">{entry.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};