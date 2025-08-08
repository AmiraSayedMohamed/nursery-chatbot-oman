import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, MapPin } from "lucide-react"
import type { Nursery } from "@/lib/data"

interface NurseryCardProps {
  nursery: Nursery
}

export function NurseryCard({ nursery }: NurseryCardProps) {
  return (
    <Card className="w-full transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-2 border-blue-100 hover:border-blue-300">
      <CardHeader className="bg-blue-50 p-4 rounded-t-lg">
        <CardTitle className="text-blue-800">{nursery.name}</CardTitle>
        <CardDescription className="text-purple-600 font-medium">{nursery.branch}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <p className="text-sm text-gray-700 leading-relaxed">{nursery.description}</p>
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="mr-2 h-4 w-4 text-green-600" />
          <div className="flex flex-col">
            <span>{nursery.phone}</span>
            {nursery.phone2 && (
              <span className="text-gray-500">{nursery.phone2}</span>
            )}
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="mr-2 h-4 w-4 text-red-500" />
          <span>{nursery.address}</span>
        </div>
      </CardContent>
    </Card>
  )
}
