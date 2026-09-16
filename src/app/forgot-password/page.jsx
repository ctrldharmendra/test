import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <>
    <div className='text-white'>Currently this is under development...</div>
    <Link href='/login' className='text-white bg-amber-300 w-[100px]'>Go to login page</Link>
    <Link href='/explore' className='text-white bg-amber-800 w-[100px]'>Go to Profile</Link>
    </>
  )
}

export default page