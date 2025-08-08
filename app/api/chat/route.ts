
import { nurseries } from "@/lib/data"

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u0652]/g, "") // remove Arabic diacritics
    .replace(/[\s\p{P}\p{S}]+/gu, " ") // remove punctuation/symbols
    .trim()
}

function fuzzyIncludes(haystack: string, needle: string) {
  if (!needle) return true
  haystack = normalize(haystack)
  needle = normalize(needle)
  return haystack.includes(needle)
}

// Helper: Haversine distance between two lat/lng points (in km)
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180
  const R = 6371 // km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages = body.messages || []
    const lastUserMessage = messages.length > 0 ? messages[messages.length - 1].content : ""
    const location = body.location

    // إذا أرسل الموقع والسؤال عن "قريب" أو "بالقرب" أو "الأقرب" أو "near" أو "around"
    if (location && typeof location.lat === "number" && typeof location.lng === "number") {
      const lowerMsg = lastUserMessage.toLowerCase()
      if (
        lowerMsg.includes("قريب") ||
        lowerMsg.includes("بالقرب") ||
        lowerMsg.includes("قريبه") ||
        lowerMsg.includes("الأقرب") ||
        lowerMsg.includes("الاقرب") ||
        lowerMsg.includes("near") ||
        lowerMsg.includes("around")
      ) {
        // Nurseries with valid GPS
        const withGPS = nurseries.filter(n => typeof n.gpsLocation === 'string' && n.gpsLocation.includes(','))
        const withDistance = withGPS.map(n => {
          if (!n.gpsLocation) return { ...n, distance: Number.POSITIVE_INFINITY }
          const [latStr, lngStr] = n.gpsLocation.split(',').map(s => s.trim())
          const lat = parseFloat(latStr)
          const lng = parseFloat(lngStr)
          const dist = haversineDistance(location.lat, location.lng, lat, lng)
          return { ...n, distance: dist }
        })
        withDistance.sort((a, b) => a.distance - b.distance)
        const nearest = withDistance.slice(0, 3)
        const answer = nearest.length
          ? nearest.map((n, i) => `${i + 1}. ${n.name} (${n.distance.toFixed(2)} كم)\n${n.address || ""}`).join("\n\n")
          : "لم يتم العثور على حضانات قريبة."
        return new Response(JSON.stringify({ content: answer }), {
          headers: { "Content-Type": "application/json" },
        })
      }
    }

    const query = normalize(lastUserMessage)
    let responseContent = ""
    let foundNurseries = []

    // إذا كان السؤال فيه كلمة "رقم" أو "تليفون" واسم حضانة
    const phoneMatch = lastUserMessage.match(/(?:رقم|تليفون|هاتف)\s+حضانة\s+([\w\s\u0600-\u06FF]+)/i)
    if (phoneMatch) {
      const namePart = normalize(phoneMatch[1] || "")
      const nursery = nurseries.find(n => fuzzyIncludes(n.name || "", namePart))
      if (nursery) {
        responseContent = `رقم هاتف حضانة ${nursery.name}: ${nursery.phone || "غير متوفر"}`
      } else {
        responseContent = `عذراً، لم أجد حضانة باسم "${phoneMatch[1].trim()}".`
      }
    } else if (/في\s+([\w\s\u0600-\u06FF]+)/i.test(lastUserMessage)) {
      // إذا كان السؤال فيه "في" + منطقة
      const areaMatch = lastUserMessage.match(/في\s+([\w\s\u0600-\u06FF]+)/i)
      const area = normalize(areaMatch ? areaMatch[1] : "")
      foundNurseries = nurseries.filter(n => fuzzyIncludes(n.branch || "", area) || fuzzyIncludes(n.address || "", area))
      if (foundNurseries.length > 0) {
        responseContent = JSON.stringify(foundNurseries.slice(0, 5))
      } else {
        responseContent = `عذراً، لم أجد حضانات في منطقة "${areaMatch ? areaMatch[1].trim() : ""}".`
      }
    } else {
      // بحث عام في كل الحقول
      foundNurseries = nurseries.filter(n =>
        fuzzyIncludes(n.name || "", query) ||
        fuzzyIncludes(n.description || "", query) ||
        fuzzyIncludes(n.address || "", query) ||
        fuzzyIncludes(n.branch || "", query)
      )
      if (foundNurseries.length > 0) {
        responseContent = JSON.stringify(foundNurseries.slice(0, 5))
      } else {
        responseContent = "عذراً، لم أجد أي حضانات تطابق طلبك. جرب كلمات أخرى أو منطقة مختلفة."
      }
    }

    return new Response(JSON.stringify({ content: responseContent }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error processing chat:", error)
    return new Response(JSON.stringify({ content: "حدث خطأ أثناء معالجة طلبك. يرجى المحاولة لاحقاً." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
// ...existing code...
