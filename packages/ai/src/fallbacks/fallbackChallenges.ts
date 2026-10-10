import {
  GeneratedChallenge,
  ExperienceType,
  DurationMinutes,
} from '@touch-grass/shared';
import { calculateBaseXp, calculateMaxBonusXp } from '@touch-grass/game';

export const FALLBACK_CHALLENGES: Record<
  ExperienceType,
  (duration: DurationMinutes) => GeneratedChallenge
> = {
  calm: (duration) => ({
    title: 'The Sky & Shadow Pause',
    description:
      'Step outside into a courtyard, balcony, or garden. Spend quiet moments watching the movement of shadows and cloud patterns without looking at a screen.',
    experienceType: 'calm',
    durationMinutes: duration,
    difficulty: 'easy',
    storyIntro: 'The world moves fast, but nature maintains its own quiet rhythm.',
    objective: 'Sit or stand comfortably outside and observe 3 distinct natural changes or ambient sounds.',
    instructions: [
      'Find a safe, quiet spot outside (your yard, balcony, or nearby bench).',
      'Put your phone in your pocket or face down.',
      'Spend 10–15 minutes listening to the ambient sounds and observing light on surfaces.',
      'Note 3 subtle things you normally overlook.',
    ],
    completionCriteria: 'Describe 3 specific sounds or light/shadow observations you noticed during your pause.',
    verificationMethods: ['observation', 'text_response'],
    baseXp: calculateBaseXp(duration),
    maxBonusXp: calculateMaxBonusXp(duration),
    safetyNotes: 'Choose a sheltered, safe spot away from roadway traffic.',
    accessibilityAlternative: 'Can be completed fully seated on a balcony, open window, or doorstep.',
    optionalBonusObjective: 'Note the exact direction of the wind or movement of the highest cloud layer.',
    source: 'fallback',
  }),

  observe: (duration) => ({
    title: 'Micro-Texture Expedition',
    description:
      'Discover 3 completely different textures created by nature or weathering in your immediate outdoor area.',
    experienceType: 'observe',
    durationMinutes: duration,
    difficulty: 'moderate',
    storyIntro: 'Intricate design is hidden in plain sight on every leaf, bark, and stone.',
    objective: 'Find and closely inspect 3 contrasting natural textures (e.g. rough bark, smooth pebble, ribbed leaf).',
    instructions: [
      'Step outside into your garden, walkway, or nearby green space.',
      'Put your phone away and search closely for 3 distinct surface textures.',
      'Gently touch or inspect each texture to examine its pattern.',
      'Take one photo of your most fascinating texture discovery.',
    ],
    completionCriteria: 'Submit a photo of your most unusual texture find with a short note describing all three textures.',
    verificationMethods: ['photo', 'text_response'],
    baseXp: calculateBaseXp(duration),
    maxBonusXp: calculateMaxBonusXp(duration),
    safetyNotes: 'Do not touch unknown thorny plants or disturb nesting insects.',
    accessibilityAlternative: 'Can be done within arms reach of a container garden or potted plant.',
    optionalBonusObjective: 'Explain what natural process (weathering, growth) formed the texture.',
    source: 'fallback',
  }),

  explore: (duration) => ({
    title: 'The Overlooked Detail Hunt',
    description:
      'Explore an accessible outdoor space and find an architectural detail or natural landmark you have never paid attention to before.',
    experienceType: 'explore',
    durationMinutes: duration,
    difficulty: 'moderate',
    storyIntro: 'Even the most familiar places hold secrets when you look with fresh eyes.',
    objective: 'Identify a unique physical marker, vintage signage, or natural growth pattern in your vicinity.',
    instructions: [
      'Leave your desk and head outdoors into your neighborhood or courtyard.',
      'Pocket your phone and choose a path you do not frequently inspect.',
      'Scan building corners, rooflines, tree branches, or stone markers.',
      'Photograph the single most unusual overlooked feature you discover.',
    ],
    completionCriteria: 'Submit a photo of the overlooked feature and explain what caught your eye.',
    verificationMethods: ['photo', 'text_response'],
    baseXp: calculateBaseXp(duration),
    maxBonusXp: calculateMaxBonusXp(duration),
    safetyNotes: 'Stay on public walkways and respect private property boundaries.',
    accessibilityAlternative: 'Focus on examining architectural features visible from an accessible ramp or seating area.',
    optionalBonusObjective: 'Estimate approximately how old the feature or plant might be.',
    source: 'fallback',
  }),

  active: (duration) => ({
    title: 'The Perimeter Scavenger Circuit',
    description:
      'Engage in light movement around an outdoor courtyard or park while tracking 4 distinct environmental markers.',
    experienceType: 'active',
    durationMinutes: duration,
    difficulty: 'moderate',
    storyIntro: 'Movement refreshes the body and sharpens the senses.',
    objective: 'Walk the perimeter of a safe outdoor space, finding 4 different tree or plant varieties.',
    instructions: [
      'Head outside to an open space, yard, or park perimeter.',
      'Put your phone away and begin moving at a comfortable, steady pace.',
      'Every few minutes, pause briefly to identify a different leaf or branch structure.',
      'Complete the full circuit without checking your screen.',
    ],
    completionCriteria: 'Describe the 4 plant varieties or landmarks you encountered on your route.',
    verificationMethods: ['observation', 'text_response'],
    baseXp: calculateBaseXp(duration),
    maxBonusXp: calculateMaxBonusXp(duration),
    safetyNotes: 'Wear comfortable shoes and stay on designated pedestrian pathways.',
    accessibilityAlternative: 'Adjust pace or distance to suit personal mobility preferences.',
    optionalBonusObjective: 'Take a photo at the highest elevation point of your route.',
    source: 'fallback',
  }),

  social: (duration) => ({
    title: 'Two Perspectives Observation',
    description:
      'Complete an outdoor observation quest with a friend, each looking for different elements in the same environment.',
    experienceType: 'social',
    durationMinutes: duration,
    difficulty: 'moderate',
    storyIntro: 'Sharing the outdoors with others reveals details you might miss on your own.',
    objective: 'With a friend or partner, find 3 outdoor features that fit contrasting themes (e.g., oldest vs newest, darkest green vs brightest blossom).',
    instructions: [
      'Gather with a friend in any outdoor space.',
      'Assign roles: Player 1 looks for natural growth, Player 2 looks for crafted structures.',
      'Put phones away and explore the space together for 15 minutes.',
      'Compare what each person spotted and take a photo of your favorite shared find.',
    ],
    completionCriteria: 'Submit a photo and a brief summary of what you both discovered.',
    verificationMethods: ['photo', 'text_response'],
    baseXp: calculateBaseXp(duration),
    maxBonusXp: calculateMaxBonusXp(duration),
    safetyNotes: 'Always respect social comfort and public space guidelines.',
    accessibilityAlternative: 'Can be completed seated together on a park bench or patio table.',
    optionalBonusObjective: 'Name one thing your partner noticed that you completely overlooked.',
    source: 'fallback',
  }),

  discover: (duration) => ({
    title: 'Botanical & Wildlife Spy',
    description:
      'Discover signs of outdoor life right outside your door: insect pollinators, bird perches, or newly sprouted shoots.',
    experienceType: 'discover',
    durationMinutes: duration,
    difficulty: 'moderate',
    storyIntro: 'Nature thrives in every crevice, garden corner, and hedgerow.',
    objective: 'Find direct evidence of local wildlife or active plant growth.',
    instructions: [
      'Go outside to a garden bed, planter box, or grassy lawn.',
      'Leave your phone in your pocket and observe quietly for 10 minutes.',
      'Look under leaves, on bark, or into flowering blooms for pollinators or bird activity.',
      'Capture one close-up photo of your living discovery.',
    ],
    completionCriteria: 'Submit a photo of the plant or animal life observed with a description.',
    verificationMethods: ['photo', 'text_response'],
    baseXp: calculateBaseXp(duration),
    maxBonusXp: calculateMaxBonusXp(duration),
    safetyNotes: 'Observe insects and wildlife from a safe, non-intrusive distance.',
    accessibilityAlternative: 'Can be completed inspecting potted plants on a window ledge or patio.',
    optionalBonusObjective: 'Identify the specific species or color palette of the organism.',
    source: 'fallback',
  }),

  surprise: (duration) => ({
    title: 'The Unplanned Outdoor Sketch',
    description:
      'Let spontaneous curiosity guide you: step outside with paper or a mind for visualization, and capture the contour of an outdoor silhouette.',
    experienceType: 'surprise',
    durationMinutes: duration,
    difficulty: 'adventurous',
    storyIntro: 'Surprise comes from creative spontaneity in the open air.',
    objective: 'Find an unusual organic silhouette (branch arch, cloud formation, stone profile) and observe or sketch its contours.',
    instructions: [
      'Step outside into whatever outdoor area is immediately available.',
      'Look upward or across the horizon for an interesting silhouette against the sky.',
      'Put your phone away and spend 10 minutes studying its geometry.',
      'Take a photo of the silhouette or your nature-inspired sketch.',
    ],
    completionCriteria: 'Submit a photo of the outdoor silhouette or your sketch with a brief note.',
    verificationMethods: ['photo', 'text_response'],
    baseXp: calculateBaseXp(duration),
    maxBonusXp: calculateMaxBonusXp(duration),
    safetyNotes: 'Do not look directly at the sun while observing sky silhouettes.',
    accessibilityAlternative: 'Can be completed from any outdoor vantage point.',
    optionalBonusObjective: 'Write a one-sentence title for your silhouette.',
    source: 'fallback',
  }),
};

export function getFallbackChallenge(
  type: ExperienceType,
  duration: DurationMinutes
): GeneratedChallenge {
  const generator = FALLBACK_CHALLENGES[type] ?? FALLBACK_CHALLENGES.calm;
  return generator(duration);
}
