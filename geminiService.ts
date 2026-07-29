import { AssetType, EmailOptions, LPOptions, VSLOptions, AdOptions, GlobalSettings, BriefInputs, ClientProfile } from "./types";

async function callApi(action: string, args: any[]): Promise<any> {
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action, args }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to execute ${action} on server`);
  }
  return response.json();
}

export async function buildFullStrategicBrief(inputs: BriefInputs, global: GlobalSettings): Promise<string> {
  return callApi("buildFullStrategicBrief", [inputs, global]);
}

export async function analyzeReferenceAsset(
  type: 'image' | 'url',
  data: string,
  global: GlobalSettings
): Promise<string> {
  return callApi("analyzeReferenceAsset", [type, data, global]);
}

export async function recommendLPSettings(brief: string, global: GlobalSettings): Promise<{ structureType: string; reason: string }> {
  return callApi("recommendLPSettings", [brief, global]);
}

export async function recommendAdSettings(brief: string, global: GlobalSettings): Promise<{ framework: string; hookType: string; platform: string; reason: string }> {
  return callApi("recommendAdSettings", [brief, global]);
}

export async function recommendVSLSettings(brief: string, global: GlobalSettings): Promise<{ framework: string; hookType: string; reason: string }> {
  return callApi("recommendVSLSettings", [brief, global]);
}

export async function generateMarketingCopy(
  brief: string,
  assetType: AssetType,
  options: EmailOptions | LPOptions | VSLOptions | AdOptions,
  global: GlobalSettings,
  isRefinement: boolean = false,
  refinementFeedback: string = "",
  refinementType: 'Fix' | 'Remake' = 'Remake',
  previousContent: string = "",
  systemPromptOverride?: string,
  knowledgeContext?: string,
  clientProfile?: { targetAudience: string; mainOffer: string; brandVoiceSummary: string }
): Promise<{ text: string; sources?: any[] }> {
  return callApi("generateMarketingCopy", [
    brief,
    assetType,
    options,
    global,
    isRefinement,
    refinementFeedback,
    refinementType,
    previousContent,
    systemPromptOverride,
    knowledgeContext,
    clientProfile
  ]);
}

export async function autoFillContext(rawText: string, global: GlobalSettings): Promise<Partial<BriefInputs>> {
  return callApi("autoFillContext", [rawText, global]);
}

export async function analyzeBrandVoice(successfulCopy: string, global: GlobalSettings): Promise<string> {
  return callApi("analyzeBrandVoice", [successfulCopy, global]);
}

export async function auditMarketingCopy(copy: string, global: GlobalSettings): Promise<string> {
  return callApi("auditMarketingCopy", [copy, global]);
}

export async function generateSocialMediaPost(
  platform: 'LinkedIn' | 'Twitter/X' | 'Instagram' | 'Facebook',
  postAbout: string,
  global: GlobalSettings,
  clientProfile?: ClientProfile
): Promise<string> {
  return callApi("generateSocialMediaPost", [platform, postAbout, global, clientProfile]);
}

