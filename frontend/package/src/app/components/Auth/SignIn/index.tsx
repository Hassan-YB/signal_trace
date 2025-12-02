'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { Icon } from '@iconify/react/dist/iconify.js'
import Loader from '@/app/components/Common/Loader'
import { auth } from '@/lib/api'

interface SigninProps {
  onSuccess?: () => void
}

const Signin = ({ onSuccess }: SigninProps) => {
  const router = useRouter()

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; non_field_errors?: string }>({})

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return !!(loginData.email && loginData.password)
  }, [loginData.email, loginData.password])

  const loginUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const response = await auth.login({
        email: loginData.email,
        password: loginData.password,
      })

      if (response.success && response.data) {
        toast.success(response.message || 'Login successful')
        setLoading(false)
        // Close modal if callback provided
        if (onSuccess) {
          onSuccess()
        }
        router.push('/profile')
      } else {
        // Check if user needs verification
        if (response.errors?.requires_verification || 
            (response.errors?.non_field_errors && 
             typeof response.errors.non_field_errors === 'string' &&
             response.errors.non_field_errors.includes('not verified'))) {
          // Redirect to verification page
          toast.error('Your account is not verified. Please verify your email with the OTP code.')
          router.push(`/verify?email=${encodeURIComponent(loginData.email)}`)
          setLoading(false)
          return
        }
        
        // Handle errors
        const fieldErrors: { email?: string; password?: string; non_field_errors?: string } = {}
        
        if (response.errors) {
          if (response.errors.email) {
            fieldErrors.email = Array.isArray(response.errors.email) ? response.errors.email[0] : response.errors.email
          }
          if (response.errors.password) {
            fieldErrors.password = Array.isArray(response.errors.password) ? response.errors.password[0] : response.errors.password
          }
          if (response.errors.non_field_errors) {
            const errorValue = response.errors.non_field_errors
            if (Array.isArray(errorValue)) {
              fieldErrors.non_field_errors = errorValue[0]
            } else if (typeof errorValue === 'string') {
              fieldErrors.non_field_errors = errorValue
            }
          }
        }
        
        setErrors(fieldErrors)
        
        // Show general error message
        const errorMessage = response.message || 'Login failed. Please check your credentials.'
        toast.error(errorMessage)
        setLoading(false)
      }
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message || 'An error occurred. Please try again.')
      console.error(err)
    }
  }

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-[22px] shadow-sm'>
      <div className='mb-[22px]'>
        <h2 className='text-2xl font-bold text-gray-900 leading-none'>Sign In</h2>
        <p className='mt-[10px] text-sm text-gray-600'>Welcome back! Please sign in to your account.</p>
      </div>

      <form onSubmit={loginUser}>
        <div className='mb-[22px]'>
          <input
            type='email'
            placeholder='Email'
            value={loginData.email}
            onChange={(e) => {
              setLoginData({ ...loginData, email: e.target.value })
              if (errors.email) setErrors({ ...errors, email: undefined })
            }}
            className={`w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
            }`}
          />
          {errors.email && (
            <p className='mt-1 text-sm text-red-500'>{errors.email}</p>
          )}
        </div>
        <div className='mb-[22px]'>
          <div className='relative'>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='Password'
              value={loginData.password}
              onChange={(e) => {
                setLoginData({ ...loginData, password: e.target.value })
                if (errors.password) setErrors({ ...errors, password: undefined })
              }}
              className={`w-full rounded-lg border border-solid bg-white px-4 py-3 pr-12 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
              }`}
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none'
              aria-label={showPassword ? 'Hide password' : 'Show password'}>
              <Icon icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'} className='w-5 h-5' />
            </button>
          </div>
          {errors.password && (
            <p className='mt-1 text-sm text-red-500'>{errors.password}</p>
          )}
        </div>
        {errors.non_field_errors && (
          <div className='mb-[22px]'>
            <p className='text-sm text-red-500'>{errors.non_field_errors}</p>
          </div>
        )}
        <div className='mb-[22px] flex justify-end'>
          <Link
            href='/forgotpassword'
            className='text-sm font-medium text-primary hover:text-primary/80 transition-colors'>
            Forgot Password?
          </Link>
        </div>
        <div className='mb-[22px]'>
          <button
            type='submit'
            disabled={loading || !isFormValid}
            className='w-full rounded-lg border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:border-gray-400 disabled:hover:bg-gray-400'>
            Sign In {loading && <Loader />}
          </button>
        </div>
      </form>

      <div className='mt-[22px] text-center'>
        <p className='text-sm text-gray-600'>
          Not a member yet?{' '}
          <Link href='/signup' className='font-medium text-primary hover:text-primary/80 transition-colors'>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signin
