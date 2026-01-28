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
    context: string = 'general',
    previousMessages?: ChatMessage[]
  ): Promise<string> {
    try {
      console.log('🤖 [AI SERVICE] Sending message to Gemini API')

      // Call Supabase Edge Function which handles Gemini API safely
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: userMessage,
          context,
          previousMessages: previousMessages || [],
        },
      })

      if (error) {
        // Check if function exists
        if (error.message?.includes('ai-chat') || error.message?.includes('404')) {
          console.warn('⚠️ [AI SERVICE] Edge Function not deployed yet - returning placeholder response')
          return `Hmm, AI asistent nije dostupan (Edge Function nije deployovan). Trebate da pokrenete: supabase functions deploy ai-chat`
        }
        console.error('❌ [AI SERVICE] Function error:', error)
        throw new Error(`AI Service error: ${error.message}`)
      }

      console.log('✅ [AI SERVICE] Response received')
      return data.response
    } catch (err: any) {
      console.error('❌ [AI SERVICE] Error:', err)
      
      // Fallback for missing Edge Function
      if (err.message?.includes('ai-chat')) {
        return `AI asistent nije dostupan. Prvo trebate da deployujete Edge Function.`
      }
      
      throw new Error(err.message || 'Greška pri komunikaciji sa AI asistentom')
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
