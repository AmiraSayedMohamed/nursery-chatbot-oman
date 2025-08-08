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
  description: string
  address: string
  email?: string
  fees?: string
  gpsLocation?: string
  image?: string
}

// قراءة البيانات الحالية من الملف - نسخة موحدة مع API الرئيسي
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
    
    // إنشاء النص الجديد للبيانات بتنسيق JSON
    let nurseriesText = 'export const nurseries: Nursery[] = [\n'
    
    nurseries.forEach((nursery, index) => {
      const nurseryJson = JSON.stringify(nursery, null, 2)
        .split('\n')
        .map(line => '  ' + line)
        .join('\n')
      
      nurseriesText += nurseryJson
      
      if (index < nurseries.length - 1) {
        nurseriesText += ','
      }
      nurseriesText += '\n'
    })
    
    nurseriesText += ']\n'
    
    // استبدال البيانات القديمة بالجديدة
    const updatedContent = fileContent.replace(
      /export const nurseries: Nursery\[\] = \[[\s\S]*?\]/m,
      nurseriesText.trim()
    )
    
    // كتابة الملف المحدث
    fs.writeFileSync(dataFilePath, updatedContent, 'utf-8')
    
    return true
  } catch (error) {
    console.error('خطأ في كتابة البيانات:', error)
    return false
  }
}

// PUT - تحديث حضانة
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // قراءة البيانات الحالية
    const currentNurseries = readNurseriesFromFile()
    
    // البحث عن الحضانة
    const nurseryIndex = currentNurseries.findIndex(n => n.id === id)
    
    if (nurseryIndex === -1) {
      return NextResponse.json(
        { error: 'الحضانة غير موجودة' },
        { status: 404 }
      )
    }
    
    // تحديث البيانات
    const updatedNursery = {
      ...currentNurseries[nurseryIndex],
      ...body,
      id, // التأكد من عدم تغيير ID
    }
    
    // تحديث المصفوفة
    currentNurseries[nurseryIndex] = updatedNursery
    
    // حفظ البيانات
    const success = writeNurseriesToFile(currentNurseries)
    
    if (success) {
      return NextResponse.json(updatedNursery)
    } else {
      return NextResponse.json(
        { error: 'خطأ في حفظ البيانات' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('خطأ في تحديث الحضانة:', error)
    return NextResponse.json(
      { error: 'خطأ في تحديث الحضانة' },
      { status: 500 }
    )
  }
}

// DELETE - حذف حضانة
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('=== DELETE REQUEST STARTED ===')
    console.log('Attempting to delete nursery with ID:', id)
    
    // قراءة البيانات الحالية
    const currentNurseries = readNurseriesFromFile()
    console.log('Total nurseries loaded for delete:', currentNurseries.length)
    
    // البحث عن الحضانة
    const nurseryIndex = currentNurseries.findIndex(n => n.id === id)
    console.log('Found nursery at index:', nurseryIndex)
    
    if (nurseryIndex === -1) {
      console.log('ERROR: Nursery not found with ID:', id)
      console.log('Available IDs:', currentNurseries.slice(-5).map(n => n.id))
      return NextResponse.json(
        { error: 'الحضانة غير موجودة' },
        { status: 404 }
      )
    }
    
    // حذف الحضانة
    const deletedNursery = currentNurseries.splice(nurseryIndex, 1)[0]
    console.log('Deleted nursery:', deletedNursery.name)
    console.log('Remaining nurseries count:', currentNurseries.length)
    
    // حفظ البيانات
    const success = writeNurseriesToFile(currentNurseries)
    console.log('File write success:', success)
    
    if (success) {
      console.log('=== DELETE SUCCESSFUL ===')
      return NextResponse.json({ message: 'تم حذف الحضانة بنجاح', deletedNursery })
    } else {
      console.log('=== DELETE FAILED - File Write Error ===')
      return NextResponse.json(
        { error: 'خطأ في حفظ البيانات' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('=== DELETE ERROR ===', error)
    return NextResponse.json(
      { error: 'خطأ في حذف الحضانة' },
      { status: 500 }
    )
  }
}
