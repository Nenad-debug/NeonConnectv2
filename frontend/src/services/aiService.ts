import { supabase } from './supabaseClient'

interface ChatMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  context?: string
}

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 30,
  maxRequestsPerHour: 300,
  windowSize: 60000, // 1 minute in ms
}

class RateLimiter {
  private requests: number[] = []

  isAllowed(): boolean {
    const now = Date.now()
    const oneMinuteAgo = now - RATE_LIMIT_CONFIG.windowSize

    // Remove old requests outside the window
    this.requests = this.requests.filter((timestamp) => timestamp > oneMinuteAgo)

    if (this.requests.length >= RATE_LIMIT_CONFIG.maxRequestsPerMinute) {
      console.warn('⚠️ [AI SERVICE] Rate limit exceeded')
      return false
    }

    this.requests.push(now)
    return true
  }
}

const rateLimiter = new RateLimiter()

export const aiService = {
  /**
   * Send message to AI and get response with error handling and timeout
   */
  async sendMessage(
    userMessage: string,
    _context: string = 'general',
    previousMessages?: ChatMessage[],
    userId?: string
  ): Promise<string> {
    try {
      // Check rate limit
      if (!rateLimiter.isAllowed()) {
        console.warn('⚠️ [AI SERVICE] Rate limit exceeded - request blocked')
        return 'Previše zahteva - pokušajte za nekoliko sekundi.'
      }

      console.log('🤖 [AI SERVICE] Sending message via Netlify Function')

      // Create abort controller for timeout (20 seconds for frontend)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 20000)

      try {
        // Call our Netlify serverless function
        const response = await fetch('/.netlify/functions/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage.slice(0, 5000), // Limit message size
            context: _context,
            previousMessages: previousMessages || [],
            userId: userId, // For server-side rate limiting
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // 404 returns HTML from Netlify – don't parse as JSON
        const contentType = response.headers.get('content-type') || ''
        const isJson = contentType.includes('application/json')

        if (!response.ok) {
          if (response.status === 404) {
            return 'AI chat trenutno nije dostupan (funkcija nije deploy-ovana). Pokušajte ponovo kasnije ili kontaktirajte podršku.'
          }
          if (response.status === 403) {
            return 'AI chat nije dostupan (zabranjen pristup). Proverite da li je Netlify funkcija deploy-ovana i da li aplikacija radi na istom domenu.'
          }
          if (response.status === 429) {
            return 'AI servis je trenutno preplavljeno zahtevima. Pokušajte za nekoliko sekundi.'
          }
          if (response.status === 503) {
            return 'AI servis je privremeno nedostupan. Pokušajte za nekoliko sekundi.'
          }
          const data = isJson ? await response.json() : {}
          return `Greška: ${data.error || response.statusText || 'Nepoznata greška'}`
        }

        const data = isJson ? await response.json() : {}
        console.log('✅ Response received')
        return data.response || 'Nisam mogao da generiram odgovor.'
      } catch (err: any) {
        clearTimeout(timeoutId)

        if (err.name === 'AbortError') {
          console.error('❌ [AI SERVICE] Request timeout')
          return 'Zahtev je trajao previše dugo. Pokušajte sa kraćom porukom.'
        }
        // JSON parse error (e.g. 404 HTML response)
        if (err.message?.includes('JSON') || err.message?.includes('Unexpected token')) {
          return 'AI chat trenutno nije dostupan. Pokušajte ponovo kasnije.'
        }
        throw err
      }
    } catch (err: any) {
      console.error('❌ [AI SERVICE] Error:', err)
      return `Greška: ${err.message || 'Nepoznata greška'}`
    }
  },

  /**
   * Save chat message to database
   */
  async saveChatMessage(
    userId: string,
    role: 'user' | 'assistant',
    content: string,
    context: string = 'general'
  ): Promise<ChatMessage> {
    try {
      console.log(`💾 [AI SERVICE] Saving ${role} message`)

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            user_id: userId,
            role,
            content,
            context,
          },
        ])
        .select()
        .single()

      if (error) {
        // If table doesn't exist, silently fail but continue
        if (error.message?.includes('chat_messages') || error.message?.includes('not exist')) {
          console.warn('⚠️ [AI SERVICE] Chat messages table not set up yet - continuing without persistence')
          return { role, content, context }
        }
        throw error
      }

      console.log('✅ [AI SERVICE] Message saved')
      return data
    } catch (err: any) {
      console.error('❌ [AI SERVICE] Save error:', err)
      // Don't throw - silently fail to not interrupt chat
      return { role, content, context }
    }
  },

  /**
   * Get chat history for user
   */
  async getChatHistory(
    userId: string,
    context?: string,
    limit: number = 50
  ): Promise<ChatMessage[]> {
    try {
      console.log(`📜 [AI SERVICE] Fetching chat history for user`)

      let query = supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (context) {
        query = query.eq('context', context)
      }

      const { data, error } = await query

      if (error) {
        console.warn('⚠️ [AI SERVICE] Could not fetch history:', error.message)
        return []
      }

      // Reverse to get chronological order
      return (data || []).reverse()
    } catch (err: any) {
      console.error('❌ [AI SERVICE] History fetch error:', err)
      return []
    }
  },

  /**
   * Clear chat history for user
   */
  async clearChatHistory(userId: string, context?: string): Promise<void> {
    try {
      console.log(`🗑️ [AI SERVICE] Clearing chat history`)

      let query = supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', userId)

      if (context) {
        query = query.eq('context', context)
      }

      const { error } = await query

      if (error) throw error

      console.log('✅ [AI SERVICE] Chat history cleared')
    } catch (err: any) {
      console.error('❌ [AI SERVICE] Clear error:', err)
      // Silently fail
    }
  },

  /**
   * Get AI response with streaming (for future implementation)
   */
  async *streamMessage(
    userMessage: string,
    context: string = 'general',
    previousMessages?: ChatMessage[]
  ): AsyncGenerator<string> {
    try {
      console.log('🤖 [AI SERVICE] Starting stream')

      // For now, we'll collect the full response
      // In future, implement true streaming via Edge Functions
      const response = await this.sendMessage(userMessage, context, previousMessages)
      yield response
    } catch (err: any) {
      console.error('❌ [AI SERVICE] Stream error:', err)
      throw err
    }
  },

  /**
   * Get chat history for a user in a specific context
   */
  async getChatHistory(
    userId: string,
    context: string = 'general',
    limit: number = 20
  ): Promise<ChatMessage[]> {
    try {
      console.log(`📚 [AI SERVICE] Loading chat history for ${userId}`)

      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, role, content, context, created_at')
        .eq('user_id', userId)
        .eq('context', context)
        .order('created_at', { ascending: true })
        .limit(limit)

      if (error) {
        if (error.message?.includes('chat_messages') || error.message?.includes('not exist')) {
          console.warn('⚠️ [AI SERVICE] Chat messages table not set up yet')
          return []
        }
        throw error
      }

      console.log(`✅ [AI SERVICE] Loaded ${data?.length || 0} messages`)
      return data?.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        context: msg.context,
      })) || []
    } catch (err: any) {
      console.error('❌ [AI SERVICE] Error loading chat history:', err)
      return []
    }
  },

  /**
   * Delete chat message
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error
      console.log(`✅ [AI SERVICE] Message ${messageId} deleted`)
    } catch (err: any) {
      console.error('❌ [AI SERVICE] Error deleting message:', err)
      throw err
    }
  },

  /**
   * Clear chat history for a user in a specific context
   */
  async clearChatHistory(userId: string, context: string = 'general'): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', userId)
        .eq('context', context)

      if (error) throw error
      console.log(`✅ [AI SERVICE] Chat history cleared for context: ${context}`)
    } catch (err: any) {
      console.error('❌ [AI SERVICE] Error clearing chat history:', err)
      throw err
    }
  },
}

export default aiService