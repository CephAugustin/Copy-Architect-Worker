
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
  structureType: 'SaaS Acceleration Matrix' | 'High-Ticket Authority Close' | 'Lead Magnet Value-Stacker' | 'Live Event Registration Page Framework (Free Training / Value Stack Funnel)' | string;
  focusStrategy: 'Relatable Problem' | 'Highlighting Benefit';
  copyStyle: 'Belief Shift' | 'Direct Response';
  ctaText: string;
  includeBlocks: string[];
  pageType: 'Opt-in Page' | 'Registration Page' | 'Sales Page' | string;
  pageGoal: string;
  referenceAsset?: {
    type: 'image' | 'url';
    data: string; // base64 for image, string for url
    analysis?: string;
  };
  mode?: 'single_page' | 'website_copy';
  websiteType?: 'SaaS' | 'eCommerce' | 'Local Business' | 'Digital Services' | 'Portfolio';
  websitePage?: string;
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

export interface UserProfile {
  uid: string;
  email: string | null;
  name: string | null;
  createdAt: number;
}

export interface KnowledgeEntry {
  knowledgeId: string;
  userId: string;
  title: string;
  label: 'email' | 'ads' | 'vsl' | 'landing_page' | 'general' | 'tactics';
  content: string;
  tags?: string[];
  priority?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  folderId: string;
  userId: string;
  name: string;
  createdAt: number;
}

export interface FileEntry {
  fileId: string;
  userId: string;
  name: string;
  folderId?: string;
  size: number;
  createdAt: number;
}

export interface Note {
  noteId: string;
  userId: string;
  title: string;
  content?: string;
  createdAt: number;
}

export interface TeamMember {
  memberId: string;
  userId: string;
  name: string;
  role?: string;
  createdAt: number;
}

export interface SavedPrompt {
  promptId: string;
  userId: string;
  title: string;
  category: 'email' | 'ads' | 'vsl' | 'landing_page' | 'general' | 'system_prompt' | 'other';
  content: string;
  createdAt: number;
  updatedAt: number;
}
