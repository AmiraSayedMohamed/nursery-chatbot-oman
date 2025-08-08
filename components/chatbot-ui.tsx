"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { NurseryCard } from "./nursery-card"
import type { Nursery } from "@/lib/data"

export function ChatbotUI() {
  // Welcome message and examples
  const welcome = (
    <div className="mb-4 p-4 rounded-lg bg-[#f5eaff] text-center">
      <div className="font-bold text-lg text-[#7c3aed] mb-2">مرحباً بك في مساعد الحضانات</div>
      <div className="text-[#7c3aed] font-medium mb-1">كيف يمكنني مساعدتك في العثور على حضانة اليوم؟</div>
      <div className="text-[#7c3aed] text-sm">
        جرب ان تسأل: "أعطني الحضانات القريبة من موقعي" او "ما هي الحضانات في مرج الحمام؟" او "أريد حضانة في الجبيهة" او "ما هي الحضانات في مرج الحمام؟" او "ما هي الحضانات في مرج الحمام؟"
      </div>
    </div>
  )
  const [messages, setMessages] = useState<{ id: string; role: "user" | "assistant"; content: string }[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation(null),
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    const userMessage = { id: Date.now() + "", role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setInput("")
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage], location }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + Math.random() + "", role: "assistant", content: data.content }
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + Math.random() + "", role: "assistant", content: "حدث خطأ أثناء الاتصال بالخادم." }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Card className="w-full bg-[#faf6ff] border border-[#ede7f6] shadow-md" style={{ minHeight: '420px' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-[#7c3aed] text-xl font-bold">مساعد الحضانات الذكي</CardTitle>
        </CardHeader>
        <div className="border-b border-[#ede7f6] mb-2" />
        <CardContent className="flex-1 overflow-y-auto">
          {welcome}
          <ScrollArea className="max-h-[40vh]">
            {messages.map((m) => {
              let renderedContent: React.ReactNode = m.content;
              if (typeof m.content === "string" && m.content.startsWith("[") && m.content.endsWith("]")) {
                try {
                  const parsedContent = JSON.parse(m.content);
                  if (
                    Array.isArray(parsedContent) &&
                    parsedContent.every((item) => "id" in item && "name" in item)
                  ) {
                    renderedContent = (
                      <div className="grid gap-3">
                        {parsedContent.length > 0 ? (
                          parsedContent.map((nursery: Nursery) => (
                            <NurseryCard key={nursery.id} nursery={nursery} />
                          ))
                        ) : (
                          <p>عذراً، لم أجد أي حضانات تطابق معايير البحث.</p>
                        )}
                      </div>
                    );
                  }
                } catch (e) {}
              }
              return (
                <div key={m.id} className={`mb-2 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-lg px-4 py-3 text-sm shadow-md",
                      m.role === "user"
                        ? "bg-blue-600 text-white ml-auto rounded-br-none"
                        : "bg-white text-gray-800 mr-auto rounded-bl-none border border-gray-200",
                    )}
                  >
                    {renderedContent}
                  </div>
                  {m.role === "user" && (
                    <Avatar className="h-8 w-8 bg-blue-500 text-white">
                      <AvatarFallback>أنت</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[75%] rounded-lg px-4 py-3 text-sm bg-white text-gray-800 mr-auto rounded-bl-none border border-gray-200 animate-pulse">
                  <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-bounce-dot"></span>
                  <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-bounce-dot animation-delay-100"></span>
                  <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-bounce-dot animation-delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4 bg-[#faf6ff]">
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Input
              id="message"
              placeholder="اكتب رسالتك..."
              className="flex-1 border border-[#d1b3ff] bg-white rounded-lg px-4 py-2 focus:border-[#a78bfa] focus:ring-[#a78bfa] text-right"
              autoComplete="off"
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
              <Send className="h-4 w-4" />
              <span className="sr-only">إرسال</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
