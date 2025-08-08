const fs = require('fs');

// قراءة JSON file
const data = JSON.parse(fs.readFileSync('nurseries_converted.json', 'utf8'));
const nurseries = data.nurseries;
const branches = data.branches;

console.log(`عدد الحضانات: ${nurseries.length}`);
console.log(`عدد الفروع: ${branches.length}`);

// إنشاء TypeScript content
let tsContent = `export interface Nursery {
  id: string
  name: string
  branch: string // e.g., "عمان المركز", "اربد"
  phone: string
  description: string
  address: string
}

export const nurseries: Nursery[] = [
`;

// إضافة البيانات
for (let i = 0; i < nurseries.length; i++) {
  const nursery = nurseries[i];
  // تنظيف رقم الهاتف
  let phone = nursery.phone.toString().replace('.0', '');
  if (phone === 'غير متوفر') {
    phone = 'غير متوفر';
  } else if (phone.length === 9 && !phone.startsWith('0')) {
    phone = '0' + phone;
  } else if (phone.length === 7) {
    phone = '06' + phone;
  }
  
  // escape quotes in strings
  const name = nursery.name.replace(/"/g, '\\"');
  const description = nursery.description.replace(/"/g, '\\"');
  const address = nursery.address.replace(/"/g, '\\"');
  
  tsContent += `  {
    id: "${nursery.id}",
    name: "${name}",
    branch: "${nursery.branch}",
    phone: "${phone}",
    description: "${description}",
    address: "${address}",
  }`;
  
  if (i < nurseries.length - 1) {
    tsContent += ',';
  }
  tsContent += '\n';
}

tsContent += ']\n\n';

// إضافة قائمة الفروع
tsContent += 'export const branches = [';
for (let i = 0; i < branches.length; i++) {
  tsContent += `"${branches[i]}"`;
  if (i < branches.length - 1) {
    tsContent += ', ';
  }
}
tsContent += ']\n';

// كتابة الملف
fs.writeFileSync('lib/data.ts', tsContent, 'utf8');

console.log('تم تحديث ملف lib/data.ts بنجاح!');

// إحصائيات
console.log('\nإحصائيات البيانات:');
branches.forEach(branch => {
  const count = nurseries.filter(n => n.branch === branch).length;
  console.log(`- ${branch}: ${count} حضانة`);
});
