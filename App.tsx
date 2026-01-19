
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AssetType, EmailOptions, LPOptions, VSLOptions, AdOptions, GlobalSettings, GeneratedAsset, BriefInputs } from './types';
import { generateMarketingCopy, autoFillContext, buildFullStrategicBrief, recommendVSLSettings, recommendAdSettings, recommendLPSettings, analyzeReferenceAsset } from './geminiService';
import { 
  Mail, Layout, Video, Megaphone, Settings, Zap, Copy, Check, Trash2, 
  RotateCcw, RefreshCcw, Loader2, Sparkles, ClipboardList, Info, X, 
  Target, Brain, Star, ShieldCheck, ZapIcon, HelpCircle, 
  User, Database, Eraser, ChevronRight, PenTool, Wand2, Link, Link2Off, Layers, Scissors, Hammer, Monitor, Boxes, MousePointerClick, Filter, 
  Sparkle, Shield, Compass, BookOpen, Flag, Clock, MessageSquare, Flame, BookText, Wand, ListChecks, ArrowDownWideNarrow, AppWindow, FlaskConical, Beaker, Gauge, Upload, Globe, Image as ImageIcon
} from 'lucide-react';

// --- Constants ---

const LP_FRAMEWORKS = [
  { 
    id: 'SaaS Acceleration Matrix', 
    name: 'SaaS Acceleration (Speed-Led)', 
    description: 'Perfect for AI tools and software. Focuses on speed of result and ease of use.',
    structure: [
      { step: '1. HERO', detail: 'The core value proposition + outcome claim (Time/Effort reduction).' },
      { step: '2. STATUS QUO CHALLENGE', detail: 'Agitating why current manual or old methods are obsolete.' },
      { step: '3. SYSTEM REVEAL', detail: 'The unique mechanism of how your software solves the problem faster.' },
      { step: '4. PROOF OF SPEED', detail: 'Visual evidence or metrics showing the acceleration in action.' },
      { step: '5. FRICTIONLESS CLOSE', detail: 'Immediate trial or onboarding call to action.' }
    ]
  },
  { 
    id: 'High-Ticket Authority Close', 
    name: 'Authority Close (Premium Service)', 
    description: 'Best for coaching, consulting, or high-value offers. Focuses on trust and logic.',
    structure: [
      { step: '1. THE BOLD PROMISE', detail: 'Qualifying the reader and stating the high-level transformation.' },
      { step: '2. AUTHORITY BRIDGE', detail: 'Why you/your process is the only logical choice (Borrowed trust).' },
      { step: '3. PROCESS OVERVIEW', detail: 'Mapping out the journey to the result (Removing mystery).' },
      { step: '4. OBJECTION CRUSHING', detail: 'Tackling trust, price, and implementation hurdles before they ask.' },
      { step: '5. COMMITMENT CTA', detail: 'A high-intent call (Apply/Book) or direct high-ticket purchase.' }
    ]
  },
  { 
    id: 'Lead Magnet Value-Stacker', 
    name: 'Value-Stacker (Lead Magnet)', 
    description: 'Designed for Opt-ins. Focuses on massive perceived value for a free gift.',
    structure: [
      { step: '1. THE HOOK', detail: 'Immediate reveal of the high-value freebie (PDF/Training).' },
      { step: '2. THE PROBLEM GAP', detail: 'Identifying the specific secret they are missing right now.' },
      { step: '3. VALUE STACK', detail: 'Listing every bonus and benefit included in the free offer.' },
      { step: '4. TRUST SIGNAL', detail: 'Why this is better than most paid products in the space.' },
      { step: '5. GRATIFICATION CTA', detail: 'Immediate download/access button.' }
    ]
  }
];

const AD_FRAMEWORKS = [
  { 
    id: 'AIDA', 
    name: 'AIDA (Attention-Interest-Desire-Action)', 
    description: 'The absolute gold standard for sales copy. Balanced and logical.',
    structure: [
      { step: '1. ATTENTION', detail: 'Scroll-stopping headline or first line.' },
      { step: '2. INTEREST', detail: 'Fascinating fact or relatable insight.' },
      { step: '3. DESIRE', detail: 'The "What\'s in it for me" transformational promise.' },
      { step: '4. ACTION', detail: 'Unmissable call to action.' }
    ]
  },
  { 
    id: 'PAS', 
    name: 'PAS (Problem-Agitate-Solution)', 
    description: 'High conversion for problem-solving products. Drives pain then relief.',
    structure: [
      { step: '1. PROBLEM', detail: 'Calling out a specific, visceral struggle.' },
      { step: '2. AGITATION', detail: 'Describing the emotional or financial cost of waiting.' },
      { step: '3. SOLUTION', detail: 'The product as the only logical escape.' }
    ]
  },
  { 
    id: 'Hook-Insight-Solution', 
    name: 'Hook-Insight-Solution (Viral Form)', 
    description: 'Best for TikTok/Instagram. Fast-paced and value-first.',
    structure: [
      { step: '1. THE HOOK', detail: 'Pattern interrupt within 1.5 seconds.' },
      { step: '2. THE INSIGHT', detail: 'A counter-intuitive revelation.' },
      { step: '3. THE SOLUTION', detail: 'Soft-sell bridge to the offer.' }
    ]
  },
  { 
    id: 'Story-Ad', 
    name: 'The Story-Ad (High Trust)', 
    description: 'Long-form narrative focus. Builds deep rapport before the pitch.',
    structure: [
      { step: '1. THE INCIDENT', detail: 'A relatable rock-bottom moment.' },
      { step: '2. THE DISCOVERY', detail: 'Meeting the mechanism of change.' },
      { step: '3. THE RESULTS', detail: 'Showing the "New Life" evidence.' },
      { step: '4. THE INVITATION', detail: 'Inviting them to join the success story.' }
    ]
  },
  { 
    id: 'The Question-Led', 
    name: 'The Question-Led (Qualification)', 
    description: 'Great for high-ticket or niche services. Filters the wrong people out.',
    structure: [
      { step: '1. THE QUESTION', detail: 'A provocative, binary "Qualifying" question.' },
      { step: '2. THE SEGMENTATION', detail: 'Identifying specifically who this is for.' },
      { step: '3. THE REVELATION', detail: 'Why the solution is finally ready for them.' }
    ]
  }
];

const LP_STRUCTURE_BLOCKS: Record<string, string[]> = {
  'SaaS Acceleration Matrix': [
    'Hero Section (Value Proposition)', 'Problem Reframe (Status Quo Challenge)', 'Proof of Effectiveness', 'Product Explanation (What It Is)', 
    'How It Works (Process Overview)', 'Use Cases & Outcomes', 'Market Timing & Advantage', 'Trust, Ethics & Compliance', 'Commitment & Expectation Setting', 
    'Product Overview', 'Feature or Module Breakdown', 'Bonus Value Stack', 'Risk Reversal', 'Brand Story & Vision', 'Founder or Team Authority'
  ],
  'High-Ticket Authority Close': [
    'Hero Section (Bold Promise + Qualification)', 'Audience Qualification (“Who Is This For?”)', 'Process Overview (Speed & Certainty)', 'Authority & Social Proof (Borrowed Trust)', 
    'Results Proof (Before / After Validation)', 'Pattern Interrupt & Call-Out Section', 'Objection Handling & Buyer Psychology', 'Authority Reassertion & Logic Close', 'Final CTA (Urgency + Simplicity)', 'Footer Branding'
  ],
  'Lead Magnet Value-Stacker': [
    'Hero Section (Free Offer Hook)', 'Immediate Value Framing', 'Authority & Social Proof (Early)', 'Core Free Training Explanation', 
    'Value Stack Introduction', 'Bonus Breakdown (Free Gift Sections)', 'Reinforced Value Comparison', 'Social Proof (Expanded)', 
    'Soft Objection Handling', 'What Members Receive (Preview)', 'Transparency Section', 'Urgency & Action Trigger', 
    'What To Do Next', 'Final Value Stack & CTA', 'Guarantee / Risk Reversal', 'Legal / FAQ / Fine Print'
  ]
};

const LP_PRODUCT_TYPES: Record<string, string> = {
  'SaaS Acceleration Matrix': 'AI Tool / Software Application',
  'High-Ticket Authority Close': 'High-Ticket Service / Coaching Offer',
  'Lead Magnet Value-Stacker': 'Free Training / Value Stack Funnel'
};

const EMAIL_SEQUENCES = [
  { name: '8 Email Welcome Sequence', length: 8 },
  { name: '8 Email Product Aware Sequence', length: 8 },
  { name: '4 Email Deadline Sequence', length: 4 },
  { name: '4 Email Abandoned Cart Sequence', length: 4 },
  { name: '4 Email Retargeting Sequence', length: 4 }
];

