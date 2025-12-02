import Image from 'next/image'
import Link from 'next/link'

const Logo: React.FC = () => {
  return (
    <Link href='/'>
      <Image
        src='/images/logo/logo.png'
        alt='logo'
        width={120}
        height={50}
        style={{ width: '120px', height: '50px', objectFit: 'contain' }}
        quality={100}
      />
    </Link>
  )
}

export default Logo
