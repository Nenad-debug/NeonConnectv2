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

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY
      if (!apiKey) {
        throw new Error('Gemini API ključ nije postavljen. Proveri .env datoteku.')
      }
      
      // Build conversation history
      const conversationHistory = previousMessages
        ?.filter((m: any) => m.role && m.content)
        .map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })) || []

      // Add current message
      conversationHistory.push({
        role: 'user',
        parts: [{ text: userMessage }],
      })

      // System prompt
      const systemPrompts: Record<string, string> = {
        profile_setup: 'Помози кориснику да попуни свој профил. Дај краће и јасније одговоре. Буди пријатан и подстицајан.',
        general: 'Си NeonConnect AI асистент. Помаж корисницима са питањима везаним за посао, каријеру и развој. Буди користан, пријатан и брз у одговорима.',
      }
      const systemPrompt = systemPrompts[context] || systemPrompts.general

      // Call Gemini API directly
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: conversationHistory,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            ],
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ Gemini API error:', data)
        return `Gemini greška: ${data.error?.message || 'Unknown error'}`
      }

      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Nema odgovora'
      console.log('✅ Gemini response received')
      return responseText
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
