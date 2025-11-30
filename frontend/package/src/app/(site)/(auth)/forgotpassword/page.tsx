import ForgotPassword from '@/app/components/Auth/ForgotPassword'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forgot Password | Warm Signal',
}

const ForgotPasswordPage = () => {
  return (
    <>
      <Breadcrumb pageName='Forgot Password' />
      <div className='container mx-auto px-4 py-10 bg-gray-50/30'>
        <div className='flex justify-center items-center min-h-[60vh]'>
          <div className='w-full max-w-md'>
            <ForgotPassword />
          </div>
        </div>
      </div>
    </>
  )
}

export default ForgotPasswordPage

