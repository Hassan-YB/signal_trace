'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useState, useEffect, useRef } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import Loader from '@/app/components/Common/Loader'
import { auth } from '@/lib/api'

interface OTPVerificationProps {
  email: string
  signupData?: {
    first_name: string
    last_name: string
    password: string
    password_confirm: string
  }
  otpType?: 'signup' | 'password_reset'
  onSuccess?: () => void
}

const OTPVerification = ({ 
  email, 
  signupData, 
  otpType = 'signup',
  onSuccess 
}: OTPVerificationProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Start countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('')
      const newOtp = [...otp]
      pastedOtp.forEach((char, i) => {
        if (index + i < 6 && /^\d$/.test(char)) {
          newOtp[index + i] = char
        }
      })
      setOtp(newOtp)
      // Focus on the next empty input or the last one
      const nextIndex = Math.min(index + pastedOtp.length, 5)
      inputRefs.current[nextIndex]?.focus()
      return
    }

    if (!/^\d$/.test(value) && value !== '') return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleResendOTP = async () => {
    setResendLoading(true)
    try {
      const response = await auth.resendOTP({
        email,
        otp_type: otpType,
      })

      if (response.success) {
        toast.success('OTP resent successfully. Please check your email.')
        setCountdown(60)
        setCanResend(false)
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      } else {
        toast.error(response.message || 'Failed to resend OTP')
      }
    } catch (error: any) {
      toast.error(error?.message || 'An error occurred. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const otpCode = otp.join('')
    
    if (otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP code')
      setLoading(false)
      return
    }

    try {
      if (otpType === 'signup' && signupData) {
        // Verify OTP and complete signup
        const response = await auth.verifySignupOTP({
          email,
          otp_code: otpCode,
          ...signupData,
        })

        if (response.success) {
          toast.success(response.message || 'Account created successfully!')
          if (onSuccess) {
            onSuccess()
          }
          if (response.data?.tokens) {
            router.push('/profile')
          } else {
            router.push('/signin')
          }
        } else {
          toast.error(response.message || 'OTP verification failed')
          setOtp(['', '', '', '', '', ''])
          inputRefs.current[0]?.focus()
        }
      } else if (otpType === 'password_reset') {
        // Verify OTP for password reset
        const response = await auth.verifyPasswordResetOTP({
          email,
          otp_code: otpCode,
        })

        if (response.success) {
          toast.success('OTP verified successfully')
          // Redirect to reset password page with email
          router.push(`/resetpassword?email=${encodeURIComponent(email)}&otp=${otpCode}`)
        } else {
          toast.error(response.message || 'OTP verification failed')
          setOtp(['', '', '', '', '', ''])
          inputRefs.current[0]?.focus()
        }
      }
    } catch (error: any) {
      toast.error(error?.message || 'An error occurred. Please try again.')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='rounded-xl border border-gray-200 bg-slate-50 p-8 shadow-sm'>
      <div className='mb-8'>
        <h2 className='text-2xl font-bold text-gray-900'>
          {otpType === 'signup' ? 'Verify Your Email' : 'Verify OTP'}
        </h2>
        <p className='mt-2 text-sm text-gray-600'>
          We've sent a 6-digit OTP code to <span className='font-medium'>{email}</span>
        </p>
        <p className='mt-1 text-sm text-gray-500'>
          Please enter the code below to {otpType === 'signup' ? 'complete your registration' : 'reset your password'}.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className='mb-6'>
          <div className='flex gap-2 justify-center'>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type='text'
                inputMode='numeric'
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className='w-12 h-12 text-center text-lg font-semibold rounded-lg border-2 border-gray-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all'
              />
            ))}
          </div>
        </div>

        <div className='mb-6'>
          <button
            type='submit'
            disabled={loading || otp.join('').length !== 6}
            className='flex w-full items-center justify-center rounded-lg border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'>
            {otpType === 'signup' ? 'Verify & Create Account' : 'Verify OTP'} {loading && <Loader />}
          </button>
        </div>

        <div className='text-center space-y-2'>
          <p className='text-sm text-gray-600'>
            Didn't receive the code?{' '}
            {canResend ? (
              <button
                type='button'
                onClick={handleResendOTP}
                disabled={resendLoading}
                className='font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50'>
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            ) : (
              <span className='text-gray-500'>
                Resend in {countdown}s
              </span>
            )}
          </p>
          {otpType === 'signup' && (
            <p className='text-sm text-gray-600'>
              <Link href='/signin' className='font-medium text-primary hover:text-primary/80 transition-colors'>
                Back to Sign In
              </Link>
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

export default OTPVerification

