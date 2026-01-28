import { useState, useEffect, useRef } from 'react'
import { Send, Loader, X, RefreshCw } from 'lucide-react'
import { aiService } from '../../services/aiService'

interface AIChatProps {
  userId: string
  context?: string
  onClose?: () => void
  compact?: boolean
  initialMessages?: any[]
}

export default function AIChat({
  userId,
  context = 'general',
  onClose,
  compact = false,
  initialMessages,
}: AIChatProps) {
  const [messages, setMessages] = useState<any[]>(initialMessages || [])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load chat history on mount
  useEffect(() => {
    loadHistory()
  }, [userId, context])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadHistory = async () => {
    try {
      const history = await aiService.getChatHistory(userId, context, 20)
      setMessages(history)
    } catch (err: any) {
      console.warn('Failed to load chat history (table may not exist yet):', err.message)
      // Don't set error - just start with empty history
      setMessages([])
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    setError(null)
    const userMessage = input.trim()
    setInput('')

    try {
      // Save user message
      await aiService.saveChatMessage(userId, 'user', userMessage, context)

      // Add to UI immediately
      setMessages((prev) => [...prev, { role: 'user', content: userMessage }])

      // Get AI response
      setLoading(true)
      const aiResponse = await aiService.sendMessage(
        userMessage,
        context,
        messages
      )

      // Save AI response
      await aiService.saveChatMessage(userId, 'assistant', aiResponse, context)

      // Add to UI
      setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }])
    } catch (err: any) {
      console.error('Chat error:', err)
      setError(err.message || 'Greška pri slanju poruke')
      // Restore input if error
      setInput(userMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = async () => {
    if (confirm('Želiš li da obriše istoriju razgovora?')) {
      try {
        await aiService.clearChatHistory(userId, context)
        setMessages([])
      } catch (err) {
        setError('Greška pri brisanju istorije')
      }
    }
  }

  if (compact) {
    return (
      <div className="h-full flex flex-col bg-slate-900/80 rounded-lg border border-slate-700/50">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            🤖 AI Asistent
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-800 rounded transition-all"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">
                Počni razgovor sa AI asistentom
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-200 px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">Razmišljam...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-2 bg-red-500/20 text-red-300 text-sm border-t border-red-500/50">
            {error}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Pitaj me nešto..."
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    )
  }

  // Full chat interface
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              🤖 AI Asistent
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearHistory}
                className="p-2 hover:bg-slate-800/50 rounded-lg text-slate-400 hover:text-slate-300 transition-all"
                title="Obriši istoriju"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-800/50 rounded-lg text-slate-400 hover:text-slate-300 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Messages Container */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-slate-900/40">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                  <p className="text-3xl">🤖</p>
                  <p className="text-slate-400">Pokreni razgovor sa AI asistentom</p>
                  <p className="text-sm text-slate-500">Mogu ti pomoći sa sve što te zanima</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    <div
                      className={`max-w-md px-4 py-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none'
                          : 'bg-slate-800/80 text-slate-200 rounded-bl-none border border-slate-700/50'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-slate-800/80 border border-slate-700/50 text-slate-200 px-4 py-3 rounded-lg rounded-bl-none flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span className="text-sm">AI razmišlja...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="px-6 py-3 bg-red-500/20 text-red-300 text-sm border-t border-red-500/50">
              ❌ {error}
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-6 border-t border-slate-700/50 bg-slate-900/40"
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder="Napiši svojom poruku..."
                className="flex-1 px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none disabled:opacity-50 transition-all"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Pošalji
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
