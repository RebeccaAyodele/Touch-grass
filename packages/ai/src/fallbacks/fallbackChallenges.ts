import { GeneratedChallenge, ExperienceType, DurationMinutes } from '@touch-grass/shared';
import { calculateBaseXp, calculateMaxBonusXp } from '@touch-grass/game';

type FallbackCopy = Pick<GeneratedChallenge,
  'title' | 'description' | 'storyIntro' | 'objective' | 'instructions' |
  'completionCriteria' | 'safetyNotes' | 'accessibilityAlternative' | 'optionalBonusObjective'
>;

const FALLBACK_COPY: Record<ExperienceType, FallbackCopy> = {
  calm: {
    title: 'A Minute for the Weather',
    description: 'Pause in one comfortable outdoor spot and let your attention settle on the weather around you.',
    storyIntro: 'A small pause can make familiar surroundings feel new.',
    objective: 'Spend a few quiet minutes noticing how the air, light, or sounds change around you.',
    instructions: ['Choose one safe place to pause.', 'Settle into a comfortable seated or standing position.', 'Notice three small changes in the air, light, or surrounding sounds.', 'Return and write what helped you feel present.'],
    completionCriteria: 'Write what you noticed and which moment helped you slow down.',
    safetyNotes: 'Choose a comfortable place away from traffic and stop if the weather feels unsafe.',
    accessibilityAlternative: 'Complete the pause seated by an open doorway or window, without needing to go far.',
    optionalBonusObjective: 'Notice whether one slow breath changes what you hear.',
  },
  observe: {
    title: 'The Tiny Pattern Study',
    description: 'Give one small natural detail your full attention and look for patterns that are easy to miss.',
    storyIntro: 'The smallest details often have the most to show.',
    objective: 'Study one safe-to-reach natural surface and describe three details in its pattern.',
    instructions: ['Choose a natural detail you can inspect without disturbing it.', 'Look closely at its lines, edges, colors, or repeating shapes.', 'Shift your viewpoint once and notice what changes.', 'Return and record three specific details from memory.'],
    completionCriteria: 'Describe the detail you studied and three visible patterns or changes you noticed.',
    safetyNotes: 'Do not touch unknown plants, wildlife, or anything that may be hazardous.',
    accessibilityAlternative: 'Choose a detail visible from where you are comfortably seated.',
    optionalBonusObjective: 'Give the pattern a name of your own.',
  },
  explore: {
    title: 'A New Angle on a Familiar Place',
    description: 'Look at a nearby public place from a different angle and find one detail you usually pass by.',
    storyIntro: 'You do not need to go far to find something unfamiliar.',
    objective: 'Notice and investigate one overlooked detail in a nearby public outdoor place.',
    instructions: ['Choose a familiar, safe public spot.', 'Take a short, comfortable route or scan the area from one place.', 'Find one detail you have not really noticed before.', 'Return and describe what it is and what drew your attention.'],
    completionCriteria: 'Write where you looked, what you discovered, and why it stood out.',
    safetyNotes: 'Stay on public paths and respect private property.',
    accessibilityAlternative: 'Explore visually from an accessible seat or path; movement is optional.',
    optionalBonusObjective: 'Imagine what question you would ask about the detail.',
  },
  active: {
    title: 'Move to a Natural Rhythm',
    description: 'Use a few minutes outdoors for gentle movement, guided by a comfortable rhythm of your own.',
    storyIntro: 'Movement can be simple, playful, and entirely your own.',
    objective: 'Try three comfortable movements and notice how each changes your energy or focus.',
    instructions: ['Choose a safe, level place with room to move.', 'Try three gentle movements, such as shoulder rolls, a slow stretch, or a few steps.', 'Pause between movements and notice how your body feels.', 'Return and log which movement felt best.'],
    completionCriteria: 'Record the movements you chose and how one of them felt.',
    safetyNotes: 'Keep movement within your comfort level and stop if anything hurts or feels unsafe.',
    accessibilityAlternative: 'Choose gentle seated movements or small hand and shoulder motions.',
    optionalBonusObjective: 'Notice a sound or natural rhythm that matched your movement.',
  },
  social: {
    title: 'A Kind Word, A Good Question',
    description: 'Share a small moment of connection with someone you know and who is happy to chat.',
    storyIntro: 'A little attention can make an ordinary conversation warmer.',
    objective: 'Offer one sincere, specific compliment or ask a willing companion an open, easy question.',
    instructions: ['Invite a friend or companion who is comfortable joining you.', 'Spend a few minutes together in a place you both feel at ease.', 'Share a genuine compliment about something specific, or ask: “What is something small that made you smile recently?”', 'Listen to their answer, then return and log how the exchange felt.'],
    completionCriteria: 'Describe the kind of question or compliment you shared and what you learned or felt. Do not include names or identifying details.',
    safetyNotes: 'Only do this with someone you know or someone already engaged in a mutually welcomed conversation. Respect a no or a short answer; never request personal details.',
    accessibilityAlternative: 'Have the conversation seated, by phone before heading out, or write a kind note to someone you know.',
    optionalBonusObjective: 'Notice one thing you appreciated about how the other person listened.',
  },
  discover: {
    title: 'Follow One Curious Question',
    description: 'Choose a small question about your surroundings and look for clues that help answer it.',
    storyIntro: 'Curiosity turns an ordinary detail into a discovery.',
    objective: 'Investigate one question about a natural or built detail in a nearby public place.',
    instructions: ['Think of one question about something you can safely observe.', 'Look for two clues that might help answer it.', 'Compare the clues and decide what they suggest.', 'Return and write your question, clues, and best explanation.'],
    completionCriteria: 'Log your question, the clues you noticed, and what you think they mean.',
    safetyNotes: 'Observe without disturbing wildlife, plants, or other people’s property.',
    accessibilityAlternative: 'Choose a question you can investigate from a comfortable seated position.',
    optionalBonusObjective: 'Write one follow-up question your discovery raised.',
  },
  surprise: {
    title: 'Find a Shape in the Ordinary',
    description: 'Let chance choose a small creative observation and turn it into a short story or sketch.',
    storyIntro: 'An unexpected idea can change the way you see a familiar place.',
    objective: 'Find an ordinary outdoor shape and imagine what else it could be.',
    instructions: ['Look around from a safe place and let one shape catch your eye.', 'Study its outline for a moment.', 'Imagine it as something else, such as a map, creature, or letter.', 'Return and write or sketch what you imagined.'],
    completionCriteria: 'Describe the shape and the unexpected thing you imagined it to be.',
    safetyNotes: 'Do not look directly at the sun or enter unsafe areas to find a view.',
    accessibilityAlternative: 'Choose a shape visible from where you are comfortably seated.',
    optionalBonusObjective: 'Give your imagined discovery a title.',
  },
};

export const FALLBACK_CHALLENGES: Record<ExperienceType, (duration: DurationMinutes) => GeneratedChallenge> =
  Object.fromEntries(Object.entries(FALLBACK_COPY).map(([type, copy]) => [type, (duration: DurationMinutes) => ({
    ...copy,
    experienceType: type as ExperienceType,
    durationMinutes: duration,
    difficulty: 'easy' as const,
    verificationMethods: ['text_response' as const],
    baseXp: calculateBaseXp(duration),
    maxBonusXp: calculateMaxBonusXp(duration),
    source: 'fallback' as const,
  })])) as Record<ExperienceType, (duration: DurationMinutes) => GeneratedChallenge>;

export function getFallbackChallenge(type: ExperienceType, duration: DurationMinutes): GeneratedChallenge {
  return (FALLBACK_CHALLENGES[type] ?? FALLBACK_CHALLENGES.calm)(duration);
}
