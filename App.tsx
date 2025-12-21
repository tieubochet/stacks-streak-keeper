
import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsCard } from './components/StatsCard';
import { Leaderboard } from './components/Leaderboard';
import { StoryMode } from './components/StoryMode';
import StreakProgressBar from './components/StreakProgressBar';
import { userSession, LEADERBOARD_CANDIDATES } from './constants';
import { 
  fetchUserStats, 
  performCheckIn, 
  getUserAddress,
  fetchGlobalStory,
  performMintStory
} from './services/stacks';
import { UserStats, AppState, LeaderboardEntry, ActiveTab, GlobalStory } from './types';
import { CheckCircle2, Loader2, Zap, LayoutDashboard, PenTool } from 'lucide-react';

const App: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [globalStory, setGlobalStory] = useState<GlobalStory>({ fullContent: "", lastWord: "", contributors: [] });
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [txId, setTxId] = useState<string | null>(null);

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
    loadStory();
  }, []);

  const loadData = useCallback(async (addr: string) => {
    setAppState(AppState.LOADING_DATA);
    try {
      const stats = await fetchUserStats(addr);
      setUserStats(stats);
      setAppState(AppState.READY);
    } catch (error) {
      setAppState(AppState.READY);
    }
  }, []);

  const loadStory = async () => {
    const story = await fetchGlobalStory();
    setGlobalStory(story);
  };

  const handleDisconnect = () => {
    userSession.signUserOut();
    setAddress(null);
    setUserStats(null);
    setAppState(AppState.IDLE);
  };

  const handleCheckIn = async () => {
    if (!address) return;
    setAppState(AppState.TX_PENDING);
    try {
      await performCheckIn(
        (data) => {
          setTxId(data.txId);
          setAppState(AppState.READY);
          setTimeout(() => loadData(address), 8000); 
        },
        () => setAppState(AppState.READY)
      );
    } catch (e) {
      setAppState(AppState.READY);
    }
  };

  const handleMintStoryPart = async (content: string, word: string) => {
    if (!address) return;
    setAppState(AppState.TX_PENDING);
    try {
      await performMintStory(content, word, (data) => {
        setTxId(data.txId);
        setAppState(AppState.READY);
        setTimeout(loadStory, 8000);
      });
    } catch (e) {
      setAppState(AppState.READY);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] text-slate-200 pb-12">
      <Header address={address} onDisconnect={handleDisconnect} />

      <main className="container mx-auto max-w-5xl px-4 py-8">
        {!address && activeTab !== 'story' ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="mb-6 rounded-full bg-orange-500/10 p-6 ring-1 ring-orange-500/20">
              <Zap className="h-16 w-16 text-orange-500" />
            </div>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-7xl">
              Consistency <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">Meets Storytelling</span>
            </h1>
            <button
              onClick={() => setActiveTab('story')}
              className="mt-4 text-orange-400 hover:text-orange-300 font-medium"
            >
              View Global Story →
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex rounded-xl bg-slate-900/80 p-1 ring-1 ring-slate-800 shadow-2xl backdrop-blur">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab('story')}
                  className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold transition-all ${activeTab === 'story' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <PenTool size={18} />
                  Story Mode
                </button>
              </div>
              
              {activeTab === 'dashboard' && (
                <button
                  onClick={handleCheckIn}
                  disabled={appState === AppState.TX_PENDING}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-8 py-3 font-bold text-white shadow-xl hover:scale-105 transition-all active:scale-95"
                >
                  {appState === AppState.TX_PENDING ? <Loader2 className="animate-spin h-5 w-5" /> : <CheckCircle2 size={20} />}
                  Daily Check-In
                </button>
              )}
            </div>

            {activeTab === 'dashboard' ? (
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                  <StatsCard stats={userStats} isLoading={appState === AppState.LOADING_DATA} />
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl backdrop-blur">
                    <StreakProgressBar currentStreak={userStats?.currentStreak || 0} />
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <Leaderboard data={[]} isLoading={false} />
                </div>
              </div>
            ) : (
              <StoryMode 
                story={globalStory} 
                onMint={handleMintStoryPart} 
                isProcessing={appState === AppState.TX_PENDING}
                isConnected={!!address}
              />
            )}
          </div>
        )}
      </main>

      {txId && (
        <div className="fixed bottom-8 right-8 z-50">
          <a 
            href={`https://explorer.hiro.so/txid/${txId}?chain=mainnet`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-full bg-slate-950 border border-orange-500/50 px-6 py-4 text-sm font-bold text-orange-400 shadow-2xl hover:bg-slate-900 transition-all border-b-4 active:border-b-0 active:translate-y-1"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Blockchain Syncing...
          </a>
        </div>
      )}
    </div>
  );
};

export default App;
