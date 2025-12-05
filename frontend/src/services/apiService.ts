const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:6001';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'voter';
  };
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'admin' | 'voter';
}

export interface ElectionCreateRequest {
  candidateNames: string[];
  durationSeconds?: number;
}

export interface ElectionInfo {
  id: number;
  candidateNames: string[];
  createdAt: number;
  durationSeconds: number;
  ended: boolean;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('blockvote_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('blockvote_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('blockvote_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.setToken(response.token);
    return response;
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    this.setToken(response.token);
    return response;
  }

  // Election Management
  async createElection(data: ElectionCreateRequest): Promise<{ success: boolean; electionId: number }> {
    return this.request('/election/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getElectionInfo(electionId: number): Promise<ElectionInfo> {
    return this.request(`/election/info/${electionId}`);
  }

  async endElection(electionId: number): Promise<{ success: boolean }> {
    return this.request('/election/end', {
      method: 'POST',
      body: JSON.stringify({ electionId }),
    });
  }

  async getAllElections(): Promise<any[]> {
    return this.request('/elections');
  }

  async deleteElection(electionId: string): Promise<{ success: boolean }> {
    return this.request(`/election/${electionId}`, {
      method: 'DELETE',
    });
  }

  async updateElectionStatus(electionId: string, status: string): Promise<{ success: boolean }> {
    return this.request(`/election/${electionId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async vote(electionId: number, candidateIndex: number): Promise<{ success: boolean; electionNumber?: number; candidateCount?: number; message?: string }> {
    return this.request('/election/vote', {
      method: 'POST',
      body: JSON.stringify({ electionId, candidateIndex }),
    });
  }

  async updateElectionBlockchainId(electionId: number, blockchainElectionId: number): Promise<{ success: boolean }> {
    return this.request(`/election/${electionId}/blockchain-id`, {
      method: 'PATCH',
      body: JSON.stringify({ blockchainElectionId }),
    });
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
