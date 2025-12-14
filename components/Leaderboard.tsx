import React, { useMemo } from 'react';
import { UserStats, LeaderboardEntry } from '../types';
import { MOCK_LEADERBOARD_DATA } from '../constants';
import { Medal, User, Flame } from 'lucide-react';

interface LeaderboardProps {
  currentUserAddress: string | null;
  currentUserStats: UserStats | null;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ currentUserAddress, currentUserStats }) => {
  
  // Merge mock data with current user data to simulate a live leaderboard
  const leaderboardData = useMemo(() => {
    let data: LeaderboardEntry[] = MOCK_LEADERBOARD_DATA.map((entry, index) => ({
      ...entry,
      rank: 0, // Will recalculate
      isCurrentUser: false
    }));

    if (currentUserAddress && currentUserStats) {
      // Check if user is already in mock data (unlikely for random address, but good practice)
      const existingIndex = data.findIndex(d => d.address === currentUserAddress);
      
      const userEntry = {
        address: currentUserAddress,
        streak: currentUserStats.currentStreak,
        total: currentUserStats.totalCheckins,
        isCurrentUser: true,
        rank: 0
      };

      if (existingIndex >= 0) {
        data[existingIndex] = userEntry;
      } else {
        data.push(userEntry);
      }
    }

    // Sort by Streak desc, then Total desc
    data.sort((a, b) => {
      if (b.streak !== a.streak) return b.streak - a.streak;
      return b.total - a.total;
    });

    // Assign ranks
    return data.map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  }, [currentUserAddress, currentUserStats]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 backdrop-blur">
      <div className="border-b border-slate-800 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Medal className="h-5 w-5 text-yellow-500" />
          Global Leaderboard
        </h2>
        <p className="mt-1 text-sm text-slate-400">Top streakers on the Stacks network.</p>
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
            {leaderboardData.map((entry) => (
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