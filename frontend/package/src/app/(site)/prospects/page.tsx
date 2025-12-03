import ProspectsPage from '@/app/components/Prospects'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Prospects | Signal Trace',
}

const Prospects = () => {
  return (
    <>
      <Breadcrumb pageName='Prospects' />
      <ProspectsPage />
    </>
  )
}

export default Prospects

