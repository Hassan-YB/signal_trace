'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import Loader from '@/app/components/Common/Loader'
import { auth } from '@/lib/api'

interface SignUpProps {
  onSuccess?: () => void
}

const SignUp = ({ onSuccess }: SignUpProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: '',
  })
  const [errors, setErrors] = useState<{
    first_name?: string
    last_name?: string
    email?: string
    password?: string
    password_confirm?: string
    non_field_errors?: string
  }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: undefined })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const response = await auth.signup(formData)

      if (response.success) {
        toast.success(response.message || 'OTP sent to your email. Please verify to complete registration.')
        setLoading(false)
        // Close modal if callback provided
        if (onSuccess) {
          onSuccess()
        }
        // Redirect to OTP verification page with signup data
        const signupData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          password: formData.password,
          password_confirm: formData.password_confirm,
        }
        const queryParams = new URLSearchParams({
          email: formData.email,
          ...Object.fromEntries(
            Object.entries(signupData).map(([key, value]) => [key, value])
          ),
        })
        router.push(`/signup/verify?${queryParams.toString()}`)
      } else {
        // Handle errors
        const fieldErrors: typeof errors = {}
        
        if (response.errors) {
          Object.keys(response.errors).forEach((key) => {
            const errorValue = response.errors[key]
            if (Array.isArray(errorValue)) {
              fieldErrors[key as keyof typeof fieldErrors] = errorValue[0]
            } else if (typeof errorValue === 'string') {
              fieldErrors[key as keyof typeof fieldErrors] = errorValue
            } else if (typeof errorValue === 'object' && errorValue !== null) {
              // Handle nested errors
              const nestedKey = Object.keys(errorValue)[0]
              fieldErrors[key as keyof typeof fieldErrors] = 
                Array.isArray(errorValue[nestedKey]) 
                  ? errorValue[nestedKey][0] 
                  : errorValue[nestedKey]
            }
          })
        }
        
        setErrors(fieldErrors)
        
        // Show general error message
        const errorMessage = response.message || 'Registration failed. Please check your information.'
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
    <div className='rounded-xl border border-gray-200 bg-slate-50 p-8 shadow-sm'>
      <div className='mb-8'>
        <h2 className='text-2xl font-bold text-gray-900'>Sign Up</h2>
        <p className='mt-2 text-sm text-gray-600'>Create a new account to get started.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className='mb-[22px]'>
          <input
            type='text'
            placeholder='First Name'
            name='first_name'
            value={formData.first_name}
            onChange={handleChange}
            required
            className={`w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              errors.first_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
            }`}
          />
          {errors.first_name && (
            <p className='mt-1 text-sm text-red-500'>{errors.first_name}</p>
          )}
        </div>
        <div className='mb-[22px]'>
          <input
            type='text'
            placeholder='Last Name'
            name='last_name'
            value={formData.last_name}
            onChange={handleChange}
            required
            className={`w-full rounded-lg border border-solid bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              errors.last_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
            }`}
          />
          {errors.last_name && (
            <p className='mt-1 text-sm text-red-500'>{errors.last_name}</p>
          )}
        </div>
        <div className='mb-[22px]'>
          <input
            type='email'
            placeholder='Email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            required
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
              name='password'
              value={formData.password}
              onChange={handleChange}
              required
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
        <div className='mb-[22px]'>
          <div className='relative'>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder='Confirm Password'
              name='password_confirm'
              value={formData.password_confirm}
              onChange={handleChange}
              required
              className={`w-full rounded-lg border border-solid bg-white px-4 py-3 pr-12 text-base text-gray-900 outline-none transition-all duration-200 border-gray-300 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                errors.password_confirm ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
              }`}
            />
            <button
              type='button'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none'
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
              <Icon icon={showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'} className='w-5 h-5' />
            </button>
          </div>
          {errors.password_confirm && (
            <p className='mt-1 text-sm text-red-500'>{errors.password_confirm}</p>
          )}
        </div>
        {errors.non_field_errors && (
          <div className='mb-4'>
            <p className='text-sm text-red-500'>{errors.non_field_errors}</p>
          </div>
        )}
        <div className='mb-9'>
          <button
            type='submit'
            disabled={loading}
            className='flex w-full items-center justify-center rounded-lg border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'>
            Sign Up {loading && <Loader />}
          </button>
        </div>
      </form>

      <div className='mt-6 space-y-4 text-center'>
        <p className='text-sm text-gray-600'>
          By creating an account you agree with our{' '}
          <Link href='/#' className='font-medium text-primary hover:text-primary/80 transition-colors'>
            Privacy
          </Link>{' '}
          and{' '}
          <Link href='/#' className='font-medium text-primary hover:text-primary/80 transition-colors'>
            Policy
          </Link>
        </p>
        <p className='text-sm text-gray-600'>
          Already have an account?{' '}
          <Link href='/signin' className='font-medium text-primary hover:text-primary/80 transition-colors'>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignUp
