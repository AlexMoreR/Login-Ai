"use client"

import { navLinks } from '@/constants'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import LogoutButton from '../logout-button'
import { ModeToggle } from '../theme-toggle-button'

const Sidebar = () => {

  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="flex size-full flex-col gap-4">
        <Link href="/" className="sidebar-logo">
          <Image src="/assets/image/Logo2.png"
           alt='logo' width={180} height={28}></Image>
        </Link>
      

      <nav className="sidebar-nav">
        <ul className="sidebar-nav_elements">
          {navLinks.slice(0, 5).map((link)=>{
            const isActive = link.route === pathname

            return (
              <li key={link.route} className={`sidebar-nav_element group ${
                isActive ? 'bg-purple-50 shadow-inner' : 'text-gray-700'
              }`}>
                <Link className='sidebar-link' href={link.route}>
                  <Image
                    src={link.icon}
                    alt="logo"
                    width={24}
                    height={24}
                    className={`${isActive && 'brightness-0'}`}
                  />
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
        <ul className='sidebar-nav_elements'>
          {navLinks.slice(5).map((link)=>{
            const isActive = link.route === pathname

            return (
              <li key={link.route} className={`sidebar-nav_element group ${
                isActive ? 'bg-purple-gradient text-white' : 'text-gray-700'
              }`}>
                <Link className='sidebar-link' href={link.route}>
                  <Image
                    src={link.icon}
                    alt="logo"
                    width={24}
                    height={24}
                    className={`${isActive && 'brightness-200'}`}
                  />
                  {link.label}
                </Link>
              </li>
            )
          })}
          <LogoutButton />
        </ul>
          
        
        
      </nav>
      </div>
    </aside>
  )
}

export default Sidebar
