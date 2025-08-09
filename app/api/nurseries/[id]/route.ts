import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

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



// PUT - تحديث حضانة في MongoDB
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('nurseries').findOneAndUpdate(
      { id },
      { $set: body },
      { returnDocument: 'after' }
    );
    if (!result || !result.value) {
      return NextResponse.json({ error: 'الحضانة غير موجودة' }, { status: 404 });
    }
    return NextResponse.json(result.value);
  } catch (error) {
    console.error('خطأ في تحديث الحضانة:', error);
    return NextResponse.json({ error: 'خطأ في تحديث الحضانة' }, { status: 500 });
  }
}

// DELETE - حذف حضانة من MongoDB
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('nurseries').findOneAndDelete({ id });
    if (!result || !result.value) {
      return NextResponse.json({ error: 'الحضانة غير موجودة' }, { status: 404 });
    }
    return NextResponse.json({ message: 'تم حذف الحضانة بنجاح', deletedNursery: result.value });
  } catch (error) {
    console.error('خطأ في حذف الحضانة:', error);
    return NextResponse.json({ error: 'خطأ في حذف الحضانة' }, { status: 500 });
  }
}
