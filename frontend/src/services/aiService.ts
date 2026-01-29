import { supabase } from './supabaseClient'

interface ChatMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  context?: string
}

export const aiService = {
  /**
   * Send message to AI and get response
   */
  async sendMessage(
    userMessage: string,
    _context: string = 'general',
    previousMessages?: ChatMessage[]
  ): Promise<string> {
    try {
      console.log('🤖 [AI SERVICE] Sending message via Netlify Function')

      // Call our Netlify serverless function instead of Gemini API directly
      const response = await fetch('/.netlify/functions/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: _context,
          previousMessages: previousMessages || [],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ Function error:', data)
        return `Greška: ${data.error || 'Unknown error'}`
      }

      console.log('✅ Response received')
      return data.response || 'Nema odgovora'
    } catch (err: any) {
      console.error('❌ [AI SERVICE] Error:', err)
      return `Greška: ${err.message}`
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
      throw err
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

      if (error) throw error

      // Reverse to get chronological order
      return (data || []).reverse()
    } catch (err: any) {
      console.error('❌ [AI SERVICE] History fetch error:', err)
      throw err
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
      throw err
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
}
