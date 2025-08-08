// اختبار بسيط للتحقق من DELETE API
import fetch from 'node-fetch';

const testDelete = async () => {
  try {
    console.log('بدء اختبار DELETE API...')
    
    // أولاً، احصل على قائمة الحضانات لنأخذ ID واحد للاختبار
    console.log('1. جلب قائمة الحضانات...')
    const getNurseries = await fetch('http://localhost:3002/api/nurseries')
    const nurseries = await getNurseries.json()
    console.log('عدد الحضانات الحالي:', nurseries.length)
    
    if (nurseries.length > 0) {
      const testNurseryId = nurseries[0].id
      console.log('2. سنحاول حذف الحضانة:', testNurseryId, nurseries[0].name)
      
      // الآن جرب حذف أول حضانة
      console.log('3. إرسال طلب DELETE...')
      const deleteResponse = await fetch(`http://localhost:3002/api/nurseries/${testNurseryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('4. حالة الاستجابة:', deleteResponse.status)
      console.log('5. الاستجابة صحيحة؟', deleteResponse.ok)
      
      const result = await deleteResponse.json()
      console.log('6. نتيجة الحذف:', result)
      
      // تحقق من العدد مرة أخرى
      console.log('7. فحص العدد بعد الحذف...')
      const checkNurseries = await fetch('http://localhost:3002/api/nurseries')
      const updatedNurseries = await checkNurseries.json()
      console.log('8. عدد الحضانات بعد الحذف:', updatedNurseries.length)
    } else {
      console.log('لا توجد حضانات للاختبار')
    }
  } catch (error) {
    console.error('خطأ في الاختبار:', error)
  }
}

testDelete()
