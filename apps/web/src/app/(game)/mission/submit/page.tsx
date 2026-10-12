'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../../../../context/GameContext';
import { TactileCard, TactileButton, TactilePill } from '../../../../components/ui';
import { ApiError } from '../../../../lib/api';

export default function SubmitEvidencePage() {
  const router = useRouter();
  const { currentChallenge, submitEvidence, loading } = useGame();
  const [textResponse, setTextResponse] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  if (!currentChallenge) {
    router.push('/dashboard');
    return null;
  }

  const requiresPhoto = currentChallenge.verificationMethods.includes('photo');

  async function handleSubmit() {
    if (!textResponse.trim()) {
      setFormError('Write a short log of what you actually did or noticed before submitting.');
      return;
    }
    if (requiresPhoto && !photoUrl.trim()) {
      setFormError('This mission also requires a photo evidence URL.');
      return;
    }
    setFormError(null);
    setAiFeedback(null);
    try {
      await submitEvidence(textResponse, photoUrl);
      router.push('/mission/results');
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 422) {
        setAiFeedback(error.feedback || error.message);
      } else {
        setFormError(error instanceof Error ? error.message : 'Your mission log could not be submitted. Please try again.');
      }
    }
  }

  return (
    <TactileCard className="p-5 sm:p-6 space-y-6">
      <div className="border-b-2 border-[var(--border-sand)] pb-4 animate-fade-in">
        <TactilePill variant="sage" className="text-xs uppercase mb-1">Mission Completion</TactilePill>
        <h2 className="text-2xl font-black text-[var(--ink-forest)]">Log Your Mission</h2>
        <p className="text-sm text-[var(--ink-muted)] mt-1">
          Mission: <span className="font-bold text-[var(--ink-forest)]">{currentChallenge.title}</span>
        </p>
      </div>

      <div className="space-y-5 animate-slide-up">
        <div>
          <label className="section-label" htmlFor="field-observation">What did you do or notice?</label>
          <textarea
            id="field-observation"
            value={textResponse}
            onChange={(event) => { setTextResponse(event.target.value); setFormError(null); setAiFeedback(null); }}
            placeholder="Describe what you actually did and one thing you noticed, discovered, or felt."
            rows={5}
            maxLength={1000}
            required
            className="tactile-textarea"
          />
          <p className="text-[11px] text-[var(--ink-muted)] mt-1">
            Your log is saved with this mission. Be specific; don’t include anyone’s name or private details. {textResponse.length}/1000
          </p>
        </div>

        {requiresPhoto && (
          <div>
            <label className="section-label" htmlFor="photo-evidence">Photo evidence URL (required)</label>
            <input
              id="photo-evidence"
              type="url"
              value={photoUrl}
              onChange={(event) => { setPhotoUrl(event.target.value); setFormError(null); setAiFeedback(null); }}
              placeholder="https://…"
              required
              className="tactile-input"
            />
            <p className="text-[11px] text-[var(--ink-muted)] mt-1">This mission requires a publicly accessible image URL.</p>
          </div>
        )}
        {formError && <p role="alert" className="text-sm font-semibold text-red-700">{formError}</p>}
        {aiFeedback && (
          <section role="alert" className="rounded-xl border-2 border-[var(--border-sand)] bg-[var(--canvas-cream)] p-4">
            <h3 className="font-bold text-[var(--ink-forest)]">A little more detail is needed</h3>
            <p className="mt-1 text-sm leading-relaxed text-[var(--ink-muted)]">{aiFeedback}</p>
            <p className="mt-2 text-xs text-[var(--ink-muted)]">Your mission is still active. Update your log and submit again.</p>
          </section>
        )}
      </div>

      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <TactileButton
          onClick={handleSubmit}
          loading={loading}
          disabled={!textResponse.trim() || (requiresPhoto && !photoUrl.trim())}
          fullWidth
          className="py-3.5 text-base flex-1"
        >
          {loading ? 'Game Master is reviewing your log…' : 'Submit mission log'}
        </TactileButton>
        <TactileButton variant="secondary" onClick={() => router.push('/mission/active')} className="py-3 px-6">
          Back
        </TactileButton>
      </div>
    </TactileCard>
  );
}
