/**
 * API Type Definitions
 * 
 * All TypeScript interfaces and types for API requests and responses.
 */

// ============================================================================
// Common Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, any>
}

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  date_joined: string
  is_active: boolean
}

// ============================================================================
// Auth Types
// ============================================================================

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  tokens: {
    access: string
    refresh: string
  }
}

export interface SignupRequest {
  first_name: string
  last_name: string
  email: string
  password: string
  password_confirm: string
}

export interface SignupResponse {
  user?: User
  tokens?: {
    access: string
    refresh: string
  }
}

export interface ProfileUpdateRequest {
  first_name?: string
  last_name?: string
  email?: string
}

export interface ProfileResponse {
  user: User
}

export interface PasswordChangeRequest {
  old_password: string
  new_password: string
  new_password_confirm: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface VerifyTokenRequest {
  token: string
}

export interface VerifyTokenResponse {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  password: string
}

export interface OTPVerificationRequest {
  email: string
  otp_code: string
}

export interface SignupOTPVerificationRequest extends SignupRequest {
  otp_code: string
}

export interface ResendOTPRequest {
  email: string
  otp_type: 'signup' | 'password_reset'
}

export interface VerifyPasswordResetOTPRequest {
  email: string
  otp_code: string
}

export interface ResetPasswordWithOTPRequest {
  email: string
  otp_code: string
  password: string
  password_confirm: string
}

export interface LogoutRequest {
  refresh_token: string
}

