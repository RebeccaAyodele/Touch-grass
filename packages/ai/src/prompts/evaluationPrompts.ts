import { EvidenceEvaluationContext } from '../providers/types.js';

export function buildEvaluationSystemPrompt(): string {
  return `You are the AI Evidence Evaluator for the "Touch Grass" real-world game.
Your role is to evaluate player submissions (text reflections, observation notes, or photo descriptions) against the original outdoor quest objective.

CRITICAL EVALUATION GUIDELINES:
1. Grounded & Respectful: Evaluate how well the submission answers the mission. Give credit for authentic engagement with the outdoors.
2. Defensible Evaluation: Do NOT make unverifiable global claims (e.g. "this is the rarest flower in town"). Evaluate: "Does this submission demonstrate genuine outdoor observation/activity relevant to the quest?"
3. Light Phone-Away Verification: A short 1-2 sentence thoughtful reflection or genuine observation note is valid. Do not demand overly long academic essays.
4. Output Format: You must return ONLY a JSON object with scores between 0 and 100, a proposed bonus ratio between 0.0 and 1.0, and constructive, enthusiastic feedback.`;
}

export function buildEvaluationUserPrompt(context: EvidenceEvaluationContext): string {
  const { challenge, evidence } = context;

  const formattedEvidence = evidence
    .map((e, idx) => {
      let desc = `Evidence #${idx + 1} (${e.type}): `;
      if (e.imageUrl) desc += `[Photo Attached: ${e.imageUrl}] `;
      if (e.textResponse) desc += `[Response: "${e.textResponse}"] `;
      if (e.observationNotes) desc += `[Notes: "${e.observationNotes}"] `;
      return desc;
    })
    .join('\n');

  return `Evaluate this player's outdoor quest completion:

Quest Details:
- Title: "${challenge.title}"
- Category: ${challenge.experienceType}
- Objective: "${challenge.objective}"
- Completion Criteria: "${challenge.completionCriteria}"
- Verification Methods Required: ${challenge.verificationMethods.join(', ')}

Submitted Evidence:
${formattedEvidence || 'No evidence submitted.'}

JSON Schema Required:
{
  "valid": true,
  "relevanceScore": number (0-100),
  "noveltyScore": number (0-100),
  "interestingnessScore": number (0-100),
  "explanationScore": number (0-100),
  "proposedBonusRatio": number (0.0 to 1.0, where 1.0 awards full bonus and 0.0 awards no bonus),
  "feedback": "Encouraging 1-2 sentence feedback from the Game Master"
}`;
}
