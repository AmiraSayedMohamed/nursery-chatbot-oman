"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  // التحقق إذا كان المستخدم مسجل دخول بالفعل
  useEffect(() => {
    const checkExistingLogin = async () => {
      const token = localStorage.getItem('adminToken')
      if (token) {
        // التحقق من صحة التوكن
        try {
          const response = await fetch('/api/admin/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            // المستخدم مسجل دخول بالفعل، إعادة توجيه لصفحة الإدارة
            router.push('/admin')
          } else {
            // التوكن غير صالح، حذفه
            localStorage.removeItem('adminToken')
            document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          }
        } catch (error) {
          // التوكن غير صالح، حذفه
          localStorage.removeItem('adminToken')
          document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        }
      }
    }
    
    checkExistingLogin()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // تنظيف البيانات القديمة أولاً
    localStorage.removeItem('adminToken')
    document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (response.ok) {
        const data = await response.json()
        
        // حفظ التوكن في localStorage
        localStorage.setItem('adminToken', data.token)
        
        // الكوكي سيتم حفظه تلقائياً من الخادم عبر Set-Cookie header
        
        // تأكيد حفظ التوكن
        console.log('Token saved:', { 
          localStorage: localStorage.getItem('adminToken'),
          token: data.token.substring(0, 20) + '...'
        })
        
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في لوحة الإدارة",
        })
        
        // إزالة بيانات النموذج
        setCredentials({
          username: "",
          password: "",
        })
        
        // تأخير بسيط ثم الانتقال
        setTimeout(() => {
          console.log('Redirecting to admin...')
          // استخدام window.location للتأكد من إعادة تحميل الصفحة مع الكوكيز الجديدة
          window.location.href = '/admin'
        }, 500)
      } else {
        const error = await response.json()
        toast({
          title: "خطأ في تسجيل الدخول",
          description: error.message || "اسم المستخدم أو كلمة المرور غير صحيحة",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">تسجيل دخول الإدارة</CardTitle>
          <CardDescription>
            يرجى إدخال بيانات الدخول للوصول إلى لوحة الإدارة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {message}
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <div className="relative">
                <User className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="أدخل اسم المستخدم"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="pr-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="أدخل كلمة المرور"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="pr-10 pl-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
