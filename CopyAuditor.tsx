import React, { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  FileText,
  Brain,
  Wand2,
  TrendingUp,
  Info,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { auditMarketingCopy } from "./geminiService";
import { GlobalSettings } from "./types";

interface CopyAuditorProps {
  globalSettings: GlobalSettings;
}

export default function CopyAuditor({ globalSettings }: CopyAuditorProps) {
  const [inputCopy, setInputCopy] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    critique: string;
    rewrite: string;
    breakdown: string;
    raw: string;
  } | null>(null);

  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [auditStep, setAuditStep] = useState(0);

  const steps = [
    "Deconstructing psychological patterns...",
    "Scanning for passive & weak verbs...",
    "Formulating high-converting headlines...",
    "Engineering emotional hooks...",
    "Finalizing Direct-Response architecture...",
  ];

  const handleAudit = async () => {
    if (!inputCopy.trim()) return;
    setIsAuditing(true);
    setAuditStep(0);

    // Create a rotating step message animation while auditing
    const interval = setInterval(() => {
      setAuditStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      const rawResponse = await auditMarketingCopy(inputCopy, globalSettings);
      
      // Parse the response into exactly three sections
      const parsed = parseAuditResponse(rawResponse);
      setAuditResult({
        ...parsed,
        raw: rawResponse,
      });
    } catch (error: any) {
      alert(error?.message || "Audit failed. Please try again.");
    } finally {
      clearInterval(interval);
      setIsAuditing(false);
    }
  };

  const handleCopy = async (text: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const handleReset = () => {
    setInputCopy("");
    setAuditResult(null);
  };

  function parseAuditResponse(text: string) {
    let critique = "";
    let rewrite = "";
    let breakdown = "";

    const lines = text.split("\n");
    let currentSection: "none" | "critique" | "rewrite" | "breakdown" = "none";
    
    const critiqueContent: string[] = [];
    const rewriteContent: string[] = [];
    const breakdownContent: string[] = [];

    for (const line of lines) {
      const upperLine = line.toUpperCase().trim();
      
      // Look for section headers flexibly (including markdown formatting and symbols)
      if (
        upperLine.includes("1. THE CRITIQUE") || 
        (upperLine.includes("THE CRITIQUE") && (upperLine.includes("1.") || upperLine.includes("###") || upperLine.includes("##")))
      ) {
        currentSection = "critique";
        continue;
      } else if (
        upperLine.includes("2. THE REWRITE") || 
        (upperLine.includes("THE REWRITE") && (upperLine.includes("2.") || upperLine.includes("###") || upperLine.includes("##")))
      ) {
        currentSection = "rewrite";
        continue;
      } else if (
        upperLine.includes("3. THE BREAKDOWN") || 
        (upperLine.includes("THE BREAKDOWN") && (upperLine.includes("3.") || upperLine.includes("###") || upperLine.includes("##")))
      ) {
        currentSection = "breakdown";
        continue;
      }

      if (currentSection === "critique") {
        critiqueContent.push(line);
      } else if (currentSection === "rewrite") {
        rewriteContent.push(line);
      } else if (currentSection === "breakdown") {
        breakdownContent.push(line);
      }
    }

    critique = critiqueContent.join("\n").trim();
    rewrite = rewriteContent.join("\n").trim();
    breakdown = breakdownContent.join("\n").trim();

    // Fallback split logic if lines parsing fails completely
    if (!critique && !rewrite && !breakdown) {
      const parts = text.split(/(?:1\.\s*THE\s*CRITIQUE|2\.\s*THE\s*REWRITE|3\.\s*THE\s*BREAKDOWN)/i);
      if (parts.length >= 4) {
        critique = parts[1].trim();
        rewrite = parts[2].trim();
        breakdown = parts[3].trim();
      } else {
        // Complete fallback - show whole text
        critique = "See full audited report below.";
        rewrite = text;
        breakdown = "";
      }
    }

    return { critique, rewrite, breakdown };
  }

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return (
      <div className="space-y-3.5 text-slate-300 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Check for bullet lists
          const isBullet = trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("•");
          let content = trimmed;
          if (isBullet) {
            content = trimmed.replace(/^[-*•]\s*/, "");
          }

          // Bold parsing: alternate text between ** markers
          const parts = content.split("**");
          const renderedParts = parts.map((part, pIdx) => {
            if (pIdx % 2 === 1) {
              return (
                <strong key={pIdx} className="text-white font-extrabold drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                  {part}
                </strong>
              );
            }
            return part;
          });

          if (isBullet) {
            return (
              <div key={idx} className="flex gap-3.5 items-start pl-2">
                <span className="text-indigo-400 mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
                <span className="text-slate-300 font-medium">{renderedParts}</span>
              </div>
            );
          }

          return <p key={idx} className="font-medium text-slate-300">{renderedParts}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8 animate-in fade-in duration-500" id="copy-auditor-root">
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-black uppercase text-indigo-400 tracking-widest">
          <Wand2 size={12} className="text-indigo-400" /> Conversions Optimizations
        </div>
        <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">
          Direct Response <span className="text-indigo-500">Copy Auditor</span>
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-base font-semibold">
          Paste any sales page, email campaign, or advertisement copy below. Our master direct-response auditor will critique, completely rewrite, and psychologically deconstruct your copy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* INPUT PANEL */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/60 rounded-3xl p-6 space-y-6 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} className="text-indigo-400" /> Source Copy
            </h3>
            {inputCopy.trim() && (
              <button
                onClick={handleReset}
                className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Paste Your Copy Here
              </label>
              <span className="text-[10px] font-bold text-slate-600">
                {inputCopy.length} characters
              </span>
            </div>
            <textarea
              value={inputCopy}
              onChange={(e) => setInputCopy(e.target.value)}
              placeholder="Paste sales letters, VSL scripts, email campaigns, landing page headers, or social media ads that need auditing..."
              className="w-full h-96 bg-slate-950 border border-slate-800/80 rounded-2xl p-4 text-xs font-semibold leading-relaxed outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none placeholder:text-slate-700 text-slate-200"
            />
          </div>

          <button
            onClick={handleAudit}
            disabled={isAuditing || !inputCopy.trim()}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
              !inputCopy.trim()
                ? "bg-slate-800/40 border border-slate-700/20 text-slate-600 cursor-not-allowed"
                : isAuditing
                  ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-400"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500/40"
            }`}
          >
            {isAuditing ? (
              <>
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span>Auditing Copy...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} className="text-white" />
                <span>Run Direct-Response Audit</span>
              </>
            )}
          </button>

          {/* Model Status Note */}
          <div className="flex items-start gap-2.5 bg-slate-950/50 p-4 border border-slate-800/60 rounded-2xl text-[11px] font-semibold text-slate-500">
            <Info size={14} className="text-indigo-400/80 shrink-0 mt-0.5" />
            <p>
              Audits are processed using the active model: <span className="text-slate-300 font-bold">{globalSettings.model}</span>. To swap model architectures, click the Settings icon in the header.
            </p>
          </div>
        </div>

        {/* OUTPUT PANEL */}
        <div className="lg:col-span-7 space-y-6">
          {isAuditing ? (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-16 flex flex-col items-center justify-center text-center space-y-6 h-[600px] backdrop-blur-xl animate-pulse">
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
                  Analyzing Copy Archetype
                </p>
                <p className="text-xs text-indigo-400 font-bold tracking-wide animate-pulse">
                  {steps[auditStep]}
                </p>
              </div>
              <div className="w-64 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-1000"
                  style={{ width: `${((auditStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          ) : auditResult ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* SECTION 1: THE CRITIQUE */}
              <div className="bg-slate-900/60 border border-red-500/10 hover:border-red-500/20 transition-all rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-red-500/10 rounded-lg flex items-center justify-center text-red-400">
                      <ShieldAlert size={14} />
                    </div>
                    <h4 className="text-xs font-black text-red-400 uppercase tracking-widest">
                      1. The Critique
                    </h4>
                  </div>
                  <button
                    onClick={() => handleCopy(auditResult.critique, "critique")}
                    className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800/80 rounded-xl transition-all flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"
                  >
                    {copiedSection === "critique" ? (
                      <>
                        <Check size={10} className="text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={10} /> Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-950/40 p-4 border border-slate-800/40 rounded-2xl">
                  {renderMarkdown(auditResult.critique)}
                </div>
              </div>

              {/* SECTION 2: THE REWRITE */}
              <div className="bg-slate-900/60 border border-emerald-500/10 hover:border-emerald-500/20 transition-all rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      <Sparkles size={14} />
                    </div>
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                      2. The Rewrite
                    </h4>
                  </div>
                  <button
                    onClick={() => handleCopy(auditResult.rewrite, "rewrite")}
                    className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800/80 rounded-xl transition-all flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"
                  >
                    {copiedSection === "rewrite" ? (
                      <>
                        <Check size={10} className="text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={10} /> Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-950/80 p-5 border border-slate-800/80 rounded-2xl shadow-inner relative group">
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md text-[8px] font-black uppercase tracking-widest">
                    Optimized Copy
                  </div>
                  <div className="whitespace-pre-wrap text-sm text-slate-200 font-bold leading-relaxed pr-6">
                    {auditResult.rewrite}
                  </div>
                </div>
              </div>

              {/* SECTION 3: THE BREAKDOWN */}
              <div className="bg-slate-900/60 border border-indigo-500/10 hover:border-indigo-500/20 transition-all rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                      <TrendingUp size={14} />
                    </div>
                    <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">
                      3. The Breakdown
                    </h4>
                  </div>
                  <button
                    onClick={() => handleCopy(auditResult.breakdown, "breakdown")}
                    className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800/80 rounded-xl transition-all flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"
                  >
                    {copiedSection === "breakdown" ? (
                      <>
                        <Check size={10} className="text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={10} /> Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-950/40 p-4 border border-slate-800/40 rounded-2xl">
                  {renderMarkdown(auditResult.breakdown)}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/20 border border-slate-800/40 rounded-3xl p-16 flex flex-col items-center justify-center text-center space-y-6 h-[600px] backdrop-blur-xl">
              <div className="w-16 h-16 bg-slate-950/60 border border-slate-800/60 rounded-2xl flex items-center justify-center text-slate-600">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-2 max-w-sm">
                <p className="text-sm font-black text-white uppercase tracking-wider">
                  No Audit Conducted Yet
                </p>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Enter your copy in the editor on the left and run the audit to unlock professional direct-response copywriting revisions.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2.5 max-w-md pt-2">
                <span className="text-[10px] font-bold text-slate-500 bg-slate-950/60 border border-slate-800/60 px-3 py-1.5 rounded-full flex items-center gap-1">
                  <ChevronRight size={10} className="text-indigo-400" /> Critique Bad Hooks
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-950/60 border border-slate-800/60 px-3 py-1.5 rounded-full flex items-center gap-1">
                  <ChevronRight size={10} className="text-indigo-400" /> Full Re-writing
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-950/60 border border-slate-800/60 px-3 py-1.5 rounded-full flex items-center gap-1">
                  <ChevronRight size={10} className="text-indigo-400" /> Behavioral Logic
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
