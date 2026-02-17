export type ChecklistType = "facebook_groups" | "linkedin" | "twitter" | "amazon_reviews" | "conversation_prep" | "conversation_debrief";

export interface ChecklistField {
  id: string;
  label: string;
  placeholder: string;
  type: "text" | "textarea" | "number";
  required?: boolean;
  helpText?: string;
}

export interface ChecklistConfig {
  type: ChecklistType;
  title: string;
  description: string;
  instructions: string[];
  fields: ChecklistField[];
}

export const CHECKLIST_CONFIGS: Record<ChecklistType, ChecklistConfig> = {
  facebook_groups: {
    type: "facebook_groups",
    title: "Facebook Groups Research",
    description: "Find groups where your target audience discusses their problems",
    instructions: [
      "Search Facebook for groups related to your topic",
      "Join 2-3 active groups with 1000+ members",
      "Read posts from the last week, note pain points",
    ],
    fields: [
      { id: "groupName", label: "Group Name", placeholder: "e.g., Shopify Entrepreneurs", type: "text", required: true },
      { id: "groupSize", label: "Group Size", placeholder: "e.g., 45,000 members", type: "text", required: true },
      { id: "topPainPosts", label: "Top Pain-Related Posts (copy 3)", placeholder: "Paste posts showing frustration, complaints, or requests for help...", type: "textarea", required: true, helpText: "Look for posts with many comments asking for solutions" },
      { id: "commonLanguage", label: "Common Language Used", placeholder: "What words do they use to describe their problems?", type: "textarea", helpText: "This helps you speak their language" },
    ],
  },

  linkedin: {
    type: "linkedin",
    title: "LinkedIn Research",
    description: "Understand professional pain points and hiring signals",
    instructions: [
      "Search for job postings in your target role/industry",
      "Look at LinkedIn posts from thought leaders",
      "Note skills in demand and frustrations mentioned",
    ],
    fields: [
      { id: "targetRoles", label: "Target Role Titles", placeholder: "e.g., Marketing Manager, Growth Lead, Head of Ops", type: "text", required: true },
      { id: "skillsInDemand", label: "Skills Being Hired For", placeholder: "What skills appear repeatedly in job posts?", type: "textarea", required: true },
      { id: "painPointsFromPosts", label: "Pain Points from Posts", placeholder: "What are people complaining about or asking for help with?", type: "textarea", helpText: "Look at posts with high engagement" },
      { id: "toolsMentioned", label: "Tools/Solutions Mentioned", placeholder: "What existing solutions are people discussing?", type: "textarea" },
    ],
  },

  twitter: {
    type: "twitter",
    title: "Twitter/X Research",
    description: "Real-time sentiment and complaint analysis",
    instructions: [
      "Search relevant hashtags and keywords",
      "Find influencers/experts in the space",
      "Note common complaints and wishes",
    ],
    fields: [
      { id: "hashtags", label: "Relevant Hashtags", placeholder: "e.g., #nocode, #buildinpublic, #saas", type: "text", required: true },
      { id: "influencers", label: "Key Influencers (handles)", placeholder: "e.g., @someone, @another", type: "text" },
      { id: "commonComplaints", label: "Common Complaints", placeholder: "What are people frustrated about? Copy specific tweets.", type: "textarea", required: true },
      { id: "wishlistItems", label: "'I wish...' Statements", placeholder: "What do people wish existed or worked better?", type: "textarea", helpText: "Search for 'I wish' + your topic" },
    ],
  },

  amazon_reviews: {
    type: "amazon_reviews",
    title: "Amazon Reviews Research",
    description: "Find unmet needs in existing product reviews",
    instructions: [
      "Find products related to your idea",
      "Read 1-2 star reviews for complaints",
      "Note what's missing or broken",
    ],
    fields: [
      { id: "productCategory", label: "Product Category", placeholder: "e.g., Project Management Software, Standing Desk", type: "text", required: true },
      { id: "productsReviewed", label: "Products Reviewed", placeholder: "List 2-3 products you analyzed", type: "text", required: true },
      { id: "topComplaints", label: "Top Complaints (from 1-2 star)", placeholder: "What do negative reviews say? Copy specific quotes.", type: "textarea", required: true, helpText: "Focus on recurring themes, not one-off issues" },
      { id: "missingFeatures", label: "Missing Features Mentioned", placeholder: "What do reviewers wish the product had?", type: "textarea" },
    ],
  },

  conversation_prep: {
    type: "conversation_prep",
    title: "Customer Conversation Prep",
    description: "Prepare for real conversations with potential customers. Print or screenshot this before you go.",
    instructions: [
      "Identify 3-5 specific people to talk to (from Phase 4)",
      "Reach out via warm intro, DM, or community — say you're exploring an idea and want 15 minutes",
      "Use the questions below as a guide, not a script — follow their energy",
      "Don't pitch. Don't sell. Just listen and learn.",
    ],
    fields: [
      { id: "person1", label: "Person 1", placeholder: "Name + how you'll reach them (e.g., 'Sarah — DM on LinkedIn')", type: "text", required: true },
      { id: "person2", label: "Person 2", placeholder: "Name + how you'll reach them", type: "text", required: true },
      { id: "person3", label: "Person 3", placeholder: "Name + how you'll reach them", type: "text" },
      { id: "person4", label: "Person 4", placeholder: "Name + how you'll reach them", type: "text" },
      { id: "person5", label: "Person 5", placeholder: "Name + how you'll reach them", type: "text" },
      { id: "openingQuestion", label: "Your Opening Question", placeholder: "e.g., 'Tell me about the last time you tried to...' or 'What does your ideal [experience] look like?'", type: "textarea", required: true, helpText: "Start broad. Let them talk. Follow the energy." },
      { id: "keyAssumptions", label: "Key Assumptions to Test", placeholder: "What do you BELIEVE but haven't confirmed? List 2-3 assumptions.", type: "textarea", required: true, helpText: "These are the things that need to be true for your idea to work." },
      { id: "whatToListenFor", label: "What to Listen For", placeholder: "e.g., 'Do they mention workarounds? Do they light up when describing the experience? Do they get emotional?'", type: "textarea", helpText: "Behavior and emotion > opinions and politeness" },
    ],
  },

  conversation_debrief: {
    type: "conversation_debrief",
    title: "Customer Conversation Debrief",
    description: "Capture what you learned from a real conversation. Fill this in right after — details fade fast.",
    instructions: [
      "Fill this in within an hour of each conversation",
      "Focus on what they DID and FELT, not what they SAID they'd do",
      "Be honest — 'polite interest' is not validation",
      "One form per conversation (submit multiple)",
    ],
    fields: [
      { id: "personName", label: "Who did you talk to?", placeholder: "Name + brief context (role, background)", type: "text", required: true },
      { id: "relationship", label: "How do you know them?", placeholder: "e.g., 'Friend of a friend', 'Cold DM on Twitter', 'Met at meetup'", type: "text", required: true },
      { id: "topInsight", label: "Single biggest insight", placeholder: "If you could only remember one thing from this conversation, what is it?", type: "textarea", required: true, helpText: "The thing that surprised you or changed your thinking" },
      { id: "behaviorEvidence", label: "What are they DOING today?", placeholder: "How do they currently handle this? What workarounds, tools, or rituals do they use?", type: "textarea", required: true, helpText: "Actions > words. What they DO is more revealing than what they SAY." },
      { id: "emotionalMoments", label: "Emotional moments", placeholder: "When did they lean in, get animated, frustrated, or light up? What triggered it?", type: "textarea", required: true, helpText: "Energy = signal. Track what made them come alive or get frustrated." },
      { id: "moneyTimeSignals", label: "Money/time signals", placeholder: "Have they spent money or significant time on this? What and how much?", type: "textarea", helpText: "Past spending is the strongest validation signal" },
      { id: "surprises", label: "What surprised you?", placeholder: "What did you learn that you didn't expect? Where were your assumptions wrong?", type: "textarea" },
      { id: "quotableLines", label: "Quotable lines", placeholder: "Exact phrases they used that stuck with you. Their words, not yours.", type: "textarea", helpText: "These become your marketing copy later" },
      { id: "strengthenedOrWeakened", label: "Did this strengthen or weaken your idea?", placeholder: "Be honest. 'They were polite about it' = weakened. 'They asked when they could use it' = strengthened.", type: "textarea", required: true },
    ],
  },
};
