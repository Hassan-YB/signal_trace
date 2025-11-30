/**
 * API utility functions for backend communication
 * Handles JWT token management and API requests
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Get toast instance - only works client-side
// Since handleLogout is only called client-side, we can safely use dynamic import
const getToast = async () => {
  if (typeof window === 'undefined') return null
  try {
    const toastModule = await import('react-hot-toast')
    return toastModule.default
  } catch {
    return null
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, any>
}

/**
 * Get stored access token from localStorage
 */
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

/**
 * Get stored refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refresh_token')
}

/**
 * Store tokens in localStorage
 */
export const setTokens = (access: string, refresh: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
}

/**
 * Clear tokens from localStorage
 */
export const clearTokens = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  // Dispatch custom event to notify other components
  window.dispatchEvent(new Event('authStateChanged'))
}

/**
 * Make API request (authenticated or public)
 * @param endpoint - API endpoint
 * @param options - Fetch options
 * @param requireAuth - Whether to include authentication token (default: true)
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = true
): Promise<ApiResponse<T>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  // Only add auth token if required and token exists
  if (requireAuth) {
    const token = getAccessToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()
  return data
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getAccessToken() !== null
}

// Flag to prevent infinite recursion when logout API also returns 401
let isLoggingOut = false

/**
 * Handle user logout - clears tokens and redirects to signin
 * This is called automatically on 401 errors or can be called manually
 * @param showToast - Whether to show a toast message (default: true)
 * @param isAutomatic - Whether this is an automatic logout due to 401 (default: false)
 */
export const handleLogout = async (showToast: boolean = true, isAutomatic: boolean = false): Promise<void> => {
  // Prevent infinite recursion if already logging out
  if (isLoggingOut) {
    return
  }
  
  isLoggingOut = true
  
  try {
    // Clear tokens from localStorage first
    const refreshToken = getRefreshToken()
    clearTokens()
    
    // Show toast message if requested
    if (showToast && typeof window !== 'undefined') {
      const toastModule = await getToast()
      if (toastModule) {
        if (isAutomatic) {
          toastModule.error('Your session has expired. Please sign in again.')
        } else {
          toastModule.success('Logged out successfully')
        }
      }
    }
    
    // Try to call logout API if refresh token exists (optional, don't block on error)
    // Note: We clear tokens first, so this call might fail, which is fine
    if (refreshToken && typeof window !== 'undefined') {
      try {
        // Import auth service dynamically to avoid circular dependencies
        // Use requireAuth: false to prevent 401 handler from triggering again
        const { post } = await import('@/lib/api/client')
        await post('/api/auth/logout/', { refresh_token: refreshToken }, { requireAuth: false })
      } catch (error) {
        // Ignore logout API errors - we still want to clear tokens and redirect
        console.warn('Logout API call failed:', error)
      }
    }
    
    // Small delay to ensure toast is visible before redirect
    if (showToast && typeof window !== 'undefined') {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // Redirect to signin page
    if (typeof window !== 'undefined') {
      window.location.href = '/signin'
    }
  } finally {
    // Reset flag after a delay to allow redirect to complete
    setTimeout(() => {
      isLoggingOut = false
    }, 1000)
  }
}

