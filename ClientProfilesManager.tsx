import React, { useState, useEffect } from "react";
import { ClientProfile } from "./types";
import { saveClientProfile, fetchClientProfiles, deleteClientProfile } from "./dbService";
import { analyzeBrandVoice } from "./geminiService";
import { auth } from "./firebase";
import {
  Plus,
  User,
  Trash2,
  X,
  Loader2,
  Sparkles,
  Search,
  Check,
  Award,
  BookOpen,
  Volume2,
  AlertCircle,
  FileText
} from "lucide-react";

interface ClientProfilesManagerProps {
  selectedProfile: ClientProfile | null;
  onSelectProfile: (profile: ClientProfile | null) => void;
  globalSettings: any;
}

export default function ClientProfilesManager({
  selectedProfile,
  onSelectProfile,
  globalSettings,
}: ClientProfilesManagerProps) {
  const [profiles, setProfiles] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingProfile, setEditingProfile] = useState<Partial<ClientProfile> | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<ClientProfile | null>(null);
  
  // AI Analyzer state
  const [successfulCopy, setSuccessfulCopy] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      setLoading(true);
      try {
        const data = await fetchClientProfiles(userId);
        setProfiles(data);
        
        // If selectedProfile is set, sync it with the fresh db load if available
        if (selectedProfile) {
          const fresh = data.find((p) => p.profileId === selectedProfile.profileId);
          if (fresh) {
            onSelectProfile(fresh);
          }
        }
      } catch (error) {
        console.error("Failed to load profiles:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStartCreate = () => {
    setEditingProfile({
      clientName: "",
      targetAudience: "",
      mainOffer: "",
      brandVoiceSummary: "",
    });
    setSuccessfulCopy("");
    setAnalysisError("");
  };

  const handleStartEdit = (profile: ClientProfile) => {
    setEditingProfile({ ...profile });
    setSuccessfulCopy("");
    setAnalysisError("");
  };

  const handleSave = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || !editingProfile?.clientName?.trim()) return;

    const isNew = !editingProfile.profileId;
    const profileId = editingProfile.profileId || Math.random().toString(36).substring(2, 11);

    const fullProfile: ClientProfile = {
      profileId,
      userId,
      clientName: editingProfile.clientName.trim(),
      targetAudience: editingProfile.targetAudience?.trim() || "",
      mainOffer: editingProfile.mainOffer?.trim() || "",
      brandVoiceSummary: editingProfile.brandVoiceSummary?.trim() || "",
      createdAt: editingProfile.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await saveClientProfile(fullProfile);
      
      // If the saved profile is currently selected, update the selected state
      if (selectedProfile?.profileId === profileId) {
        onSelectProfile(fullProfile);
      } else if (isNew && !selectedProfile) {
        // Automatically select the new profile if none is active
        onSelectProfile(fullProfile);
      }

      setEditingProfile(null);
      loadProfiles();
    } catch (error) {
      console.error("Error saving client profile:", error);
    }
  };

  const handleDelete = async () => {
    const userId = auth.currentUser?.uid;
    if (userId && showDeleteConfirm) {
      try {
        await deleteClientProfile(userId, showDeleteConfirm.profileId);
        
        // Unselect if deleting the currently selected profile
        if (selectedProfile?.profileId === showDeleteConfirm.profileId) {
          onSelectProfile(null);
        }
        
        setShowDeleteConfirm(null);
        if (editingProfile?.profileId === showDeleteConfirm.profileId) {
          setEditingProfile(null);
        }
        loadProfiles();
      } catch (error) {
        console.error("Error deleting client profile:", error);
      }
    }
  };

  const handleAnalyzeCopy = async () => {
    if (!successfulCopy.trim()) return;
    setAnalyzing(true);
    setAnalysisError("");

    try {
      const guide = await analyzeBrandVoice(successfulCopy, globalSettings);
      if (guide) {
        setEditingProfile((prev) => ({
          ...prev,
          brandVoiceSummary: guide,
        }));
      } else {
        setAnalysisError("AI synthesis completed but did not produce output. Please try again.");
      }
    } catch (error: any) {
      console.error("Brand voice analysis error:", error);
      setAnalysisError(error?.message || "Failed to analyze copy. Please verify model credentials and retry.");
    } finally {
      setAnalyzing(false);
    }
  };

  const filteredProfiles = profiles.filter((p) =>
    p.clientName.toLowerCase().includes(search.toLowerCase()) ||
    p.targetAudience.toLowerCase().includes(search.toLowerCase()) ||
    p.mainOffer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">
            Client <span className="text-indigo-500">Profiles</span>
          </h2>
          <p className="text-slate-400 font-medium">
            Manage target audiences, brand voices, and append them directly to strategic generations.
          </p>
        </div>
        {!editingProfile && (
          <button
            onClick={handleStartCreate}
            id="btn-create-client-profile"
            className="flex items-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl shadow-indigo-900/10 active:scale-95"
          >
            <Plus size={16} /> Add Profile
          </button>
        )}
      </div>

      {editingProfile ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Profile Details Form */}
          <div className="lg:col-span-7 bg-[#0f172a]/40 border border-slate-800/40 rounded-[2.5rem] p-8 backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-white italic tracking-tight uppercase">
                {editingProfile.profileId ? "Modify" : "Create"} <span className="text-indigo-400">Profile</span>
              </h3>
              <button
                onClick={() => setEditingProfile(null)}
                className="p-2 text-slate-500 hover:text-white rounded-xl bg-slate-900/40 hover:bg-slate-800/40 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 block">
                  Client / Brand Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp, Jane's Consulting"
                  value={editingProfile.clientName || ""}
                  onChange={(e) => setEditingProfile({ ...editingProfile, clientName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-5 py-4 text-sm font-semibold outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 block">
                  Target Audience
                </label>
                <textarea
                  placeholder="Describe your ideal demographics, pain points, core demographics, and buying behaviors..."
                  value={editingProfile.targetAudience || ""}
                  onChange={(e) => setEditingProfile({ ...editingProfile, targetAudience: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-5 py-4 text-sm font-semibold outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 block">
                  Main Offer / Product USP
                </label>
                <textarea
                  placeholder="Detail the main offer, pricing model, key transformation guarantee, and product structure..."
                  value={editingProfile.mainOffer || ""}
                  onChange={(e) => setEditingProfile({ ...editingProfile, mainOffer: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-5 py-4 text-sm font-semibold outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center pb-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 block">
                    Brand Voice Summary & Guide
                  </label>
                  <span className="text-[9px] font-bold text-slate-600 bg-slate-900/40 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Auto-synthesizable
                  </span>
                </div>
                <textarea
                  placeholder="Outline standard sentence patterns, tone vocabulary, words to avoid, or paste synthesized guidelines here..."
                  value={editingProfile.brandVoiceSummary || ""}
                  onChange={(e) => setEditingProfile({ ...editingProfile, brandVoiceSummary: e.target.value })}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-5 py-4 text-xs font-mono outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all no-scrollbar"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={handleSave}
                disabled={!editingProfile.clientName?.trim()}
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-lg active:scale-95"
              >
                Save Client Profile
              </button>
              <button
                onClick={() => setEditingProfile(null)}
                className="px-6 py-4 bg-slate-900 text-slate-400 hover:text-white border border-slate-800/60 rounded-2xl font-black text-xs tracking-widest uppercase transition-all"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* AI Brand Voice Extractor Tool */}
          <div className="lg:col-span-5 bg-[#0f172a]/20 border border-slate-800/40 rounded-[2.5rem] p-8 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                  <Sparkles size={16} />
                </div>
                <h4 className="text-lg font-black text-white italic tracking-tight uppercase">
                  AI Voice <span className="text-indigo-400">Synthesizer</span>
                </h4>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">
                Paste previous highly successful copywriting pieces, marketing templates, or strategic files below to extract their distinctive brand guide automatically.
              </p>
            </div>

            <div className="space-y-4">
              <textarea
                placeholder="Paste previous successful copy here (the more you paste, the more accurate the analysis)..."
                value={successfulCopy}
                onChange={(e) => setSuccessfulCopy(e.target.value)}
                rows={12}
                className="w-full bg-slate-950/60 border border-slate-800/60 text-slate-300 placeholder:text-slate-700 rounded-2xl px-5 py-4 text-xs outline-none focus:border-indigo-500/30 transition-all font-medium leading-relaxed"
              />

              {analysisError && (
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-start gap-3 text-red-400 text-xs">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p className="font-semibold leading-relaxed">{analysisError}</p>
                </div>
              )}

              <button
                onClick={handleAnalyzeCopy}
                disabled={analyzing || !successfulCopy.trim()}
                className="w-full py-4 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-400 hover:text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    Analyzing & Formatting...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} fill="currentColor" />
                    Synthesize Brand Voice Guide
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search client profiles by name, audience, or offer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0f172a]/40 border border-slate-800/60 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-indigo-500" size={48} />
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="bg-[#0f172a]/40 border border-slate-800/40 rounded-[3rem] h-[400px] flex flex-col items-center justify-center text-center p-20 space-y-6">
              <div className="w-20 h-20 bg-slate-900/60 rounded-[2.5rem] flex items-center justify-center text-slate-700">
                <User size={40} />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black text-white italic tracking-tight uppercase">No Client Profiles</h4>
                <p className="text-slate-600 text-sm max-w-sm">
                  {search ? "No profiles match your search criteria." : "Create your first client profile to inject targeted branding into your assets."}
                </p>
              </div>
              {!search && (
                <button
                  onClick={handleStartCreate}
                  className="flex items-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl shadow-indigo-900/10 active:scale-95"
                >
                  <Plus size={16} /> Add Profile
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => {
                const isSelected = selectedProfile?.profileId === profile.profileId;
                return (
                  <div
                    key={profile.profileId}
                    className={`bg-[#0f172a]/40 border rounded-[2rem] p-6 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between h-[340px] group hover:border-slate-700/60 ${
                      isSelected
                        ? "border-indigo-500/60 ring-2 ring-indigo-500/10 shadow-[0_10px_30px_rgba(99,102,241,0.05)]"
                        : "border-slate-800/40"
                    }`}
                  >
                    <div className="space-y-4 min-h-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            isSelected ? "bg-indigo-600 text-white" : "bg-slate-850 text-slate-400 group-hover:bg-indigo-600/10 group-hover:text-indigo-400"
                          }`}>
                            <User size={18} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-black text-white uppercase italic truncate tracking-tight">
                              {profile.clientName}
                            </h4>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                              Updated {new Date(profile.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEdit(profile)}
                            className="p-2 text-slate-500 hover:text-white bg-slate-900/40 hover:bg-slate-850/40 rounded-lg transition-all text-xs font-bold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(profile)}
                            className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 font-medium text-xs text-slate-400 overflow-y-auto no-scrollbar max-h-[170px] pr-1">
                        {profile.targetAudience && (
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-black uppercase text-indigo-400/80 tracking-wider">
                              Audience:
                            </span>
                            <p className="line-clamp-2 text-slate-300 leading-relaxed font-semibold">
                              {profile.targetAudience}
                            </p>
                          </div>
                        )}
                        {profile.mainOffer && (
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-black uppercase text-indigo-400/80 tracking-wider">
                              Offer:
                            </span>
                            <p className="line-clamp-2 text-slate-300 leading-relaxed font-semibold">
                              {profile.mainOffer}
                            </p>
                          </div>
                        )}
                        {profile.brandVoiceSummary && (
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-black uppercase text-indigo-400/80 tracking-wider">
                              Voice Guide:
                            </span>
                            <p className="line-clamp-2 font-mono text-[11px] text-slate-400 leading-relaxed">
                              {profile.brandVoiceSummary}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/30 flex items-center mt-4">
                      {isSelected ? (
                        <button
                          onClick={() => onSelectProfile(null)}
                          className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                        >
                          <Check size={12} strokeWidth={3} /> Active Profile
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectProfile(profile)}
                          className="w-full py-2.5 bg-slate-900 hover:bg-indigo-600/10 text-slate-400 hover:text-indigo-400 border border-slate-800 hover:border-indigo-500/20 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all"
                        >
                          Activate Profile
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] w-full max-w-sm rounded-[2rem] border border-slate-800 shadow-2xl p-10 text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto">
              <Trash2 size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">
                Delete Profile?
              </h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Are you sure you want to delete the client profile for{" "}
                <span className="text-white">"{showDeleteConfirm.clientName}"</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDelete}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs tracking-widest uppercase transition-all"
              >
                Delete Profile
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="w-full py-4 bg-slate-900 text-slate-400 hover:text-white rounded-xl font-black text-xs tracking-widest uppercase transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
