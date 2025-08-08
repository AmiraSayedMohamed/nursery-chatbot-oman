import pandas as pd
import json

try:
    # قراءة ملف CSV وتحويله إلى البيانات المطلوبة
    nurseries_data = []
    branches_set = set()

    # قراءة CSV باستخدام pandas
    print("قراءة ملف CSV...")
    df = pd.read_csv('data.csv', encoding='utf-8')
    print(f"تم قراءة {len(df)} صف")
    print("أعمدة الملف:", df.columns.tolist())

    for index, row in df.iterrows():
        # تنظيف البيانات
        name = str(row['اسم الحضانه']).strip()
        address = str(row['عنوان الحضانة']).strip() if pd.notna(row['عنوان الحضانة']) else ""
        phone = str(row['رقم الهاتف']).strip() if pd.notna(row['رقم الهاتف']) and row['رقم الهاتف'] != 'NULL' else ""
        branch_full = str(row['الموقع']).strip()
        
        # استخراج اسم الفرع (إزالة كلمة "فرع")
        branch = branch_full.replace('فرع ', '') if branch_full.startswith('فرع ') else branch_full
        branches_set.add(branch)
        
        # إنشاء وصف تلقائي
        if address:
            description = f"حضانة متميزة تقدم رعاية تعليمية وتربوية شاملة للأطفال في {branch}. بيئة آمنة ومحفزة للنمو والتطور."
        else:
            description = f"حضانة متميزة تقدم رعاية تعليمية وتربوية شاملة للأطفال في {branch}."
        
        # تنظيف رقم الهاتف
        if phone and phone != '0' and phone != 'nan':
            # إضافة 0 في البداية إذا لم يكن موجود
            if not phone.startswith('0') and len(phone) == 9 and phone.isdigit():
                phone = '0' + phone
            # تنظيف الأرقام غير المنطقية
            if len(phone) < 7 or phone in ['5555555', '555555', '55555', '5555', '555', '1111111111', '111111111', '11111111', '1111111', '111111', '11111', '1111', '0']:
                phone = "غير متوفر"
        else:
            phone = "غير متوفر"
            
        nursery = {
            "id": str(index + 1),
            "name": name,
            "branch": branch,
            "phone": phone,
            "description": description,
            "address": address if address else f"{branch}، الأردن"
        }
        
        nurseries_data.append(nursery)

    # إنشاء قائمة الفروع
    branches_list = sorted(list(branches_set))

    print("تم تحويل", len(nurseries_data), "حضانة")
    print("عدد الفروع:", len(branches_list))
    print("الفروع:", branches_list)

    # حفظ البيانات في ملف JSON مؤقت
    with open('nurseries_converted.json', 'w', encoding='utf-8') as json_file:
        json.dump({
            'nurseries': nurseries_data,
            'branches': branches_list
        }, json_file, ensure_ascii=False, indent=2)

    print("تم حفظ البيانات في nurseries_converted.json")

except Exception as e:
    print(f"خطأ: {e}")
    import traceback
    traceback.print_exc()
