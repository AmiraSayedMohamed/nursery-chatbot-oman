"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { branches } from "@/lib/data"

interface SearchFilterProps {
  onSearch: (filters: {
    name: string
    phone: string
    branch: string
  }) => void
}

export function SearchFilter({ onSearch }: SearchFilterProps) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [branch, setBranch] = useState("all")

  const handleSearch = () => {
    const filters = { name, phone, branch }
    // Assuming nursery is defined somewhere in the code
    onSearch(filters)
  }

  return (
    <div className="grid gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <h2 className="text-lg font-semibold">البحث اليدوي عن الحضانات</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nursery-name">اسم الحضانة</Label>
          <Input
            id="nursery-name"
            placeholder="أدخل اسم الحضانة"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone-number">رقم الهاتف</Label>
          <Input
            id="phone-number"
            placeholder="أدخل رقم الهاتف"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="branch">الفرع/المنطقة</Label>
          <Select value={branch} onValueChange={setBranch}>
            <SelectTrigger id="branch">
              <SelectValue placeholder="اختر الفرع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الفروع</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={handleSearch} className="w-full">
        بحث
      </Button>
    </div>
  )
}
