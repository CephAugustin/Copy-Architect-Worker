import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AssetType, EmailOptions, LPOptions, VSLOptions, AdOptions, GlobalSettings, BriefInputs, ClientProfile } from "./types";
import { WEBSITE_FRAMEWORKS } from "./websiteFrameworks";

const EMAIL_STYLE_GUIDE = `
- Casual, conversational tone.
- Short sentences and paragraphs (2-3 sentences max).
- Use ellipses (...) for readability.
- Grade 4-6 reading level.
- CTA should be non-pushy but persuasive.
`;

const AD_FRAMEWORKS_KNOWLEDGE = `
FRAMEWORK: AIDA (Classic Sales)
1. ATTENTION: Stop the scroll with a bold claim or striking question.
2. INTEREST: Build intrigue by explaining the benefit or new discovery.
3. DESIRE: Make them want it by painting a picture of the outcome.
4. ACTION: Direct command to click/buy/sign up.

FRAMEWORK: PAS (Problem-Agitate-Solution)
1. PROBLEM: Call out a specific pain point the audience feels.
2. AGITATION: Twist the knife. Why ignoring this makes life harder.
3. SOLUTION: Introduce the product as the bridge to relief.

FRAMEWORK: Hook-Insight-Solution (Short Form/Viral)
1. THE HOOK: High-energy pattern interrupt.
2. THE INSIGHT: One surprising "Aha!" moment or counter-intuitive tip.
3. THE SOLUTION: Soft-sell the product as the implementation of the insight.

FRAMEWORK: Story-Ad (Long Form/Engagement)
1. THE INCIDENT: A relatable "Day in the life" struggle.
2. THE DISCOVERY: The moment the "old way" stopped working and the search began.
3. THE RESULTS: Showing, not telling, the transformation.
4. THE INVITATION: Asking them to join the same path.

FRAMEWORK: The Question-Led (Qualification focus)
1. THE QUESTION: A provocative "Yes/No" question that pre-qualifies.
2. THE QUALIFICATION: Confirming who this is (and isn't) for.
3. THE TRANSFORMATION: Explaining the mechanism of change.
`;

const VSL_KNOWLEDGE = `
FRAMEWORK: Perfect Webinar / Standard (Russell Brunson & Jon Benson Inspired)
1. HOOK/MICRO-LEAD: Attention-grabbing claim, surprising fact, pattern interrupt.
2. LEAD SECTION: Identify core problem, acknowledge pain, build curiosity for solution.
3. BACKGROUND STORY: Personal struggle, credibility, "Dark Night of the Soul" moment.
4. UNIQUE MECHANISM: Reveal the "real reason" they fail, introduce the secret sauce, show proof.
5. PRODUCT REVEAL: Introduce solution, detail features/benefits, build perceived value.
6. CLOSE SECTION: Summarize, review transformation, add urgency/scarcity, price anchoring, clear CTA.

FRAMEWORK: Elite High-Ticket (Conversion-Engineered)
1. DISRUPTIVE OPENING: Pattern-interrupt, "You're being lied to" hook.
2. BELIEF BREAKING: Reject previous methods, stack the pain of the status quo.
3. PERSONAL/CLIENT STORY: The discovery shift, from guide to hero.
4. UNIQUE MECHANISM: Simple & visual reveal of the "Hidden Layer".
5. FUTURE CASTING: Visualized transformation, "Imagine..." scenarios.
6. PRODUCT/SOLUTION INTRO: The tool to unlock the result, feature->benefit->payoff stack.
7. PROOF STACKING: Erase doubt with before/afters and emotional wins.
8. OFFER + URGENCY: Value stacking, risk reduction (Guarantee), trigger FOMO.
9. FINAL CTA: Lock in action with visual instructions.
`;

const API_KEY = process.env.GEMINI_API_KEY || "";

let cachedActiveModel: string | null = null;

function stripModelsPrefix(name: string): string {
  return name.startsWith("models/") ? name.substring(7) : name;
}

