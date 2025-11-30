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
    <div className='rounded-xl border border-gray-200 bg-slate-50 p-8 shadow-sm relative overflow-hidden'>
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

      <div>
        <span className='absolute right-1 top-1'>
          <svg
            width='40'
            height='40'
            viewBox='0 0 40 40'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            <circle
              cx='1.39737'
              cy='38.6026'
              r='1.39737'
              transform='rotate(-90 1.39737 38.6026)'
              fill='#3056D3'
            />
            <circle
              cx='1.39737'
              cy='1.99122'
              r='1.39737'
              transform='rotate(-90 1.39737 1.99122)'
              fill='#3056D3'
            />
            <circle
              cx='13.6943'
              cy='38.6026'
              r='1.39737'
              transform='rotate(-90 13.6943 38.6026)'
              fill='#3056D3'
            />
            <circle
              cx='13.6943'
              cy='1.99122'
              r='1.39737'
              transform='rotate(-90 13.6943 1.99122)'
              fill='#3056D3'
            />
            <circle
              cx='25.9911'
              cy='38.6026'
              r='1.39737'
              transform='rotate(-90 25.9911 38.6026)'
              fill='#3056D3'
            />
            <circle
              cx='25.9911'
              cy='1.99122'
              r='1.39737'
              transform='rotate(-90 25.9911 1.99122)'
              fill='#3056D3'
            />
            <circle
              cx='38.288'
              cy='38.6026'
              r='1.39737'
              transform='rotate(-90 38.288 38.6026)'
              fill='#3056D3'
            />
            <circle
              cx='38.288'
              cy='1.99122'
              r='1.39737'
              transform='rotate(-90 38.288 1.99122)'
              fill='#3056D3'
            />
            <circle
              cx='1.39737'
              cy='26.3057'
              r='1.39737'
              transform='rotate(-90 1.39737 26.3057)'
              fill='#3056D3'
            />
            <circle
              cx='13.6943'
              cy='26.3057'
              r='1.39737'
              transform='rotate(-90 13.6943 26.3057)'
              fill='#3056D3'
            />
            <circle
              cx='25.9911'
              cy='26.3057'
              r='1.39737'
              transform='rotate(-90 25.9911 26.3057)'
              fill='#3056D3'
            />
            <circle
              cx='38.288'
              cy='26.3057'
              r='1.39737'
              transform='rotate(-90 38.288 26.3057)'
              fill='#3056D3'
            />
            <circle
              cx='1.39737'
              cy='14.0086'
              r='1.39737'
              transform='rotate(-90 1.39737 14.0086)'
              fill='#3056D3'
            />
            <circle
              cx='13.6943'
              cy='14.0086'
              r='1.39737'
              transform='rotate(-90 13.6943 14.0086)'
              fill='#3056D3'
            />
            <circle
              cx='25.9911'
              cy='14.0086'
              r='1.39737'
              transform='rotate(-90 25.9911 14.0086)'
              fill='#3056D3'
            />
            <circle
              cx='38.288'
              cy='14.0086'
              r='1.39737'
              transform='rotate(-90 38.288 14.0086)'
              fill='#3056D3'
            />
          </svg>
        </span>
        <span className='absolute bottom-1 left-1'>
          <svg
            width='40'
            height='40'
            viewBox='0 0 40 40'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            <circle
              cx='1.39737'
              cy='38.6026'
              r='1.39737'
              transform='rotate(-90 1.39737 38.6026)'
              fill='#3056D3'
            />
            <circle
              cx='1.39737'
              cy='1.99122'
              r='1.39737'
              transform='rotate(-90 1.39737 1.99122)'
              fill='#3056D3'
            />
            <circle
              cx='13.6943'
              cy='38.6026'
              r='1.39737'
              transform='rotate(-90 13.6943 38.6026)'
              fill='#3056D3'
            />
            <circle
              cx='13.6943'
              cy='1.99122'
              r='1.39737'
              transform='rotate(-90 13.6943 1.99122)'
              fill='#3056D3'
            />
            <circle
              cx='25.9911'
              cy='38.6026'
              r='1.39737'
              transform='rotate(-90 25.9911 38.6026)'
              fill='#3056D3'
            />
            <circle
              cx='25.9911'
              cy='1.99122'
              r='1.39737'
              transform='rotate(-90 25.9911 1.99122)'
              fill='#3056D3'
            />
            <circle
              cx='38.288'
              cy='38.6026'
              r='1.39737'
              transform='rotate(-90 38.288 38.6026)'
              fill='#3056D3'
            />
            <circle
              cx='38.288'
              cy='1.99122'
              r='1.39737'
              transform='rotate(-90 38.288 1.99122)'
              fill='#3056D3'
            />
            <circle
              cx='1.39737'
              cy='26.3057'
              r='1.39737'
              transform='rotate(-90 1.39737 26.3057)'
              fill='#3056D3'
            />
            <circle
              cx='13.6943'
              cy='26.3057'
              r='1.39737'
              transform='rotate(-90 13.6943 26.3057)'
              fill='#3056D3'
            />
            <circle
              cx='25.9911'
              cy='26.3057'
              r='1.39737'
              transform='rotate(-90 25.9911 26.3057)'
              fill='#3056D3'
            />
            <circle
              cx='38.288'
              cy='26.3057'
              r='1.39737'
              transform='rotate(-90 38.288 26.3057)'
              fill='#3056D3'
            />
            <circle
              cx='1.39737'
              cy='14.0086'
              r='1.39737'
              transform='rotate(-90 1.39737 14.0086)'
              fill='#3056D3'
            />
            <circle
              cx='13.6943'
              cy='14.0086'
              r='1.39737'
              transform='rotate(-90 13.6943 14.0086)'
              fill='#3056D3'
            />
            <circle
              cx='25.9911'
              cy='14.0086'
              r='1.39737'
              transform='rotate(-90 25.9911 14.0086)'
              fill='#3056D3'
            />
            <circle
              cx='38.288'
              cy='14.0086'
              r='1.39737'
              transform='rotate(-90 38.288 14.0086)'
              fill='#3056D3'
            />
          </svg>
        </span>
      </div>
    </div>
  )
}

export default ForgotPassword
