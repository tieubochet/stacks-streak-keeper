import React from 'react';
import { Wallet, LogOut, Flame } from 'lucide-react';
import { showConnect } from '@stacks/connect';
import { userSession, appConfig } from '../constants';

interface HeaderProps {
  address: string | null;
  onDisconnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({ address, onDisconnect }) => {
  
  const handleConnect = () => {
    showConnect({
      appDetails: {
        name: 'StreakProtocol',
        icon: window.location.origin + '/vite.svg',
      },
      redirectTo: '/',
      onFinish: () => {
        window.location.reload();
      },
      userSession,
    });
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]">
            <Flame size={20} fill="currentColor" />
          </div>
          <span className="hidden text-xl font-bold tracking-tight text-white sm:inline-block">
            StreakProtocol
          </span>
        </div>

        <div>
          {address ? (
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-300 sm:flex">
                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                {truncateAddress(address)}
              </div>
              <button
                onClick={onDisconnect}
                className="group flex h-9 w-9 items-center justify-center rounded-md border border-slate-700 bg-transparent text-slate-400 transition-colors hover:border-red-900 hover:bg-red-900/20 hover:text-red-400"
                title="Disconnect"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition-all hover:bg-slate-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              <Wallet size={16} />
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};