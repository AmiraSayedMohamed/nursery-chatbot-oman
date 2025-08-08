import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// مفتاح سري للتوكن
const JWT_SECRET = process.env.JWT_SECRET || 'nursery-admin-secret-key-2024'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'توكن غير موجود' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // إزالة "Bearer "

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      return NextResponse.json({
        message: 'توكن صالح',
        user: {
          username: decoded.username,
          role: decoded.role
        }
      })
    } catch (jwtError) {
      return NextResponse.json(
        { message: 'توكن غير صالح' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('خطأ في التحقق من التوكن:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
