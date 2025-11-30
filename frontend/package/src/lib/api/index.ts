/**
 * API Module
 * 
 * Main export file for all API-related functionality.
 * 
 * Usage:
 *   import { auth } from '@/lib/api'
 *   const response = await auth.login({ email, password })
 * 
 *   Or import specific functions:
 *   import { login, signup } from '@/lib/api/services/auth'
 */

// Export client utilities
export * from './client'

// Export types
export * from './types'

// Export services
export * as auth from './services/auth'

// Default export for convenience
import * as authService from './services/auth'

export default {
  auth: authService,
}

