import {
  ProcessingStatusResponse,
  UserProfile,
  SkillsResponse,
  UploadResponse,
} from '@/types/processing';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiClient {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail ||
          errorData.message ||
          `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    return response.json();
  }

  async uploadResume(file: File): Promise<UploadResponse> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/auth/upload-resume`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return this.handleResponse<UploadResponse>(response);
  }

  async getProcessingStatus(): Promise<ProcessingStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/processing-status`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<ProcessingStatusResponse>(response);
  }

  async getUserProfile(): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<UserProfile>(response);
  }

  async getUserSkills(category?: string): Promise<SkillsResponse> {
    const url = new URL(`${API_BASE_URL}/auth/skills`);
    if (category) {
      url.searchParams.append('category', category);
    }

    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });

    return this.handleResponse<SkillsResponse>(response);
  }

  async signup(
    email: string,
    password: string,
  ): Promise<{ access_token?: string; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password }),
    });

    return this.handleResponse(response);
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token?: string; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password }),
    });

    return this.handleResponse(response);
  }
}

export const apiClient = new ApiClient();
