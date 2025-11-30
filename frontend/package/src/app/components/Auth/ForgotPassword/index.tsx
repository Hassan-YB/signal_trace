'use client'
import React from 'react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/api'
import Loader from '@/app/components/Common/Loader'
import Link from 'next/link'

const ForgotPassword = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loader, setLoader] = useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!email) {
      toast.error('Please enter your email address.')
      return
    }

    setLoader(true)

    try {
      const response = await auth.forgotPassword({
        email: email.toLowerCase(),
      })

      if (response.success) {
        toast.success(response.message || 'OTP sent to your email. Please check your inbox.')
        // Redirect to OTP verification page
        router.push(`/forgotpassword/verify?email=${encodeURIComponent(email.toLowerCase())}`)
      } else {
        toast.error(response.message || 'Failed to send password reset OTP')
        setLoader(false)
      }
    } catch (error: any) {
      toast.error(error?.message || 'An error occurred. Please try again.')
      setLoader(false)
    }
  }

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-8 shadow-sm'>
      <div className='mb-8'>
        <h2 className='text-2xl font-bold text-gray-900'>Forgot Password</h2>
        <p className='mt-2 text-sm text-gray-600'>Enter your email address and we'll send you a link to reset your password.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className='mb-[22px]'>
          <input
            type='email'
            placeholder='Email'
            name='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20'
          />
        </div>
        <div className='mb-9'>
          <button
            type='submit'
            disabled={loader}
            className='flex w-full cursor-pointer items-center justify-center rounded-lg border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'>
            Send Email {loader && <Loader />}
          </button>
        </div>
      </form>

      <div className='mt-6 text-center'>
        <p className='text-sm text-gray-600'>
          Remember your password?{' '}
          <Link href='/signin' className='font-medium text-primary hover:text-primary/80 transition-colors'>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