export async function getActiveModel(): Promise<string> {
  if (cachedActiveModel) {
    return cachedActiveModel;
  }

  const primaryFallback = "gemini-3.5-flash";
  const secondaryFallback = "gemini-3.5-flash-lite";
  const apiKey = process.env.GEMINI_API_KEY || API_KEY;
  if (!apiKey) {
    console.warn("[getActiveModel] No API key found, returning fallback:", primaryFallback);
    return primaryFallback;
  }

  try {
    // 1. Fetch the list of available models
    console.log("[getActiveModel] Fetching list of available models...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    const data = await response.json();
    const availableModels: string[] = (data.models || []).map((m: any) => m.name);
    console.log(`[getActiveModel] Found ${availableModels.length} available models.`);

    // 2. Identify the equipped model
    const equippedRaw = process.env.EQUIPPED_MODEL || process.env.GEMINI_MODEL || process.env.MODEL_NAME || "";
    if (!equippedRaw) {
      console.log("[getActiveModel] No equipped model env var found. Using fallback:", primaryFallback);
      cachedActiveModel = primaryFallback;
      return primaryFallback;
    }

    const availableModelsClean = availableModels.map(m => stripModelsPrefix(m));
    const equippedModelClean = stripModelsPrefix(equippedRaw);
    
    // Check if the equipped model is in the fetched available models list
    if (!availableModelsClean.includes(equippedModelClean)) {
      console.warn(`[getActiveModel] Equipped model '${equippedModelClean}' not found in available models list. Falling back to '${primaryFallback}'`);
      cachedActiveModel = primaryFallback;
      return primaryFallback;
    }

    const equippedModel = `models/${equippedModelClean}`;

    // 3. Check quota availability for the equipped model
    console.log(`[getActiveModel] Verifying quota availability for '${equippedModel}'...`);
    const ai = new GoogleGenAI({ apiKey });
    try {
      // Send a minimal request to verify quota
      await ai.models.generateContent({
        model: equippedModel,
        contents: "Hello",
        config: { maxOutputTokens: 1 }
      });
      console.log(`[getActiveModel] Quota verification succeeded for '${equippedModel}'.`);
      cachedActiveModel = equippedModelClean;
      return equippedModelClean;
    } catch (quotaError: any) {
      const errorMsg = quotaError?.message || "";
      const isQuotaExceeded = errorMsg.includes("RESOURCE_EXHAUSTED") || 
                             errorMsg.includes("429") ||
                             errorMsg.toLowerCase().includes("quota");
      
      if (isQuotaExceeded) {
        console.warn(`[getActiveModel] Equipped model '${equippedModel}' has 0 or exhausted quota. Skipping it and using fallback '${primaryFallback}'.`);
        cachedActiveModel = primaryFallback;
        return primaryFallback;
      } else {
        // If it's some other non-quota error (like bad parameters), the model is technically available and has quota
        console.log(`[getActiveModel] Model '${equippedModel}' returned non-quota error: ${errorMsg}. Assuming it has quota and is active.`);
        cachedActiveModel = equippedModelClean;
        return equippedModelClean;
      }
    }
  } catch (error) {
    console.error("[getActiveModel] Error during active model selection, falling back to default:", error);
    cachedActiveModel = primaryFallback;
    return primaryFallback;
  }
}

async function safeGenerateContent(
  ai: any,
  options: {
    model: string;
    contents: any;
    config?: any;
  }
): Promise<any> {
  const model = options.model;
  console.log(`[Gemini Request] Attempting generation with model: ${model}`);
  
  try {
    const response = await ai.models.generateContent({
      ...options,
      model: model
    });
    console.log(`[Gemini Success] Successfully generated content with model: ${model}`);
    return response;
  } catch (error: any) {
    const errorMsg = error?.message || "";
    const isUnavailable = errorMsg.includes("503") || 
                          errorMsg.includes("UNAVAILABLE") || 
                          errorMsg.toLowerCase().includes("high demand") ||
                          errorMsg.toLowerCase().includes("unavailable");

    console.error(`[Gemini Attempt Failed] model: ${model}. Error:`, errorMsg);
    
    // If the API returns a 503 “high demand / unavailable” error, switch to flash-lite
    if (isUnavailable && model !== "gemini-3.5-flash-lite") {
      console.log("[Gemini Fallback] Flash unavailable. Switching to flash-lite");
      try {
        const secondaryFallback = "gemini-3.5-flash-lite";
        console.log(`[Gemini Request] Attempting generation with secondary fallback model: ${secondaryFallback}`);
        const response = await ai.models.generateContent({
          ...options,
          model: secondaryFallback
        });
        console.log(`[Gemini Success] Successfully generated content with secondary fallback model: ${secondaryFallback}`);
        return response;
      } catch (fallbackError: any) {
        const fallbackErrorMsg = fallbackError?.message || "";
        console.error(`[Gemini Fallback Failed] model: gemini-3.5-flash-lite. Error:`, fallbackErrorMsg);
        // If flash-lite also fails, return a clean JSON error instead of throwing an unhandled rejection
        return {
          text: JSON.stringify({ error: "Gemini models currently unavailable", details: fallbackErrorMsg })
        };
      }
    } else {
      // Return a clean JSON error instead of throwing an unhandled rejection
      return {
        text: JSON.stringify({ error: "Gemini model generation failed", details: errorMsg })
      };
    }
  }
}

export async function buildFullStrategicBrief(inputs: BriefInputs, global: GlobalSettings): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = await getActiveModel();
  const response = await safeGenerateContent(ai, {
    model: model,
    contents: `Generate a comprehensive strategic brief based on these inputs: ${JSON.stringify(inputs)}.
    
    You MUST follow this EXACT format and include all headers and sub-bullets:
    
    Brief Template
    Client’s Name: [Name]
    
    Target Audience Demographics:
    - Age range, gender, income level: [Details]
    - Professional background: [Details]
    - Family status: [Details]
    - Geographic location: [Details]
    - Values and beliefs: [Details]
    
    Top 3 Pain Points/Fears:
    - Current struggles: [Details]
    - What keeps them up at night: [Details]
    - Worst-case scenarios they want to avoid: [Details]
    
    Top 3 Dreams/Desires:
    - Ideal outcomes: [Details]
    - Aspirational goals: [Details]
    - Emotional rewards they seek: [Details]
    
    One Big Promise:
    [The primary transformation your offer provides. Must be specific and believable]
    
    Existing Solutions' Flaws:
    - Why current options fall short: [Details]
    - Common frustrations with alternatives: [Details]
    - Market gaps your offer fills: [Details]
    
    Product Details:
    - Features and specifications: [Details]
    - Delivery method: [Details]
    - Implementation process: [Details]
    - Support and resources included: [Details]
    
    Key Benefits:
    - Tangible results: [Details]
    - Emotional benefits: [Details]
    - Lifestyle improvements: [Details]
    - Time/money saved: [Details]
    
    Common Objections:
    - Price concerns: [Details]
    - Trust issues: [Details]
    - Implementation fears: [Details]
    - Time commitment worries: [Details]
    
    For Landing Page Writing (ONLY): What is the big idea offer for the landing page?
    [The Big Idea]`,
    config: {
      systemInstruction: `You are an Elite Copywriting Strategist and Behavioral Psychologist.${global && global.defaultLanguage ? ` You MUST write the entire brief in the ${global.defaultLanguage} language.` : ""}`,
      temperature: global && global.creativityEngine !== undefined ? global.creativityEngine : undefined
    }
  });
  return response.text || "";
}

