export interface SignupResponse {
  access_token?: string;
  message?: string;
  detail?: string;
  email_confirmation_required?: boolean;
}

export interface LoginResponse {
  access_token?: string;
  message?: string;
  detail?: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface SignupFormData extends Omit<AuthFormData, 'confirmPassword'> {
  confirmPassword: string;
}

export interface AuthValidationError {
  field: keyof AuthFormData;
  message: string;
}

export type AuthMode = 'login' | 'signup';