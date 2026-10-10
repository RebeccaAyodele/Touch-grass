'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../../../../context/GameContext';
import { TactileCard, TactileButton, TactilePill } from '../../../../components/ui';

export default function SubmitEvidencePage() {
  const router = useRouter();
  const { currentChallenge, submitEvidence, loading } = useGame();
  const [textResponse, setTextResponse] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  if (!currentChallenge) {
    router.push('/dashboard');
    return null;
  }

  async function handleSubmit() {
    try {
      await submitEvidence(textResponse, photoUrl);
      router.push('/mission/results');
    } catch {}
  }

  return (
    <TactileCard className="p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="border-b-2 border-[var(--border-sand)] pb-4 animate-fade-in">
        <TactilePill variant="sage" className="text-xs uppercase mb-1">
          Mission Completion
        </TactilePill>
        <h2 className="text-2xl font-black text-[var(--ink-forest)]">Submit Your Field Evidence</h2>
        <p className="text-sm text-[var(--ink-muted)] mt-1">
          Mission: <span className="font-bold text-[var(--ink-forest)]">{currentChallenge.title}</span>
        </p>
      </div>

      {/* Form */}
      <div className="space-y-5 animate-slide-up">
        <div>
          <label className="section-label" htmlFor="field-observation">
            Field Observation Notes / Reflection
          </label>
          <textarea
            id="field-observation"
            value={textResponse}
            onChange={(e) => setTextResponse(e.target.value)}
            placeholder="What did you notice, discover, or experience while outdoors? Describe textures, colors, sounds, or feelings..."
            rows={5}
            className="tactile-textarea"
          />
          <p className="text-[11px] text-[var(--ink-muted)] mt-1">
            Detailed, sensory-rich observations earn higher AI discovery bonuses.
          </p>
        </div>

        <div>
          <label className="section-label" htmlFor="photo-evidence">
            Photo Evidence (Image URL / Snapshot)
          </label>
          <input
            id="photo-evidence"
            type="text"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="Enter image URL (or leave blank for default)"
            className="tactile-input"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <TactileButton
          onClick={handleSubmit}
          loading={loading}
          fullWidth
          className="py-3.5 text-base flex-1"
        >
          {loading ? '🔬 AI Game Master is evaluating...' : '🏆 Submit to AI Game Master'}
        </TactileButton>
        <TactileButton
          variant="secondary"
          onClick={() => router.push('/mission/active')}
          className="py-3 px-6"
        >
          Back
        </TactileButton>
      </div>
    </TactileCard>
  );
}
