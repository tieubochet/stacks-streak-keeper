import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsCard } from './components/StatsCard';
import { Leaderboard } from './components/Leaderboard';
import { MintCard } from './components/MintCard';
import { userSession } from './constants';
import { fetchUserStats, performCheckIn, performMintNft, getUserAddress } from './services/stacks';
import { UserStats, AppState } from './types';
import { CheckCircle2, Loader2, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [txId, setTxId] = useState<string | null>(null);
  const [mintTxId, setMintTxId] = useState<string | null>(null);

  // Initialize session and data
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

  const loadData = useCallback(async (addr: string) => {
    setAppState(AppState.LOADING_DATA);
    const stats = await fetchUserStats(addr);
    setUserStats(stats);
    setAppState(AppState.READY);
  }, []);

  const handleDisconnect = () => {
    userSession.signUserOut();
    setAddress(null);
    setUserStats(null);
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
        },
        () => {
          setAppState(AppState.READY); // User cancelled
        }
      );
    } catch (e) {
      console.error(e);
      setAppState(AppState.READY);
    }
  };

  const handleMintNft = async () => {
    if (!address) return;

    setAppState(AppState.TX_PENDING);
    setMintTxId(null);
    try {
      await performMintNft(
        (data) => {
          setMintTxId(data.txId);
          setAppState(AppState.READY);
        },
        () => {
          setAppState(AppState.READY);
        }
      );
    } catch (e) {
      console.error(e);
      setAppState(AppState.READY);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] text-slate-200">
      <Header address={address} onDisconnect={handleDisconnect} />

      <main className="container mx-auto max-w-5xl px-4 py-8">
        {!address ? (
          // Landing State
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
          // Dashboard State
          <div className="space-y-8">
            
            {/* Welcome & Action Area */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400">Manage your daily activity.</p>
              </div>
              
              <div className="flex items-center gap-4">
                {txId && (
                   <a 
                     href={`https://explorer.hiro.so/txid/${txId}?chain=mainnet`} 
                     target="_blank" 
                     rel="noreferrer"
                     className="flex items-center gap-2 text-xs text-orange-400 hover:underline"
                   >
                     View Pending Check-in
                   </a>
                )}
                
                <button
                  onClick={handleCheckIn}
                  disabled={appState === AppState.TX_PENDING || appState === AppState.LOADING_DATA}
                  className={`relative flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white shadow-lg transition-all
                    ${appState === AppState.TX_PENDING 
                      ? 'cursor-not-allowed bg-slate-700 opacity-50' 
                      : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 hover:shadow-orange-500/25'
                    }`}
                >
                  {appState === AppState.TX_PENDING && !mintTxId ? ( // Only show loading here if not minting
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Check-In Now
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <StatsCard 
              stats={userStats} 
              isLoading={appState === AppState.LOADING_DATA} 
            />

            {/* NFT Mint Section */}
            <MintCard 
              stats={userStats} 
              isMinting={appState === AppState.TX_PENDING && !txId && !mintTxId} // Rough state check
              onMint={handleMintNft}
              txId={mintTxId}
            />

            {/* Leaderboard Section */}
            <div className="pt-4">
              <Leaderboard 
                currentUserAddress={address} 
                currentUserStats={userStats} 
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