'use client'
import React, { useState, useEffect } from 'react'
import { auth } from '@/lib/api'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Loader from '@/app/components/Common/Loader'
import Link from 'next/link'

const ResetPassword = ({ token }: { token: string }) => {
  const [data, setData] = useState({
    newPassword: '',
    ReNewPassword: '',
  })
  const [loader, setLoader] = useState(false)

  const [user, setUser] = useState({
    email: '',
  })

  const router = useRouter()

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await auth.verifyResetToken({ token })

        if (response.success && response.data) {
          setUser({
            email: response.data.email,
          })
        } else {
          toast.error(response.message || 'Invalid or expired token')
          router.push('/forgot-password')
        }
      } catch (error: any) {
        toast.error(error?.message || 'Failed to verify token')
        router.push('/forgot-password')
      }
    }

    verifyToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoader(true)

    if (data.newPassword === '') {
      toast.error('Please enter your password.')
      setLoader(false)
      return
    }

    if (!user.email) {
      toast.error('User email not found. Please try again.')
      setLoader(false)
      return
    }

    try {
      const response = await auth.resetPassword({
        email: user.email,
        password: data.newPassword,
      })

      if (response.success) {
        toast.success(response.message || 'Password reset successfully')
        setData({ newPassword: '', ReNewPassword: '' })
        router.push('/signin')
      } else {
        toast.error(response.message || 'Failed to reset password')
      }

      setLoader(false)
    } catch (error: any) {
      toast.error(error?.message || 'An error occurred. Please try again.')
      setLoader(false)
    }
  }

  return (
    <section className='bg-[#F4F7FF] py-14 lg:py-20'>
      <div className='container'>
        <div className='-mx-4 flex flex-wrap'>
          <div className='w-full px-4'>
            <div
              className='wow fadeInUp relative mx-auto max-w-[525px] overflow-hidden rounded-xl border border-gray-200 bg-slate-50 px-8 py-14 text-center shadow-sm sm:px-12 md:px-[60px]'
              data-wow-delay='.15s'>
              <div className='mb-8'>
                <h2 className='text-2xl font-bold text-gray-900'>Reset Password</h2>
                <p className='mt-2 text-sm text-gray-600'>Enter your new password below.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className='mb-[22px]'>
                  <input
                    type='password'
                    placeholder='New password'
                    name='newPassword'
                    value={data?.newPassword}
                    onChange={handleChange}
                    required
                    className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  />
                </div>

                <div className='mb-[22px]'>
                  <input
                    type='password'
                    placeholder='Confirm new password'
                    name='ReNewPassword'
                    value={data?.ReNewPassword}
                    onChange={handleChange}
                    required
                    className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  />
                </div>
                <div className=''>
                  <button
                    type='submit'
                    className='flex w-full cursor-pointer items-center justify-center rounded-lg border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'>
                    Save Password {loader && <Loader />}
                  </button>
                </div>
              </form>

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
                    width='29'
                    height='40'
                    viewBox='0 0 29 40'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'>
                    <circle
                      cx='2.288'
                      cy='25.9912'
                      r='1.39737'
                      transform='rotate(-90 2.288 25.9912)'
                      fill='#3056D3'
                    />
                    <circle
                      cx='14.5849'
                      cy='25.9911'
                      r='1.39737'
                      transform='rotate(-90 14.5849 25.9911)'
                      fill='#3056D3'
                    />
                    <circle
                      cx='26.7216'
                      cy='25.9911'
                      r='1.39737'
                      transform='rotate(-90 26.7216 25.9911)'
                      fill='#3056D3'
                    />
                    <circle
                      cx='2.288'
                      cy='13.6944'
                      r='1.39737'
                      transform='rotate(-90 2.288 13.6944)'
                      fill='#3056D3'
                    />
                    <circle
                      cx='14.5849'
                      cy='13.6943'
                      r='1.39737'
                      transform='rotate(-90 14.5849 13.6943)'
                      fill='#3056D3'
                    />
                    <circle
                      cx='26.7216'
                      cy='13.6943'
                      r='1.39737'
                      transform='rotate(-90 26.7216 13.6943)'
                      fill='#3056D3'
                    />
                    <circle
                      cx='2.288'
                      cy='38.0087'
                      r='1.39737'
                      transform='rotate(-90 2.288 38.0087)'
                      fill='#3056D3'
                    />
                    <circle
                      cx='2.288'
                      cy='1.39739'
                      r='1.39737'
                      transform='rotate(-90 2.288 1.39739)'
                      fill='#3056D3'
                    />
                    <circle
                      cx='14.5849'
                      cy='38.0089'
                      r='1.39737'
                      transform='rotate(-90 14.5849 38.0089)'
                      fill='#3056D3'
                    />
                    <circle
                      cx='26.7216'
                      cy='38.0089'
                      r='1.39737'
                      transform='rotate(-90 26.7216 38.0089)'
                      fill='#3056D3'
                    />
                    <circle
                      cx='14.5849'
                      cy='1.39761'
                      r='1.39737'
                      transform='rotate(-90 14.5849 1.39761)'
                      fill='#3056D3'
                    />
                    <circle
                      cx='26.7216'
                      cy='1.39761'
                      r='1.39737'
                      transform='rotate(-90 26.7216 1.39761)'
                      fill='#3056D3'
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ResetPassword
