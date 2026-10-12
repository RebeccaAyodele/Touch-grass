'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserResponse,
  ChallengeResponse,
  CompletionResponse,
  SpaceResponse,
  LeaderboardEntry,
  ExperienceType,
  DurationMinutes,
  EvidenceSubmission,
} from '@touch-grass/shared';
import { calculateLevelProgress } from '@touch-grass/game';
import { api, ApiError } from '../lib/api';

interface GameState {
  // Auth & User
  user: UserResponse | null;
  isAuthChecked: boolean;
  loading: boolean;
  errorMsg: string | null;

  // Active challenge
  currentChallenge: ChallengeResponse | null;
  lastCompletion: CompletionResponse | null;
  lastEvidence: EvidenceSubmission[];

  // Spaces & Leaderboard
  spaces: SpaceResponse[];
  leaderboard: LeaderboardEntry[];

  // Computed
  levelProgress: ReturnType<typeof calculateLevelProgress>;
}

interface GameActions {
  // Auth
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;

  // Challenges
  generateChallenge: (params: {
    experienceType: ExperienceType;
    durationMinutes: DurationMinutes;
  }) => Promise<ChallengeResponse>;
  startChallenge: () => Promise<void>;
  submitEvidence: (textResponse: string, photoUrl: string) => Promise<CompletionResponse>;

  // Data loading
  loadSpaces: () => Promise<void>;
  loadLeaderboard: () => Promise<void>;
  createSpace: (name: string) => Promise<void>;
  joinSpace: (inviteCode: string) => Promise<void>;

  // UI
  setError: (msg: string | null) => void;
  clearChallenge: () => void;
}

const GameContext = createContext<(GameState & GameActions) | null>(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeResponse | null>(null);
  const [lastCompletion, setLastCompletion] = useState<CompletionResponse | null>(null);
  const [lastEvidence, setLastEvidence] = useState<EvidenceSubmission[]>([]);
  const [spaces, setSpaces] = useState<SpaceResponse[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const levelProgress = calculateLevelProgress(user?.totalXp || 0);

  // Check auth on mount
  useEffect(() => {
    async function checkAuth() {
      const token = api.getToken();
      if (token) {
        try {
          const { user: me } = await api.getMe();
          setUser(me);
          // Also check for active challenge
          try {
            const { challenge } = await api.getActiveChallenge();
            if (challenge) setCurrentChallenge(challenge);
          } catch {}
        } catch {
          api.logout();
        }
      }
      setIsAuthChecked(true);
    }
    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
    } catch (err: any) {
      setErrorMsg(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string, confirmPassword: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.register(username, email, password, confirmPassword);
      setUser(res.user);
    } catch (err: any) {
      setErrorMsg(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
    setCurrentChallenge(null);
    setLastCompletion(null);
    setLastEvidence([]);
    setSpaces([]);
  }, []);

  const generateChallenge = useCallback(async (params: {
    experienceType: ExperienceType;
    durationMinutes: DurationMinutes;
  }) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { challenge } = await api.generateChallenge(params);
      setCurrentChallenge(challenge);
      return challenge;
    } catch (err: any) {
      setErrorMsg(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const startChallenge = useCallback(async () => {
    if (!currentChallenge) return;
    setLoading(true);
    try {
      const { challenge } = await api.startChallenge(currentChallenge.id);
      setCurrentChallenge(challenge);
    } catch (err: any) {
      setErrorMsg(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentChallenge]);

  const submitEvidence = useCallback(async (textResponse: string, photoUrl: string) => {
    if (!currentChallenge) throw new Error('No active challenge');
    const missionLog = textResponse.trim();
    if (!missionLog) throw new Error('Write a short mission log before submitting.');
    setLoading(true);
    setErrorMsg(null);
    try {
      const evidenceList: EvidenceSubmission[] = [{
        challengeId: currentChallenge.id,
        type: 'text_response',
        textResponse: missionLog,
      }];
      if (currentChallenge.verificationMethods.includes('photo')) {
        if (!photoUrl.trim()) throw new Error('This mission requires a photo evidence URL.');
        evidenceList.push({
          challengeId: currentChallenge.id,
          type: 'photo',
          imageUrl: photoUrl.trim(),
        });
      }
      if (currentChallenge.verificationMethods.includes('observation')) {
        evidenceList.push({
          challengeId: currentChallenge.id,
          type: 'observation',
          textResponse: missionLog,
        });
      }

      const { completion } = await api.completeChallenge(currentChallenge.id, evidenceList);
      setLastCompletion(completion);
      setLastEvidence(evidenceList);
      if (user) {
        setUser({
          ...user,
          totalXp: completion.newTotalXp,
          level: completion.newLevel,
          streak: completion.newStreak,
        });
      }
      return completion;
    } catch (err: any) {
      if (!(err instanceof ApiError && err.statusCode === 422)) {
        setErrorMsg(err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentChallenge, user]);

  const loadSpaces = useCallback(async () => {
    try {
      const { spaces: sp } = await api.getMySpaces();
      setSpaces(sp);
    } catch {}
  }, []);

  const loadLeaderboard = useCallback(async () => {
    try {
      const { leaderboard: lb } = await api.getGlobalLeaderboard();
      setLeaderboard(lb);
    } catch {}
  }, []);

  const createSpace = useCallback(async (name: string) => {
    await api.createSpace(name);
    await loadSpaces();
  }, [loadSpaces]);

  const joinSpace = useCallback(async (inviteCode: string) => {
    await api.joinSpace(inviteCode);
    await loadSpaces();
  }, [loadSpaces]);

  const clearChallenge = useCallback(() => {
    setCurrentChallenge(null);
    setLastCompletion(null);
    setLastEvidence([]);
  }, []);

  const value: GameState & GameActions = {
    user,
    isAuthChecked,
    loading,
    errorMsg,
    currentChallenge,
    lastCompletion,
    lastEvidence,
    spaces,
    leaderboard,
    levelProgress,
    login,
    register,
    logout,
    generateChallenge,
    startChallenge,
    submitEvidence,
    loadSpaces,
    loadLeaderboard,
    createSpace,
    joinSpace,
    setError: setErrorMsg,
    clearChallenge,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
