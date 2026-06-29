import { useState, useRef, useEffect } from 'react'
import { useChat } from '../hooks/useChat'
import { MessageBubble } from './MessageBubble'

const SUGGESTIONS = [
  'มี headphone แบรนด์ Bose ไหม?',
  'แนะนำ SSD ราคาไม่แพง',
  'มีสินค้า category อะไรบ้าง?',
  'Compare speakers ให้หน่อย',
]

export function ChatWindow() {
  const [input, setInput] = useState('')
  const { messages, isLoading, sendMessage } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const msg = input.trim()
    if (!msg || isLoading) return
    setInput('')
    sendMessage(msg)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">

      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:flex w-60 border-r border-white/8 flex-col p-4 shrink-0">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0">
            <span className="text-black font-bold text-xs">IQ</span>
          </div>
          <span className="font-medium text-sm tracking-tight">CatalogIQ</span>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white hover:bg-white/6 rounded-lg px-3 py-2 transition-colors text-left"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New chat
        </button>

        <div className="mt-auto pt-4 border-t border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium shrink-0">
              J
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">Jomchai</p>
              <p className="text-xs text-white/30 truncate">AI Engineer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 py-10">
              <div className="w-full max-w-xl">

                {/* Hero */}
                <div className="text-center mb-7">
                  <div className="w-11 h-11 rounded-2xl bg-white/8 border border-white/12 flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xs">IQ</span>
                  </div>
                  <h2 className="text-xl font-semibold mb-1">CatalogIQ</h2>
                  <p className="text-white/40 text-sm">AI ผู้ช่วยค้นหาสินค้า Electronics</p>
                </div>

                {/* About */}
                <div className="bg-white/4 border border-white/8 rounded-2xl p-4 mb-3">
                  <p className="text-xs text-white/30 font-medium uppercase tracking-wider mb-3">เกี่ยวกับ AI นี้</p>
                  <p className="text-sm text-white/60 leading-relaxed">
                    ระบบ RAG ที่ใช้ข้อมูลจาก <span className="text-white/80">Amazon Electronics catalog</span> มากกว่า{' '}
                    <span className="text-white/80">1,200+ สินค้า</span> ครอบคลุมหมวด Speaker, SSD, Monitor, TV Mount, Headphone และอื่นๆ
                    — ถามเป็นภาษาไทยหรืออังกฤษก็ได้
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { value: '1,200+', label: 'สินค้า' },
                    { value: 'Amazon', label: 'แหล่งข้อมูล' },
                    { value: 'ไทย / EN', label: 'ภาษา' },
                  ].map(({ value, label }) => (
                    <div key={label} className="bg-white/3 border border-white/6 rounded-xl py-3 text-center">
                      <p className="text-sm font-semibold text-white">{value}</p>
                      <p className="text-xs text-white/30 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Capabilities */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {[
                    { icon: '🔍', text: 'ค้นหาสินค้าตามชื่อหรือ spec' },
                    { icon: '💰', text: 'เปรียบเทียบราคาสินค้า' },
                    { icon: '🏷️', text: 'กรองตามแบรนด์หรือ category' },
                    { icon: '💬', text: 'ขอคำแนะนำการเลือกซื้อ' },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 bg-white/3 border border-white/6 rounded-xl px-3 py-2.5">
                      <span className="text-sm">{icon}</span>
                      <span className="text-xs text-white/45">{text}</span>
                    </div>
                  ))}
                </div>

                {/* Suggestions */}
                <p className="text-xs text-white/20 mb-2 px-1">ลองถามได้เลย</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-left text-sm bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-white/50 hover:text-white hover:bg-white/8 hover:border-white/15 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>

              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full px-6 py-8 space-y-8">
              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
                  message={msg}
                  isStreaming={isLoading && i === messages.length - 1 && msg.role === 'assistant'}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="px-6 pb-6 pt-2">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end bg-white/6 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-white/25 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about products..."
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm text-white placeholder-white/25 focus:outline-none leading-relaxed"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="w-8 h-8 rounded-xl bg-white flex items-center justify-center hover:bg-white/85 disabled:opacity-20 disabled:cursor-not-allowed transition-all shrink-0"
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-center text-xs text-white/15 mt-2">Enter to send · Shift+Enter for new line</p>
          </div>
        </div>

      </div>
    </div>
  )
}
