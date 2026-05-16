import React from 'react';
import { Zap } from 'lucide-react';

interface WorkspaceProps {
  onEnterLab: () => void;
}

export default function Workspace({ onEnterLab }: WorkspaceProps) {
  return (
    <div className="max-w-[1200px] mx-auto px-8 py-12 relative z-10 min-h-[80vh]">
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">My <span className="text-indigo-500">Workspace</span></h2>
          <p className="text-slate-400 font-medium">Welcome to your central hub for strategic planning.</p>
        </div>
      </div>

      <div className="bg-[#0f172a]/40 border border-slate-800/40 rounded-[3rem] h-[500px] flex flex-col items-center justify-center text-center p-20 space-y-8">
        <div className="w-24 h-24 bg-indigo-600/10 rounded-[2.5rem] flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-[0_0_50px_rgba(79,70,229,0.1)]">
          <Zap size={48} fill="currentColor" />
        </div>
        <div className="space-y-4 flex flex-col items-center">
          <div className="space-y-2">
            <h4 className="text-3xl font-black text-white italic tracking-tight uppercase">Ready to Execute</h4>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">Start building your elite marketing assets using our proprietary synthesis protocols.</p>
          </div>
          <button 
            onClick={onEnterLab}
            className="flex items-center gap-3 px-8 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl shadow-indigo-900/20 active:scale-95"
          >
            <Zap size={18} fill="currentColor" /> Enter Execution Lab
          </button>
        </div>
      </div>
    </div>
  );
}
