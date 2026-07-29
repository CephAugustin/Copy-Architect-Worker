import React, { useState, useEffect } from 'react';
import { 
  Zap, Mail, Video, Monitor, Sparkles, Megaphone, Share2, 
  Users, FileText, Database, Plus, ChevronRight, Clock, ShieldCheck,
  TrendingUp, ArrowRight, FileCheck, BrainCircuit
} from 'lucide-react';
import { auth } from './firebase';
import { 
  fetchFiles, 
  fetchClientProfiles, 
  fetchNotes, 
  fetchSavedPrompts 
} from './dbService';
import { ClientProfile, FileEntry } from './types';

interface WorkspaceProps {
  onEnterLab: (tab?: "Brief" | "Email" | "Landing Page" | "VSL" | "Ads" | "Auditor" | "Social") => void;
  selectedClientProfile: ClientProfile | null;
  onNavigate: (view: "workspace" | "editor" | "knowledge" | "files" | "notes" | "team" | "prompts" | "profiles") => void;
}

export default function Workspace({ onEnterLab, selectedClientProfile, onNavigate }: WorkspaceProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [profileCount, setProfileCount] = useState<number>(0);
  const [notesCount, setNotesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        setLoading(true);
        const [filesData, profilesData, notesData] = await Promise.all([
          fetchFiles(user.uid),
          fetchClientProfiles(user.uid),
          fetchNotes(user.uid)
        ]);
        
        if (isMounted) {
          setFiles(filesData || []);
          setProfileCount(profilesData ? profilesData.length : 0);
          setNotesCount(notesData ? notesData.length : 0);
        }
      } catch (err) {
        console.error("Error loading dashboard metrics:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadDashboardData();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const totalWordsGenerated = files.reduce((acc, file) => acc + Math.round((file.size || 0) / 4.5), 0);
  const estimatedTokens = Math.round(totalWordsGenerated * 1.3);

  // Quick actions config
  const quickActions = [
    {
      title: "Email Architect",
      desc: "Instant direct-response follow-ups",
      icon: Mail,
      tab: "Email" as const,
      color: "from-blue-600/20 to-indigo-600/5 hover:to-indigo-600/10 border-indigo-500/20 text-indigo-400",
    },
    {
      title: "VSL Scriptwriter",
      desc: "Video sales letter hooks & structures",
      icon: Video,
      tab: "VSL" as const,
      color: "from-purple-600/20 to-fuchsia-600/5 hover:to-fuchsia-600/10 border-purple-500/20 text-purple-400",
    },
    {
      title: "Landing Page",
      desc: "High-conversion architecture briefs",
      icon: Monitor,
      tab: "Landing Page" as const,
      color: "from-emerald-600/20 to-teal-600/5 hover:to-teal-600/10 border-emerald-500/20 text-emerald-400",
    },
    {
      title: "Copy Auditor",
      desc: "Psychological optimization & review",
      icon: ShieldCheck,
      tab: "Auditor" as const,
      color: "from-amber-600/20 to-orange-600/5 hover:to-orange-600/10 border-amber-500/20 text-amber-400",
    },
    {
      title: "Social Poster",
      desc: "Engagement booster for channels",
      icon: Share2,
      tab: "Social" as const,
      color: "from-rose-600/20 to-pink-600/5 hover:to-pink-600/10 border-rose-500/20 text-rose-400",
    }
  ];

  return (
    <div className="max-w-[1240px] mx-auto px-8 py-12 relative z-10 min-h-[85vh] space-y-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-800/40">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-widest">
            <TrendingUp size={14} /> Intelligence Dashboard
          </div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">My <span className="text-indigo-500">Workspace</span></h2>
          <p className="text-slate-400 font-medium text-sm">Welcome back to your central copy-generation matrix.</p>
        </div>
        <button 
          onClick={() => onEnterLab("Brief")}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs tracking-wider uppercase transition-all shadow-xl shadow-indigo-900/10 active:scale-95"
        >
          <Zap size={14} fill="currentColor" /> Enter Execution Lab
        </button>
      </div>

      {/* Quick Actions Matrix */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
          Quick Launch Matrix
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onEnterLab(action.tab)}
              className={`group flex flex-col justify-between p-6 bg-slate-950/40 border rounded-[2rem] text-left transition-all hover:scale-[1.02] hover:border-indigo-500/30 active:scale-95 duration-300 relative overflow-hidden h-40 ${action.color}`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-3 bg-slate-900/60 rounded-xl group-hover:bg-indigo-500/10 transition-colors">
                  <action.icon size={20} className="transition-transform group-hover:scale-110" />
                </div>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
              </div>
              <div className="space-y-1 mt-auto">
                <h4 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                  {action.title}
                </h4>
                <p className="text-[10px] text-slate-500 font-semibold leading-snug">
                  {action.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-slate-950/30 border border-slate-900/60 rounded-[2rem] flex items-center gap-4 hover:border-slate-800/80 transition-all">
          <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-2xl">
            <FileText size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Assets Saved</span>
            <span className="text-xl font-black text-white">{loading ? "..." : files.length}</span>
          </div>
        </div>

        <div className="p-6 bg-slate-950/30 border border-slate-900/60 rounded-[2rem] flex items-center gap-4 hover:border-slate-800/80 transition-all">
          <div className="p-3 bg-purple-600/10 text-purple-400 rounded-2xl">
            <Users size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Client Profiles</span>
            <span className="text-xl font-black text-white">{loading ? "..." : profileCount}</span>
          </div>
        </div>

        <div className="p-6 bg-slate-950/30 border border-slate-900/60 rounded-[2rem] flex items-center gap-4 hover:border-slate-800/80 transition-all">
          <div className="p-3 bg-emerald-600/10 text-emerald-400 rounded-2xl">
            <Database size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Notes & Brainstorms</span>
            <span className="text-xl font-black text-white">{loading ? "..." : notesCount}</span>
          </div>
        </div>

        <div className="p-6 bg-slate-950/30 border border-slate-900/60 rounded-[2rem] flex items-center gap-4 hover:border-slate-800/80 transition-all">
          <div className="p-3 bg-amber-600/10 text-amber-400 rounded-2xl">
            <BrainCircuit size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Tokens Processed</span>
            <span className="text-xl font-black text-white">{loading ? "..." : estimatedTokens.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Core Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Currently Active Client Profile Card */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Active Client Profile Context
            </h3>
            {selectedClientProfile && (
              <button 
                onClick={() => onNavigate("profiles")}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline tracking-wider uppercase"
              >
                Change Profile
              </button>
            )}
          </div>

          <div className="flex-1 bg-slate-950/40 border border-slate-900 rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[300px]">
            {selectedClientProfile ? (
              <div className="space-y-6 h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                      <Users size={16} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white uppercase tracking-tight">
                        {selectedClientProfile.clientName}
                      </h4>
                      <span className="text-[9px] bg-indigo-600/10 text-indigo-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-widest border border-indigo-500/10">
                        Context Injected
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-1">
                        Main Offer
                      </span>
                      <p className="text-slate-300 font-medium line-clamp-2 bg-slate-900/30 p-3 rounded-xl border border-slate-800/20">
                        {selectedClientProfile.mainOffer}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-1">
                        Target Audience
                      </span>
                      <p className="text-slate-300 font-medium line-clamp-2 bg-slate-900/30 p-3 rounded-xl border border-slate-800/20">
                        {selectedClientProfile.targetAudience}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-indigo-400/80 font-semibold italic bg-indigo-950/10 p-3.5 rounded-2xl border border-indigo-900/20 mt-auto">
                  💡 This profile context is automatically loaded into the generative model for personalized copy results.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-6 space-y-6 h-full my-auto">
                <div className="w-16 h-16 bg-slate-900 rounded-[1.8rem] flex items-center justify-center text-slate-500 border border-slate-800/40">
                  <Users size={28} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-md font-black text-white uppercase tracking-tight">
                    No Active Profile Context
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Personalize your generation models instantly by activating a specific Client Profile database.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate("profiles")}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-white rounded-xl border border-indigo-500/20 text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  <Plus size={14} /> Select Profile Context
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity / File List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Recent Generations Activity
            </h3>
            <button 
              onClick={() => onNavigate("files")}
              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline tracking-wider uppercase"
            >
              Browse All Files
            </button>
          </div>

          <div className="bg-slate-950/40 border border-slate-900 rounded-[2.5rem] p-6 min-h-[300px] flex flex-col justify-between">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-3">
                <div className="w-8 h-8 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Compiling Matrix Data...</p>
              </div>
            ) : files.length > 0 ? (
              <div className="flex flex-col h-full justify-between gap-4">
                <div className="divide-y divide-slate-900/60 overflow-hidden">
                  {files.slice(0, 5).map((file) => (
                    <div 
                      key={file.fileId} 
                      className="group flex items-center justify-between py-4 px-2 hover:bg-slate-900/20 rounded-2xl transition-all cursor-pointer"
                      onClick={() => onNavigate("files")}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="p-2.5 bg-slate-900 text-slate-400 group-hover:bg-indigo-600/10 group-hover:text-indigo-400 rounded-xl transition-colors shrink-0">
                          <FileCheck size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white truncate uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] text-slate-500 font-bold uppercase flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(file.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="text-[9px] text-slate-600 font-bold">•</span>
                            <span className="text-[9px] text-slate-500 font-mono uppercase">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-700 group-hover:text-white transition-all transform group-hover:translate-x-1 shrink-0" />
                    </div>
                  ))}
                </div>
                
                <p className="text-[10px] text-slate-500 font-semibold tracking-wide block mt-2 text-center">
                  Showing {Math.min(5, files.length)} of {files.length} custom-generated marketing assets.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 space-y-6 my-auto">
                <div className="w-16 h-16 bg-slate-900 rounded-[1.8rem] flex items-center justify-center text-slate-500 border border-slate-800/40">
                  <FileText size={28} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-md font-black text-white uppercase tracking-tight">
                    No Generations Yet
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Activate the direct-response matrix engines to write copy, emails, and ads.
                  </p>
                </div>
                <button
                  onClick={() => onEnterLab("Brief")}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  <Plus size={14} /> Start New Execution
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