export async function analyzeReferenceAsset(
  type: 'image' | 'url',
  data: string,
  global: GlobalSettings
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  let parts: any[] = [];
  if (type === 'image') {
    parts = [
      {
        text: "Analyze this landing page image. Extract its: 1. Value Proposition, 2. Hook style, 3. Visual sections/flow, 4. Specific psychological triggers used, 5. CTA placement and wording. Provide a detailed summary of how to integrate these elements into a new version."
      },
      {
        inlineData: {
          mimeType: "image/png",
          data: data.split(',')[1]
        }
      }
    ];
  } else {
    parts = [
      {
        text: `Using Google Search, visit and analyze the landing page at ${data}. Extract its: 1. Value Proposition, 2. Hook style, 3. Structural components, 4. Triggers, 5. CTA style. Provide a summary for replication.`
      }
    ];
  }

  const model = await getActiveModel();
  const response = await safeGenerateContent(ai, {
    model: model,
    contents: { parts },
    config: {
      tools: type === 'url' ? [{ googleSearch: {} }] : undefined,
    }
  });

  return response.text || "Analysis failed.";
}

export async function recommendLPSettings(brief: string, global: GlobalSettings): Promise<{ structureType: string; reason: string }> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = await getActiveModel();
  const response = await safeGenerateContent(ai, {
    model: model,
    contents: `Based on this brief, recommend the best Landing Page Framework: ${brief}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          structureType: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["structureType", "reason"]
      }
    }
  });
  try {
    return JSON.parse(response.text || "{}");
  } catch {
    return { structureType: 'SaaS Acceleration Matrix', reason: 'Logical default for this offer.' };
  }
}

export async function recommendAdSettings(brief: string, global: GlobalSettings): Promise<{ framework: string; hookType: string; platform: string; reason: string }> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = await getActiveModel();
  const response = await safeGenerateContent(ai, {
    model: model,
    contents: `Recommend the best Ad Framework, Hook, and Platform for this brief: ${brief}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          framework: { type: Type.STRING },
          hookType: { type: Type.STRING },
          platform: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["framework", "hookType", "platform", "reason"]
      }
    }
  });
  try {
    return JSON.parse(response.text || "{}");
  } catch {
    return { framework: 'AIDA', hookType: 'The Question', platform: 'Facebook', reason: 'Balanced conversion default.' };
  }
}

