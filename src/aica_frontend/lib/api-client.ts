import {
  ProcessingStatusResponse,
  SkillsResponse,
  UploadResponse,
} from '@/types/api';
import { UserProfile } from '@/types/user';
import { API_BASE_URL, API_ENDPOINTS } from '@/lib/constants/api';


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

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.UPLOAD_RESUME}`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return this.handleResponse<UploadResponse>(response);
  }

  async getProcessingStatus(): Promise<ProcessingStatusResponse> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.PROCESSING_STATUS}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<ProcessingStatusResponse>(response);
  }

  async getUserProfile(): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.PROFILE}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<UserProfile>(response);
  }

  async getUserSkills(category?: string): Promise<SkillsResponse> {
    const url = new URL(`${API_BASE_URL}${API_ENDPOINTS.AUTH.SKILLS}`);
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
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.SIGNUP}`, {
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
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password }),
    });

    return this.handleResponse(response);
  }

  // Generic HTTP methods for job matching endpoints
  async get<T = unknown>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T = unknown>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async getSavedJobs(): Promise<unknown[]> {
    return this.get<unknown[]>(API_ENDPOINTS.JOBS.SAVED_JOBS);
  }

  async saveJob(jobId: string): Promise<unknown> {
    return this.post<unknown>(`${API_ENDPOINTS.JOBS.SAVED_JOBS}/${jobId}`);
  }

  async removeSavedJob(jobId: string): Promise<unknown> {
    return this.delete<unknown>(`${API_ENDPOINTS.JOBS.SAVED_JOBS}/${jobId}`);
  }
}

export const apiClient = new ApiClient();

