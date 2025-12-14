import React from 'react';
import { Gem, Loader2, ExternalLink, Check } from 'lucide-react';
import { UserStats } from '../types';

interface MintCardProps {
  stats: UserStats | null;
  nftBalance: number;
  isMinting: boolean;
  onMint: () => void;
  txId: string | null;
}

export const MintCard: React.FC<MintCardProps> = ({ stats, nftBalance, isMinting, onMint, txId }) => {
  const hasNft = nftBalance > 0;

  return (
    <div className="relative overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900/20 p-1">
      <div className="absolute -left-20 -top-20 h-40 w-40 bg-purple-500/20 blur-[60px]"></div>
      <div className="absolute -bottom-20 -right-20 h-40 w-40 bg-blue-500/20 blur-[60px]"></div>
      
      <div className="relative flex flex-col gap-6 rounded-lg bg-slate-950/60 p-6 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-6">
          <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl shadow-[0_0_20px_rgba(124,58,237,0.3)]
            ${hasNft ? 'bg-green-900/50' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
            {hasNft ? <Check className="h-10 w-10 text-green-400" /> : <Gem className="h-10 w-10 text-white" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {hasNft ? "Streak NFT Collected" : "Mint Your Streak NFT"}
            </h3>
            <p className="mt-1 max-w-md text-sm text-slate-400">
              {hasNft 
                ? "You have already claimed your on-chain badge. Keep your streak alive to maintain your reputation!" 
                : "Immortalize your progress on-chain. Mint a unique SIP-009 NFT badge representing your current streak level."}
            </p>
            {stats && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                <span>Status:</span>
                <span className="font-bold text-white">
                  {stats.maxStreak > 0 ? `Streak Master (${stats.maxStreak} days)` : 'Novice'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
            {txId ? (
                 <a 
                 href={`https://explorer.hiro.so/txid/${txId}?chain=mainnet`} 
                 target="_blank" 
                 rel="noreferrer"
                 className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500/10 px-6 py-3 text-sm font-semibold text-green-400 ring-1 ring-inset ring-green-500/20 transition-all hover:bg-green-500/20 md:w-auto"
               >
                 View Transaction <ExternalLink className="h-4 w-4" />
               </a>
            ) : (
                <button
                    onClick={onMint}
                    disabled={isMinting || hasNft}
                    className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg px-8 py-3 font-bold transition-all md:w-auto
                      ${hasNft 
                        ? 'cursor-not-allowed bg-slate-800 text-slate-500' 
                        : 'bg-white text-slate-900 hover:bg-purple-100 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                      } disabled:opacity-70`}
                >
                    {isMinting ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Minting...
                    </>
                    ) : hasNft ? (
                    <>
                        <Check className="h-4 w-4" />
                        Owned
                    </>
                    ) : (
                    <>
                        <Gem className="h-4 w-4 transition-transform group-hover:scale-110" />
                        Mint NFT
                    </>
                    )}
                </button>
            )}
          {!hasNft && <p className="text-xs text-slate-500">Gas fees apply (STX)</p>}
        </div>
      </div>
    </div>
  );
};