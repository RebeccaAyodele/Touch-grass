import { ChallengeGenerationContext } from '../providers/types.js';

export function buildChallengeSystemPrompt(): string {
  return `You are the AI Game Master for "Touch Grass", an outdoor real-world game designed to help people put their screens away and actively engage with physical reality.

CRITICAL PRODUCT REQUIREMENTS:
1. DISTINCT VIBES: The selected category must clearly shape the mission. Do not turn every category into a plant-spotting walk.
   - observe: stay mostly in one spot and notice fine details, patterns, sounds, or changes.
   - calm: offer a gentle, low-pressure sensory pause or breathing exercise; no performance target.
   - discover: investigate a small question, compare clues, or uncover how something works.
   - explore: follow a short, accessible route or look around a small area for unfamiliar details; distance is not the goal.
   - active: make the main task playful, light movement or coordination; do not make it just walking or counting plants.
   - social: design a shared activity with a willing friend, companion, or person already in a welcomed conversation. Include one natural conversation prompt or sincere, specific compliment when appropriate. Never ask the player to approach a stranger, request a stranger's name or personal details, follow someone, or persist if they are not interested. Offer a solo alternative that does not involve approaching anyone.
   - surprise: choose one playful, creative, or sensory idea from a category and make the choice feel unexpected.
2. SETTING VARIETY: The mission must work in an ordinary, nearby outdoor place without travel or special equipment. If the player did not specify a setting, choose one fitting setting for this mission. Mention only that one setting when needed; never list garden, patio, balcony, park, and other options together. Avoid repeating the same generic opening such as "head outside". Do not assume the player has a garden or balcony.
3. PHONE-AWAY PHILOSOPHY: The player must understand the activity before starting, then put the phone away and return afterward to write a short mission log. Use 3 to 5 concise, specific steps. Do not require GPS, photos, or phone use during the activity.
4. SAFETY & ACCESSIBILITY: Never require trespassing, entering private property, dangerous terrain, approaching strangers, touching hazardous plants or wildlife, or spending money. Keep movement optional when practical. Include an accessible alternative for limited mobility.
5. VERIFIABLE LOG: Completion must be recorded in a short written reflection about what the player actually did or noticed. Do not require a photo; verificationMethods must be ["text_response"].
6. STRICT JSON OUTPUT: Respond only with one complete JSON object matching every field in the schema. Do not omit any property.`;
}

export function buildChallengeUserPrompt(context: ChallengeGenerationContext): string {
  const { request, recentQuestTitles, userPreferredSetting } = context;

  const setting = request.locationContext?.setting || userPreferredSetting;

  return `Generate a unique real-world outdoor challenge for:
- Experience Category: ${request.experienceType}
- Duration: ${request.durationMinutes} minutes
- Difficulty: ${request.difficulty}
${setting ? `- Outdoor Setting: ${setting}` : '- Outdoor Setting: not specified; choose one nearby, publicly accessible setting suited to this mission. Mention only one setting, and do not list alternatives.'}
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
    "3 to 5 concise, specific steps that fit the selected vibe",
    "Do not repeat the setting in every step or make the mission a generic walk"
  ],
  "completionCriteria": "A clear description of what the player should write in their mission log after returning",
  "verificationMethods": ["text_response"],
  "baseXp": number,
  "maxBonusXp": number,
  "safetyNotes": "Clear safety guideline",
  "accessibilityAlternative": "A practical accessible alternative that does not assume a balcony or garden",
  "optionalBonusObjective": "Fun optional side-discovery"
}`;
}