export async function recommendVSLSettings(brief: string, global: GlobalSettings): Promise<{ framework: string; hookType: string; reason: string }> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = await getActiveModel();
  const response = await safeGenerateContent(ai, {
    model: model,
    contents: `Recommend a VSL Framework and Hook for this brief: ${brief}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          framework: { type: Type.STRING },
          hookType: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["framework", "hookType", "reason"]
      }
    }
  });
  try {
    return JSON.parse(response.text || "{}");
  } catch {
    return { framework: 'Perfect Webinar', hookType: 'The Secret Weapon', reason: 'Defaulting to standard high-conversion logic.' };
  }
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
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  let assetSpecificPrompt = "";
  const optAny = options as any;
  if (optAny.optimizeExisting) {
    assetSpecificPrompt = `You are an elite copywriter. Take the following ${assetType} copy and optimize it for higher conversions. Keep the core message but improve the hooks, clarity, and call to actions.

EXISTING COPY TO OPTIMIZE:
${optAny.existingCopy || ""}
`;
    if (clientProfile) {
      assetSpecificPrompt += `\n\nCLIENT PROFILE CONTEXT:
- Target Audience: ${clientProfile.targetAudience}
- Main Offer: ${clientProfile.mainOffer}
- Brand Voice Summary: ${clientProfile.brandVoiceSummary}`;
    }
  } else if (assetType === 'Email') {
    const opt = options as EmailOptions;
    assetSpecificPrompt = `TASK: Write Email #${opt.emailNumber}. Sequence: ${opt.sequenceType}. Structure: ${opt.structure}. Sign-off: ${opt.userName}. ${EMAIL_STYLE_GUIDE}`;
  } else if (assetType === 'Landing Page') {
    const opt = options as LPOptions;
    const inspirationNote = opt.referenceAsset?.analysis 
      ? `\nINSPIRATION REFERENCE DATA (Extracted from your provided link/image): \n${opt.referenceAsset.analysis}\nCrucially integrate the successful hook, structure, and psychological triggers from this reference into the new copy while adhering to the Brief context.`
      : "";

    let structuralFrameworkRules = "";
    const isWebsiteCopy = opt.mode === 'website_copy';
    
    if (isWebsiteCopy && opt.websiteType && opt.websitePage) {
      const config = WEBSITE_FRAMEWORKS[opt.websiteType];
      if (config) {
        const pageConfig = config.pages[opt.websitePage];
        if (pageConfig) {
          const stepsStr = pageConfig.structure.map((s, idx) => `${idx + 1}. ${s.step.toUpperCase()}\n   - ${s.detail}`).join('\n');
          structuralFrameworkRules = `
          CRITICAL: You are writing a specific page for a full multi-page website brand experience.
          - Website Model: ${opt.websiteType} Website
          - Site-Wide Narrative Directive: ${config.narrative}
          - Specific Page to Write: ${opt.websitePage}
          - Page Purpose: ${pageConfig.description}
          
          You MUST structure this copy explicitly around the following Page Copy Framework steps:
          ${stepsStr}
          
          Ensure the style remains consistent with the brand's global narrative while executing these precise structural sections.
          `;
        }
      }
    } else if (opt.structureType === 'Live Event Registration Page Framework (Free Training / Value Stack Funnel)') {
      structuralFrameworkRules = `
      CRITICAL: You MUST structure this landing page using the "Live Event Registration Page Framework (Free Training / Value Stack Funnel)" structure:
      
      1. HERO SECTION
         - Clear, bold event promise
         - Event name, date, and time
         - One-sentence transformation statement
         - Primary CTA: "${opt.ctaText || "Reserve Your Spot"}"
         - Optional countdown timer
         
      2. WHAT YOU’LL LEARN
         - 3–7 outcome-focused bullet points
         - Emphasize transformation, clarity, and value
         
      3. EVENT DETAILS
         - Date, time, duration
         - Location or livestream platform
         - Who the event is for
         - What to bring or expect
         
      4. SPEAKER CREDIBILITY
         - Short authority bio
         - Relevant achievements, results, or credentials
         - Social proof indicators
      `;
    }

    const appliedFramework = isWebsiteCopy 
      ? `Website: ${opt.websiteType} - ${opt.websitePage}` 
      : opt.structureType;

    const includeBlocksText = opt.includeBlocks ? opt.includeBlocks.join(', ') : "All standard structural blocks";

    assetSpecificPrompt = `
      TASK: Write a highly persuasive and complete page copy for: ${isWebsiteCopy ? `Website Page "${opt.websitePage}" for a ${opt.websiteType} site` : `"${opt.pageType}"`}.
      Goal: ${opt.pageGoal}. 
      Framework: ${appliedFramework}. 
      Style: ${opt.copyStyle}. 
      Strategy: ${opt.focusStrategy}. 
      Blocks: ${includeBlocksText}. 
      CTA: ${opt.ctaText}.
      ${inspirationNote}
      
      ${structuralFrameworkRules}

      CRITICAL FINAL SECTIONS (REQUIRED):
      
      1. "--- LANDING PAGE ARCHITECTURE SUMMARY ---"
      Provide a comprehensive summary including:
      - **Framework Applied**: ${appliedFramework}
      - **Primary Objective**: ${opt.pageGoal}
      - **Architectural Flow (In Order)**:
        List every section generated above in the exact order they appear.
      - **Technical Breakdown**:
        For each block, explain: 
        - The specific conversion objective of that section.
        - The psychological trigger used (e.g., Scarcity, Social Proof, Authority, Liking).
        - Why this specific content angle was chosen for this target audience.
      Format this as a detailed technical architectural breakdown.

      2. "--- A/B TESTING STRATEGY ---"
      Suggest 3 specific variables to split-test for this page copy to optimize conversion performance.
    `;
  } else if (assetType === 'VSL') {
    const opt = options as VSLOptions;
    assetSpecificPrompt = `
      ROLE: World-Class Direct Response VSL Copywriter.
      GOAL: ${opt.vslGoal}
      TARGET CONTEXT: For a ${opt.targetLandingPage}.
      FRAMEWORK: ${opt.framework}
      HOOK: ${opt.hookType}
      LENGTH: ${opt.scriptLength}
      TONE: ${opt.tone}
      
      GUIDELINES:
      ${VSL_KNOWLEDGE}
      
      INSTRUCTIONS:
      - Strictly follow the ${opt.framework} structure provided in knowledge.
      - Use short sentences and bucket brigades.
      - 70% Emotion, 30% Logic.
      - Grade 6-8 reading level.
      - Include visual slide directions.
    `;
  } else if (assetType === 'Ads') {
    const opt = options as AdOptions;
    assetSpecificPrompt = `
      ROLE: Expert Paid Social & Search Copywriter.
      PLATFORM: ${opt.platform}
      FRAMEWORK: ${opt.framework}
      AD GOAL: ${opt.adGoal}
      TARGET CONTEXT: ${opt.targetContext}
      HOOK TYPE: ${opt.hookType}
      CTA: ${opt.ctaText}
      TONE: ${opt.tone}
      VARIATIONS: ${opt.variations}
      
      FRAMEWORK KNOWLEDGE:
      ${AD_FRAMEWORKS_KNOWLEDGE}
      
      INSTRUCTIONS:
      - Write ${opt.variations} distinct ad variations.
      - Strictly follow the ${opt.framework} psychological phases.
      - Ensure the copy is optimized for ${opt.platform}.
      - Include Headline and Primary Copy sections for each variation.
      
      CRITICAL FINAL STEP:
      At the end of the variations, include a section titled "--- A/B TESTING STRATEGY ---".
      In this section, suggest 3 specific variables to split-test for this campaign (e.g., Hook angle, CTA urgency, or Benefit focus).
      For each, provide a "Challenger" idea and explain the psychological rationale for why this test could improve conversion.
    `;
  }

  const baseSystemInstruction = "You are an Elite Direct Response Copywriter. Your goal is high conversion through emotional resonance and simple logic.";
  let finalSystemInstruction = systemPromptOverride || baseSystemInstruction;

  if (clientProfile) {
    finalSystemInstruction += `\n\nCLIENT PROFILE CONTEXT:
- Target Audience: ${clientProfile.targetAudience}
- Main Offer: ${clientProfile.mainOffer}
- Brand Voice Summary: ${clientProfile.brandVoiceSummary}`;
  }

  if (knowledgeContext) {
    finalSystemInstruction += `\n\nREQUIRED KNOWLEDGE & TACTICS TO APPLY:\n${knowledgeContext}`;
  }

  if (global && global.defaultLanguage) {
    finalSystemInstruction += `\n\nCRITICAL LANGUAGE REQUIREMENT: You MUST generate all copy, headlines, CTAs, and structural body texts in the following language: ${global.defaultLanguage}. Do not write or translate back to English. Output directly in ${global.defaultLanguage}.`;
  }

  const model = await getActiveModel();
  const response: GenerateContentResponse = await safeGenerateContent(ai, {
    model: model,
    contents: `${isRefinement ? "REFINEMENT: " + refinementFeedback : "GENERATE NEW COPY."} BRIEF: ${brief} ${assetSpecificPrompt}`,
    config: {
      systemInstruction: finalSystemInstruction,
      temperature: global && global.creativityEngine !== undefined ? global.creativityEngine : undefined,
      tools: global && global.useGoogleSearch ? [{ googleSearch: {} }] : undefined,
    },
  });

  return { text: response.text || "Failed to generate content." };
}

