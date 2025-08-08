const fs = require('fs');

// خريطة تحويل الفروع القديمة إلى محافظات ومدن
const branchToGovernorateCity = {
  "عمان المركز": { governorate: "عمان", city: "عمان المركز" },
  "شمال عمان": { governorate: "عمان", city: "شمال عمان" },
  "شرق عمان": { governorate: "عمان", city: "شرق عمان" },
  "جنوب عمان": { governorate: "عمان", city: "جنوب عمان" },
  "اليوبيل": { governorate: "عمان", city: "اليوبيل" },
  "اربد": { governorate: "إربد", city: "اربد" },
  "اليرموك": { governorate: "إربد", city: "اليرموك" },
  "الزرقاء": { governorate: "الزرقاء", city: "الزرقاء" },
  "السلط": { governorate: "البلقاء", city: "السلط" },
  "الكرك": { governorate: "الكرك", city: "الكرك" },
  "مـعـان": { governorate: "معان", city: "مـعـان" },
  "العقبه": { governorate: "العقبة", city: "العقبه" },
  "مادبا": { governorate: "مادبا", city: "مادبا" },
  "جـرش": { governorate: "جرش", city: "جـرش" },
  "عجلون": { governorate: "عجلون", city: "عجلون" },
  "المفرق": { governorate: "المفرق", city: "المفرق" },
  "الطفيلة": { governorate: "الطفيلة", city: "الطفيلة" },
  "سحاب": { governorate: "منطقة أخرى", city: "سحاب" }
};

try {
  // قراءة ملف البيانات
  const fileContent = fs.readFileSync('lib/data.ts', 'utf-8');
  
  console.log('قراءة الملف...');
  
  // تحديث البيانات عبر regex أكثر دقة
  let updatedContent = fileContent;
  
  // تحديث كل حضانة منفصلة
  for (const [branch, mapping] of Object.entries(branchToGovernorateCity)) {
    const regex = new RegExp(
      `(\\{\\s*id:\\s*"[^"]*",\\s*name:\\s*"[^"]*",\\s*)branch:\\s*"${branch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",`,
      'g'
    );
    
    updatedContent = updatedContent.replace(regex, 
      `$1governorate: "${mapping.governorate}",\n    city: "${mapping.city}",\n    branch: "${branch}",`
    );
  }
  
  // كتابة الملف المحدث
  fs.writeFileSync('lib/data.ts', updatedContent, 'utf-8');
  
  console.log('تم تحديث ملف البيانات بنجاح!');
  console.log('تم إضافة المحافظات والمدن لجميع الحضانات');
  
} catch (error) {
  console.error('خطأ في تحديث البيانات:', error);
  process.exit(1);
}
