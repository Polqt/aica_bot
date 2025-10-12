import {
  ProcessingStatusResponse,
  SkillsResponse,
  UploadResponse,
} from '@/types/api';
import {
  UserProfile,
  UserEducation,
  UserEducationCreate,
  UserExperience,
  UserExperienceCreate,
  UserSkill,
  UserSkillCreate,
  ResumeSummary,
} from '@/types/user';
import { SavedJob } from '@/types/jobMatch';
import { API_BASE_URL, API_ENDPOINTS } from '@/lib/constants/api';
import { toast } from 'sonner';

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

  private handleAuthError(): void {
    if (typeof window === 'undefined') return;

    // Clear the expired token
    localStorage.removeItem('access_token');

    // Show toast notification
    toast.error('Session expired', {
      description: 'Please log in again to continue.',
      duration: 3000,
    });

    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // Handle authentication errors (401 Unauthorized)
      if (response.status === 401) {
        this.handleAuthError();
        throw new Error('Authentication expired. Please log in again.');
      }

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

    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.AUTH.UPLOAD_RESUME}`,
      {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return this.handleResponse<UploadResponse>(response);
  }

  async getProcessingStatus(): Promise<ProcessingStatusResponse> {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.AUTH.PROCESSING_STATUS}`,
      {
        headers: this.getHeaders(),
      },
    );

    return this.handleResponse<ProcessingStatusResponse>(response);
  }

  async getUserProfile(): Promise<UserProfile> {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.AUTH.PROFILE}`,
      {
        headers: this.getHeaders(),
      },
    );

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
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.AUTH.SIGNUP}`,
      {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify({ email, password }),
      },
    );

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

  async getSavedJobs(): Promise<SavedJob[]> {
    return this.get<SavedJob[]>(API_ENDPOINTS.JOBS.SAVED_JOBS);
  }

  async saveJob(jobId: string): Promise<SavedJob> {
    return this.post<SavedJob>(`${API_ENDPOINTS.JOBS.SAVED_JOBS}/${jobId}`);
  }

  async removeSavedJob(jobId: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(
      `${API_ENDPOINTS.JOBS.SAVED_JOBS}/${jobId}`,
    );
  }

  // Resume Builder API methods
  async getEducation(): Promise<UserEducation[]> {
    return this.get<UserEducation[]>('/resume/education');
  }

  async addEducation(education: UserEducationCreate): Promise<UserEducation> {
    return this.post<UserEducation>('/resume/education', education);
  }

  async updateEducation(
    id: string,
    education: Partial<UserEducationCreate>,
  ): Promise<UserEducation> {
    return this.put<UserEducation>(`/resume/education/${id}`, education);
  }

  async deleteEducation(id: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/resume/education/${id}`);
  }

  async getExperience(): Promise<UserExperience[]> {
    return this.get<UserExperience[]>('/resume/experience');
  }

  async addExperience(
    experience: UserExperienceCreate,
  ): Promise<UserExperience> {
    return this.post<UserExperience>('/resume/experience', experience);
  }

  async updateExperience(
    id: string,
    experience: Partial<UserExperienceCreate>,
  ): Promise<UserExperience> {
    return this.put<UserExperience>(`/resume/experience/${id}`, experience);
  }

  async deleteExperience(id: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/resume/experience/${id}`);
  }

  async getSkills(): Promise<UserSkill[]> {
    return this.get<UserSkill[]>('/resume/skills');
  }

  async addSkill(skill: UserSkillCreate): Promise<UserSkill> {
    return this.post<UserSkill>('/resume/skills', skill);
  }

  async updateSkill(
    id: string,
    skill: Partial<UserSkillCreate>,
  ): Promise<UserSkill> {
    return this.put<UserSkill>(`/resume/skills/${id}`, skill);
  }

  async deleteSkill(id: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/resume/skills/${id}`);
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    return this.put<UserProfile>('/resume/profile', profile);
  }

  async getResumeSummary(): Promise<ResumeSummary> {
    return this.get<ResumeSummary>('/resume/summary');
  }

  async resetResume(): Promise<{ message: string }> {
    return this.delete<{ message: string }>('/resume/reset');
  }

  async generateMatches(): Promise<{
    success: boolean;
    message: string;
    matches_found: number;
  }> {
    return this.post('/auth/generate-matches');
  }
}

export const apiClient = new ApiClient();
