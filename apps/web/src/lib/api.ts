import {
  UserResponse,
  ChallengeResponse,
  CompletionResponse,
  SpaceResponse,
  LeaderboardEntry,
  ExperienceType,
  DurationMinutes,
  Difficulty,
  EvidenceSubmission,
} from '@touch-grass/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('touch_grass_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('touch_grass_token', token);
      } else {
        localStorage.removeItem('touch_grass_token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('touch_grass_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`;
      try {
        const errorData = await res.json();
        errorMsg = errorData.error || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    return res.json() as Promise<T>;
  }

  // Auth
  async register(username: string, email: string, password: string): Promise<{ user: UserResponse; token: string }> {
    const data = await this.request<{ user: UserResponse; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email: string, password: string): Promise<{ user: UserResponse; token: string }> {
    const data = await this.request<{ user: UserResponse; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async getMe(): Promise<{ user: UserResponse }> {
    return this.request<{ user: UserResponse }>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Challenges
  async getActiveChallenge(): Promise<{ challenge: ChallengeResponse | null }> {
    return this.request<{ challenge: ChallengeResponse | null }>('/challenges/active');
  }

  async generateChallenge(params: {
    experienceType: ExperienceType;
    durationMinutes: DurationMinutes;
    difficulty?: Difficulty;
    spaceId?: string | null;
  }): Promise<{ challenge: ChallengeResponse }> {
    return this.request<{ challenge: ChallengeResponse }>('/challenges/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async startChallenge(challengeId: string): Promise<{ challenge: ChallengeResponse }> {
    return this.request<{ challenge: ChallengeResponse }>(`/challenges/${challengeId}/start`, {
      method: 'POST',
    });
  }

  async completeChallenge(
    challengeId: string,
    evidence: EvidenceSubmission[]
  ): Promise<{ completion: CompletionResponse }> {
    return this.request<{ completion: CompletionResponse }>(`/challenges/${challengeId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ evidence }),
    });
  }

  // Spaces
  async getMySpaces(): Promise<{ spaces: SpaceResponse[] }> {
    return this.request<{ spaces: SpaceResponse[] }>('/spaces');
  }

  async createSpace(name: string, description?: string): Promise<{ space: SpaceResponse }> {
    return this.request<{ space: SpaceResponse }>('/spaces', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  async joinSpace(inviteCode: string): Promise<{ space: SpaceResponse }> {
    return this.request<{ space: SpaceResponse }>('/spaces/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    });
  }

  // Leaderboard
  async getGlobalLeaderboard(): Promise<{ leaderboard: LeaderboardEntry[] }> {
    return this.request<{ leaderboard: LeaderboardEntry[] }>('/leaderboard');
  }

  // User History
  async getMyHistory(): Promise<{ history: any[] }> {
    return this.request<{ history: any[] }>('/users/me/history');
  }
}

export const api = new ApiClient();
