import ContactForm from '@/app/components/Contact/Form'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | Signal Trace',
}

export default function ContactUsPage() {
  return (
    <>
      <Breadcrumb pageName='Contact Us' />
      <ContactForm />
    </>
  )
}

