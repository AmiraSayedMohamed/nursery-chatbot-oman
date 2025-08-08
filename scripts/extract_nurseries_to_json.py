import re
import json

INPUT_FILE = 'lib/data.ts'
OUTPUT_FILE = 'lib/nurseries.json'

nurseries = []
inside = False
current = {}

with open(INPUT_FILE, encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line.startswith('export const nurseries:'):
            inside = True
            continue
        if inside and line.startswith(']'):
            break
        if inside:
            if line.startswith('{'):
                current = {}
            elif line.startswith('},') or line.startswith('}'):  # نهاية كائن
                if current:
                    nurseries.append(current)
                current = {}
            elif ':' in line:
                # استخراج المفتاح والقيمة
                key, value = line.split(':', 1)
                key = key.strip().strip('"')
                value = value.strip().rstrip(',').strip('"')
                # إزالة علامات الاقتباس الزائدة
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                current[key] = value

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(nurseries, f, ensure_ascii=False, indent=2)

print(f'Extracted {len(nurseries)} nurseries to {OUTPUT_FILE}')