export async function autoFillContext(rawText: string, global: GlobalSettings): Promise<Partial<BriefInputs>> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = await getActiveModel();
  const response = await safeGenerateContent(ai, {
    model: model,
    contents: `Extract businessName, industry, targetAudience, productDescription, primaryUSP, painPoints from: "${rawText}"`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          businessName: { type: Type.STRING },
          industry: { type: Type.STRING },
          targetAudience: { type: Type.STRING },
          productDescription: { type: Type.STRING },
          primaryUSP: { type: Type.STRING },
          painPoints: { type: Type.STRING }
        }
      }
    }
  });
  try { return JSON.parse(response.text || "{}"); } catch { return {}; }
}

export async function analyzeBrandVoice(
  successfulCopy: string,
  global: GlobalSettings
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = await getActiveModel();
  const response = await safeGenerateContent(ai, {
    model: model,
    contents: `Analyze this copy. Extract the brand voice, tone, vocabulary, and sentence structure. Format as a short Brand Voice Guide.\n\nCOPY:\n${successfulCopy}`,
    config: {
      systemInstruction: "You are an Elite Copywriting Strategist and Brand Voice Expert.",
      temperature: global && global.creativityEngine !== undefined ? global.creativityEngine : undefined
    }
  });
  return response.text || "";
}

