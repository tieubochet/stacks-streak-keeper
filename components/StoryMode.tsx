// components/StoryMode.tsx
import React, { useState, useEffect } from 'react';
import { Vote, PenTool, Sparkles, Loader2 } from 'lucide-react';
import { generateStory } from '../services/ai';
import { submitProposal, voteForProposal, fetchProposals } from '../services/stacks';

// ... props interface

export const StoryModeDAO: React.FC<any> = ({ story, isConnected }) => {
  const [activeTab, setActiveTab] = useState<'read' | 'vote'>('vote');
  const [proposals, setProposals] = useState<any[]>([]);
  const [aiDraft, setAiDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load proposals cho round hiện tại (giả định round 1)
    fetchProposals(1).then(setProposals);
  }, []);

  const handleGenerateAI = async () => {
    setIsLoading(true);
    const draft = await generateStory(5, "Write a plot twist for the next chapter.");
    setAiDraft(draft);
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex gap-4 border-b border-slate-800 pb-4">
        <button 
           onClick={() => setActiveTab('vote')}
           className={`flex items-center gap-2 px-4 py-2 font-bold ${activeTab === 'vote' ? 'text-orange-500' : 'text-slate-500'}`}
        >
           <Vote size={20} /> Vote Next Step
        </button>
        <button 
           onClick={() => setActiveTab('read')}
           className={`flex items-center gap-2 px-4 py-2 font-bold ${activeTab === 'read' ? 'text-orange-500' : 'text-slate-500'}`}
        >
           <PenTool size={20} /> Read Full Story
        </button>
      </div>

      {activeTab === 'vote' ? (
        <div className="grid gap-6 md:grid-cols-2">
           {/* Proposal Form */}
           <div className="rounded-xl bg-slate-900/50 p-6 border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-4">Propose Next Chapter</h3>
              <textarea 
                className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-300 mb-4"
                placeholder="What happens next? (Use AI for ideas)"
                value={aiDraft}
                onChange={(e) => setAiDraft(e.target.value)}
              />
              <div className="flex gap-3">
                 <button 
                   onClick={handleGenerateAI}
                   className="flex items-center gap-2 bg-purple-600/20 text-purple-400 px-4 py-2 rounded-lg hover:bg-purple-600/30"
                 >
                    <Sparkles size={16} /> Ask AI
                 </button>
                 <button 
                   onClick={() => submitProposal(aiDraft, () => alert('Submitted!'))}
                   className="flex-1 bg-orange-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-orange-600"
                 >
                    Submit Proposal
                 </button>
              </div>
           </div>

           {/* Voting List */}
           <div className="space-y-3">
              <h3 className="text-xl font-bold text-white mb-4">Active Proposals</h3>
              {proposals.map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 hover:border-orange-500/50 transition-all">
                   <p className="text-slate-300 mb-3">"{p.content}"</p>
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">By: {p.author.slice(0,6)}...</span>
                      <button 
                        onClick={() => voteForProposal(p.id, () => alert('Voted!'))}
                        className="flex items-center gap-2 bg-slate-700 hover:bg-green-600 px-3 py-1 rounded text-sm font-bold text-white transition-colors"
                      >
                         <Vote size={14} /> Vote ({p.votes})
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      ) : (
        <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 prose prose-invert max-w-none">
           {story.fullContent}
        </div>
      )}
    </div>
  );
};