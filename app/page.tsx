"use client"

import { useState, useMemo, useCallback } from "react"
import { type Nursery, nurseries } from "@/lib/data"
import { NurseryCard } from "@/components/nursery-card"
import { SearchFilter } from "@/components/search-filter"
import { ChatbotUI } from "@/components/chatbot-ui"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useToast } from "@/components/ui/use-toast" // Import useToast
import { Toaster } from "@/components/ui/toaster" // Import Toaster

export default function HomePage() {
  const [filteredNurseries, setFilteredNurseries] = useState<Nursery[]>(nurseries)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  const ITEMS_PER_PAGE = 12 // عرض 12 حضانة في كل صفحة
  
  // تحسين عرض البيانات مع pagination
  const paginatedNurseries = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredNurseries.slice(startIndex, endIndex)
  }, [filteredNurseries, currentPage])
  
  const totalPages = Math.ceil(filteredNurseries.length / ITEMS_PER_PAGE)

  const handleFilter = useCallback((filters: {
    searchQuery: string
    selectedGovernorate: string
    selectedArea: string
    selectedMinAge: string
    selectedMaxAge: string
    priceRange: [number, number]
  }) => {
    setIsLoading(true)
    setCurrentPage(1) // إعادة تعيين إلى الصفحة الأولى عند التصفية
    
    setTimeout(() => {
      let filtered = nurseries.filter(nursery => {
        const matchesSearch = !filters.searchQuery || 
          nursery.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          nursery.description.toLowerCase().includes(filters.searchQuery.toLowerCase())
        
        const matchesBranch = !filters.selectedGovernorate || 
          nursery.branch === filters.selectedGovernorate
        
        const matchesArea = !filters.selectedArea || 
          nursery.branch === filters.selectedArea
        
        // Since fees is a string, we'll try to extract numeric value
        const extractPrice = (fees: string | undefined): number => {
          if (!fees) return 0
          const match = fees.match(/(\d+)/)
          return match ? parseInt(match[1]) : 0
        }
        
        const nurseryPrice = extractPrice(nursery.fees)
        const matchesPrice = nurseryPrice >= filters.priceRange[0] && 
          nurseryPrice <= filters.priceRange[1]
        
        return matchesSearch && matchesBranch && matchesArea && matchesPrice
      })
      
      setFilteredNurseries(filtered)
      setIsLoading(false)
    }, 300) // إضافة تأخير بسيط لتحسين UX
  }, [])

  const handleManualSearch = useCallback((filters: {
    name: string
    phone: string
    branch: string
  }) => {
    setIsLoading(true)
    setCurrentPage(1)
    
    setTimeout(() => {
      let filtered = nurseries.filter(nursery => {
        const matchesName = !filters.name || 
          nursery.name.toLowerCase().includes(filters.name.toLowerCase())
        
        const matchesPhone = !filters.phone || 
          nursery.phone.includes(filters.phone) ||
          (nursery.phone2 && nursery.phone2.includes(filters.phone))
        
        const matchesBranch = filters.branch === "all" || 
          nursery.branch === filters.branch
        
        return matchesName && matchesPhone && matchesBranch
      })
      
      setFilteredNurseries(filtered)
      setIsLoading(false)
    }, 300)
  }, [])

  return (
    <main className="flex flex-col lg:flex-row gap-8 p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
      <section className="flex-1 space-y-8 bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-4xl font-extrabold text-center lg:text-right text-blue-700">
          البحث عن حضانات في <span className="text-purple-600">الأردن</span>
        </h1>
        <p className="text-center lg:text-right text-gray-600 mb-8">اعثر على الحضانة المثالية لطفلك بسهولة ويسر.</p>
        <SearchFilter onSearch={handleManualSearch} />

        <Separator className="my-8 bg-gray-200" />

        <h2 className="text-3xl font-bold text-center lg:text-right text-blue-600">
          نتائج البحث ({filteredNurseries.length} حضانة)
        </h2>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedNurseries.length > 0 ? (
              paginatedNurseries.map((nursery) => <NurseryCard key={nursery.id} nursery={nursery} />)
            ) : (
              <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-500">
                <p className="text-lg font-medium">لا توجد حضانات مطابقة لمعايير البحث.</p>
                <p className="text-sm">حاول تغيير معايير البحث أو استخدم الشات بوت.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
            >
              السابق
            </button>
            <span className="px-4 py-2 bg-gray-100 rounded">
              صفحة {currentPage} من {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
            >
              التالي
            </button>
          </div>
        )}
      </section>
      <aside className="lg:w-1/3">
        <ChatbotUI />
      </aside>
      <Toaster /> {/* Add Toaster component here */}
    </main>
  )
}
