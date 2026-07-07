export interface WebsitePageFramework {
  description: string;
  structure: Array<{ step: string; detail: string }>;
}

export interface WebsiteTypeConfig {
  narrative: string;
  pages: Record<string, WebsitePageFramework>;
}

export const WEBSITE_FRAMEWORKS: Record<string, WebsiteTypeConfig> = {
  'SaaS': {
    narrative: 'Clarity, product mechanism, validation, tiered pricing strategy, and founder authority.',
    pages: {
      'Home Page (Clarity → Value → Proof → Action)': {
        description: 'The front-facing identity. Clear bold promise, Pain → Shift, outcome pillars, proof, and high-converting CTAs.',
        structure: [
          { step: '1. HERO SECTION (Core Promise)', detail: 'One sentence clearly stating what the software helps the customer do.' },
          { step: '2. PAIN → SHIFT (Contrast)', detail: 'What sucks now or the friction of old manual methods vs the transformation of the new mechanism.' },
          { step: '3. FEATURE PILLARS (Outcome-aligned)', detail: '3–5 key capabilities of the product tied directly to tangible outcomes.' },
          { step: '4. SOCIAL PROOF (Logos & Metrics)', detail: 'Adding authority logos, reviews, and metric proof points.' },
          { step: '5. PRIMARY CTA (Action)', detail: 'Low friction prompt like "Start Free Trial" or "Book a Demo".' }
        ]
      },
      'Features Page (Problem → Mechanism → Result)': {
        description: 'How the software works behind the scenes. Demystifies the core features and links them to direct benefits.',
        structure: [
          { step: '1. THE PROBLEM', detail: 'The exact friction or pain point that this specific feature is engineered to solve.' },
          { step: '2. THE MECHANISM (How It Works)', detail: 'A neat overview of the proprietary system/logic of the feature.' },
          { step: '3. THE RESULT (Outcome)', detail: 'The tangible, measurable benefit or result of utilizing this feature.' },
          { step: '4. MICRO-PROOF', detail: 'Screenshots, user feedback or data metrics specific to this feature.' }
        ]
      },
      'Pricing Page (The Value Ladder)': {
        description: 'Tackling price objections. Compares plan tiers, features, and addresses FAQs with risk removal.',
        structure: [
          { step: '1. TIER LOGIC (Target Fit)', detail: 'Clearly showing who each plan is ideal for (e.g., Solo, Team, Enterprise).' },
          { step: '2. FEATURE COMPARISION', detail: 'A transparent breakdown of features included across tiers.' },
          { step: '3. RISK REVERSAL (Guarantees)', detail: 'Reinforcing free trial terms, refund policy, and cancel-anytime guarantees.' },
          { step: '4. OBJECTION CRUSHING (FAQ)', detail: 'Tackling top sales questions and objections via a strategic Q&A section.' }
        ]
      },
      'About Page (The Founder Story Arc)': {
        description: 'Building human connection and trust. Discusses the gap in the industry that led to the software genesis.',
        structure: [
          { step: '1. ORIGIN PROBLEM', detail: 'The catalyst event or core struggle the founders experienced themselves.' },
          { step: '2. BREAKTHROUGH INSIGHT', detail: 'The discovery or "Aha!" moment that led to designing the new mechanism.' },
          { step: '3. MISSION + VALUES', detail: 'The team vision, standards, and future commitment.' }
        ]
      }
    }
  },
  'eCommerce': {
    narrative: 'Desire, sensory and feature-to-benefit product details, simple category selections, trust, and risk reduction.',
    pages: {
      'Home Page (Desire → Category → Trust)': {
        description: 'The front door of your storefront. Displays hot lines, best categories, best sellers, and shopping trust elements.',
        structure: [
          { step: '1. BRAND PROMISE', detail: 'A beautiful, aspirational headline stating the lifestyle or solution the brand represents.' },
          { step: '2. TOP CATEGORIES', detail: 'Helping buyers select their immediate desire or category path.' },
          { step: '3. BEST SELLERS', detail: 'Validating selection by showcasing popular products and high-rated items.' },
          { step: '4. TRUST BUILDERS', detail: 'Adding details about shipping speed, customer satisfaction guarantees, or returns.' }
        ]
      },
      'Product Page (The 7-Part Conversion)': {
        description: 'The standard conversion asset for eCommerce. Highlights benefits, features, reviews, urgency, and questions.',
        structure: [
          { step: '1. HERO BENEFIT', detail: 'An emotional lifestyle headline + clear benefit above the fold.' },
          { step: '2. SENSORY DESCRIPTION', detail: 'Rich description appealing to the buyer\'s senses and tactile imagination.' },
          { step: '3. FEATURES → BENEFITS Map', detail: 'Listing technical details and instantly re-framing them as real-world benefits.' },
          { step: '4. SOCIAL PROOF (Reviews)', detail: 'User-generated proof, rating distribution, and real customer photos/reviews.' },
          { step: '5. RISK REVERSAL', detail: 'Prominently placing shipping & return policies or satisfaction guarantees.' },
          { step: '6. URGENCY / SCARCITY', detail: 'Adding prompts indicating low stock level, bundles, or limited discount periods.' },
          { step: '7. ACCORDION FAQ', detail: 'Quick sizing, care, usage, and shipping questions answered.' }
        ]
      },
      'Category Page (Filter → Guide → Recommend)': {
        description: 'Guides a visitor through choice overload. Curates, filters, and recommends targeted sub-selections.',
        structure: [
          { step: '1. CATEGORY INTRO', detail: 'Setting the mood for the category with descriptive copy.' },
          { step: '2. BUYING GUIDE', detail: 'Quick answers about how to select the right product in this category.' },
          { step: '3. TOP PICKS', detail: 'Highlighting staff favorites or best value items within the category.' }
        ]
      }
    }
  },
  'Local Business': {
    narrative: 'Geographic relevance, service clarity, expertise signals, customer validation, and frictionless direct contact.',
    pages: {
      'Home Page (The Local Trust Framework)': {
        description: 'Builds immediate local authority. Connects local area, licensing, service types, and immediate contact lines.',
        structure: [
          { step: '1. SERVICE STATEMENT', detail: 'Clearly stating what you do, who you serve, and which local target area.' },
          { step: '2. SERVICE AREA (Locality)', detail: 'Explicit list of neighborhoods, towns, or service boundaries.' },
          { step: '3. PROOF OF EXPERTISE', detail: 'Highlighting local licenses, badges, certifications, or years in active service.' },
          { step: '4. LOCAL TESTIMONIALS', detail: 'Customer reviews calling out the speed, quality, and friendliness from local residents.' },
          { step: '5. RAPID CALL-TO-ACTION', detail: 'Highly visible phone numbers or direct interactive quote requests.' }
        ]
      },
      'Services Page (Problem → Process → Proof)': {
        description: 'Deep dive into a specific service. Builds trust by explaining the process step-by-step and outlining results.',
        structure: [
          { step: '1. THE PROBLEM', detail: 'The local issue, defect, emergency, or upgrade need the customer is experiencing.' },
          { step: '2. YOUR PROCESS', detail: 'A detailed 3-step or 4-step look at how you carry out the job professionally.' },
          { step: '3. BEFORE / AFTER', detail: 'Visual descriptions or actual summaries of past work results.' }
        ]
      },
      'Contact Page (Frictionless Conversion)': {
        description: 'The gateway to bookings and phones. Reduces submit friction and reinforces confidence.',
        structure: [
          { step: '1. WHY CONTACT US', detail: 'Friendly reassurance of speed of response, free quoting, or friendly technicians.' },
          { step: '2. SIMPLE FORM', detail: 'The minimum required data points to start a consultation or booking request.' },
          { step: '3. TRUST REASSURANCE', detail: 'No obligations, respect of privacy, and quick time-to-respond estimates.' }
        ]
      }
    }
  },
  'Digital Services': {
    narrative: 'High-ticket authority, method transparency, outcomes or case studies focused, and logical process pathways.',
    pages: {
      'Home Page (Authority → Process → Proof)': {
        description: 'Positions the consultant or agency as the prime choice. Focuses on methods, outcomes, and case study overviews.',
        structure: [
          { step: '1. POSITIONING STATEMENT', detail: 'An elite, high-transformational statement of who you serve and your mechanism.' },
          { step: '2. CORE SERVICES', detail: 'Overview of standard digital transformation vectors.' },
          { step: '3. MINI CASE STUDIES', detail: 'Summarizing notable client successes, achievements, and statistics.' },
          { step: '4. YOUR PROPRIETARY METHOD', detail: 'Breaking down your unique sequence or methodology.' }
        ]
      },
      'Services Page (The Value Stack)': {
        description: 'Overcome generalism by detailing specific deliverables, execution processes, and proof points.',
        structure: [
          { step: '1. DELIVERABLES', detail: 'A robust list of what they receive.' },
          { step: '2. TANGIBLE OUTCOMES', detail: 'Relating deliverables directly to revenue, hours saved, or efficiency gains.' },
          { step: '3. COLLABORATION PROCESS', detail: 'Exactly what happens after sign-off, timeline milestones, and team setups.' },
          { step: '4. SERVICES PROOF', detail: 'Testimonials specific to this precise service pillar.' }
        ]
      },
      'Case Studies (The 5-Part Story)': {
        description: 'A data-driven story proving capability. Shows origin challenge, transition logic, mechanisms, and final metric outcomes.',
        structure: [
          { step: '1. THE CLIENT', detail: 'Setting the field, business model, and initial state.' },
          { step: '2. THE PROBLEM', detail: 'The complex limitation, bottleneck, or missed opportunity they had.' },
          { step: '3. THE SOLUTION', detail: 'How your team designed the strategy and applied the mechanism.' },
          { step: '4. THE METRIC RESULTS', detail: 'Showing specific tangible percentages, conversions, or revenue gains.' },
          { step: '5. PROOF ASSET / QUOTE', detail: 'An enthusiastic statement of praise/endorsement from the client champion.' }
        ]
      }
    }
  },
  'Portfolio': {
    narrative: 'Creative identity, design philosophy, premium project deep dives, and credibility vectors.',
    pages: {
      'Home Page (Identity → Specialty → Proof)': {
        description: 'The creative front. Highlights identity, visual specialty, major showcases, and how to start collaborating.',
        structure: [
          { step: '1. IDENTITY STATEMENT', detail: 'Creative statement of identity, focus, style, or philosophy.' },
          { step: '2. SPECIALTY SUMMARY', detail: 'Key capabilities (e.g., Art Direction, Interactive Design, Brand Strategy).' },
          { step: '3. SELECTED SPOTLIGHT WORK', detail: 'Presenting the proudest projects with beautiful titles and summaries.' }
        ]
      },
      'Portfolio Page (Work → Process → Outcome)': {
        description: 'Deconstructs a creative project. Shares design briefs, steps of discovery, and the final elegant outcome.',
        structure: [
          { step: '1. PROJECT SUMMARY', detail: 'Goal, target audience, and constraint elements in the design brief.' },
          { step: '2. YOUR CREATIVE ROLE', detail: 'Exactly what you led, crafted, or coordinated on.' },
          { step: '3. PROCESS & DISCOVERY', detail: 'Sketches, pivots, logic, and how your solutions came together.' },
          { step: '4. VISUAL & STRATEGIC OUTCOME', detail: 'The final, stunning design delivery and results (e.g., award, client success).' }
        ]
      },
      'About Page (The Credibility Story)': {
        description: 'Humor, passion, origin story, philosophies, and edge indicators that make your creative voice stand out.',
        structure: [
          { step: '1. DESIGN ORIGIN', detail: 'What inspired you to build things and how you developed your craft.' },
          { step: '2. CREATIVE PHILOSOPHY', detail: 'Your standard guidelines, beliefs, or "rules of thumb" in design/copy.' },
          { step: '3. YOUR EXPERTISE EDGE', detail: 'Your unfair advantages, unique tools, or multi-disciplinary skills.' }
        ]
      }
    }
  }
};
