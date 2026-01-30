import React, { useState, useEffect } from 'react';
import { Vote, PenTool, Sparkles, Loader2 } from 'lucide-react';
import { generateStory } from '../services/ai';
import { submitProposal, voteForProposal, fetchProposals } from '../services/stacks';
import { GlobalStory } from '../types';

interface StoryModeProps {
  story: GlobalStory;
  onMint: (content: string, word: string) => void;
  isProcessing: boolean;
  isConnected: boolean;
  currentStreak?: number; 
}

export const StoryMode: React.FC<StoryModeProps> = ({ story, isConnected, isProcessing }) => {
  const [activeTab, setActiveTab] = useState<'read' | 'vote'>('vote');
  const [proposals, setProposals] = useState<any[]>([]);
  const [aiDraft, setAiDraft] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

 
  useEffect(() => {
    
    fetchProposals(1).then((data) => {
        if(Array.isArray(data)) setProposals(data);
    });
  }, []);

  const handleGenerateAI = async () => {
    setIsAiGenerating(true);
   
    const draft = await generateStory(0, "Write a short, exciting plot twist (1 sentence) for the next chapter of a fantasy story.");
    setAiDraft(draft);
    setIsAiGenerating(false);
  };

  const handleSubmit = async () => {
      if (!aiDraft) return;
      await submitProposal(aiDraft, (data) => {
          console.log("Proposal submitted:", data);
       
      });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Controls */}
      <div className="flex gap-4 border-b border-slate-800 pb-4">
        <button 
           onClick={() => setActiveTab('vote')}
           className={`flex items-center gap-2 px-4 py-2 font-bold transition-colors ${activeTab === 'vote' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
           <Vote size={20} /> Vote Next Step
        </button>
        <button 
           onClick={() => setActiveTab('read')}
           className={`flex items-center gap-2 px-4 py-2 font-bold transition-colors ${activeTab === 'read' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
           <PenTool size={20} /> Read Full Story
        </button>
      </div>

      {activeTab === 'vote' ? (
        <div className="grid gap-8 md:grid-cols-2">
           {/* Proposal Form */}
           <div className="rounded-2xl bg-slate-900/40 p-8 border border-slate-800 backdrop-blur-md">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <PenTool className="text-blue-400" size={20}/>
                  Propose Next Chapter
              </h3>
              <textarea 
                className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 mb-6 focus:border-blue-500/50 focus:outline-none transition-all resize-none"
                placeholder="What happens next? (Use AI for ideas)"
                value={aiDraft}
                onChange={(e) => setAiDraft(e.target.value)}
                disabled={isProcessing}
              />
              <div className="flex gap-3">
                 <button 
                   onClick={handleGenerateAI}
                   disabled={isAiGenerating || isProcessing}
                   className="flex items-center gap-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 px-4 py-3 rounded-xl hover:bg-purple-500/20 transition-all font-semibold"
                 >
                    {isAiGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    Ask AI
                 </button>
                 <button 
                   onClick={handleSubmit}
                   disabled={!isConnected || isProcessing || !aiDraft}
                   className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold px-4 py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/20 disabled:opacity-50 transition-all active:scale-95"
                 >
                    {isProcessing ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Submit Proposal'}
                 </button>
              </div>
              {!isConnected && <p className="mt-3 text-sm text-slate-500 text-center">Connect wallet to submit</p>}
           </div>

           {/* Voting List */}
           <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Vote className="text-green-400" size={20}/>
                  Active Proposals
              </h3>
              {proposals.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl text-slate-500 italic">
                      No proposals yet. Be the first!
                  </div>
              ) : (
                  proposals.map((p) => (
                    <div key={p.id} className="p-5 rounded-xl bg-slate-800/40 border border-slate-700 hover:border-orange-500/50 transition-all group">
                    <p className="text-slate-200 mb-4 text-lg italic leading-relaxed">"{p.content}"</p>
                    <div className="flex justify-between items-center border-t border-slate-700/50 pt-3">
                        <span className="text-xs text-slate-500 font-mono">By: {p.author ? `${p.author.slice(0,6)}...` : 'Anonymous'}</span>
                        <button 
                            onClick={() => voteForProposal(p.id, () => alert('Voted successfully!'))}
                            disabled={!isConnected || isProcessing}
                            className="flex items-center gap-2 bg-slate-700 group-hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-md"
                        >
                            <Vote size={14} /> Vote ({p.votes})
                        </button>
                    </div>
                    </div>
                ))
              )}
           </div>
        </div>
      ) : (
        <div className="min-h-[300px] rounded-2xl border border-slate-800 bg-slate-950/40 p-8 backdrop-blur shadow-inner">
             <h2 className="text-2xl font-bold text-white mb-6">The Story So Far...</h2>
           <p className="text-lg leading-relaxed text-slate-300 first-letter:text-5xl first-letter:font-bold first-letter:text-orange-500 first-letter:mr-3 first-letter:float-left">
            {story.fullContent || "The story has not begun yet..."}
          </p>
        </div>
      )}
    </div>
  );
};