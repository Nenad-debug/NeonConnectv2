// Netlify Serverless Function for Google Gemini API
// Deploy automatically with: netlify deploy

export default async (event: any) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: '',
    }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const { message, context, previousMessages } = body

    // Validate input
    if (!message || typeof message !== 'string') {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid message' }),
      }
    }

    // Get Gemini API key from environment
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      console.error('Missing GOOGLE_GEMINI_API_KEY environment variable')
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'API key not configured' }),
      }
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
    const systemPrompts: Record<string, string> = {
      profile_setup:
        'Помози кориснику да попуни свој профил. Дај краће и јасније одговоре. Буди пријатан и подстицајан.',
      general:
        'Си NeonConnect AI асистент. Помаж корисницима са питањима везаним за посао, каријеру и развој. Буди користан, пријатан и брз у одговорима.',
      default: 'Си помоћни AI асистент на NeonConnect платформи.',
    }

    const systemPrompt = systemPrompts[context] || systemPrompts.default

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

    const data = await response.json()

    if (!response.ok) {
      console.error('Gemini API error:', data)
      return {
        statusCode: response.status,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          error: data.error?.message || 'Gemini API error',
        }),
      }
    }

    // Extract response text
    const responseText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Извините, нема одговора од AI-а.'

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ response: responseText }),
    }
  } catch (error: any) {
    console.error('AI Function error:', error)
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        error: error.message || 'Internal server error',
      }),
    }
  }
}