const EMAIL_STRUCTURES = [
  { id: '1', name: 'PAS – Problem, Agitate, Solution' },
  { id: '2', name: 'DIC – Direct, Informative, Clear' },
  { id: '3', name: 'HSO – Hook, Story, Offer' },
  { id: '4', name: 'CJN – Callout, Journey, Nugget' },
  { id: '5', name: 'Lesson/Learning Email' },
  { id: '6', name: 'Listicle Email' },
  { id: '7', name: 'AIDA – Attention, Interest, Desire, Action' },
  { id: '8', name: '4Ps – Picture, Promise, Prove, Push' },
  { id: '9', name: 'Before–After–Bridge' },
  { id: '10', name: 'SOAP – Series Opener, Amplify, Point' },
  { id: '11', name: 'TEASE – Tease, Explain, Answer, Show, Encourage' }
];

const SEQUENCE_RECOMMENDATIONS: Record<string, string[]> = {
  '8 Email Welcome Sequence': ['10', '5', '4', '6', '11', '3', '7', '2'],
  '8 Email Product Aware Sequence': ['1', '9', '8', '3', '5', '11', '7', '2'],
  '4 Email Deadline Sequence': ['2', '1', '8', '2'],
  '4 Email Abandoned Cart Sequence': ['2', '7', '8', '2'],
  '4 Email Retargeting Sequence': ['11', '3', '8', '1']
};

const VSL_HOOKS = [
  'Shocking Discovery',
  'The Secret Weapon',
  'Negative to Positive',
  'The New Opportunity',
  'The Pattern Interrupt',
  'The Big Secret'
];

const VSL_FRAMEWORKS = [
  { 
    id: 'Perfect Webinar', 
    name: 'The Perfect Webinar (Brunson)', 
    description: 'Best for long-form sales & webinars. Heavy on Value Stacking.',
    structure: [
      { step: '1. HOOK/MICRO-LEAD', detail: 'Curiosity claim + Bold promise of outcome.' },
      { step: '2. LEAD SECTION', detail: 'Identify core problem, build curiosity about solution.' },
      { step: '3. BACKGROUND STORY', detail: 'The Origin Story: Struggle, Credibility, Epiphany.' },
      { step: '4. UNIQUE MECHANISM', detail: 'Reveal "The Hidden Reason" + Breakdown breakthrough solution.' },
      { step: '5. PRODUCT REVEAL', detail: 'The Stack: Feature -> Benefit -> Value.' },
      { step: '6. CLOSE SECTION', detail: 'Scarcity, Price Anchoring, Guarantee, Final CTA.' }
    ]
  },
  { 
    id: 'Ugly VSL', 
    name: 'The Ugly VSL (Jon Benson)', 
    description: 'Text-on-screen focus. Highly analytical and logical path.',
    structure: [
      { step: '1. VISCERAL PAIN', detail: 'Start with the specific nightmare scenario.' },
      { step: '2. THE AGITATION', detail: 'Why other solutions (diet/software) fail logically.' },
      { step: '3. THE DATA SHIFT', detail: 'Introduce new scientific/logical proof.' },
      { step: '4. ANALYTICAL SOLUTION', detail: 'The "Ugly" but effective mechanism.' },
      { step: '5. CASE STUDY PROOF', detail: 'Heavy logic-based evidence.' },
      { step: '6. COMMAND CLOSE', detail: 'Direct, clear, authoritative instructions.' }
    ]
  },
  { 
    id: 'Elite High-Ticket', 
    name: 'Elite High-Ticket (Authority)', 
    description: 'Short, sharp, and disruptive. Designed for booking high-value calls.',
    structure: [
      { step: '1. DISRUPTIVE OPENING', detail: 'Instantly pattern-interrupt (Shock callout).' },
      { step: '2. BELIEF BREAKING', detail: 'Make them reject what they have tried before.' },
      { step: '3. CLIENT/PERSONAL STORY', detail: 'Discovery of the new breakthrough.' },
      { step: '4. UNIQUE MECHANISM', detail: 'Simple reveal of the "Hidden Layer".' },
      { step: '5. FUTURE CASTING', detail: 'Let them see the transformed future.' },
      { step: '6. SOLUTION INTRO', detail: 'Feature -> Benefit -> Emotional Payoff.' },
      { step: '7. PROOF STACKING', detail: 'Erase doubt with high-impact results.' },
      { step: '8. OFFER + URGENCY', detail: 'Value stack, Guarantee, trigger FOMO.' },
      { step: '9. FINAL CTA', detail: 'Identity shift + Visual instructions.' }
    ]
  },
  { 
    id: 'Unique Mechanism', 
    name: 'Unique Mechanism (Georgi)', 
    description: 'Focuses on the "Secret Sauce" mechanism behind the product.',
    structure: [
      { step: '1. THE HIDDEN REASON', detail: 'Why they are REALLY stuck (surprising).' },
      { step: '2. OLD WAY vs NEW WAY', detail: 'Compare the flaw of current methods.' },
      { step: '3. MECHANISM REVEAL', detail: 'Deep dive into how your solution works.' },
      { step: '4. THE IMPLEMENTATION', detail: 'How your product executes the mechanism.' },
      { step: '5. LOGIC CLOSE', detail: 'Why it is the only viable path left.' }
    ]
  },
  { 
    id: 'Hero Journey', 
    name: 'Hero Journey (Story-Led)', 
    description: 'Deep emotional connection. Ideal for personal brands and coaches.',
    structure: [
      { step: '1. THE ORDINARY WORLD', detail: 'Relatable rock-bottom struggle.' },
      { step: '2. CALL TO ADVENTURE', detail: 'The incident that forced a search for truth.' },
      { step: '3. THE MENTOR', detail: 'Meeting the system or teacher.' },
      { step: '4. THE ROAD BACK', detail: 'Bringing the discovery to others.' },
      { step: '5. EMOTIONAL CTA', detail: 'Help them start their own journey.' }
    ]
  }
];

// --- Helpers ---

const Tooltip = ({ children, text }: React.PropsWithChildren<{ text: string }>) => (
  <div className="group relative flex items-center">
    {children}
    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
      <div className="bg-slate-900 border border-slate-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-2xl whitespace-nowrap uppercase tracking-widest text-center">
        {text}
      </div>
      <div className="w-2.5 h-2.5 bg-slate-900 border-r border-b border-slate-700 rotate-45 mx-auto -mt-[5px]"></div>
    </div>
  </div>
);

