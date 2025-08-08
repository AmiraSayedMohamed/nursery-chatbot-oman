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
  
  // استخراج البيانات الحالية
  const nurseriesMatch = fileContent.match(/export const nurseries: Nursery\[\] = \[([\s\S]*?)\]/m);
  if (!nurseriesMatch) {
    console.error('لا يمكن العثور على بيانات الحضانات');
    process.exit(1);
  }
  
  // تحويل البيانات
  let updatedContent = fileContent.replace(
    /export const nurseries: Nursery\[\] = \[([\s\S]*?)\]/m,
    (match, nurseriesContent) => {
      // استخراج كل حضانة وتحديثها
      const updatedNurseries = nurseriesContent.replace(
        /\{\s*id:\s*"([^"]*)",\s*name:\s*"([^"]*)",\s*branch:\s*"([^"]*)",\s*phone:\s*"([^"]*)",\s*description:\s*"([^"]*)",\s*address:\s*"([^"]*)"\s*\}/g,
        (nurseryMatch, id, name, branch, phone, description, address) => {
          const mapping = branchToGovernorateCity[branch];
          if (!mapping) {
            console.warn(`لا يمكن العثور على تحويل للفرع: ${branch}`);
            return nurseryMatch; // إرجاع النص الأصلي
          }
          
          return `{
    id: "${id}",
    name: "${name}",
    governorate: "${mapping.governorate}",
    city: "${mapping.city}",
    branch: "${branch}",
    phone: "${phone}",
    description: "${description}",
    address: "${address}",
  }`;
        }
      );
      
      return `export const nurseries: Nursery[] = [${updatedNurseries}]`;
    }
  );
  
  // كتابة الملف المحدث
  fs.writeFileSync('lib/data.ts', updatedContent, 'utf-8');
  
  console.log('تم تحديث ملف البيانات بنجاح!');
  console.log('تم إضافة المحافظات والمدن لجميع الحضانات');
  
} catch (error) {
  console.error('خطأ في تحديث البيانات:', error);
  process.exit(1);
}
