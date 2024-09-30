import MobileNav from '@/components/shared/MobileNav'
import Sidebar from '@/components/shared/Sidebar'
import React from 'react'

const layout = ({ children }: {children: React.ReactNode}) => {
  return (
    <div>
      <main className='root'>
          <Sidebar />
          <MobileNav />
          {/* <pre>{JSON.stringify(session, null, 2)}</pre> */}

        <div className='root-container'>
            <div className="wrapper">
                {children}
            </div>
        </div>
      </main>
    </div>
  )
}

export default layout