const NavTab = ({ label, icon: Icon, active, onClick, tooltip }: { label: string, icon: any, active: boolean, onClick: () => void, tooltip: string }) => (
  <Tooltip text={tooltip}>
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 transition-all duration-300 border-b-2 font-bold text-xs uppercase tracking-widest ${
        active 
          ? 'border-indigo-500 text-white bg-indigo-500/5' 
          : 'border-transparent text-slate-500 hover:text-slate-200 hover:bg-slate-800/40'
      }`}
    >
      <Icon size={16} className={active ? 'text-indigo-400' : 'text-slate-600'} />
      {label}
    </button>
  </Tooltip>
);

const InsideStructureViewer = ({ frameworkId, frameworks, icon: Icon, title }: { frameworkId: string, frameworks: any[], icon: any, title: string }) => {
  const fw = frameworks.find(f => f.id === frameworkId);
  return (
    <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl overflow-hidden shadow-inner">
      <div className="px-5 py-3 border-b border-slate-800/60 flex items-center gap-2 bg-slate-900/50">
        <Icon size={14} className="text-indigo-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{title}</span>
      </div>
      <div className="max-h-[250px] overflow-y-auto p-5 space-y-5">
        {fw?.structure.map((item: any, idx: number) => (
          <div key={idx} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:bg-indigo-600 before:rounded-full before:shadow-[0_0_8px_rgba(79,70,229,0.8)]">
            <p className="text-[10px] font-black text-indigo-100 uppercase italic tracking-tight mb-1">{item.step}</p>
            <p className="text-[9px] text-slate-500 font-medium leading-relaxed">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Custom Hook for Dynamic Loading Status ---
function useLoadingStatus(isLoading: boolean, phrases: string[]) {
  const [currentPhrase, setCurrentPhrase] = useState(phrases[0]);
  const indexRef = useRef(0);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        indexRef.current = (indexRef.current + 1) % phrases.length;
        setCurrentPhrase(phrases[indexRef.current]);
      }, 1500);
      return () => clearInterval(interval);
    } else {
      indexRef.current = 0;
      setCurrentPhrase(phrases[0]);
    }
  }, [isLoading, phrases]);

  return currentPhrase;
}

const SmartLoadingButton = ({ 
  onClick, 
  isLoading, 
  loadingPhrases, 
  label, 
  icon: Icon, 
  disabled, 
  variant = 'primary',
  className = ""
}: { 
  onClick: () => void, 
  isLoading: boolean, 
  loadingPhrases: string[], 
  label: string, 
  icon: any, 
  disabled?: boolean,
  variant?: 'primary' | 'ghost' | 'secondary',
  className?: string
}) => {
  const status = useLoadingStatus(isLoading, loadingPhrases);
  
  const baseStyles = "relative overflow-hidden transition-all duration-300 active:scale-[0.98]";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_10px_30px_rgba(99,102,241,0.2)] disabled:bg-slate-800 disabled:text-slate-600",
    ghost: "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-50",
    secondary: "bg-slate-800/40 border border-slate-700/60 text-slate-400 hover:text-white disabled:opacity-50"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled || isLoading} 
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {isLoading && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full h-full animate-[scan_1.5s_linear_infinite]" 
            style={{ 
              animation: 'scan 2s linear infinite',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)'
            }} 
          />
        </div>
      )}
      <div className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <div className="relative">
              <Loader2 className="animate-spin" size={16} />
              <Zap size={8} className="absolute inset-0 m-auto animate-pulse text-indigo-200" fill="currentColor" />
            </div>
            <span className="animate-in fade-in slide-in-from-bottom-1 duration-300 italic">{status}</span>
          </>
        ) : (
          <>
            <Icon size={16} fill={variant === 'primary' ? 'currentColor' : 'none'} />
            <span>{label}</span>
          </>
        )}
      </div>
      <style>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </button>
  );
};

interface BlueprintData {
  audience: { clientName: string; ageGenderIncome: string; background: string; familyStatus: string; location: string; valuesBeliefs: string; };
  psychology: { pains: { struggles: string; nightmare: string; worstCase: string }; dreams: { outcomes: string; aspirational: string; rewards: string }; };
  promise: { transformation: string; whyShortfall: string; commonFrustrations: string; marketGaps: string; };
  product: { features: string; delivery: string; implementation: string; support: string; };
  benefits: { tangible: string; emotional: string; lifestyle: string; timeMoney: string; };
  objections: { price: string; trust: string; implementation: string; time: string; };
  bigIdea: string;
}

const emptyBlueprint: BlueprintData = {
  audience: { clientName: '', ageGenderIncome: '', background: '', familyStatus: '', location: '', valuesBeliefs: '' },
  psychology: { pains: { struggles: '', nightmare: '', worstCase: '' }, dreams: { outcomes: '', aspirational: '', rewards: '' } },
  promise: { transformation: '', whyShortfall: '', commonFrustrations: '', marketGaps: '' },
  product: { features: '', delivery: '', implementation: '', support: '' },
  benefits: { tangible: '', emotional: '', lifestyle: '', timeMoney: '' },
  objections: { price: '', trust: '', implementation: '', time: '' },
  bigIdea: ''
};

const parseFullBrief = (text: string): BlueprintData => {
  const data: BlueprintData = JSON.parse(JSON.stringify(emptyBlueprint));
  if (!text.trim()) return data;
  const getVal = (regex: RegExp) => {
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  };
  data.audience.clientName = getVal(/CLIENT NAME:\s*(.*)/i);
  data.audience.ageGenderIncome = getVal(/AGE \/ GENDER \/ INCOME:\s*(.*)/i);
  data.audience.background = getVal(/PROFESSIONAL BACKGROUND:\s*(.*)/i);
  data.audience.familyStatus = getVal(/FAMILY STATUS:\s*(.*)/i);
  data.audience.location = getVal(/GEOGRAPHIC LOCATION:\s*(.*)/i);
  data.audience.valuesBeliefs = getVal(/VALUES & BELIEFS:\s*(.*)/i);
  data.psychology.pains.struggles = getVal(/CURRENT STRUGGLES:\s*(.*)/i);
  data.psychology.pains.nightmare = getVal(/NIGHTMARE SCENARIOS:\s*(.*)/i);
  data.psychology.pains.worstCase = getVal(/WORST-CASE AVOIDANCE:\s*(.*)/i);
  data.psychology.dreams.outcomes = getVal(/IDEAL OUTCOMES:\s*(.*)/i);
  data.psychology.dreams.aspirational = getVal(/ASPIRATIONAL GOALS:\s*(.*)/i);
  data.psychology.dreams.rewards = getVal(/EMOTIONAL REWARDS:\s*(.*)/i);
  data.promise.transformation = getVal(/THE TRANSFORMATION:\s*(.*)/i);
  data.promise.whyShortfall = getVal(/WHY SHORTFALL:\s*(.*)/i);
  data.promise.commonFrustrations = getVal(/COMMON FRUSTRATIONS:\s*(.*)/i);
  data.promise.marketGaps = getVal(/MARKET GAPS:\s*(.*)/i);
  data.product.features = getVal(/FEATURES & SPECS:\s*(.*)/i);
  data.product.delivery = getVal(/DELIVERY METHOD:\s*(.*)/i);
  data.product.implementation = getVal(/IMPLEMENTATION:\s*(.*)/i);
  data.product.support = getVal(/SUPPORT & RESOURCES:\s*(.*)/i);
  data.benefits.tangible = getVal(/TANGIBLE RESULTS:\s*(.*)/i);
  data.benefits.emotional = getVal(/EMOTIONAL BENEFITS:\s*(.*)/i);
  data.benefits.lifestyle = getVal(/LIFESTYLE IMPROVEMENTS:\s*(.*)/i);
  data.benefits.timeMoney = getVal(/TIME\/MONEY SAVED:\s*(.*)/i);
  data.objections.price = getVal(/PRICE OBJECTION:\s*(.*)/i);
  data.objections.trust = getVal(/TRUST OBJECTION:\s*(.*)/i);
  data.objections.implementation = getVal(/IMPLEMENTATION OBJECTION:\s*(.*)/i);
  data.objections.time = getVal(/TIME OBJECTION:\s*(.*)/i);
  data.bigIdea = getVal(/LANDING PAGE BIG IDEA:\s*(.*)/i);
  return data;
};

const getAssetSections = (content: string) => {
  const archTag = "--- LANDING PAGE ARCHITECTURE SUMMARY ---";
  const abTag = "--- A/B TESTING STRATEGY ---";
  
  let mainContent = content;
  let archSummary = "";
  let abStrategy = "";

  if (content.includes(archTag)) {
    const parts = content.split(archTag);
    mainContent = parts[0];
    const rest = parts[1];
    if (rest.includes(abTag)) {
      const subParts = rest.split(abTag);
      archSummary = subParts[0];
      abStrategy = subParts[1];
    } else {
      archSummary = rest;
    }
  } else if (content.includes(abTag)) {
    const parts = content.split(abTag);
    mainContent = parts[0];
    abStrategy = parts[1];
  }
  
  return { 
    mainContent: mainContent.trim(), 
    archSummary: archSummary.trim(), 
    abStrategy: abStrategy.trim() 
  };
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'Brief' | AssetType>('Brief');
  const [quickPaste, setQuickPaste] = useState('');
  const [inputs, setInputs] = useState<BriefInputs>({
    businessName: '', industry: '', targetAudience: '', productDescription: '', 
    primaryUSP: '', painPoints: '', tone: 'Professional & Direct', goal: 'Lead Generation'
  });
  
  const [fullBriefText, setFullBriefText] = useState('');
  const [activeContext, setActiveContext] = useState('');
  const [blueprint, setBlueprint] = useState<BlueprintData>(emptyBlueprint);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);
  const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);
  const [isAnalyzingRef, setIsAnalyzingRef] = useState(false);
  const [isRecommendingLP, setIsRecommendingLP] = useState(false);
  const [lpRecommendation, setLpRecommendation] = useState<{ structureType: string; reason: string } | null>(null);
  const [isRecommendingVSL, setIsRecommendingVSL] = useState(false);
  const [vslRecommendation, setVslRecommendation] = useState<{ framework: string; hookType: string; reason: string } | null>(null);
  const [isRecommendingAds, setIsRecommendingAds] = useState(false);
  const [adRecommendation, setAdRecommendation] = useState<{ framework: string; hookType: string; platform: string; reason: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);

  const [showRefinementModal, setShowRefinementModal] = useState<string | null>(null);
  const [refinementFeedback, setRefinementFeedback] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [globalSettings, setGlobalSettings] = useState<GlobalSettings & { performanceMode: boolean }>({
    assetBatching: 1, model: 'gemini-3-flash-preview', useGoogleSearch: false, performanceMode: false
  });

  const [emailOpts, setEmailOpts] = useState<EmailOptions>({ 
    sequenceType: '8 Email Welcome Sequence', emailNumber: 1, structure: '10', 
    recommendedStructure: 'SOAP', ctaType: 'Direct', notes: '', quantity: 1, 
    wordCount: '250', userName: 'Strategist' 
  });

  const [lpOpts, setLpOpts] = useState<LPOptions>({ 
    structureType: 'SaaS Acceleration Matrix', 
    focusStrategy: 'Highlighting Benefit', 
    copyStyle: 'Belief Shift', 
    ctaText: 'Get Access Now',
    includeBlocks: LP_STRUCTURE_BLOCKS['SaaS Acceleration Matrix'],
    pageType: 'Sales Page',
    pageGoal: 'Direct Sale / Conversion'
  });
  
  const [vslOpts, setVslOpts] = useState<VSLOptions>({ 
    hookType: 'Shocking Discovery', 
    scriptLength: '5 min (Standard)', 
    framework: 'Perfect Webinar', 
    tone: 'Authoritative',
    vslGoal: 'Convert viewer into a high-ticket coaching client',
    targetLandingPage: 'Sales Page'
  });

  const [adOpts, setAdOpts] = useState<AdOptions>({ 
    platform: 'Facebook', 
    framework: 'AIDA',
    creativeAngle: 'UGC Style', 
    hookType: 'The Question',
    ctaText: 'Learn More',
    variations: 3,
    adGoal: 'Generate high-quality leads for my business',
    targetContext: 'Potential customers who have never heard of us before',
    tone: 'Professional & Authoritative'
  });

  // Update Email Recommendations
  useEffect(() => {
    const recs = SEQUENCE_RECOMMENDATIONS[emailOpts.sequenceType];
    if (recs && recs[emailOpts.emailNumber - 1]) {
      const recId = recs[emailOpts.emailNumber - 1];
      const recName = EMAIL_STRUCTURES.find(s => s.id === recId)?.name || '';
      setEmailOpts(prev => ({ ...prev, recommendedStructure: recName, structure: recId }));
    }
  }, [emailOpts.sequenceType, emailOpts.emailNumber]);

  useEffect(() => {
    if (globalSettings.performanceMode) document.body.classList.add('performance-mode');
    else document.body.classList.remove('performance-mode');
  }, [globalSettings.performanceMode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLpOpts(prev => ({ 
          ...prev, 
          referenceAsset: { type: 'image', data: reader.result as string } 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeReference = async () => {
    if (!lpOpts.referenceAsset?.data) return;
    setIsAnalyzingRef(true);
    try {
      const analysis = await analyzeReferenceAsset(
        lpOpts.referenceAsset.type, 
        lpOpts.referenceAsset.data, 
        globalSettings
      );
      setLpOpts(prev => ({ 
        ...prev, 
        referenceAsset: { ...prev.referenceAsset!, analysis } 
      }));
    } finally { 
      setIsAnalyzingRef(false); 
    }
  };

  const handleGetLPRecommendation = async () => {
    if (!activeContext) return;
    setIsRecommendingLP(true);
    const rec = await recommendLPSettings(activeContext, globalSettings);
    setLpRecommendation(rec);
    setIsRecommendingLP(false);
  };

  const applyLpRecommendation = () => {
    if (lpRecommendation) {
      handleStructureChange(lpRecommendation.structureType);
    }
  };

  const handleGetVSLRecommendation = async () => {
    if (!activeContext) return;
    setIsRecommendingVSL(true);
    const rec = await recommendVSLSettings(activeContext, globalSettings);
    setVslRecommendation(rec);
    setIsRecommendingVSL(false);
  };

  const applyVSLRecommendation = () => {
    if (vslRecommendation) {
      setVslOpts(prev => ({
        ...prev,
        framework: vslRecommendation.framework as any,
        hookType: vslRecommendation.hookType
      }));
    }
  };

  const handleGetAdRecommendation = async () => {
    if (!activeContext) return;
    setIsRecommendingAds(true);
    const rec = await recommendAdSettings(activeContext, globalSettings);
    setAdRecommendation(rec);
    setIsRecommendingAds(false);
  };

  const applyAdRecommendation = () => {
    if (adRecommendation) {
      setAdOpts(prev => ({
        ...prev,
        framework: adRecommendation.framework as any,
        hookType: adRecommendation.hookType,
        platform: adRecommendation.platform as any
      }));
    }
  };

  const handleAutoFill = async () => {
    if (!quickPaste.trim()) return;
    setIsAutoFilling(true);
    const result = await autoFillContext(quickPaste, globalSettings);
    setInputs(prev => ({ ...prev, ...result }));
    setIsAutoFilling(false);
  };

  const handleBuildBrief = async () => {
    setIsBuilding(true);
    try {
      let finalInputs = { ...inputs };
      
      const isManuallyComplete = !!(
        inputs.businessName.trim() &&
        inputs.industry.trim() &&
        inputs.targetAudience.trim() &&
        inputs.productDescription.trim() &&
        inputs.primaryUSP.trim() &&
        inputs.painPoints.trim()
      );

      if (!isManuallyComplete && quickPaste.trim()) {
        const extracted = await autoFillContext(quickPaste, globalSettings);
        finalInputs = { ...inputs, ...extracted };
        setInputs(finalInputs);
      }
      
      if (!finalInputs.businessName.trim()) {
        throw new Error("Business Name is required to build a brief. Please enter it manually or provide source text.");
      }

      const brief = await buildFullStrategicBrief(finalInputs, globalSettings);
      setFullBriefText(brief);
      setBlueprint(parseFullBrief(brief));
    } catch (e: any) { 
      alert(e.message || "Brief construction failed."); 
    } finally { 
      setIsBuilding(false); 
    }
  };

  const handleInject = () => {
    if (!fullBriefText) return;
    setActiveContext(fullBriefText);
    setIsInjecting(true);
    setTimeout(() => setIsInjecting(false), 2000);
  };

  const handleCopyAndConnect = async () => {
    if (!fullBriefText) return;
    await copyToClipboard(fullBriefText, 'full');
    handleInject();
  };

  const handleGenerate = async (assetIdToRefine?: string, refinementType: 'Fix' | 'Remake' = 'Remake') => {
    if (!activeContext) { setActiveTab('Brief'); return; }
    setIsGeneratingAsset(true);
    try {
      const assetToRefine = assetIdToRefine ? assets.find(a => a.id === assetIdToRefine) : null;
      const type = assetToRefine ? assetToRefine.type : activeTab as AssetType;
      const options = type === 'Email' ? emailOpts : type === 'Landing Page' ? lpOpts : type === 'VSL' ? vslOpts : adOpts;
      const result = await generateMarketingCopy(activeContext, type, options, globalSettings, !!assetIdToRefine, refinementFeedback, refinementType, assetToRefine?.content || "");
      if (assetIdToRefine) {
        setAssets(prev => prev.map(a => a.id === assetIdToRefine ? { ...a, content: result.text, timestamp: Date.now() } : a));
        setShowRefinementModal(null);
        setRefinementFeedback('');
      } else {
        setAssets(prev => [{ id: Math.random().toString(36).substr(2, 9), type, content: result.text, timestamp: Date.now() }, ...prev]);
      }
    } catch (err) { alert("Generation failed."); } finally { setIsGeneratingAsset(false); }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    setInputs({ businessName: '', industry: '', targetAudience: '', productDescription: '', primaryUSP: '', painPoints: '', tone: 'Professional & Direct', goal: 'Lead Generation' });
    setQuickPaste('');
  };

  const toggleLPBlock = (block: string) => {
    setLpOpts(prev => {
      const newBlocks = prev.includeBlocks.includes(block) ? prev.includeBlocks.filter(b => b !== block) : [...prev.includeBlocks, block];
      return { ...prev, includeBlocks: newBlocks };
    });
  };

  const handleStructureChange = (val: string) => {
    setLpOpts(prev => ({
      ...prev,
      structureType: val as any,
      includeBlocks: LP_STRUCTURE_BLOCKS[val]
    }));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30 font-sans">
      <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <header className="sticky top-0 z-40 bg-[#020617]/90 backdrop-blur-xl border-b border-slate-800/60 shadow-2xl">
        <div className="max-w-[1500px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/40 transform -rotate-6">
              <ZapIcon size={22} className="text-white" fill="currentColor" />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Copy <span className="text-indigo-400">Architect AI</span></h1>
          </div>
          <nav className="flex items-center gap-2">
            <NavTab label="Briefs" icon={ClipboardList} active={activeTab === 'Brief'} onClick={() => setActiveTab('Brief')} tooltip="Strategy Architect" />
            <NavTab label="Emails" icon={Mail} active={activeTab === 'Email'} onClick={() => setActiveTab('Email')} tooltip="Email Matrix" />
            <NavTab label="Landing Page" icon={Layout} active={activeTab === 'Landing Page'} onClick={() => setActiveTab('Landing Page')} tooltip="Sales Builder" />
            <NavTab label="VSL" icon={Video} active={activeTab === 'VSL'} onClick={() => setActiveTab('VSL')} tooltip="Video Scripts" />
            <NavTab label="Ads" icon={Megaphone} active={activeTab === 'Ads'} onClick={() => setActiveTab('Ads')} tooltip="Ad Variations" />
          </nav>
          <button onClick={() => setIsSettingsOpen(true)} className="p-3 rounded-2xl border border-slate-800 hover:bg-slate-800 text-slate-400 transition-all"><Settings size={20} /></button>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto px-8 py-12 relative z-10">
        {activeTab === 'Brief' ? (
          <div className="flex flex-col items-center animate-in fade-in duration-700">
            <div className="text-center mb-16 space-y-2">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-black uppercase text-indigo-400 tracking-widest mb-2">
                 <ZapIcon size={12} fill="currentColor" /> Marketing Strategy Architect
               </div>
               <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase">Elite <span className="text-indigo-500">Copywriting Briefs</span></h2>
               <p className="text-slate-500 max-w-2xl mx-auto text-base font-medium">From brain dump to comprehensive blueprint. The foundation for emails, VSLs, and high-ticket landing pages.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full items-start">
              <div className="lg:col-span-4 lg:sticky lg:top-32">
                <div className="bg-[#0f172a]/80 border border-slate-800/60 rounded-[2rem] p-8 shadow-2xl space-y-8 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"><Target size={24} className="text-white" /></div>
                      <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Project Setup</h3>
                    </div>
                    <button onClick={() => { handleReset(); setFullBriefText(''); setBlueprint(emptyBlueprint); }} className="px-4 py-2 bg-slate-800/40 border border-slate-700/60 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"><RotateCcw size={14} className="inline mr-2" /> Clear</button>
                  </div>
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400"><Zap size={14} fill="currentColor" /> 1. Quick Paste</div>
                      <textarea value={quickPaste} onChange={(e) => setQuickPaste(e.target.value)} placeholder="Paste data here..." className="w-full h-32 bg-slate-950/60 border border-slate-800/60 rounded-2xl p-5 text-xs font-medium outline-none resize-none leading-relaxed" />
                      <SmartLoadingButton 
                        onClick={handleAutoFill} 
                        isLoading={isAutoFilling} 
                        loadingPhrases={["Parsing text...", "Identifying entities...", "Extracting intent..."]}
                        label="Auto-Fill from Text"
                        icon={Wand2}
                        variant="secondary"
                        disabled={!quickPaste}
                        className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                      />
                    </div>
                    <div className="h-[1px] bg-slate-800/60"></div>
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400"><Info size={14} /> 2. Verify Context</div>
                      <div className="grid grid-cols-2 gap-4">
                        <input placeholder="Business Name" value={inputs.businessName} onChange={e => setInputs({...inputs, businessName: e.target.value})} className="w-full bg-slate-950/60 border border-slate-800/60 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                        <input placeholder="Industry" value={inputs.industry} onChange={e => setInputs({...inputs, industry: e.target.value})} className="w-full bg-slate-950/60 border border-slate-800/60 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                      </div>
                      <input placeholder="Ideal Target Audience" value={inputs.targetAudience} onChange={e => setInputs({...inputs, targetAudience: e.target.value})} className="w-full bg-slate-950/60 border border-slate-800/60 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                      <textarea placeholder="Product Description" value={inputs.productDescription} onChange={e => setInputs({...inputs, productDescription: e.target.value})} className="w-full h-20 bg-slate-950/60 border border-slate-800/60 rounded-xl px-4 py-3 text-xs font-bold outline-none resize-none" />
                      <input placeholder="Primary USP" value={inputs.primaryUSP} onChange={e => setInputs({...inputs, primaryUSP: e.target.value})} className="w-full bg-slate-950/60 border border-slate-800/60 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                      <input placeholder="Pain Points" value={inputs.painPoints} onChange={e => setInputs({...inputs, painPoints: e.target.value})} className="w-full bg-slate-950/60 border border-slate-800/60 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                      <div className="grid grid-cols-2 gap-4">
                         <select value={inputs.tone} onChange={e => setInputs({...inputs, tone: e.target.value})} className="w-full bg-slate-950/60 border border-slate-800/60 rounded-xl px-4 py-3 text-xs font-bold outline-none"><option>Professional & Direct</option><option>Witty & Irreverent</option><option>Elite & Authoritative</option></select>
                         <select value={inputs.goal} onChange={e => setInputs({...inputs, goal: e.target.value})} className="w-full bg-slate-950/60 border border-slate-800/60 rounded-xl px-4 py-3 text-xs font-bold outline-none"><option>Lead Generation</option><option>Direct Sales</option><option>Affiliate Marketing</option></select>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button onClick={handleReset} className="flex-1 py-4 bg-slate-800/40 border border-slate-700/60 rounded-2xl font-black text-[10px] uppercase text-slate-400 hover:text-white transition-all"><RotateCcw size={16} className="inline mr-1" /> Reset</button>
                    <SmartLoadingButton 
                        onClick={handleBuildBrief} 
                        isLoading={isBuilding} 
                        loadingPhrases={["Synthesizing data...", "Applying psychology...", "Finalizing strategy..."]}
                        label="Build Full Brief"
                        icon={ChevronRight}
                        disabled={!inputs.businessName && !quickPaste.trim()}
                        className="flex-[2] py-4 rounded-2xl font-black text-[10px] uppercase"
                      />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8 pb-32">
                {!fullBriefText && !isBuilding ? (
                  <div className="bg-[#0f172a]/40 border border-slate-800/40 rounded-[3rem] h-[800px] flex flex-col items-center justify-center text-center p-20 space-y-6">
                    <div className="w-20 h-20 bg-slate-900/60 rounded-[2.5rem] flex items-center justify-center text-slate-700"><PenTool size={40} /></div>
                    <div className="space-y-2"><h4 className="text-2xl font-black text-white italic tracking-tight">Ready to Build</h4><p className="text-slate-600 text-sm max-w-sm">Enter business info manually or use the Quick Paste tool to populate the context automatically.</p></div>
                  </div>
                ) : isBuilding ? (
                  <div className="bg-[#0f172a]/40 border border-slate-800/40 rounded-[3rem] h-[800px] flex flex-col items-center justify-center text-center p-20 space-y-8 animate-pulse">
                    <div className="relative"><div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div><Sparkles className="absolute inset-0 m-auto text-indigo-400" size={24} /></div>
                    <div className="space-y-2"><h4 className="text-2xl font-black text-white italic tracking-tight uppercase">Architecting Strategy...</h4><p className="text-slate-600 text-sm max-w-md italic tracking-widest uppercase text-[10px] opacity-60">Applying behavioral economics & psychological triggers</p></div>
                  </div>
                ) : (
                  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="bg-[#0f172a]/60 border border-slate-800/60 rounded-[3rem] p-12 shadow-2xl relative">
                       <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
                          <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Strategy Blueprint</h3>
                          <div className="flex gap-4">
                             <button onClick={handleCopyAndConnect} className="flex items-center gap-3 px-8 py-4 bg-indigo-600 rounded-xl font-black text-[10px] uppercase text-white shadow-xl hover:bg-indigo-500 transition-all">{copiedId === 'full' ? <Check size={16} /> : <Copy size={16} />} {isInjecting ? "Copy and Connected!" : "Copy Full Brief & Connect"}</button>
                             <button onClick={handleInject} className={`p-4 bg-slate-900 border border-slate-800 rounded-xl transition-all shadow-lg ${isInjecting ? 'text-emerald-400 border-emerald-500/40' : 'text-slate-500 hover:text-indigo-400'}`}><Database size={24} /></button>
                          </div>
                       </div>
                       <div className="prose prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-slate-300 font-serif italic text-xl px-4 opacity-90 selection:bg-indigo-500/30">
                          {fullBriefText}
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in zoom-in-95 duration-500">
             <div className="lg:col-span-4 space-y-8">
                <div className="bg-[#0f172a]/80 border border-slate-800/60 rounded-[3rem] p-10 space-y-8 backdrop-blur-md sticky top-32 shadow-2xl">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">
                        {activeTab === 'Email' ? <Mail size={16} /> : activeTab === 'Landing Page' ? <Layout size={16} /> : activeTab === 'VSL' ? <Video size={16} /> : <Megaphone size={16} />}
                        <span>{activeTab} Module</span>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${activeContext ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {activeContext ? <Link size={10} /> : <Link2Off size={10} />}
                        {activeContext ? 'Connected' : 'Unlinked'}
                      </div>
                   </div>

                   {activeTab === 'Email' ? (
                     <div className="space-y-6">
                        <div className="space-y-3">
                           <Tooltip text="Select the type of automated funnel sequence.">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sequence Type</label>
                           </Tooltip>
                           <select value={emailOpts.sequenceType} onChange={e => setEmailOpts({...emailOpts, sequenceType: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold outline-none">
                              {EMAIL_SEQUENCES.map(seq => <option key={seq.name} value={seq.name}>{seq.name}</option>)}
                           </select>
                        </div>
                        <div className="space-y-3">
                           <Tooltip text="The position of this email within the sequence.">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Number</label>
                           </Tooltip>
                           <div className="grid grid-cols-4 gap-2">
                             {Array.from({ length: EMAIL_SEQUENCES.find(s => s.name === emailOpts.sequenceType)?.length || 4 }).map((_, i) => (
                               <button key={i} onClick={() => setEmailOpts({...emailOpts, emailNumber: i + 1})} className={`py-3 rounded-xl font-black text-xs transition-all ${emailOpts.emailNumber === i + 1 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}>#{i + 1}</button>
                             ))}
                           </div>
                        </div>
                        <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-2">
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Zap size={12} fill="currentColor" /> Recommendation
                          </p>
                          <p className="text-xs font-bold text-slate-300">Target Structure: <span className="text-white underline decoration-indigo-500/50">{emailOpts.recommendedStructure}</span></p>
                        </div>
                        <div className="space-y-3">
                          <Tooltip text="Change the psychological formula for this specific email.">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Structure Override</label>
                          </Tooltip>
                          <select value={emailOpts.structure} onChange={e => setEmailOpts({...emailOpts, structure: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold outline-none">
                            {EMAIL_STRUCTURES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-3">
                           <Tooltip text="Add specific context, stories, or technical details for the AI.">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Notes / Special Instructions</label>
                           </Tooltip>
                           <textarea value={emailOpts.notes} onChange={e => setEmailOpts({...emailOpts, notes: e.target.value})} placeholder="Mistakes to avoid, specific details to include..." className="w-full h-24 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-medium outline-none resize-none placeholder:text-slate-700" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                             <Tooltip text="The name used to sign off the message.">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sign-off Name</label>
                             </Tooltip>
                             <input value={emailOpts.userName} onChange={e => setEmailOpts({...emailOpts, userName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold outline-none" />
                          </div>
                          <div className="space-y-3">
                             <Tooltip text="Desired length of the final email content.">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Word Count</label>
                             </Tooltip>
                             <input value={emailOpts.wordCount} onChange={e => setEmailOpts({...emailOpts, wordCount: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold outline-none" />
                          </div>
                        </div>
                     </div>
                   ) : activeTab === 'Landing Page' ? (
                     <div className="space-y-6">
                        <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-[2rem] space-y-6">
                          <div className="flex items-center gap-3 text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em]"><ImageIcon size={16} /> Inspiration Asset</div>
                          <div className="flex flex-col gap-4">
                            <label className="flex items-center justify-center gap-3 w-full py-4 bg-slate-900 border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-800 transition-all text-slate-400 hover:text-white">
                              <Upload size={18} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Upload Screenshot</span>
                              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                            </label>
                            <div className="flex items-center gap-2 px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl">
                              <Globe size={16} className="text-slate-500" />
                              <input placeholder="URL to replicate..." className="bg-transparent border-none outline-none text-[10px] w-full text-slate-300 font-bold" value={lpOpts.referenceAsset?.type === 'url' ? lpOpts.referenceAsset.data : ''} onChange={e => setLpOpts(prev => ({ ...prev, referenceAsset: { type: 'url', data: e.target.value } }))} />
                            </div>
                            {lpOpts.referenceAsset?.data && (
                              <button onClick={handleAnalyzeReference} disabled={isAnalyzingRef} className="w-full py-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-600/20 transition-all flex items-center justify-center gap-2">
                                {isAnalyzingRef ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                {isAnalyzingRef ? 'Extracting Architecture...' : 'Analyze & Integrate Asset'}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                           <Tooltip text="The specific conversion objective of this page.">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Flag size={14} /> Page Type</label>
                           </Tooltip>
                           <select value={lpOpts.pageType} onChange={e => setLpOpts({...lpOpts, pageType: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold outline-none">
                              <option value="Opt-in Page">Opt-in Page</option>
                              <option value="Registration Page">Registration Page</option>
                              <option value="Sales Page">Sales Page</option>
                           </select>
                        </div>

                        <SmartLoadingButton 
                          onClick={handleGetLPRecommendation} 
                          isLoading={isRecommendingLP} 
                          loadingPhrases={["Scanning Brief...", "Matching Framework...", "Predicting Conversion..."]}
                          label="Suggest Best LP parameters"
                          icon={Sparkles}
                          variant="ghost"
                          disabled={!activeContext}
                          className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                        />

                        {lpRecommendation && (
                           <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-2 animate-in fade-in zoom-in-95 duration-300">
                             <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                  <Sparkle size={12} fill="currentColor" /> Strategy Tip
                                </p>
                                <button onClick={applyLpRecommendation} className="text-[8px] font-black text-white bg-indigo-600 px-2 py-1 rounded hover:bg-indigo-500 transition-colors uppercase">Apply</button>
                             </div>
                             <p className="text-[11px] font-bold text-slate-300">Framework: <span className="text-white italic">{lpRecommendation.structureType}</span></p>
                             <p className="text-[10px] leading-relaxed text-slate-500 italic">{lpRecommendation.reason}</p>
                           </div>
                        )}

                        <div className="space-y-3">
                           <Tooltip text="Describe exactly what this page is trying to achieve.">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Target size={14} /> Reason & Goal</label>
                           </Tooltip>
                           <textarea value={lpOpts.pageGoal} onChange={e => setLpOpts({...lpOpts, pageGoal: e.target.value})} placeholder="e.g. Sales page for $2k coaching program..." className="w-full h-20 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-medium outline-none resize-none placeholder:text-slate-700" />
                        </div>

                        <div className="space-y-3">
                           <Tooltip text="The structural foundation and section flow of the copy.">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Monitor size={14} /> Framework Selection</label>
                           </Tooltip>
                           <select value={lpOpts.structureType} onChange={e => handleStructureChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold outline-none">
                              {Object.keys(LP_STRUCTURE_BLOCKS).map(s => (
                                <option key={s} value={s}>
                                  {LP_PRODUCT_TYPES[s]} ({s})
                                </option>
                              ))}
                           </select>
                        </div>

                        <InsideStructureViewer 
                          frameworkId={lpOpts.structureType} 
                          frameworks={LP_FRAMEWORKS} 
                          icon={BookText} 
                          title="LP Psychological logic" 
                        />

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-3">
                              <Tooltip text="Choose between highlighting the pain or the solution.">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Compass size={12} /> Focus Strategy</label>
                              </Tooltip>
                              <select value={lpOpts.focusStrategy} onChange={e => setLpOpts({...lpOpts, focusStrategy: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] font-bold outline-none">
                                <option value="Relatable Problem">Relatable Problem</option>
                                <option value="Highlighting Benefit">Highlighting Benefit</option>
                              </select>
                           </div>
                           <div className="space-y-3">
                              <Tooltip text="Direct response vs deep psychological belief shifting.">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><BookOpen size={12} /> Copy Style</label>
                              </Tooltip>
                              <select value={lpOpts.copyStyle} onChange={e => setLpOpts({...lpOpts, copyStyle: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] font-bold outline-none">
                                <option value="Belief Shift">Belief Shift</option>
                                <option value="Direct Response">Direct Response</option>
                              </select>
                           </div>
                        </div>
                        <div className="space-y-3">
                           <Tooltip text="The text displayed on primary buttons.">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><MousePointerClick size={14} /> CTA Text</label>
                           </Tooltip>
                           <input value={lpOpts.ctaText} onChange={e => setLpOpts({...lpOpts, ctaText: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold outline-none" />
                        </div>
                        <div className="space-y-3">
                           <Tooltip text="Toggle specific sections to include in the output.">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Boxes size={14} /> Structural Blocks</label>
                           </Tooltip>
                           <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto p-3 border border-slate-800/40 rounded-xl bg-slate-950/40">
                              {LP_STRUCTURE_BLOCKS[lpOpts.structureType].map(block => (
                                <button key={block} onClick={() => toggleLPBlock(block)} className={`px-2 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${lpOpts.includeBlocks.includes(block) ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.1)]' : 'bg-slate-950 border-slate-800 text-slate-600 opacity-40 grayscale'}`}>
                                  {block}
                                </button>
                              ))}
                           </div>
                        </div>
                     </div>
                   ) : activeTab === 'VSL' ? (
                     <div className="space-y-6">
                        <div className="space-y-3">
                           <Tooltip text="The page the viewer goes to after the video.">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Flag size={14} /> Target Landing Page</label>
                           </Tooltip>
                           <select value={vslOpts.targetLandingPage} onChange={e => setVslOpts({...vslOpts, targetLandingPage: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold outline-none">
                              <option value="Opt-in Page">Opt-in Page</option>
                              <option value="Registration Page">Registration Page</option>
                              <option value="Sales Page">Sales Page</option>
                           </select>
                        </div>
                        
                        <div className="space-y-3">
                           <Tooltip text="The primary action the video should drive.">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Target size={14} /> VSL Goal & Purpose</label>
                           </Tooltip>
                           <textarea value={vslOpts.vslGoal} onChange={e => setVslOpts({...vslOpts, vslGoal: e.target.value})} placeholder="e.g. Convert viewer into a high-ticket coaching client..." className="w-full h-20 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-medium outline-none resize-none placeholder:text-slate-700" />
                        </div>

                        <SmartLoadingButton 
                          onClick={handleGetVSLRecommendation} 
                          isLoading={isRecommendingVSL} 
                          loadingPhrases={["Synthesizing Script Hook...", "Calculating Retention...", "Optimizing Narrative Flow..."]}
                          label="Suggest Best VSL Parameters"
                          icon={Wand}
                          variant="ghost"
                          disabled={!activeContext}
                          className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                        />

                        {vslRecommendation && (
                          <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-2 animate-in fade-in zoom-in-95 duration-300">
                             <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                  <Sparkle size={12} fill="currentColor" /> Strategy Tip
                                </p>
                                <button onClick={applyVSLRecommendation} className="text-[8px] font-black text-white bg-indigo-600 px-2 py-1 rounded hover:bg-indigo-500 transition-colors uppercase">Apply</button>
                             </div>
                             <p className="text-[11px] font-bold text-slate-300">Framework: <span className="text-white italic">{vslRecommendation.framework}</span></p>
                             <p className="text-[11px] font-bold text-slate-300">Hook: <span className="text-white italic">{vslRecommendation.hookType}</span></p>
                             <p className="text-[10px] leading-relaxed text-slate-500 italic">{vslRecommendation.reason}</p>
                          </div>
                        )}

                        <div className="space-y-3">
                           <Tooltip text="Guide the duration and content density of the script.">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Clock size={14} /> Script Length</label>
                           </Tooltip>
                           <select value={vslOpts.scriptLength} onChange={e => setVslOpts({...vslOpts, scriptLength: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold outline-none">
                              <option>2 min (Short Hook)</option>
                              <option>5 min (Standard)</option>
                              <option>10 min (In-Depth)</option>
                              <option>20 min (Webinar Style)</option>
                           </select>
                        </div>

                        <div className="space-y-3">
                           <Tooltip text="Narrative structure used to build authority and desire.">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Layers size={14} /> Script Framework</label>
                           </Tooltip>
                           <select value={vslOpts.framework} onChange={e => setVslOpts({...vslOpts, framework: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold outline-none">
                              {VSL_FRAMEWORKS.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                              ))}
                           </select>
                        </div>

                        <InsideStructureViewer 
                          frameworkId={vslOpts.framework} 
                          frameworks={VSL_FRAMEWORKS} 
                          icon={ListChecks} 
                          title="Framework Blueprint" 
                        />

                        <div className="space-y-3">
                           <Tooltip text="The vocal delivery style and emotional energy.">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Flame size={14} /> Script Tone</label>
                           </Tooltip>
                           <select value={vslOpts.tone} onChange={e => setVslOpts({...vslOpts, tone: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold outline-none">
                              <option>Authoritative & Professional</option>
                              <option>Relatable & Humble</option>
                              <option>Hype & High Energy</option>
                              <option>Educational & Direct</option>
                           </select>
                        </div>
                     </div>
                   ) : activeTab === 'Ads' ? (
                     <div className="space-y-6">
                        <div className="space-y-3">
                           <Tooltip text="The primary objective for this ad campaign.">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Target size={14} /> Ad Goal</label>
                           </Tooltip>
                           <textarea value={adOpts.adGoal} onChange={e => setAdOpts({...adOpts, adGoal: e.target.value})} placeholder="e.g. Generate high-quality leads for my business..." className="w-full h-16 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-medium outline-none resize-none placeholder:text-slate-700" />
                        </div>
                        <div className="space-y-3">
                           <Tooltip text="Detailed information about the segment being targeted.">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><User size={14} /> Target Context</label>
                           </Tooltip>
                           <textarea value={adOpts.targetContext} onChange={e => setAdOpts({...adOpts, targetContext: e.target.value})} placeholder="e.g. Potential customers who have never heard of us..." className="w-full h-16 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-medium outline-none resize-none placeholder:text-slate-700" />
                        </div>

                        <SmartLoadingButton 
                          onClick={handleGetAdRecommendation} 
                          isLoading={isRecommendingAds} 
                          loadingPhrases={["Scanning Market Angles...", "Analyzing Scroll-Stoppers...", "Predicting Ad CTR..."]}
                          label="Suggest Best Ad parameters"
                          icon={Sparkles}
                          variant="ghost"
                          disabled={!activeContext}
                          className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                        />

                        {adRecommendation && (
                          <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-2 animate-in fade-in zoom-in-95 duration-300">
                             <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                  <Sparkle size={12} fill="currentColor" /> Strategy Suggestion
                                </p>
                                <button onClick={applyAdRecommendation} className="text-[8px] font-black text-white bg-indigo-600 px-2 py-1 rounded hover:bg-indigo-500 transition-colors uppercase">Apply</button>
                             </div>
                             <p className="text-[11px] font-bold text-slate-300">Framework: <span className="text-white italic">{adRecommendation.framework}</span></p>
                             <p className="text-[11px] font-bold text-slate-300">Platform: <span className="text-white italic">{adRecommendation.platform}</span></p>
                             <p className="text-[10px] leading-relaxed text-slate-500 italic">{adRecommendation.reason}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <Tooltip text="Optimize copy for specific network constraints.">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1"><AppWindow size={10} className="inline mr-1" /> Ad Platform</label>
                              </Tooltip>
                              <select value={adOpts.platform} onChange={e => setAdOpts({...adOpts, platform: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] font-bold outline-none">
                                <option>Facebook</option><option>Instagram</option><option>TikTok</option><option>YouTube</option><option>Google Search</option><option>LinkedIn</option>
                              </select>
                           </div>
                           <div className="space-y-2">
                              <Tooltip text="Brand voice and communication style.">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1"><Flame size={10} className="inline mr-1" /> Ad Tone</label>
                              </Tooltip>
                              <select value={adOpts.tone} onChange={e => setAdOpts({...adOpts, tone: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] font-bold outline-none">
                                <option>Professional & Authoritative</option><option>Witty & Sarcastic</option><option>Empathetic & Caring</option><option>Direct & Aggressive</option>
                              </select>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <Tooltip text="The psychological sequence for high-CTR ads.">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Layers size={14} /> Ad Framework</label>
                           </Tooltip>
                           <select value={adOpts.framework} onChange={e => setAdOpts({...adOpts, framework: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold outline-none">
                              {AD_FRAMEWORKS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                           </select>
                        </div>

                        <InsideStructureViewer 
                          frameworkId={adOpts.framework} 
                          frameworks={AD_FRAMEWORKS} 
                          icon={ArrowDownWideNarrow} 
                          title="Ad Psychology Flow" 
                        />

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <Tooltip text="Call to action button text.">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">CTA Text</label>
                              </Tooltip>
                              <input value={adOpts.ctaText} onChange={e => setAdOpts({...adOpts, ctaText: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-bold outline-none" />
                           </div>
                           <div className="space-y-2">
                              <Tooltip text="How many unique copy variants to generate.">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Variations</label>
                              </Tooltip>
                              <input type="number" min="1" max="5" value={adOpts.variations} onChange={e => setAdOpts({...adOpts, variations: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-bold outline-none" />
                           </div>
                        </div>
                     </div>
                   ) : (
                     <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl text-center"><p className="text-xs text-slate-500 font-bold uppercase italic leading-relaxed">Framework Optimized. Connect Strategy Context above.</p></div>
                   )}
                   
                   <SmartLoadingButton 
                      onClick={() => handleGenerate()} 
                      isLoading={isGeneratingAsset} 
                      loadingPhrases={["Synthesizing Copy...", "Applying Framework...", "Calibrating Tone...", "Finalizing Result..."]}
                      label={`Generate ${activeTab}`}
                      icon={Zap}
                      variant="primary"
                      disabled={!activeContext}
                      className="w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em]"
                    />
                </div>
             </div>
             <div className="lg:col-span-8 space-y-12 pb-24">
                {assets.filter(a => a.type === activeTab).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-56 border-2 border-dashed border-slate-800/40 rounded-[4rem] opacity-40"><RotateCcw size={48} className="mb-6" /><p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">Awaiting Content Synthesis</p></div>
                ) : (
                  <div className="space-y-12">
                    {assets.filter(a => a.type === activeTab).map((asset) => {
                      const { mainContent, archSummary, abStrategy } = getAssetSections(asset.content);

                      return (
                        <div key={asset.id} className="bg-[#0f172a]/40 border border-slate-800/60 rounded-[3.5rem] overflow-hidden group shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                           <div className="px-12 py-8 border-b border-slate-800/60 bg-slate-900/50 flex items-center justify-between">
                              <div className="flex items-center gap-6"><div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-400">{asset.type === 'Email' ? <Mail size={22} /> : asset.type === 'Landing Page' ? <Layout size={22} /> : asset.type === 'VSL' ? <Video size={22} /> : <Megaphone size={22} />}</div><div className="text-xs font-black text-white italic uppercase tracking-tighter">{activeTab} Output</div></div>
                              <div className="flex items-center gap-3"><button onClick={() => { setShowRefinementModal(asset.id); setRefinementFeedback(''); }} className="flex items-center gap-2 px-5 py-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500 transition-all text-[10px] font-black uppercase"><RefreshCcw size={16} /> Refine / Fix</button><button onClick={() => copyToClipboard(asset.content, asset.id)} className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:text-white">{copiedId === asset.id ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}</button></div>
                           </div>
                           <div className="p-16 space-y-12">
                              <div className="whitespace-pre-wrap leading-relaxed text-slate-300 font-serif italic text-xl prose prose-invert max-w-none">{mainContent}</div>
                              
                              {archSummary && (
                                <div className="mt-12 pt-12 border-t border-indigo-500/20 bg-indigo-500/[0.03] -mx-16 px-16 pb-12 relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/60"></div>
                                  <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                                      <BookText size={18} />
                                    </div>
                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Landing Page Architecture Summary</h4>
                                  </div>
                                  <div className="whitespace-pre-wrap leading-relaxed text-slate-400 font-mono text-[12px] opacity-90 border-l-2 border-indigo-500/20 pl-6">
                                    {archSummary}
                                  </div>
                                  <div className="mt-6 flex justify-end">
                                    <button 
                                      onClick={() => copyToClipboard(archSummary, `${asset.id}-arch`)} 
                                      className="flex items-center gap-2 text-[9px] font-black uppercase text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                      {copiedId === `${asset.id}-arch` ? <Check size={12} /> : <Copy size={12} />} 
                                      Copy Architecture Summary
                                    </button>
                                  </div>
                                </div>
                              )}

                              {abStrategy && (
                                <div className="mt-12 pt-12 border-t border-slate-800/60 bg-slate-900/20 -mx-16 px-16 pb-12 rounded-b-[3.5rem] relative overflow-hidden">
                                  <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                                      <FlaskConical size={18} />
                                    </div>
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Optimization Blueprint: A/B Testing Matrix</h4>
                                  </div>
                                  <div className="whitespace-pre-wrap leading-relaxed text-slate-500 font-sans text-sm italic prose prose-invert max-w-none opacity-80 border-l-2 border-slate-800/30 pl-6">
                                    {abStrategy}
                                  </div>
                                </div>
                              )}
                           </div>
                        </div>
                      );
                    })}
                  </div>
                )}
             </div>
          </div>
        )}
      </main>

      {/* Global Settings & Refinement Modals */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="bg-[#0f172a] w-full max-w-xl rounded-[4rem] border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="p-16 space-y-10">
                 <div className="flex items-center justify-between"><div className="flex items-center gap-5"><div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl"><Settings className="text-white" size={28} /></div><h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Global Settings</h3></div><button onClick={() => setIsSettingsOpen(false)} className="p-3 text-slate-500 hover:text-white transition-colors bg-slate-800/40 rounded-2xl"><X size={24} /></button></div>
                 <div className="space-y-8">
                    <div className="space-y-3"><label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">Intelligence Matrix</label>
                       <div className="grid grid-cols-2 gap-4">
                          <button onClick={() => setGlobalSettings({...globalSettings, model: 'gemini-3-flash-preview'})} className={`p-6 rounded-[1.5rem] border transition-all flex flex-col items-center ${globalSettings.model === 'gemini-3-flash-preview' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-950 border-slate-800'}`}><Zap size={24} /><p className="text-xs font-black uppercase">Fast Matrix</p></button>
                          <button onClick={() => setGlobalSettings({...globalSettings, model: 'gemini-3-pro-preview'})} className={`p-6 rounded-[1.5rem] border transition-all flex flex-col items-center ${globalSettings.model === 'gemini-3-pro-preview' ? 'bg-purple-600 border-purple-500' : 'bg-slate-950 border-slate-800'}`}><Brain size={24} /><p className="text-xs font-black uppercase">Genius Matrix</p></button>
                       </div>
                    </div>
                    <div className="space-y-6 pt-6 border-t border-slate-800/60">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className={`p-2.5 rounded-xl transition-all ${globalSettings.performanceMode ? 'bg-indigo-600/10 text-indigo-400' : 'bg-slate-800 text-slate-600'}`}>
                                <Gauge size={18} />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-xs font-black uppercase tracking-widest text-white">Performance Optimizer</span>
                                <span className="text-[10px] text-slate-500 font-medium italic mt-1 leading-relaxed">Disables complex animations for low-end hardware.</span>
                             </div>
                          </div>
                          <button 
                            onClick={() => setGlobalSettings({...globalSettings, performanceMode: !globalSettings.performanceMode})}
                            className={`w-12 h-6 rounded-full p-1 transition-all flex items-center ${globalSettings.performanceMode ? 'bg-indigo-600' : 'bg-slate-800'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-all transform ${globalSettings.performanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setIsSettingsOpen(false)} className="w-full py-6 bg-slate-800 hover:bg-slate-700 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.3em] transition-all">Apply Parameters</button>
              </div>
           </div>
        </div>
      )}

      {showRefinementModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-[#0f172a] w-full max-w-2xl rounded-[4rem] border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-16 space-y-10">
              <div className="flex items-center justify-between"><div className="flex items-center gap-5"><div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl"><RefreshCcw className="text-white" size={28} /></div><h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Refinement Protocol</h3></div><button onClick={() => setShowRefinementModal(null)} className="p-3 text-slate-500 hover:text-white transition-colors bg-slate-800/40 rounded-2xl"><X size={24} /></button></div>
              <div className="space-y-8">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">What mistakes should be fixed?</p>
                <textarea value={refinementFeedback} onChange={(e) => setRefinementFeedback(e.target.value)} placeholder="Type the specific things you want fixed or adjusted..." className="w-full h-40 bg-slate-950/60 border border-slate-800 rounded-[2rem] p-8 text-sm font-medium outline-none resize-none leading-relaxed" autoFocus />
                <div className="grid grid-cols-2 gap-4">
                  <SmartLoadingButton 
                    onClick={() => handleGenerate(showRefinementModal, 'Fix')} 
                    isLoading={isGeneratingAsset} 
                    loadingPhrases={["Applying correction...", "Recalibrating...", "Finalizing fix..."]}
                    label="Surgical Fix"
                    icon={Scissors}
                    variant="secondary"
                    disabled={!refinementFeedback}
                    className="flex-1 py-6 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.2em] flex flex-col"
                  />
                  <SmartLoadingButton 
                    onClick={() => handleGenerate(showRefinementModal, 'Remake')} 
                    isLoading={isGeneratingAsset} 
                    loadingPhrases={["Starting over...", "Synthesizing new angle...", "Generating asset..."]}
                    label="Full Remake"
                    icon={Hammer}
                    variant="primary"
                    disabled={!refinementFeedback}
                    className="flex-1 py-6 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.2em] flex flex-col"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <footer className="max-w-[1500px] mx-auto px-8 py-16 border-t border-slate-900/50 flex justify-between items-center opacity-30 group"><div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 italic">Matrix Protocol v1.6 // Architect System Active</div><div className="flex gap-8 grayscale group-hover:grayscale-0 transition-all duration-1000"><Sparkles size={16} /><Brain size={16} /><Target size={16} /><Zap size={16} /><Layers size={16} /></div></footer>
    </div>
  );
}

const FrameworkPreview = ({ frameworkId, frameworks, icon: Icon, title }: { frameworkId: string, frameworks: any[], icon: any, title: string }) => {
  const fw = frameworks.find(f => f.id === frameworkId);
  return (
    <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl overflow-hidden shadow-inner animate-in fade-in slide-in-from-top-1 duration-400">
      <div className="px-5 py-3 border-b border-slate-800/60 flex items-center gap-2 bg-slate-900/50">
        <Icon size={14} className="text-indigo-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</span>
      </div>
      <div className="max-h-[200px] overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {fw?.structure.map((item: any, idx: number) => (
          <div key={idx} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:bg-indigo-600 before:rounded-full before:shadow-[0_0_8px_#4f46e5]">
            <p className="text-[10px] font-black text-indigo-100 uppercase tracking-tight mb-1 opacity-90">{item.step}</p>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
