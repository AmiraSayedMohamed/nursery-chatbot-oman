import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

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



// GET - جلب جميع الحضانات
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const nurseries = await db.collection('nurseries').find({}).toArray();
    return NextResponse.json(nurseries);
  } catch (error) {
    console.error('خطأ في جلب البيانات:', error);
    return NextResponse.json(
      { error: 'خطأ في جلب البيانات' },
      { status: 500 }
    );
  }
}


// POST - إضافة حضانة جديدة
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      const rawBody = await request.text();
      body = JSON.parse(rawBody);
    } catch (jsonError) {
      return NextResponse.json(
        { error: 'خطأ في تحليل البيانات المرسلة' },
        { status: 400 }
      );
    }
    const { name, branch, phone, phone2, email, fees, gpsLocation, image, description, address } = body;
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'اسم الحضانة مطلوب' },
        { status: 400 }
      );
    }
    if (!branch || !branch.trim()) {
      return NextResponse.json(
        { error: 'الفرع مطلوب' },
        { status: 400 }
      );
    }
    const client = await clientPromise;
    const db = client.db();
    // Check for duplicate
    const duplicateNursery = await db.collection('nurseries').findOne({
      name: { $regex: `^${name.trim()}$`, $options: 'i' },
      branch: { $regex: `^${branch.trim()}$`, $options: 'i' }
    });
    if (duplicateNursery) {
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
      );
    }
    // Generate new ID (find max id in collection)
    const lastNursery = await db.collection('nurseries')
      .find({})
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    const newId = lastNursery.length > 0 ? (parseInt(lastNursery[0].id) + 1).toString() : '1';
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
    };
    await db.collection('nurseries').insertOne(newNursery);
    return NextResponse.json(newNursery, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: `خطأ في إضافة الحضانة: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
