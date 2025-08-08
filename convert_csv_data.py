import csv
import json
import uuid
import re

def clean_phone(phone):
    """Clean and format phone number"""
    if not phone or phone.strip() == '':
        return None
    # Remove spaces and common formatting
    phone = re.sub(r'[^\d+]', '', str(phone))
    # Remove leading zeros if present
    if phone.startswith('0'):
        phone = phone[1:]
    # Add Jordan country code if not present
    if not phone.startswith('+962') and not phone.startswith('962'):
        phone = '0' + phone
    return phone

def extract_city_from_address(governorate, city, area):
    """Extract city/branch from the location fields"""
    if city and city.strip():
        return city.strip()
    elif area and area.strip():
        return area.strip()
    elif governorate and governorate.strip():
        return governorate.strip()
    else:
        return "عمان"  # Default

def convert_csv_to_typescript():
    nurseries = []
    
    # Read CSV file
    with open('nurseries_final_clean.csv', 'r', encoding='utf-8-sig') as file:  # utf-8-sig to handle BOM
        csv_reader = csv.DictReader(file)
        
        for i, row in enumerate(csv_reader, 1):
            # Extract data with fallbacks
            name = row.get('اسم_الحضانة', '').strip()
            if not name:
                continue
                
            phone1 = clean_phone(row.get('رقم_التليفون_الأول', ''))
            phone2 = clean_phone(row.get('رقم_التليفون_الثاني', ''))
            email = row.get('البريد_الإلكتروني', '').strip() or None
            description = row.get('الوصف', '').strip() or f"حضانة {name} تقدم خدمات تعليمية متميزة للأطفال"
            fees = row.get('الرسوم', '').strip() or None
            governorate = row.get('المحافظة', '').strip()
            city = row.get('المدينة', '').strip()
            area = row.get('المنطقة', '').strip()
            image = row.get('صورة_الحضانة', '').strip() or None
            gps = row.get('الموقع_GPS', '').strip() or None
            address = row.get('العنوان', '').strip() or f"{area}, {city}" if area and city else city or governorate
            
            # Determine branch (city)
            branch = extract_city_from_address(governorate, city, area)
            
            # Create nursery object
            nursery = {
                'id': str(i),
                'name': name,
                'branch': branch,
                'phone': phone1 or '0791234567',  # Fallback phone
                'description': description,
                'address': address
            }
            
            # Add optional fields
            if phone2:
                nursery['phone2'] = phone2
            if email:
                nursery['email'] = email
            if fees:
                nursery['fees'] = fees
            if gps:
                nursery['gpsLocation'] = gps
            if image:
                nursery['image'] = image
                
            nurseries.append(nursery)
    
    # Generate TypeScript content
    ts_content = '''// أنواع البيانات المطلوبة للحضانات
export interface Nursery {
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

// قائمة الفروع المتاحة - يمكن إضافة فروع جديدة ديناميكياً
export const branches: string[] = [
  "عمان",
  "تلاع العلي",
  "عبدون", 
  "الجبيهة",
  "خلدا",
  "بسمان",
  "جبل الحسين",
  "الشميساني",
  "إربد", 
  "الزرقاء",
  "السلط",
  "العقبة",
  "الكرك",
  "معان",
  "الطفيلة",
  "عجلون",
  "جرش",
  "المفرق",
  "مأدبا"
]

// بيانات الحضانات من ملف CSV
export const nurseries: Nursery[] = '''

    # Add nurseries data
    ts_content += json.dumps(nurseries, ensure_ascii=False, indent=2, separators=(',', ': '))
    
    # Write to TypeScript file
    with open('lib/data.ts', 'w', encoding='utf-8') as file:
        file.write(ts_content)
    
    print(f"تم تحويل {len(nurseries)} حضانة بنجاح!")
    print("تم حفظ البيانات في lib/data.ts")

if __name__ == "__main__":
    convert_csv_to_typescript()
