import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET - جلب جميع الفروع من MongoDB
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const branches = await db.collection('branches').find({}).toArray();
    const branchNames = branches.map(b => b.name);
    return NextResponse.json(branchNames);
  } catch (error) {
    console.error('خطأ في جلب الفروع:', error);
    return NextResponse.json(["غير محدد"], { status: 500 });
  }
}

// POST - إضافة فرع جديد إلى MongoDB
export async function POST(request: NextRequest) {
  try {
    const { branch } = await request.json();
    if (!branch || !branch.trim()) {
      return NextResponse.json({ error: 'اسم الفرع مطلوب' }, { status: 400 });
    }
    const newBranch = branch.trim();
    const client = await clientPromise;
    const db = client.db();
    const existing = await db.collection('branches').findOne({ name: newBranch });
    if (existing) {
      const allBranches = await db.collection('branches').find({}).toArray();
      return NextResponse.json({ message: 'الفرع موجود مسبقاً', branches: allBranches.map(b => b.name) });
    }
    await db.collection('branches').insertOne({ name: newBranch });
    const allBranches = await db.collection('branches').find({}).toArray();
    return NextResponse.json({ message: 'تم إضافة الفرع بنجاح', branches: allBranches.map(b => b.name) });
  } catch (error) {
    console.error('خطأ في إضافة الفرع:', error);
    return NextResponse.json({ error: 'خطأ في إضافة الفرع' }, { status: 500 });
  }
}
