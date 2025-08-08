import json

# قراءة البيانات المحولة
with open('nurseries_converted.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

nurseries = data['nurseries']
branches = data['branches']

print(f"عدد الحضانات: {len(nurseries)}")
print(f"عدد الفروع: {len(branches)}")

# إنشاء محتوى ملف TypeScript
ts_content = """export interface Nursery {
  id: string
  name: string
  branch: string // e.g., "عمان المركز", "اربد"
  phone: string
  description: string
  address: string
}

export const nurseries: Nursery[] = [
"""

# إضافة البيانات
for i, nursery in enumerate(nurseries):
    # تنظيف رقم الهاتف لإزالة .0
    phone = str(nursery['phone']).replace('.0', '') if nursery['phone'] != "غير متوفر" else "غير متوفر"
    
    ts_content += f"""  {{
    id: "{nursery['id']}",
    name: "{nursery['name']}",
    branch: "{nursery['branch']}",
    phone: "{phone}",
    description: "{nursery['description']}",
    address: "{nursery['address']}",
  }}"""
    
    if i < len(nurseries) - 1:
        ts_content += ","
    
    ts_content += "\n"

ts_content += "]\n\n"

# إضافة قائمة الفروع
ts_content += "export const branches = ["
for i, branch in enumerate(branches):
    ts_content += f'"{branch}"'
    if i < len(branches) - 1:
        ts_content += ", "

ts_content += "]\n"

# كتابة الملف
with open('lib/data.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print("تم تحديث ملف lib/data.ts بنجاح!")
print("البيانات الجديدة تشمل:")
for branch in branches:
    count = len([n for n in nurseries if n['branch'] == branch])
    print(f"- {branch}: {count} حضانة")
