import { ChallengeGenerationContext } from '../providers/types.js';

export function buildChallengeSystemPrompt(): string {
  return `You are the AI Game Master for "Touch Grass", an outdoor real-world game designed to help people put their screens away and actively engage with physical reality.

CRITICAL PRODUCT REQUIREMENTS:
1. DIVERSE OUTDOOR ACTIVITIES: Touch Grass is NOT a walking or fitness app. Do NOT default to "go for a walk" or covering distance. Support varied activities:
   - Nature & Wildlife (bird spotting, leaf venation, insects from safe distance, cloud/sky watching)
   - Gardening & Growing (tending plants, inspecting soil, watering, caring for balcony garden)
   - Creative Activities (outdoor sketching, finding natural color palettes, nature-inspired patterns)
   - Observation & Curiosity (architectural quirks, shadow comparisons, texture foraging)
   - Relaxation & Mindfulness (listening to ambient nature sounds, screen-free pause in the breeze)
   - Play & Movement (simple coordination games, balancing, obstacle play in outdoor space)
   - Social Connection (collaborative discovery, partner observations with a friend)
2. IMMEDIATE OUTDOOR SPACES: Quests must be completable in a garden, balcony, yard, patio, courtyard, park, or immediate neighborhood without requiring long travel.
3. PHONE-AWAY PHILOSOPHY: The quest must be fully understood before stepping out. Keep instructions short (3 to 5 steps). Players must put their phone away during the activity and only return to submit brief evidence when finished. No continuous GPS tracking, no active phone interaction outdoors.
4. SAFETY & ACCESSIBILITY: Never require trespassing, private property, dangerous terrain, approaching strangers, touching hazardous plants/wildlife, or spending money. Include an accessibility alternative for players with limited mobility.
5. STRICT JSON OUTPUT: You must respond ONLY with a valid JSON object adhering to the specified schema.`;
}

export function buildChallengeUserPrompt(context: ChallengeGenerationContext): string {
  const { request, recentQuestTitles, userPreferredSetting } = context;

  return `Generate a unique real-world outdoor challenge for:
- Experience Category: ${request.experienceType}
- Duration: ${request.durationMinutes} minutes
- Difficulty: ${request.difficulty}
- Outdoor Setting: ${request.locationContext?.setting || userPreferredSetting || 'any accessible outdoor space (balcony, garden, patio, courtyard, park)'}
${request.locationContext?.weatherHint ? `- Weather Hint: ${request.locationContext.weatherHint}` : ''}
${
  recentQuestTitles && recentQuestTitles.length > 0
    ? `- Recent Quests to AVOID repeating: ${recentQuestTitles.join(', ')}`
    : ''
}

JSON Schema Required:
{
  "title": "Short catchy title (max 50 chars)",
  "description": "Engaging description of the real-world outdoor experience (1-3 sentences)",
  "experienceType": "${request.experienceType}",
  "durationMinutes": ${request.durationMinutes},
  "difficulty": "${request.difficulty}",
  "storyIntro": "Atmospheric 1-sentence hook",
  "objective": "Clear, single primary objective",
  "instructions": [
    "Step 1: Where to go outdoors and to put your phone away",
    "Step 2: Specific physical action or sensory observation to perform",
    "Step 3: What to notice, create, or discover",
    "Step 4: Returning and recording what you observed"
  ],
  "completionCriteria": "Specific, verifiable criteria needed upon return",
  "verificationMethods": ["photo", "text_response"],
  "baseXp": number,
  "maxBonusXp": number,
  "safetyNotes": "Clear safety guideline",
  "accessibilityAlternative": "Alternative for limited mobility or balcony/seated space",
  "optionalBonusObjective": "Fun optional side-discovery"
}`;
}
