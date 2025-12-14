import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsCard } from './components/StatsCard';
import { Leaderboard } from './components/Leaderboard';
import StreakProgressBar from './components/StreakProgressBar'; // Import component mới
import { userSession, LEADERBOARD_CANDIDATES } from './constants';
import { 
  fetchUserStats, 
  performCheckIn, 
  getUserAddress,
  fetchLeaderboardData,
  fetchNftBalance 
} from './services/stacks';
import { UserStats, AppState, LeaderboardEntry } from './types';
import { CheckCircle2, Loader2, Zap, Trophy } from 'lucide-react';

const App: React.FC = () => {
  // --- State Management ---
  const [address, setAddress] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [nftBalance, setNftBalance] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [txId, setTxId] = useState<string | null>(null);

  // --- Initialization ---
  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then(() => {
        window.history.replaceState({}, document.title, "/");
        const addr = getUserAddress();
        setAddress(addr);
        if (addr) loadData(addr);
      });
    } else if (userSession.isUserSignedIn()) {
      const addr = getUserAddress();
      setAddress(addr);
      if (addr) loadData(addr);
    }
  }, []);

  // --- Data Fetching ---
  const loadData = useCallback(async (addr: string) => {
    setAppState(AppState.LOADING_DATA);
    
    try {
      // Fetch tất cả dữ liệu song song
      const [stats, balance, lbData] = await Promise.all([
        fetchUserStats(addr),
        fetchNftBalance(addr),
        fetchLeaderboardData(LEADERBOARD_CANDIDATES, addr)
      ]);

      setUserStats(stats);
      setNftBalance(balance);
      setLeaderboard(lbData);
      setAppState(AppState.READY);
    } catch (error) {
      console.error("Error loading data:", error);
      setAppState(AppState.READY);
    }
  }, []);

  // --- Handlers ---
  const handleDisconnect = () => {
    userSession.signUserOut();
    setAddress(null);
    setUserStats(null);
    setLeaderboard([]);
    setAppState(AppState.IDLE);
  };

  const handleCheckIn = async () => {
    if (!address) return;

    setAppState(AppState.TX_PENDING);
    setTxId(null);
    
    try {
      await performCheckIn(
        (data) => {
          setTxId(data.txId);
          setAppState(AppState.READY);
          // Reload dữ liệu sau 5s để cập nhật UI (Optimistic update)
          setTimeout(() => loadData(address), 5000); 
        },
        () => {
          setAppState(AppState.READY); // User hủy giao dịch
        }
      );
    } catch (e) {
      console.error(e);
      setAppState(AppState.READY);
    }
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-[#0f172a] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] text-slate-200">
      <Header address={address} onDisconnect={handleDisconnect} />

      <main className="container mx-auto max-w-5xl px-4 py-8">
        {!address ? (
          // === LANDING STATE ===
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="mb-6 rounded-full bg-orange-500/10 p-6 ring-1 ring-orange-500/20">
              <Zap className="h-16 w-16 text-orange-500" />
            </div>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">On-Chain Streak</span>
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-slate-400">
              Consistency is key. Check-in daily on the Stacks blockchain, earn your reputation, and compete on the global leaderboard.
            </p>
          </div>
        ) : (
          // === DASHBOARD STATE ===
          <div className="space-y-8">
            
            {/* Header Area & Welcome */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400">Manage your daily activity.</p>
              </div>
              
              {/* NFT Status Badge */}
              {nftBalance > 0 && (
                <div className="flex items-center gap-2 rounded-full bg-yellow-500/10 px-4 py-2 text-yellow-500 ring-1 ring-yellow-500/20">
                  <Trophy className="h-5 w-5" />
                  <span className="font-bold">Streak Master NFT Owner</span>
                </div>
              )}
            </div>

            {/* PROGRESS BAR SECTION (New) */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
              <StreakProgressBar currentStreak={userStats?.currentStreak || 0} />
              
              {/* Check-In Button Area */}
              <div className="mt-6 flex flex-col items-center justify-center gap-4">
                 <button
                  onClick={handleCheckIn}
                  disabled={appState === AppState.TX_PENDING || appState === AppState.LOADING_DATA}
                  className={`relative flex items-center gap-2 rounded-lg px-8 py-4 text-lg font-bold text-white shadow-xl transition-all
                    ${appState === AppState.TX_PENDING 
                      ? 'cursor-not-allowed bg-slate-700 opacity-50' 
                      : 'bg-gradient-to-r from-orange-500 to-red-600 hover:scale-105 hover:from-orange-400 hover:to-red-500 hover:shadow-orange-500/25'
                    }`}
                >
                  {appState === AppState.TX_PENDING ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-6 w-6" />
                      Daily Check-In
                    </>
                  )}
                </button>

                {txId && (
                  <a 
                    href={`https://explorer.hiro.so/txid/${txId}?chain=testnet`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-sm text-orange-400 hover:underline"
                  >
                    View transaction in explorer
                  </a>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <StatsCard 
              stats={userStats} 
              isLoading={appState === AppState.LOADING_DATA} 
            />

            {/* Leaderboard Section */}
            <div className="pt-4">
              <Leaderboard 
                data={leaderboard}
                isLoading={appState === AppState.LOADING_DATA}
              />
            </div>

          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="mt-20 border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} StreakProtocol. Built on Stacks.</p>
      </footer>
    </div>
  );
};

export default App;