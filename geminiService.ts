import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AssetType, EmailOptions, LPOptions, VSLOptions, AdOptions, GlobalSettings, BriefInputs } from "./types";

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

export async function buildFullStrategicBrief(inputs: BriefInputs, global: GlobalSettings): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  const response = await ai.models.generateContent({
    model: global.model,
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
    config: { systemInstruction: "You are an Elite Copywriting Strategist and Behavioral Psychologist." }
  });
  return response.text || "";
}

export async function analyzeReferenceAsset(
  type: 'image' | 'url',
  data: string,
  global: GlobalSettings
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  
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

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      tools: type === 'url' ? [{ googleSearch: {} }] : undefined,
    }
  });

  return response.text || "Analysis failed.";
}

export async function recommendLPSettings(brief: string, global: GlobalSettings): Promise<{ structureType: string; reason: string }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  const response = await ai.models.generateContent({
    model: global.model,
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  const response = await ai.models.generateContent({
    model: global.model,
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  const response = await ai.models.generateContent({
    model: global.model,
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
  previousContent: string = ""
): Promise<{ text: string; sources?: any[] }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  
  let assetSpecificPrompt = "";
  if (assetType === 'Email') {
    const opt = options as EmailOptions;
    assetSpecificPrompt = `TASK: Write Email #${opt.emailNumber}. Sequence: ${opt.sequenceType}. Structure: ${opt.structure}. Sign-off: ${opt.userName}. ${EMAIL_STYLE_GUIDE}`;
  } else if (assetType === 'Landing Page') {
    const opt = options as LPOptions;
    const inspirationNote = opt.referenceAsset?.analysis 
      ? `\nINSPIRATION REFERENCE DATA (Extracted from your provided link/image): \n${opt.referenceAsset.analysis}\nCrucially integrate the successful hook, structure, and psychological triggers from this reference into the new copy while adhering to the Brief context.`
      : "";

    assetSpecificPrompt = `
      TASK: Write a highly persuasive "${opt.pageType}". 
      Goal: ${opt.pageGoal}. 
      Framework: ${opt.structureType}. 
      Style: ${opt.copyStyle}. 
      Strategy: ${opt.focusStrategy}. 
      Blocks: ${opt.includeBlocks.join(', ')}. 
      CTA: ${opt.ctaText}.
      ${inspirationNote}

      CRITICAL FINAL SECTIONS (REQUIRED):
      
      1. "--- LANDING PAGE ARCHITECTURE SUMMARY ---"
      Provide a comprehensive summary including:
      - **Framework Applied**: ${opt.structureType}
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
      Suggest 3 specific variables to split-test for this landing page to optimize conversion performance.
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

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: global.model,
    contents: `${isRefinement ? "REFINEMENT: " + refinementFeedback : "GENERATE NEW COPY."} BRIEF: ${brief} ${assetSpecificPrompt}`,
    config: {
      systemInstruction: "You are an Elite Direct Response Copywriter. Your goal is high conversion through emotional resonance and simple logic.",
      tools: global.useGoogleSearch ? [{ googleSearch: {} }] : undefined,
    },
  });

  return { text: response.text || "Failed to generate content." };
}

export async function autoFillContext(rawText: string, global: GlobalSettings): Promise<Partial<BriefInputs>> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  const response = await ai.models.generateContent({
    model: global.model,
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
