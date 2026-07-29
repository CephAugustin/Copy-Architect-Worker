import React, { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Info,
  Brain,
  Share2,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  MessageSquare,
  Bookmark,
  Users,
  ChevronRight,
  Zap,
} from "lucide-react";
import { generateSocialMediaPost } from "./geminiService";
import { GlobalSettings, ClientProfile } from "./types";
import { auth } from "./firebase";
import { saveFileEntry } from "./dbService";

interface SocialMediaGeneratorProps {
  globalSettings: GlobalSettings;
  selectedClientProfile: ClientProfile | null;
}

type PlatformType = "LinkedIn" | "Twitter/X" | "Instagram" | "Facebook";

export default function SocialMediaGenerator({
  globalSettings,
  selectedClientProfile,
}: SocialMediaGeneratorProps) {
  const [platform, setPlatform] = useState<PlatformType>("LinkedIn");
  const [postAbout, setPostAbout] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  const steps = [
    "Analyzing target audience alignment...",
    "Matching brand voice and resonance...",
    "Drafting persuasive scroll-stopping hook...",
    "Formatting line lengths and structure...",
    "Polishing call-to-action for max CTR...",
  ];

  const handleGenerate = async () => {
    if (!postAbout.trim()) return;
    setIsGenerating(true);
    setGenerationStep(0);

    const interval = setInterval(() => {
      setGenerationStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      const response = await generateSocialMediaPost(
        platform,
        postAbout,
        globalSettings,
        selectedClientProfile || undefined
      );
      setGeneratedPost(response);

      // Auto-save social media posts
      if (globalSettings.autoSaveAssets && auth.currentUser) {
        try {
          const sizeInBytes = response.length;
          const dateStr = new Date().toLocaleDateString().replace(/\//g, '-');
          const newFile = {
            fileId: Math.random().toString(36).substr(2, 9),
            userId: auth.currentUser.uid,
            name: `${platform}_Post_${dateStr}.txt`,
            size: sizeInBytes,
            createdAt: Date.now(),
            content: response
          };
          await saveFileEntry(newFile);
        } catch (saveErr) {
          console.error("Auto-Save of social post failed:", saveErr);
        }
      }
    } catch (error: any) {
      alert(error?.message || "Failed to generate social post. Please try again.");
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedPost) return;
    try {
      await navigator.clipboard.writeText(generatedPost);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleReset = () => {
    setPostAbout("");
    setGeneratedPost(null);
  };

  const getPlatformIcon = (type: PlatformType, size: number = 18) => {
    switch (type) {
      case "LinkedIn":
        return <Linkedin size={size} className="text-[#0a66c2]" />;
      case "Twitter/X":
        return <Twitter size={size} className="text-white" />;
      case "Instagram":
        return <Instagram size={size} className="text-[#e1306c]" />;
      case "Facebook":
        return <Facebook size={size} className="text-[#1877f2]" />;
    }
  };

  const getPlatformPromptExplanation = (type: PlatformType) => {
    switch (type) {
      case "LinkedIn":
        return "Professional, story-driven formatting using single-sentence spacing ('broetry style') to maximize readability.";
      case "Twitter/X":
        return "A punchy, concise tweet or a high-value mini-thread with a strong scroll-stopping hook, designed within character limits.";
      case "Instagram":
        return "Features a visually descriptive hook, highly engaging caption formatting, and 5-10 strategic, relevant hashtags.";
      case "Facebook":
        return "Friendly, highly conversational style designed for community-building and encouraging comments & shares.";
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8 animate-in fade-in duration-500" id="social-media-root">
      {/* HEADER SECTION */}
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-black uppercase text-indigo-400 tracking-widest">
          <Share2 size={12} className="text-indigo-400" /> Multi-Platform Amplification
        </div>
        <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">
          Social Media <span className="text-indigo-500">Post Architect</span>
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-base font-semibold">
          Draft persuasive social content optimized for platform-specific algorithms. Automatically integrates your active brand voice and audience profile.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* INPUT CONFIGURATION PANEL */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/60 rounded-3xl p-6 space-y-6 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Zap size={16} className="text-indigo-400 animate-pulse" /> Post Parameters
            </h3>
            {postAbout.trim() && (
              <button
                onClick={handleReset}
                className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>

          {/* Platform Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              Select Destination Platform
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 border border-slate-800 rounded-2xl">
              {(["LinkedIn", "Twitter/X", "Instagram", "Facebook"] as PlatformType[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`py-3 px-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                    platform === p
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10 border border-indigo-500/30"
                      : "text-slate-400 hover:text-white border border-transparent"
                  }`}
                >
                  {getPlatformIcon(p, 13)}
                  <span>{p}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Platform Details Info Box */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl flex gap-3">
            <div className="shrink-0 mt-0.5">{getPlatformIcon(platform, 18)}</div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-slate-300 tracking-wider">
                {platform} Algorithm Focus
              </p>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                {getPlatformPromptExplanation(platform)}
              </p>
            </div>
          </div>

          {/* Source Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                What is the post about?
              </label>
              <span className="text-[10px] font-bold text-slate-600">
                {postAbout.length} characters
              </span>
            </div>
            <textarea
              value={postAbout}
              onChange={(e) => setPostAbout(e.target.value)}
              placeholder="E.g., We are launching a brand new 5-day client acquisition challenge starting Monday. It's free to join and we will build their funnel live. Looking to drive registrations..."
              className="w-full h-48 bg-slate-950 border border-slate-800/80 rounded-2xl p-4 text-xs font-semibold leading-relaxed outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none placeholder:text-slate-700 text-slate-200"
            />
          </div>

          {/* Selected Client Profile Overview */}
          <div className="bg-slate-950/40 p-4 border border-slate-800/60 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1.5">
                <Users size={12} className="text-indigo-400/80" /> Active Profile Context
              </span>
              {selectedClientProfile ? (
                <span className="text-[8px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Connected
                </span>
              ) : (
                <span className="text-[8px] font-black bg-slate-800 border border-slate-700 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  None Selected
                </span>
              )}
            </div>
            {selectedClientProfile ? (
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">
                  {selectedClientProfile.clientName}
                </p>
                <p className="text-[10px] text-slate-400 leading-normal font-medium line-clamp-2">
                  <strong className="text-slate-300">Audience:</strong> {selectedClientProfile.targetAudience}
                </p>
                <p className="text-[10px] text-slate-400 leading-normal font-medium line-clamp-2">
                  <strong className="text-slate-300">Tone:</strong> {selectedClientProfile.brandVoiceSummary}
                </p>
              </div>
            ) : (
              <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                No Client Profile selected. To inject customized brand voices & specific target audience profiles, select a client profile from the top header menu.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !postAbout.trim()}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
              !postAbout.trim()
                ? "bg-slate-800/40 border border-slate-700/20 text-slate-600 cursor-not-allowed"
                : isGenerating
                  ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-400"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500/40"
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span>Architecting Post...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} className="text-white" />
                <span>Build Platform Post</span>
              </>
            )}
          </button>
        </div>

        {/* OUTPUT DELIVERABLE PANEL */}
        <div className="lg:col-span-7 space-y-6">
          {isGenerating ? (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-16 flex flex-col items-center justify-center text-center space-y-6 h-[560px] backdrop-blur-xl animate-pulse">
              <div className="relative">
                <div className="w-16 h-16 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                  <Brain size={28} className="animate-bounce" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-black text-white uppercase tracking-wider">
                  Formulating Social Hook & Spacing
                </p>
                <p className="text-xs text-indigo-400 font-bold tracking-wide animate-pulse">
                  {steps[generationStep]}
                </p>
              </div>
              <div className="w-64 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-1000"
                  style={{ width: `${((generationStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          ) : generatedPost ? (
            <div className="bg-slate-900/60 border border-indigo-500/15 hover:border-indigo-500/25 transition-all rounded-3xl p-6 space-y-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                    {getPlatformIcon(platform, 16)}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">
                      Generated Deliverable
                    </h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Ready for {platform} distribution
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCopy}
                  className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800/80 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                  {copied ? (
                    <>
                      <Check size={12} className="text-emerald-400" /> Copied Post
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Copy to Clipboard
                    </>
                  )}
                </button>
              </div>

              {/* RENDER BOX */}
              <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl relative shadow-inner overflow-y-auto max-h-[460px]">
                {platform === "LinkedIn" && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md text-[8px] font-black uppercase tracking-widest">
                    Broetry Spacing Enabled
                  </div>
                )}
                {platform === "Twitter/X" && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-md text-[8px] font-black uppercase tracking-widest">
                    Twitter Formatted
                  </div>
                )}
                
                <div className="whitespace-pre-wrap text-sm text-slate-200 font-bold leading-relaxed font-sans">
                  {generatedPost}
                </div>
              </div>

              {/* COPY AUDITOR BRIDGE NOTICE */}
              <div className="flex items-start gap-2.5 bg-slate-950/40 p-4 border border-indigo-500/10 rounded-xl text-[11px] font-semibold text-slate-400">
                <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  Need to polish this output further? You can copy this output and paste it into our <strong className="text-indigo-400">Copy Auditor</strong> tab for direct-response psychological diagnostics.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/20 border border-slate-800/40 rounded-3xl p-16 flex flex-col items-center justify-center text-center space-y-6 h-[560px] backdrop-blur-xl">
              <div className="w-16 h-16 bg-slate-950/60 border border-slate-800/60 rounded-2xl flex items-center justify-center text-slate-600">
                <MessageSquare size={24} />
              </div>
              <div className="space-y-2 max-w-sm">
                <p className="text-sm font-black text-white uppercase tracking-wider">
                  No Content Generated Yet
                </p>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Select your platform on the left, describe your core message, and trigger the AI Architect to build highly optimized organic social assets.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2.5 max-w-md pt-2">
                <span className="text-[10px] font-bold text-slate-500 bg-slate-950/60 border border-slate-800/60 px-3 py-1.5 rounded-full flex items-center gap-1">
                  <ChevronRight size={10} className="text-indigo-400" /> LinkedIn Broetry
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-950/60 border border-slate-800/60 px-3 py-1.5 rounded-full flex items-center gap-1">
                  <ChevronRight size={10} className="text-indigo-400" /> Twitter Hooks
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-950/60 border border-slate-800/60 px-3 py-1.5 rounded-full flex items-center gap-1">
                  <ChevronRight size={10} className="text-indigo-400" /> Instagram Hashtags
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-950/60 border border-slate-800/60 px-3 py-1.5 rounded-full flex items-center gap-1">
                  <ChevronRight size={10} className="text-indigo-400" /> Facebook Community
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
