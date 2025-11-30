/**
 * Auth Service
 * 
 * Authentication and user management API methods.
 */

import { post, get, put } from '../client'
import { setTokens } from '@/utils/api'
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  ProfileUpdateRequest,
  ProfileResponse,
  PasswordChangeRequest,
  ForgotPasswordRequest,
  VerifyTokenRequest,
  VerifyTokenResponse,
  ResetPasswordRequest,
  LogoutRequest,
  ApiResponse,
  SignupOTPVerificationRequest,
  ResendOTPRequest,
  VerifyPasswordResetOTPRequest,
  ResetPasswordWithOTPRequest,
} from '../types'

/**
 * Login user
 * POST /api/auth/login/
 */
export async function login(
  data: LoginRequest
): Promise<ApiResponse<LoginResponse>> {
  const response = await post<LoginResponse>(
    '/api/auth/login/',
    data,
    { requireAuth: false } // Public endpoint
  )

  // Auto-store tokens if login successful
  if (response.success && response.data?.tokens) {
    setTokens(response.data.tokens.access, response.data.tokens.refresh)
    window.dispatchEvent(new Event('authStateChanged'))
  }

  return response
}

/**
 * Register new user - generates OTP
 * POST /api/auth/signup/
 */
export async function signup(
  data: SignupRequest
): Promise<ApiResponse<{ email: string }>> {
  const response = await post<{ email: string }>(
    '/api/auth/signup/',
    data,
    { requireAuth: false } // Public endpoint
  )

  return response
}

/**
 * Verify OTP and complete signup
 * POST /api/auth/signup/verify/
 */
export async function verifySignupOTP(
  data: SignupOTPVerificationRequest
): Promise<ApiResponse<SignupResponse>> {
  const response = await post<SignupResponse>(
    '/api/auth/signup/verify/',
    data,
    { requireAuth: false } // Public endpoint
  )

  // Auto-store tokens if signup returns tokens
  if (response.success && response.data?.tokens) {
    setTokens(response.data.tokens.access, response.data.tokens.refresh)
    window.dispatchEvent(new Event('authStateChanged'))
  }

  return response
}

/**
 * Resend OTP for signup or password reset
 * POST /api/auth/signup/otp/resend/ or /api/auth/password/forgot/otp/resend/
 */
export async function resendOTP(
  data: ResendOTPRequest
): Promise<ApiResponse<{ email: string }>> {
  const endpoint = data.otp_type === 'signup' 
    ? '/api/auth/signup/otp/resend/'
    : '/api/auth/password/forgot/otp/resend/'
  
  const response = await post<{ email: string }>(
    endpoint,
    data,
    { requireAuth: false } // Public endpoint
  )

  return response
}

/**
 * Verify OTP for inactive users (users who skipped OTP screen)
 * POST /api/auth/verify/otp/
 */
export async function verifyInactiveUserOTP(
  data: OTPVerificationRequest
): Promise<ApiResponse<LoginResponse>> {
  const response = await post<LoginResponse>(
    '/api/auth/verify/otp/',
    data,
    { requireAuth: false } // Public endpoint
  )

  // Auto-store tokens if verification successful
  if (response.success && response.data?.tokens) {
    setTokens(response.data.tokens.access, response.data.tokens.refresh)
    window.dispatchEvent(new Event('authStateChanged'))
  }

  return response
}

/**
 * Resend OTP for inactive user verification
 * POST /api/auth/verify/otp/resend/
 */
export async function resendVerificationOTP(
  data: { email: string }
): Promise<ApiResponse<{ email: string }>> {
  return post<{ email: string }>(
    '/api/auth/verify/otp/resend/',
    { ...data, otp_type: 'signup' },
    { requireAuth: false } // Public endpoint
  )
}

/**
 * Get user profile
 * GET /api/auth/profile/
 */
export async function getProfile(): Promise<ApiResponse<ProfileResponse>> {
  return get<ProfileResponse>('/api/auth/profile/')
}

/**
 * Update user profile
 * PUT /api/auth/profile/
 */
export async function updateProfile(
  data: ProfileUpdateRequest
): Promise<ApiResponse<ProfileResponse>> {
  return put<ProfileResponse>('/api/auth/profile/', data)
}

/**
 * Change user password
 * POST /api/auth/password/change/
 */
export async function changePassword(
  data: PasswordChangeRequest
): Promise<ApiResponse> {
  return post('/api/auth/password/change/', data)
}

/**
 * Logout user
 * POST /api/auth/logout/
 */
export async function logout(
  data: LogoutRequest
): Promise<ApiResponse> {
  return post('/api/auth/logout/', data)
}

/**
 * Request password reset OTP
 * POST /api/auth/password/forgot/
 */
export async function forgotPassword(
  data: ForgotPasswordRequest
): Promise<ApiResponse<{ email: string }>> {
  return post<{ email: string }>('/api/auth/password/forgot/', data, {
    requireAuth: false, // Public endpoint
  })
}

/**
 * Verify password reset OTP
 * POST /api/auth/password/forgot/verify/
 */
export async function verifyPasswordResetOTP(
  data: VerifyPasswordResetOTPRequest
): Promise<ApiResponse<{ email: string }>> {
  return post<{ email: string }>(
    '/api/auth/password/forgot/verify/',
    data,
    { requireAuth: false } // Public endpoint
  )
}

/**
 * Reset password with OTP verification
 * POST /api/auth/password/reset/
 */
export async function resetPassword(
  data: ResetPasswordWithOTPRequest
): Promise<ApiResponse> {
  return post('/api/auth/password/reset/', data, {
    requireAuth: false, // Public endpoint
  })
}

