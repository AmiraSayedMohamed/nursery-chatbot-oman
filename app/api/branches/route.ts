import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// مسار ملف البيانات
const dataFilePath = path.join(process.cwd(), 'lib', 'data.ts')

// GET - جلب جميع الفروع
export async function GET() {
  try {
    const fileContent = fs.readFileSync(dataFilePath, 'utf-8')
    
    // استخراج الفروع من الملف
    const branchesMatch = fileContent.match(/export const branches = \[([\s\S]*?)\]/)
    if (!branchesMatch) {
      return NextResponse.json(["غير محدد"])
    }
    
    // تحليل الفروع
    const branchesString = branchesMatch[1]
    const branches = branchesString
      .split(',')
      .map(branch => branch.trim().replace(/['"]/g, ''))
      .filter(branch => branch.length > 0)
    
    return NextResponse.json(branches)
  } catch (error) {
    console.error('خطأ في جلب الفروع:', error)
    return NextResponse.json(["غير محدد"], { status: 500 })
  }
}

// POST - إضافة فرع جديد
export async function POST(request: NextRequest) {
  try {
    const { branch } = await request.json()
    
    if (!branch || !branch.trim()) {
      return NextResponse.json(
        { error: 'اسم الفرع مطلوب' },
        { status: 400 }
      )
    }
    
    const newBranch = branch.trim()
    const fileContent = fs.readFileSync(dataFilePath, 'utf-8')
    
    // استخراج الفروع الحالية
    const branchesMatch = fileContent.match(/export const branches = \[([\s\S]*?)\]/)
    if (!branchesMatch) {
      return NextResponse.json(
        { error: 'خطأ في قراءة الفروع' },
        { status: 500 }
      )
    }
    
    const branchesString = branchesMatch[1]
    const currentBranches = branchesString
      .split(',')
      .map(branch => branch.trim().replace(/['"]/g, ''))
      .filter(branch => branch.length > 0)
    
    // التحقق من عدم وجود الفرع مسبقاً
    if (currentBranches.includes(newBranch)) {
      return NextResponse.json(
        { message: 'الفرع موجود مسبقاً', branches: currentBranches }
      )
    }
    
    // إضافة الفرع الجديد
    const updatedBranches = [...currentBranches, newBranch]
    const newBranchesString = updatedBranches.map(b => `"${b}"`).join(', ')
    
    // تحديث الملف
    const updatedContent = fileContent.replace(
      /export const branches = \[[\s\S]*?\]/,
      `export const branches = [${newBranchesString}]`
    )
    
    fs.writeFileSync(dataFilePath, updatedContent, 'utf-8')
    
    return NextResponse.json({
      message: 'تم إضافة الفرع بنجاح',
      branches: updatedBranches
    })
  } catch (error) {
    console.error('خطأ في إضافة الفرع:', error)
    return NextResponse.json(
      { error: 'خطأ في إضافة الفرع' },
      { status: 500 }
    )
  }
}
