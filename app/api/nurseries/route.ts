import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// مسار ملف البيانات
const dataFilePath = path.join(process.cwd(), 'lib', 'data.ts')

// نوع البيانات
interface Nursery {
  id: string
  name: string
  branch: string
  phone: string
  phone2?: string
  email?: string
  fees?: string
  gpsLocation?: string
  image?: string
  description: string
  address: string
}

// قراءة البيانات الحالية من الملف
function readNurseriesFromFile(): Nursery[] {
  try {
    const fileContent = fs.readFileSync(dataFilePath, 'utf-8')
    
    // استخراج البيانات من TypeScript file باستخدام regex محسن
    const nurseriesMatch = fileContent.match(/export const nurseries: Nursery\[\] = \[([\s\S]*?)\](?:\s*$|\s*\/\/)/m)
    if (!nurseriesMatch) {
      console.log('لم يتم العثور على بيانات الحضانات في الملف')
      return []
    }
    
    // استخراج محتوى المصفوفة وتحويله إلى JSON صالح
    let nurseriesContent = nurseriesMatch[1].trim()
    
    // إضافة أقواس المصفوفة للتحويل إلى JSON
    const jsonContent = `[${nurseriesContent}]`
    
    try {
      // تحويل إلى JSON مباشرة
      const parsedNurseries = JSON.parse(jsonContent)
      console.log(`تم قراءة ${parsedNurseries.length} حضانة من الملف`)
      return parsedNurseries
    } catch (jsonError) {
      console.error('خطأ في تحويل JSON:', jsonError)
      return []
    }
    
  } catch (error) {
    console.error('خطأ في قراءة البيانات:', error)
    return []
  }
}

// كتابة البيانات إلى الملف
function writeNurseriesToFile(nurseries: Nursery[]) {
  try {
    // قراءة محتوى الملف الحالي
    const fileContent = fs.readFileSync(dataFilePath, 'utf-8')
    
    // تحويل البيانات إلى JSON string مع formatting جميل
    const nurseriesJSON = JSON.stringify(nurseries, null, 2)
    
    // إنشاء النص الجديد للبيانات
    const nurseriesText = `export const nurseries: Nursery[] = ${nurseriesJSON}`
    
    // استبدال البيانات القديمة بالجديدة
    const updatedContent = fileContent.replace(
      /export const nurseries: Nursery\[\] = \[[\s\S]*?\](?:\s*$|\s*\/\/)/m,
      nurseriesText
    )
    
    // كتابة الملف المحدث
    fs.writeFileSync(dataFilePath, updatedContent, 'utf-8')
    
    return true
  } catch (error) {
    console.error('خطأ في كتابة البيانات:', error)
    return false
  }
}

// GET - جلب جميع الحضانات
export async function GET() {
  try {
    const nurseries = readNurseriesFromFile()
    return NextResponse.json(nurseries)
  } catch (error) {
    console.error('خطأ في جلب البيانات:', error)
    return NextResponse.json(
      { error: 'خطأ في جلب البيانات' },
      { status: 500 }
    )
  }
}

// POST - إضافة حضانة جديدة
export async function POST(request: NextRequest) {
  try {
    console.log('POST request received')
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    
    let body
    try {
      const rawBody = await request.text()
      console.log('Raw body:', rawBody)
      body = JSON.parse(rawBody)
      console.log('Parsed body:', body)
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError)
      return NextResponse.json(
        { error: 'خطأ في تحليل البيانات المرسلة' },
        { status: 400 }
      )
    }
    
    const { name, branch, phone, phone2, email, fees, gpsLocation, image, description, address } = body
    
    // التحقق من الحقول المطلوبة
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'اسم الحضانة مطلوب' },
        { status: 400 }
      )
    }
    
    if (!branch || !branch.trim()) {
      return NextResponse.json(
        { error: 'الفرع مطلوب' },
        { status: 400 }
      )
    }
    
    console.log('Data validation passed:', { name, branch, phone });
    
    // قراءة البيانات الحالية
    const currentNurseries = readNurseriesFromFile()
    
    // التحقق من وجود حضانة بنفس الاسم والفرع
    const duplicateNursery = currentNurseries.find(nursery => {
      const currentName = nursery.name.toLowerCase().trim()
      const currentBranch = nursery.branch.toLowerCase().trim()
      const newName = (name?.trim() || "").toLowerCase()
      const newBranch = (branch?.trim() || "").toLowerCase()
      
      console.log('Comparing:', {
        existing: { name: currentName, branch: currentBranch },
        new: { name: newName, branch: newBranch },
        match: currentName === newName && currentBranch === newBranch
      })
      
      return currentName === newName && currentBranch === newBranch
    })
    
    if (duplicateNursery) {
      console.log('Duplicate nursery found:', duplicateNursery)
      console.log('Returning error response: هذه الحضانة موجودة من قبل')
      return NextResponse.json(
        { 
          error: `هذه الحضانة موجودة من قبل - ابحث عنها في قائمة الحضانات للتعديل أو الحذف`,
          existingNursery: {
            id: duplicateNursery.id,
            name: duplicateNursery.name,
            branch: duplicateNursery.branch,
            phone: duplicateNursery.phone
          }
        },
        { status: 400 }
      )
    }
    
    // إنشاء ID جديد
    const newId = (Math.max(...currentNurseries.map(n => parseInt(n.id))) + 1).toString()
    
    // إنشاء حضانة جديدة
    const newNursery: Nursery = {
      id: newId,
      name: name?.trim() || "حضانة جديدة",
      branch: branch?.trim() || "غير محدد",
      phone: phone?.trim() || "",
      phone2: phone2?.trim() || undefined,
      email: email?.trim() || undefined,
      fees: fees?.trim() || undefined,
      gpsLocation: gpsLocation?.trim() || undefined,
      image: image?.trim() || undefined,
      description: description?.trim() || `حضانة تقدم رعاية تعليمية وتربوية للأطفال.`,
      address: address?.trim() || "غير محدد",
    }
    
    // إضافة الحضانة الجديدة
    const updatedNurseries = [...currentNurseries, newNursery]
    
    // حفظ البيانات
    const success = writeNurseriesToFile(updatedNurseries)
    
    if (success) {
      return NextResponse.json(newNursery, { status: 201 })
    } else {
      return NextResponse.json(
        { error: 'خطأ في حفظ البيانات' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('خطأ في إضافة الحضانة:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: `خطأ في إضافة الحضانة: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
