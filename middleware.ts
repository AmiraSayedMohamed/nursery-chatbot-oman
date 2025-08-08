import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // تعطيل middleware مؤقتاً للاختبار
  // سنعتمد على الحماية في الصفحة نفسها
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin']
}
