export type ChecklistType = "facebook_groups" | "linkedin" | "twitter" | "amazon_reviews";

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
};
