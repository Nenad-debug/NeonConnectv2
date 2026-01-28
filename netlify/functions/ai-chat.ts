// Supabase Edge Function for Google Gemini API
// Deploy with: supabase functions deploy ai-chat

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, context, previousMessages } = await req.json()

    // Validate input
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid message' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Get Gemini API key from environment
    const apiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY')
    if (!apiKey) {
      console.error('Missing GOOGLE_GEMINI_API_KEY')
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: corsHeaders }
      )
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
      parts: [{ text: message }],
    })

    // System prompt based on context
    const systemPrompts = {
      profile_setup:
        'Помози кориснику да попуни свој профил. Дај краће и јасније одговоре. Буди пријатан и подстицајан.',
      general:
        'Си NeonConnect AI асистент. Помаж корисницима са питањима везаним за посао, каријеру и развој. Буди користан, пријатан и брз у одговорима.',
      default: 'Си помоћни AI асистент на NeonConnect платформи.',
    }

    const systemPrompt =
      systemPrompts[context as keyof typeof systemPrompts] || systemPrompts.default

    // Call Google Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: conversationHistory,
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('Gemini API error:', error)
      return new Response(
        JSON.stringify({ error: 'AI service error', details: error }),
        { status: response.status, headers: corsHeaders }
      )
    }

    const result = await response.json()

    // Extract response text
    const aiResponse =
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Извините, нисам могао генерисати одговор.'

    return new Response(
      JSON.stringify({
        response: aiResponse,
        success: true,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: corsHeaders }
    )
  }
})
