'use client'
import { useMemo } from 'react'

interface PasswordStrengthMeterProps {
  password: string
  email?: string
  firstName?: string
  lastName?: string
}

interface PasswordStrength {
  score: number // 0-4 (0 = very weak, 4 = very strong)
  feedback: string[]
  isValid: boolean
}

/**
 * Validates password strength based on Django's default password validators:
 * - MinimumLengthValidator (8 characters minimum)
 * - UserAttributeSimilarityValidator (not too similar to user attributes)
 * - CommonPasswordValidator (not a common password)
 * - NumericPasswordValidator (not entirely numeric)
 */
export const validatePasswordStrength = (
  password: string,
  email?: string,
  firstName?: string,
  lastName?: string
): PasswordStrength => {
  const feedback: string[] = []
  let score = 0

  if (!password) {
    return { score: 0, feedback: [], isValid: false }
  }

  // Minimum length check (8 characters - Django default)
  const hasMinLength = password.length >= 8
  if (!hasMinLength) {
    feedback.push('Password must be at least 8 characters long')
  } else {
    score += 1
  }

  // Numeric password check (Django NumericPasswordValidator)
  const isAllNumeric = /^\d+$/.test(password)
  if (isAllNumeric) {
    feedback.push('Password cannot be entirely numeric')
  } else {
    score += 1
  }

  // Character variety checks
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

  if (!hasLowercase) {
    feedback.push('Add lowercase letters')
  } else {
    score += 0.5
  }

  if (!hasUppercase) {
    feedback.push('Add uppercase letters')
  } else {
    score += 0.5
  }

  if (!hasNumber) {
    feedback.push('Add numbers')
  } else {
    score += 0.5
  }

  if (!hasSpecialChar) {
    feedback.push('Add special characters')
  } else {
    score += 0.5
  }

  // Length bonus
  if (password.length >= 12) {
    score += 0.5
  }
  if (password.length >= 16) {
    score += 0.5
  }

  // User attribute similarity check (Django UserAttributeSimilarityValidator)
  if (email) {
    const emailParts = email.toLowerCase().split('@')[0]
    if (password.toLowerCase().includes(emailParts) && emailParts.length >= 3) {
      feedback.push('Password is too similar to your email')
      score = Math.max(0, score - 1)
    }
  }

  if (firstName && firstName.length >= 3) {
    if (password.toLowerCase().includes(firstName.toLowerCase())) {
      feedback.push('Password is too similar to your first name')
      score = Math.max(0, score - 1)
    }
  }

  if (lastName && lastName.length >= 3) {
    if (password.toLowerCase().includes(lastName.toLowerCase())) {
      feedback.push('Password is too similar to your last name')
      score = Math.max(0, score - 1)
    }
  }

  // Common password check (basic check for very common passwords)
  const commonPasswords = [
    'password',
    'password123',
    '12345678',
    '123456789',
    'qwerty123',
    'abc123456',
    'password1',
    'welcome123',
  ]
  if (commonPasswords.includes(password.toLowerCase())) {
    feedback.push('This password is too common')
    score = Math.max(0, score - 1)
  }

  // Normalize score to 0-4
  const normalizedScore = Math.min(4, Math.max(0, Math.floor(score)))

  // Password is valid if it meets minimum requirements
  const isValid = hasMinLength && !isAllNumeric && normalizedScore >= 2

  return {
    score: normalizedScore,
    feedback,
    isValid,
  }
}

const PasswordStrengthMeter = ({
  password,
  email,
  firstName,
  lastName,
}: PasswordStrengthMeterProps) => {
  const strength = useMemo(
    () => validatePasswordStrength(password, email, firstName, lastName),
    [password, email, firstName, lastName]
  )

  if (!password) {
    return null
  }

  const getStrengthLabel = (score: number) => {
    if (score === 0) return { label: 'Very Weak', color: 'bg-red-500' }
    if (score === 1) return { label: 'Weak', color: 'bg-orange-500' }
    if (score === 2) return { label: 'Fair', color: 'bg-yellow-500' }
    if (score === 3) return { label: 'Good', color: 'bg-blue-500' }
    return { label: 'Strong', color: 'bg-green-500' }
  }

  const { label, color } = getStrengthLabel(strength.score)

  return (
    <div className='mt-2'>
      <div className='flex items-center gap-2 mb-2'>
        <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
          <div
            className={`h-full transition-all duration-300 ${color}`}
            style={{ width: `${(strength.score / 4) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${
          strength.score === 0 || strength.score === 1
            ? 'text-red-600'
            : strength.score === 2
            ? 'text-yellow-600'
            : strength.score === 3
            ? 'text-blue-600'
            : 'text-green-600'
        }`}>
          {label}
        </span>
      </div>
      {strength.feedback.length > 0 && (
        <div className='text-xs text-gray-600 space-y-1 mt-2'>
          {strength.feedback.map((item, index) => (
            <div key={index} className='flex items-start gap-2'>
              <span className='text-red-500 mt-0.5 flex-shrink-0'>✗</span>
              <span className='leading-relaxed'>{item}</span>
            </div>
          ))}
        </div>
      )}
      {strength.feedback.length === 0 && strength.score >= 2 && (
        <p className='text-xs text-green-600 mt-1 flex items-center gap-1'>
          <span>✓</span>
          <span>Password meets all requirements</span>
        </p>
      )}
    </div>
  )
}

export default PasswordStrengthMeter

