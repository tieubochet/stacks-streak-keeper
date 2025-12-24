// App.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsCard } from './components/StatsCard';
import { Leaderboard } from './components/Leaderboard';
import { StoryMode } from './components/StoryMode';
import StreakProgressBar from './components/StreakProgressBar';
import { userSession } from './constants';
import { 
  fetchUserStats, 
  performCheckIn, 
  getUserAddress,
  fetchGlobalStory,
  performMintStory
} from './services/stacks';
import { UserStats, AppState, ActiveTab, GlobalStory } from './types';
import { CheckCircle2, Loader2, Zap, LayoutDashboard, PenTool, Key, RefreshCw } from 'lucide-react';

// Define window interface for AI Studio if needed
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const App: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [globalStory, setGlobalStory] = useState<GlobalStory>({ fullContent: "", lastWord: "", contributors: [] });
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [txId, setTxId] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      // Logic kiểm tra key của Google AI Studio (Giữ nguyên theo code bạn gửi)
      if (window.aistudio) {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          if (!hasKey) {
            setNeedsApiKey(true);
          }
        } catch (err) {
          console.error("Error checking API key status", err);
        }
      }

      if (userSession.isSignInPending()) {
        await userSession.handlePendingSignIn();
        window.history.replaceState({}, document.title, "/");
      }

      const addr = getUserAddress();
      if (addr) {
        setAddress(addr);
        loadData(addr);
      }
      loadStory();
    };

    init();
  }, []);

  const loadData = useCallback(async (addr: string) => {
    setAppState(AppState.LOADING_DATA);
    try {
      const stats = await fetchUserStats(addr);
      setUserStats(stats);
      setAppState(AppState.READY);
    } catch (error) {
      console.error(error);
      setAppState(AppState.READY);
    }
  }, []);

  const loadStory = async () => {
    try {
      const story = await fetchGlobalStory();
      setGlobalStory(story);
    } catch (e) {
      console.error("Failed to load story", e);
    }
  };

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setNeedsApiKey(false);
      } catch (err) {
        console.error("Error opening key selector", err);
      }
    }
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
      console.error(e);
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
      console.error(e);
      setAppState(AppState.READY);
    }
  };

  if (needsApiKey) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] p-6 text-center text-slate-200">
        <div className="mb-8 rounded-3xl bg-blue-500/10 p-8 ring-1 ring-blue-500/20 shadow-2xl shadow-blue-500/10 animate-pulse">
          <Key className="h-16 w-16 text-blue-400" />
        </div>
        <h2 className="mb-4 text-4xl font-bold text-white tracking-tight">AI Activation Required</h2>
        <p className="mb-10 max-w-md text-lg text-slate-400 leading-relaxed">
          StreakProtocol uses AI services. Please verify your API Key configuration.
        </p>
        <button
          onClick={handleOpenKeySelector}
          className="group relative flex items-center gap-3 rounded-2xl bg-blue-600 px-10 py-4 font-bold text-white shadow-xl shadow-blue-500/30 hover:bg-blue-500 hover:scale-105 transition-all active:scale-95"
        >
          <Zap className="h-5 w-5 text-blue-200" />
          Configure API Key
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] text-slate-200 pb-12">
      <Header />

      <main className="container mx-auto max-w-5xl px-4 py-8">
        {!address && activeTab !== 'story' ? (
          <div className="flex min-h-[65vh] flex-col items-center justify-center text-center animate-in fade-in duration-1000">
            <div className="mb-8 rounded-full bg-orange-500/10 p-8 ring-1 ring-orange-500/20 shadow-2xl shadow-orange-500/10">
              <Zap className="h-20 w-20 text-orange-500" />
            </div>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
              Consistency <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600">
                Meets Storytelling
              </span>
            </h1>
            <p className="mb-10 max-w-2xl text-lg text-slate-400">
              Build your on-chain reputation through daily check-ins and collaborate with others to write an AI-powered global story.
            </p>
            <button
              onClick={() => setActiveTab('story')}
              className="group flex items-center gap-2 text-orange-400 hover:text-orange-300 font-bold text-xl transition-all"
            >
              Start Writing Now
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex rounded-2xl bg-slate-900/80 p-1.5 ring-1 ring-slate-800 shadow-2xl backdrop-blur-xl">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <LayoutDashboard size={20} />
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab('story')}
                  className={`flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition-all ${activeTab === 'story' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <PenTool size={20} />
                  Story Mode
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                {activeTab === 'story' && window.aistudio && (
                  <button
                    onClick={handleOpenKeySelector}
                    className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-all"
                    title="Switch API Key"
                  >
                    <RefreshCw size={14} />
                    Switch AI Key
                  </button>
                )}
                
                {activeTab === 'dashboard' && address && (
                  <button
                    onClick={handleCheckIn}
                    disabled={appState === AppState.TX_PENDING}
                    className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 px-10 py-4 font-bold text-white shadow-xl shadow-orange-500/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {appState === AppState.TX_PENDING ? <Loader2 className="animate-spin h-6 w-6" /> : <CheckCircle2 size={24} />}
                    Check-In Today
                  </button>
                )}
              </div>
            </div>

            <div className="transition-all duration-500">
              {activeTab === 'dashboard' ? (
                <div className="grid gap-8 lg:grid-cols-3 animate-in slide-in-from-left-4">
                  <div className="lg:col-span-2 space-y-8">
                    <StatsCard stats={userStats} isLoading={appState === AppState.LOADING_DATA} />
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-10 shadow-2xl backdrop-blur-md">
                      <h3 className="mb-6 text-xl font-bold text-white">Your Progress</h3>
                      <StreakProgressBar currentStreak={userStats?.currentStreak || 0} />
                    </div>
                  </div>
                  <div className="lg:col-span-1">
                    <Leaderboard data={[]} isLoading={false} />
                  </div>
                </div>
              ) : (
                <div className="animate-in slide-in-from-right-4">
                  <StoryMode 
                    story={globalStory} 
                    onMint={handleMintStoryPart} 
                    isProcessing={appState === AppState.TX_PENDING}
                    isConnected={!!address}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {txId && (
        <div className="fixed bottom-10 right-10 z-50 animate-in slide-in-from-bottom-10 duration-700">
          <a 
            href={`https://explorer.hiro.so/txid/${txId}?chain=mainnet`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 rounded-3xl bg-slate-950/90 border border-orange-500/40 px-8 py-5 text-md font-bold text-orange-400 shadow-[0_0_50px_rgba(249,115,22,0.2)] hover:bg-slate-900 transition-all backdrop-blur-xl border-b-4 active:border-b-0 active:translate-y-1"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
            <span>Syncing On-Chain Data...</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default App;