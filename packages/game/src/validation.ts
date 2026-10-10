import {
  ChallengeStatus,
  VerificationMethod,
  EvidenceSubmission,
} from '@touch-grass/shared';

const VALID_TRANSITIONS: Record<ChallengeStatus, ChallengeStatus[]> = {
  generated: ['active', 'abandoned', 'expired'],
  active: ['completed', 'abandoned', 'expired'],
  completed: [],
  expired: [],
  abandoned: [],
};

/**
 * Validates whether a state transition is legal.
 */
export function isValidStatusTransition(
  current: ChallengeStatus,
  next: ChallengeStatus
): boolean {
  const allowed = VALID_TRANSITIONS[current];
  return allowed ? allowed.includes(next) : false;
}

export interface EvidenceValidationResult {
  valid: boolean;
  missingMethods: VerificationMethod[];
  errors: string[];
}

/**
 * Validates that all required evidence types for a challenge were supplied.
 */
export function validateEvidenceRequirements(
  requiredMethods: VerificationMethod[],
  submittedEvidence: EvidenceSubmission[]
): EvidenceValidationResult {
  const errors: string[] = [];
  const missingMethods: VerificationMethod[] = [];

  for (const method of requiredMethods) {
    if (method === 'honor') {
      continue;
    }

    const matchingEvidence = submittedEvidence.find((e) => e.type === method);
    if (!matchingEvidence) {
      missingMethods.push(method);
      errors.push(`Missing required evidence for '${method}'.`);
      continue;
    }

    if (method === 'photo' && (!matchingEvidence.imageUrl || matchingEvidence.imageUrl.trim().length === 0)) {
      errors.push('A valid photo URL must be supplied for photo verification.');
    }

    if (
      (method === 'text_response' || method === 'observation') &&
      (!matchingEvidence.textResponse || matchingEvidence.textResponse.trim().length === 0) &&
      (!matchingEvidence.observationNotes || matchingEvidence.observationNotes.trim().length === 0)
    ) {
      errors.push(`A written description or note is required for '${method}'.`);
    }
  }

  return {
    valid: errors.length === 0,
    missingMethods,
    errors,
  };
}
