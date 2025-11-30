/**
 * API Client
 * 
 * Base client for making HTTP requests to the backend API.
 * Handles authentication, headers, and response parsing.
 * Automatically handles 401 errors by logging out the user.
 */

import { getAccessToken, handleLogout } from '@/utils/api'
import type { ApiResponse } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface RequestOptions extends RequestInit {
  requireAuth?: boolean
}

/**
 * Base API client for making HTTP requests
 * 
 * @param endpoint - API endpoint (e.g., '/api/auth/login/')
 * @param options - Fetch options with optional requireAuth flag
 * @returns Promise with API response
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { requireAuth = true, ...fetchOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  }

  // Add authentication token if required
  if (requireAuth) {
    const token = getAccessToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401 && requireAuth) {
    // Automatically logout user on 401 error (show toast and mark as automatic)
    await handleLogout(true, true)
    
    // Return error response
    return {
      success: false,
      message: 'Your session has expired. Please sign in again.',
      errors: { detail: 'Authentication required' },
    } as ApiResponse<T>
  }

  const data = await response.json()
  return data
}

/**
 * GET request helper
 */
export function get<T = any>(
  endpoint: string,
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, { ...options, method: 'GET' })
}

/**
 * POST request helper
 */
export function post<T = any>(
  endpoint: string,
  data?: any,
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PUT request helper
 */
export function put<T = any>(
  endpoint: string,
  data?: any,
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PATCH request helper
 */
export function patch<T = any>(
  endpoint: string,
  data?: any,
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * DELETE request helper
 */
export function del<T = any>(
  endpoint: string,
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, { ...options, method: 'DELETE' })
}

