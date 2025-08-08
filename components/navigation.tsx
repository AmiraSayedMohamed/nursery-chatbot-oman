"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-gray-800">
            دليل الحضانات
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              الصفحة الرئيسية
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
