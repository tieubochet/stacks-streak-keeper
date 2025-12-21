
import React, { useState } from 'react';
import { Type, Send, Users, Sparkles, Loader2, BookOpen } from 'lucide-react';
import { generateStoryFromWord } from '../services/ai';
import { GlobalStory } from '../types';

interface StoryModeProps {
  story: GlobalStory;
  onMint: (content: string, word: string) => void;
  isProcessing: boolean;
  isConnected: boolean;
}

export const StoryMode: React.FC<StoryModeProps> = ({ story, onMint, isProcessing, isConnected }) => {
  const [word, setWord] = useState('');
  const [genre, setGenre] = useState('fantasy');
  const [draftPart, setDraftPart] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleAddWord = async () => {
    if (!word.trim()) return;
    setIsAiGenerating(true);
    const newPart = await generateStoryFromWord(word, story.fullContent, genre);
    setDraftPart(newPart);
    setIsAiGenerating(false);
  };

  const handleMint = () => {
    if (draftPart) {
      onMint(draftPart, word);
      setDraftPart('');
      setWord('');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Add a Word Section */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-md">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-white mb-6">
          <Type className="text-blue-400" />
          Add a Word
        </h2>
        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value.split(' ')[0])}
            placeholder="Enter one word..."
            className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-5 py-3 text-slate-200 focus:border-blue-500/50 focus:outline-none transition-all"
            disabled={!isConnected || isProcessing}
          />
          <select 
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-slate-400 focus:outline-none"
          >
            <option value="fantasy">Fantasy</option>
            <option value="scifi">Sci-Fi</option>
            <option value="mystery">Mystery</option>
            <option value="noir">Noir</option>
          </select>
          <button
            onClick={handleAddWord}
            disabled={!isConnected || isProcessing || !word || isAiGenerating}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white hover:bg-blue-500 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
          >
            {isAiGenerating ? <Loader2 className="animate-spin h-5 w-5" /> : <Sparkles size={18} />}
            Add Word
          </button>
        </div>
        {!isConnected && <p className="mt-3 text-sm text-slate-500">Connect your wallet to contribute to the story</p>}
      </section>

      {/* Draft Section (Hidden if no draft) */}
      {draftPart && (
        <section className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6 border-dashed animate-in zoom-in-95">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400">AI Draft Extension</h3>
            <button 
              onClick={handleMint}
              disabled={isProcessing}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-900 hover:bg-blue-50 transition-all"
            >
              {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : <Send size={14} />}
              Mint Story Part
            </button>
          </div>
          <p className="text-lg text-slate-200 italic leading-relaxed">"... {draftPart}"</p>
        </section>
      )}

      {/* Full Story Section */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
          <BookOpen className="text-orange-500" />
          Full Story
        </h2>
        <div className="min-h-[200px] rounded-2xl border border-slate-800 bg-slate-950/40 p-8 backdrop-blur shadow-inner">
          <p className="text-lg leading-relaxed text-slate-300 first-letter:text-5xl first-letter:font-bold first-letter:text-orange-500 first-letter:mr-3 first-letter:float-left">
            {story.fullContent}
          </p>
        </div>
      </section>

      {/* Contributors Section */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
          <Users className="text-purple-400" />
          Contributors
        </h2>
        <div className="flex flex-wrap gap-3">
          {story.contributors.length === 0 ? (
            <div className="w-full py-10 text-center text-slate-600 border border-dashed border-slate-800 rounded-2xl italic">
              Loading contributors...
            </div>
          ) : (
            story.contributors.map((c, i) => (
              <div key={i} className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-4 py-2 text-xs font-mono text-slate-400 transition-colors hover:border-purple-500/50">
                <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                {c.address.slice(0, 6)}...{c.address.slice(-4)}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
