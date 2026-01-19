
export type AssetType = 'Email' | 'Landing Page' | 'VSL' | 'Ads';

export interface EmailOptions {
  sequenceType: string;
  emailNumber: number;
  structure: string;
  recommendedStructure: string;
  ctaType: string;
  notes: string;
  quantity: number;
  wordCount: string;
  userName: string;
}

export interface LPOptions {
  structureType: 'SaaS Acceleration Matrix' | 'High-Ticket Authority Close' | 'Lead Magnet Value-Stacker';
  focusStrategy: 'Relatable Problem' | 'Highlighting Benefit';
  copyStyle: 'Belief Shift' | 'Direct Response';
  ctaText: string;
  includeBlocks: string[];
  pageType: 'Opt-in Page' | 'Registration Page' | 'Sales Page';
  pageGoal: string;
  referenceAsset?: {
    type: 'image' | 'url';
    data: string; // base64 for image, string for url
    analysis?: string;
  };
}

export interface VSLOptions {
  hookType: string;
  scriptLength: string;
  framework: 'Perfect Webinar' | 'Ugly VSL' | 'Unique Mechanism' | 'Hero Journey' | 'Elite High-Ticket';
  tone: string;
  vslGoal: string;
  targetLandingPage: 'Opt-in Page' | 'Registration Page' | 'Sales Page';
}

export interface AdOptions {
  platform: string;
  framework: string;
  creativeAngle: string;
  hookType: string;
  ctaText: string;
  variations: number;
  adGoal: string;
  targetContext: string;
  tone: string;
}

export interface GlobalSettings {
  assetBatching: number;
  model: 'gemini-3-flash-preview' | 'gemini-3-pro-preview';
  useGoogleSearch: boolean;
}

export interface BriefInputs {
  businessName: string;
  industry: string;
  targetAudience: string;
  productDescription: string;
  primaryUSP: string;
  painPoints: string;
  tone: string;
  goal: string;
}

export interface GeneratedAsset {
  id: string;
  type: AssetType;
  content: string;
  timestamp: number;
  sources?: Array<{ web: { uri: string; title: string } }>;
  originalPromptData?: any;
}