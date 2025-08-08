"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Trash2, Plus, Edit, Save, X, Search, LogOut } from "lucide-react"
import { branches, type Nursery } from "@/lib/data"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const [nurseries, setNurseries] = useState<Nursery[]>([])
  const [filteredNurseries, setFilteredNurseries] = useState<Nursery[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newNursery, setNewNursery] = useState({
    name: "",
    branch: "",
    phone: "",
    phone2: "",
    description: "",
    address: "",
    email: "",
    fees: "",
    gpsLocation: "",
    image: "",
  })
  const [availableBranches, setAvailableBranches] = useState<string[]>([])
  const [selectedBranch, setSelectedBranch] = useState("")
  const [customBranch, setCustomBranch] = useState("")
  const [activeTab, setActiveTab] = useState("add")
  const { toast } = useToast()
  const router = useRouter()

  // دالة للتحقق من صحة التوكن
  const verifyToken = async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      setIsAuthenticated(false)
      router.push('/admin/login')
      return false
    }

    try {
      const response = await fetch('/api/admin/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) {
        localStorage.removeItem('adminToken')
        document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        setIsAuthenticated(false)
        router.push('/admin/login')
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error verifying token:', error)
      localStorage.removeItem('adminToken')
      document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      setIsAuthenticated(false)
      router.push('/admin/login')
      return false
    }
  }

  // التحقق من تسجيل الدخول عند تحميل الصفحة
  useEffect(() => {
    const checkAuthentication = async () => {
      setLoading(true)
      
      // انتظار قصير للتأكد من تحميل localStorage
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // التحقق من الـ localStorage أولاً
      const token = localStorage.getItem('adminToken')
      if (!token) {
        setLoading(false)
        setIsAuthenticated(false)
        router.push('/admin/login')
        return
      }

      try {
        // التحقق من صحة التوكن مع الخادم
        const response = await fetch('/api/admin/verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        })

        if (response.ok) {
          setIsAuthenticated(true)
          await fetchNurseries()
        } else {
          // التوكن غير صالح
          localStorage.removeItem('adminToken')
          document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          setIsAuthenticated(false)
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('Error verifying token:', error)
        localStorage.removeItem('adminToken')
        document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        setIsAuthenticated(false)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuthentication()
  }, [router])

  // فحص دوري للتوكن كل 5 دقائق
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(async () => {
      const isValid = await verifyToken()
      if (!isValid) {
        clearInterval(interval)
      }
    }, 5 * 60 * 1000) // كل 5 دقائق

    return () => clearInterval(interval)
  }, [isAuthenticated, router])

  // جلب بيانات الحضانات
  const fetchNurseries = async () => {
    try {
      console.log('🔄 Fetching nurseries...')
      const response = await fetch('/api/nurseries')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Fetched nurseries count:', data.length)
        setNurseries(data)
        setFilteredNurseries(data)
      } else {
        console.error('❌ Failed to fetch nurseries:', response.status)
      }
    } catch (error) {
      console.error('❌ Error fetching nurseries:', error)
    }
  }

  // جلب الفروع المتاحة عند تحميل الصفحة
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch('/api/branches')
        if (response.ok) {
          const data = await response.json()
          setAvailableBranches(data.branches || branches)
        } else {
          setAvailableBranches(branches)
        }
      } catch (error) {
        console.error('Error fetching branches:', error)
        setAvailableBranches(branches)
      }
    }
    fetchBranches()
  }, [])

  // تصفية البحث
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredNurseries(nurseries)
    } else {
      const filtered = nurseries.filter((nursery) =>
        nursery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nursery.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nursery.phone.includes(searchQuery) ||
        nursery.phone2?.includes(searchQuery) ||
        nursery.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nursery.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredNurseries(filtered)
    }
  }, [searchQuery, nurseries])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/admin/login')
  }

  const handleAddNursery = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    // التحقق من صحة التوكن قبل الإضافة
    const isValid = await verifyToken()
    if (!isValid) return
    
    setIsSubmitting(true)
    
    const finalNursery = {
      ...newNursery,
      branch: customBranch || selectedBranch || newNursery.branch || ""
    }
    
    // التحقق من الحقول المطلوبة
    if (!finalNursery.name || !finalNursery.name.trim()) {
      toast({
        title: "خطأ",
        description: "اسم الحضانة مطلوب",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }
    
    if (!finalNursery.branch || !finalNursery.branch.trim()) {
      toast({
        title: "خطأ",
        description: "الفرع مطلوب",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }
    
    // إزالة القيم الفارغة فقط للحقول الاختيارية
    Object.keys(finalNursery).forEach(key => {
      if (key !== 'name' && key !== 'branch' && !finalNursery[key as keyof typeof finalNursery]) {
        delete (finalNursery as any)[key]
      }
    })

    try {
      const response = await fetch('/api/nurseries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalNursery),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        console.log('Nursery added successfully!')
        toast({
          title: "نجح الإضافة",
          description: "تم إضافة الحضانة بنجاح",
          className: "bg-green-50 border-green-200 text-green-800",
          duration: 4000
        })
        
        // إضافة الفرع الجديد إلى قائمة الفروع إذا كان مخصص
        if (customBranch && !availableBranches.includes(customBranch)) {
          try {
            await fetch('/api/branches', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ branch: customBranch }),
            })
            setAvailableBranches([...availableBranches, customBranch])
          } catch (error) {
            console.error('Error adding new branch:', error)
          }
        }
        
        setNewNursery({
          name: "",
          branch: "",
          phone: "",
          phone2: "",
          description: "",
          address: "",
          email: "",
          fees: "",
          gpsLocation: "",
          image: "",
        })
        setSelectedBranch("")
        setCustomBranch("")
        fetchNurseries()
      } else {
        console.log('Request failed with status:', response.status)
        console.log('=== DEBUGGING ERROR RESPONSE ===')
        
        // دائماً نعرض رسالة خطأ عامة أولاً
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء إضافة الحضانة - يرجى المحاولة مرة أخرى",
          variant: "destructive",
          duration: 5000
        })
        
        // ثم نحاول تحليل الاستجابة للحصول على تفاصيل أكثر
        try {
          const responseData = await response.json()
          console.log('Error response data:', responseData)
          
          if (responseData.error && responseData.error.includes('موجودة من قبل')) {
            console.log('=== DUPLICATE DETECTED ===')
            // عرض رسالة مخصصة للحضانات المكررة
            setTimeout(() => {
              toast({
                title: "تحذير - حضانة مكررة",
                description: responseData.error,
                variant: "destructive", 
                duration: 8000,
                action: (
                  <Button 
                    size="sm"
                    onClick={() => {
                      setActiveTab("manage")
                      setSearchQuery(newNursery.name.trim())
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  >
                    ابحث عنها
                  </Button>
                )
              })
            }, 100)
          }
        } catch (jsonError) {
          console.error('Failed to parse error response:', jsonError)
        }
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الحضانة",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNursery = async (id: string) => {
    console.log('🗑️ Starting delete process for nursery ID:', id)
    if (!confirm('هل أنت متأكد من حذف هذه الحضانة؟')) {
      console.log('❌ Delete cancelled by user')
      return
    }

    // التحقق من صحة التوكن قبل الحذف
    const isValid = await verifyToken()
    if (!isValid) {
      console.log('❌ Token invalid, delete aborted')
      return
    }

    try {
      console.log('Sending DELETE request to:', `/api/nurseries/${id}`)
      const response = await fetch(`/api/nurseries/${id}`, {
        method: 'DELETE',
      })

      console.log('Delete response status:', response.status)
      console.log('Delete response ok:', response.ok)

      if (response.ok) {
        console.log('✅ Delete successful! Refreshing nursery list...')
        
        // إزالة الحضانة من state فوراً لتحديث فوري
        setNurseries(prev => prev.filter(n => n.id !== id))
        setFilteredNurseries(prev => prev.filter(n => n.id !== id))
        
        toast({
          title: "تم الحذف",
          description: "تم حذف الحضانة بنجاح",
          className: "bg-green-50 border-green-200 text-green-800",
          duration: 4000
        })
        
        // تحديث إضافي من الخادم للتأكد
        await fetchNurseries()
        console.log('✅ Nursery list refreshed after delete')
      } else {
        const errorData = await response.text()
        console.log('Delete error response:', errorData)
        toast({
          title: "خطأ",
          description: "فشل في حذف الحضانة",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الحضانة",
        variant: "destructive",
      })
    }
  }

  const handleUpdateNursery = async (id: string, updatedData: Partial<Nursery>) => {
    // التحقق من صحة التوكن قبل التحديث
    const isValid = await verifyToken()
    if (!isValid) return
    
    try {
      const response = await fetch(`/api/nurseries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        toast({
          title: "تم التحديث",
          description: "تم تحديث الحضانة بنجاح",
        })
        setEditingId(null)
        fetchNurseries()
      } else {
        toast({
          title: "خطأ",
          description: "فشل في تحديث الحضانة",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الحضانة",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">لوحة إدارة الحضانات</h1>
            <p className="text-gray-600 mt-2">إدارة بيانات الحضانات والبحث</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            تسجيل خروج
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">إضافة حضانة جديدة</TabsTrigger>
            <TabsTrigger value="manage">إدارة الحضانات</TabsTrigger>
          </TabsList>

          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>إضافة حضانة جديدة</CardTitle>
                <CardDescription>
                  أدخل بيانات الحضانة الجديدة مع الحقول الجديدة (البريد الإلكتروني، الرسوم، موقع GPS، صورة الحضانة)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddNursery} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">اسم الحضانة <span className="text-red-500">*</span></Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="مثل: حضانة الأطفال السعداء"
                        value={newNursery.name}
                        onChange={(e) => setNewNursery({ ...newNursery, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="branch">الفرع <span className="text-red-500">*</span></Label>
                      <div className="space-y-2">
                        <Select
                          value={selectedBranch}
                          onValueChange={(value) => {
                            setSelectedBranch(value)
                            setNewNursery({ ...newNursery, branch: value })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الفرع" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableBranches.map((branch) => (
                              <SelectItem key={branch} value={branch}>
                                {branch}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="text"
                          placeholder="أو أدخل فرع جديد"
                          value={customBranch}
                          onChange={(e) => {
                            setCustomBranch(e.target.value)
                            if (e.target.value) {
                              setSelectedBranch("")
                              setNewNursery({ ...newNursery, branch: e.target.value })
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="مثل: 0791234567"
                        value={newNursery.phone}
                        onChange={(e) => setNewNursery({ ...newNursery, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone2">رقم الهاتف الثاني</Label>
                      <Input
                        id="phone2"
                        type="tel"
                        placeholder="مثل: 0796543210 (اختياري)"
                        value={newNursery.phone2}
                        onChange={(e) => setNewNursery({ ...newNursery, phone2: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="مثل: info@nursery.com"
                        value={newNursery.email}
                        onChange={(e) => setNewNursery({ ...newNursery, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fees">رسوم الحضانة (اختياري)</Label>
                      <Input
                        id="fees"
                        type="text"
                        placeholder="مثل: 150 دينار شهرياً"
                        value={newNursery.fees}
                        onChange={(e) => setNewNursery({ ...newNursery, fees: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gpsLocation">موقع GPS (اختياري)</Label>
                      <Input
                        id="gpsLocation"
                        type="text"
                        placeholder="مثل: 31.9566,35.9457"
                        value={newNursery.gpsLocation}
                        onChange={(e) => setNewNursery({ ...newNursery, gpsLocation: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">رابط صورة الحضانة (اختياري)</Label>
                      <Input
                        id="image"
                        type="url"
                        placeholder="مثل: https://example.com/image.jpg"
                        value={newNursery.image}
                        onChange={(e) => setNewNursery({ ...newNursery, image: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">العنوان</Label>
                      <Input
                        id="address"
                        type="text"
                        placeholder="مثل: شارع الملك حسين، عمان"
                        value={newNursery.address}
                        onChange={(e) => setNewNursery({ ...newNursery, address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">الوصف</Label>
                    <Textarea
                      id="description"
                      placeholder="وصف الحضانة والخدمات المقدمة..."
                      value={newNursery.description}
                      onChange={(e) => setNewNursery({ ...newNursery, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    <Plus className="w-4 h-4 mr-2" />
                    {isSubmitting ? "جاري الإضافة..." : "إضافة الحضانة"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <div className="space-y-4">
              {/* شريط البحث */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="ابحث عن الحضانة (الاسم، الفرع، الهاتف، العنوان، البريد الإلكتروني...)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10"
                      />
                    </div>
                    <div className="text-sm text-gray-600 whitespace-nowrap">
                      {filteredNurseries.length} من {nurseries.length} حضانة
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* قائمة الحضانات */}
              {filteredNurseries.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-gray-500">
                      {searchQuery ? "لا توجد نتائج للبحث المحدد" : "لا توجد حضانات"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredNurseries.map((nursery) => (
                  <Card key={nursery.id}>
                    <CardContent className="p-4">
                      {editingId === nursery.id ? (
                        <EditNurseryForm
                          nursery={nursery}
                          onSave={(updatedData) => handleUpdateNursery(nursery.id, updatedData)}
                          onCancel={() => setEditingId(null)}
                        />
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900">{nursery.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{nursery.description}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingId(nursery.id)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                تعديل
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteNursery(nursery.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                حذف
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="font-medium">الفرع:</p>
                              <p className="text-sm">{nursery.branch}</p>
                            </div>
                            <div>
                              <p className="font-medium">الهاتف:</p>
                              <p className="text-sm">{nursery.phone}</p>
                              {nursery.phone2 && (
                                <p className="text-sm text-gray-500">{nursery.phone2}</p>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">العنوان:</p>
                              <p className="text-sm">{nursery.address}</p>
                            </div>
                            {nursery.email && (
                              <div>
                                <p className="font-medium">البريد الإلكتروني:</p>
                                <p className="text-sm">{nursery.email}</p>
                              </div>
                            )}
                            {nursery.fees && (
                              <div>
                                <p className="font-medium">الرسوم:</p>
                                <p className="text-sm">{nursery.fees}</p>
                              </div>
                            )}
                            {nursery.gpsLocation && (
                              <div>
                                <p className="font-medium">موقع GPS:</p>
                                <p className="text-sm">{nursery.gpsLocation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}

function EditNurseryForm({ nursery, onSave, onCancel }: {
  nursery: Nursery
  onSave: (data: Partial<Nursery>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: nursery.name,
    branch: nursery.branch,
    phone: nursery.phone,
    phone2: nursery.phone2 || "",
    description: nursery.description,
    address: nursery.address,
    email: nursery.email || "",
    fees: nursery.fees || "",
    gpsLocation: nursery.gpsLocation || "",
    image: nursery.image || "",
  })
  const [availableBranches, setAvailableBranches] = useState<string[]>([])
  const [selectedBranch, setSelectedBranch] = useState(nursery.branch)
  const [customBranch, setCustomBranch] = useState("")

  // جلب الفروع المتاحة عند تحميل الصفحة
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch('/api/branches')
        if (response.ok) {
          const data = await response.json()
          setAvailableBranches(data.branches || branches)
        } else {
          setAvailableBranches(branches)
        }
      } catch (error) {
        console.error('Error fetching branches:', error)
        setAvailableBranches(branches)
      }
    }
    fetchBranches()
  }, [])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const finalData = {
      ...formData,
      branch: customBranch || selectedBranch || formData.branch
    }
    
    onSave(finalData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>اسم الحضانة</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label>الفرع</Label>
          <div className="space-y-2">
            <Select
              value={selectedBranch}
              onValueChange={(value) => {
                setSelectedBranch(value)
                setFormData({ ...formData, branch: value })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الفرع" />
              </SelectTrigger>
              <SelectContent>
                {availableBranches.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="أو أدخل فرع جديد"
              value={customBranch}
              onChange={(e) => {
                setCustomBranch(e.target.value)
                if (e.target.value) {
                  setSelectedBranch("")
                  setFormData({ ...formData, branch: e.target.value })
                }
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>رقم الهاتف</Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>رقم الهاتف الثاني</Label>
          <Input
            value={formData.phone2}
            onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>البريد الإلكتروني</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>رسوم الحضانة</Label>
          <Input
            value={formData.fees}
            onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>موقع GPS</Label>
          <Input
            value={formData.gpsLocation}
            onChange={(e) => setFormData({ ...formData, gpsLocation: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>رابط صورة الحضانة</Label>
          <Input
            type="url"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>العنوان</Label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>الوصف</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          حفظ
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          إلغاء
        </Button>
      </div>
    </form>
  )
}
