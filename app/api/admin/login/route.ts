import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// بيانات الأدمن (في التطبيق الحقيقي يجب حفظها في قاعدة بيانات آمنة)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123', // في التطبيق الحقيقي يجب تشفيرها
}

// مفتاح سري للتوكن
const JWT_SECRET = process.env.JWT_SECRET || 'nursery-admin-secret-key-2024'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    console.log('Login attempt:', { username, password: password ? '***' : 'empty' })

    // التحقق من البيانات
    if (!username || !password) {
      console.log('Missing credentials')
      return NextResponse.json(
        { message: 'يرجى إدخال اسم المستخدم وكلمة المرور' },
        { status: 400 }
      )
    }

    // التحقق من صحة البيانات
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      console.log('Login successful')
      // إنشاء توكن JWT
      const token = jwt.sign(
        { 
          username,
          role: 'admin',
          timestamp: Date.now()
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      )

      return NextResponse.json({
        message: 'تم تسجيل الدخول بنجاح',
        token,
        user: {
          username,
          role: 'admin'
        }
      }, {
        headers: {
          'Set-Cookie': `adminToken=${token}; Path=/; Max-Age=86400; HttpOnly=false; SameSite=Strict`
        }
      })
    } else {
      console.log('Invalid credentials:', { 
        receivedUsername: username, 
        expectedUsername: ADMIN_CREDENTIALS.username,
        receivedPassword: password,
        expectedPassword: ADMIN_CREDENTIALS.password
      })
      return NextResponse.json(
        { message: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
