/**
 * Mock phase states for testing Idea Card visual states
 * Covers phases 0-9 with varying keywords, sentences, and scores
 */

interface MockKeyword {
  word: string;
  area: number;
  relevance: number;
}

interface MockSupportingSentence {
  text: string;
  areaIndex: number;
}

interface MockPhaseState {
  phase: number;
  ideaKeywords: MockKeyword[] | null;
  ideaSentence: string | null;
  supportingSentences: MockSupportingSentence[];
  score: number | null;
}

// Helper to generate mock keywords for an area
function generateKeywords(areaIndex: number, words: string[]): MockKeyword[] {
  return words.map((word, i) => ({
    word,
    area: areaIndex,
    relevance: 0.9 - i * 0.1, // Decreasing relevance
  }));
}

export const MOCK_PHASE_STATES: MockPhaseState[] = [
  // Phase 0: No data yet
  {
    phase: 0,
    ideaKeywords: null,
    ideaSentence: null,
    supportingSentences: [],
    score: null,
  },

  // Phase 1: Initial keywords appearing (6-10 per area)
  {
    phase: 1,
    ideaKeywords: [
      ...generateKeywords(0, ['professionals', 'busy', 'time', 'convenience', 'schedule']),
      ...generateKeywords(1, ['artisan', 'local', 'quality', 'craft', 'authentic']),
      ...generateKeywords(2, ['food', 'meal', 'weekly', 'delivery', 'subscription']),
      ...generateKeywords(3, ['personalized', 'preferences', 'custom', 'tailored']),
      ...generateKeywords(4, ['connection', 'community', 'support', 'local-business']),
      ...generateKeywords(5, ['healthy', 'fresh', 'sustainable', 'seasonal']),
    ],
    ideaSentence: null,
    supportingSentences: [],
    score: null,
  },

  // Phase 2: More keywords, blobs closer (10-14 per area)
  {
    phase: 2,
    ideaKeywords: [
      ...generateKeywords(0, ['professionals', 'busy', 'time-poor', 'convenience', 'schedule', 'work-life', 'productivity', 'efficiency']),
      ...generateKeywords(1, ['artisan', 'local', 'quality', 'craft', 'authentic', 'makers', 'small-batch', 'handmade', 'expertise']),
      ...generateKeywords(2, ['food', 'meal', 'weekly', 'delivery', 'subscription', 'service', 'recurring', 'convenient', 'doorstep']),
      ...generateKeywords(3, ['personalized', 'preferences', 'custom', 'tailored', 'curated', 'individual', 'dietary', 'taste']),
      ...generateKeywords(4, ['connection', 'community', 'support', 'local-business', 'relationships', 'direct', 'storytelling']),
      ...generateKeywords(5, ['healthy', 'fresh', 'sustainable', 'seasonal', 'organic', 'nutritious', 'whole-foods', 'wellness']),
    ],
    ideaSentence: null,
    supportingSentences: [],
    score: null,
  },

  // Phase 3: Merge happens, idea sentence appears
  {
    phase: 3,
    ideaKeywords: [
      ...generateKeywords(0, ['professionals', 'busy', 'time-poor', 'convenience', 'schedule', 'work-life']),
      ...generateKeywords(1, ['artisan', 'local', 'quality', 'craft', 'authentic', 'makers']),
      ...generateKeywords(2, ['food', 'meal', 'weekly', 'delivery', 'subscription', 'service']),
      ...generateKeywords(3, ['personalized', 'preferences', 'custom', 'tailored', 'curated']),
      ...generateKeywords(4, ['connection', 'community', 'support', 'local-business', 'relationships']),
      ...generateKeywords(5, ['healthy', 'fresh', 'sustainable', 'seasonal', 'organic']),
    ],
    ideaSentence: 'A subscription service that connects busy professionals with local artisan food makers for personalized weekly meal deliveries',
    supportingSentences: [
      { text: 'Professionals value convenience and time savings in meal planning', areaIndex: 0 },
      { text: 'Artisan makers need direct customer relationships beyond farmers markets', areaIndex: 1 },
      { text: 'Weekly subscriptions create predictable revenue for small businesses', areaIndex: 2 },
      { text: 'Personalization drives customer loyalty and retention', areaIndex: 3 },
    ],
    score: null,
  },

  // Phase 4-6: Idea exists but no score yet
  {
    phase: 4,
    ideaKeywords: null,
    ideaSentence: 'A subscription service that connects busy professionals with local artisan food makers for personalized weekly meal deliveries',
    supportingSentences: [
      { text: 'Professionals value convenience and time savings in meal planning', areaIndex: 0 },
      { text: 'Artisan makers need direct customer relationships beyond farmers markets', areaIndex: 1 },
      { text: 'Weekly subscriptions create predictable revenue for small businesses', areaIndex: 2 },
      { text: 'Personalization drives customer loyalty and retention', areaIndex: 3 },
    ],
    score: null,
  },
  {
    phase: 5,
    ideaKeywords: null,
    ideaSentence: 'A subscription service that connects busy professionals with local artisan food makers for personalized weekly meal deliveries',
    supportingSentences: [
      { text: 'Professionals value convenience and time savings in meal planning', areaIndex: 0 },
      { text: 'Artisan makers need direct customer relationships beyond farmers markets', areaIndex: 1 },
      { text: 'Weekly subscriptions create predictable revenue for small businesses', areaIndex: 2 },
      { text: 'Personalization drives customer loyalty and retention', areaIndex: 3 },
    ],
    score: null,
  },
  {
    phase: 6,
    ideaKeywords: null,
    ideaSentence: 'A subscription service that connects busy professionals with local artisan food makers for personalized weekly meal deliveries',
    supportingSentences: [
      { text: 'Professionals value convenience and time savings in meal planning', areaIndex: 0 },
      { text: 'Artisan makers need direct customer relationships beyond farmers markets', areaIndex: 1 },
      { text: 'Weekly subscriptions create predictable revenue for small businesses', areaIndex: 2 },
      { text: 'Personalization drives customer loyalty and retention', areaIndex: 3 },
    ],
    score: null,
  },

  // Phase 7: Score appears (18) - below threshold, stays orange
  {
    phase: 7,
    ideaKeywords: null,
    ideaSentence: 'A subscription service that connects busy professionals with local artisan food makers for personalized weekly meal deliveries',
    supportingSentences: [
      { text: 'Professionals value convenience and time savings in meal planning', areaIndex: 0 },
      { text: 'Artisan makers need direct customer relationships beyond farmers markets', areaIndex: 1 },
      { text: 'Weekly subscriptions create predictable revenue for small businesses', areaIndex: 2 },
      { text: 'Personalization drives customer loyalty and retention', areaIndex: 3 },
    ],
    score: 18, // Below threshold of 20
  },

  // Phase 8: Score improves (24) - above threshold, turns green
  {
    phase: 8,
    ideaKeywords: null,
    ideaSentence: 'A subscription service that connects busy professionals with local artisan food makers for personalized weekly meal deliveries',
    supportingSentences: [
      { text: 'Professionals value convenience and time savings in meal planning', areaIndex: 0 },
      { text: 'Artisan makers need direct customer relationships beyond farmers markets', areaIndex: 1 },
      { text: 'Weekly subscriptions create predictable revenue for small businesses', areaIndex: 2 },
      { text: 'Personalization drives customer loyalty and retention', areaIndex: 3 },
    ],
    score: 24, // Above threshold of 20
  },

  // Phase 9: High score (28) - well above threshold, dark green
  {
    phase: 9,
    ideaKeywords: null,
    ideaSentence: 'A subscription service that connects busy professionals with local artisan food makers for personalized weekly meal deliveries',
    supportingSentences: [
      { text: 'Professionals value convenience and time savings in meal planning', areaIndex: 0 },
      { text: 'Artisan makers need direct customer relationships beyond farmers markets', areaIndex: 1 },
      { text: 'Weekly subscriptions create predictable revenue for small businesses', areaIndex: 2 },
      { text: 'Personalization drives customer loyalty and retention', areaIndex: 3 },
    ],
    score: 28, // Well above threshold
  },
];