export async function auditMarketingCopy(
  copy: string,
  global: GlobalSettings
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  let systemInstruction = "You are a master direct-response copywriter auditing a piece of copy. You must format your response into exactly three sections: 1. THE CRITIQUE (Bullet points on why it is weak, confusing, or passive). 2. THE REWRITE (The fully optimized, high-converting version). 3. THE BREAKDOWN (Bullet points explaining the psychological reasons the rewrite is better).";
  
  if (global && global.defaultLanguage) {
    systemInstruction += `\n\nCRITICAL LANGUAGE REQUIREMENT: You MUST write your entire audit report (including the Critique, the Rewrite, and the Breakdown sections) in the ${global.defaultLanguage} language.`;
  }

  const model = await getActiveModel();
  const response = await safeGenerateContent(ai, {
    model: model,
    contents: `Please audit this piece of marketing copy:\n\n${copy}`,
    config: {
      systemInstruction,
      temperature: global && global.creativityEngine !== undefined ? global.creativityEngine : undefined
    }
  });
  return response.text || "";
}

export async function generateSocialMediaPost(
  platform: 'LinkedIn' | 'Twitter/X' | 'Instagram' | 'Facebook',
  postAbout: string,
  global: GlobalSettings,
  clientProfile?: ClientProfile
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  let dynamicInstruction = "";
  if (platform === 'LinkedIn') {
    dynamicInstruction = "Use professional, story-driven formatting with single-sentence spacing (broetry style). Structure it with a powerful hook, a relatable core problem, a lesson, and a clear call-to-action.";
  } else if (platform === 'Twitter/X') {
    dynamicInstruction = "Create a punchy, concise tweet or a short high-value thread with a strong scroll-stopping hook, adhering to character limits. Maximum of 280 characters per tweet/thread segment. Format with clean line breaks.";
  } else if (platform === 'Instagram') {
    dynamicInstruction = "Use a visually descriptive hook, engaging caption style, clean emojis, and include 5-10 highly relevant hashtags at the bottom.";
  } else if (platform === 'Facebook') {
    dynamicInstruction = "Use conversational, community-building language. Encourage comments, ask questions, and build connection with the audience.";
  }

  let profileContext = "";
  if (clientProfile) {
    profileContext = `
Active Client Profile:
- Business/Client Name: ${clientProfile.clientName}
- Target Audience: ${clientProfile.targetAudience}
- Main Offer: ${clientProfile.mainOffer}
- Brand Voice/Tone: ${clientProfile.brandVoiceSummary}
`;
  }

  const prompt = `Please generate a high-performing social media post for the platform: ${platform}.

Topic/Details: ${postAbout}
${profileContext}

Platform Style Guide:
${dynamicInstruction}

Write the post content directly. Do not include meta-commentary like "Here is your post:". Apply direct-response copywriting principles to optimize engagement, clicks, or conversions.`;

  const model = await getActiveModel();
  const response = await safeGenerateContent(ai, {
    model: model,
    contents: prompt,
    config: {
      systemInstruction: `You are an elite direct-response copywriter and social media strategist.${global && global.defaultLanguage ? ` You MUST write the final social media post content entirely in the ${global.defaultLanguage} language.` : ""}`,
      temperature: global && global.creativityEngine !== undefined ? global.creativityEngine : undefined
    }
  });
  return response.text || "";
}

