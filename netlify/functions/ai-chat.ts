// Netlify Serverless Function for Google Gemini API

exports.handler = async (event: any) => {
  console.log('📨 AI Function invoked')
  console.log('Method:', event.httpMethod)
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    }
  }

  try {
    // Parse body
    let body = event.body
    if (typeof body === 'string') {
      body = JSON.parse(body)
    }
    const { message, context, previousMessages } = body

    console.log('📨 Message received:', { message, context })

    // Validate input
    if (!message || typeof message !== 'string') {
      console.error('❌ Invalid message')
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid message' }),
      }
    }

    // Get AIML API key
    const apiKey = process.env.AIML_API_KEY
    if (!apiKey) {
      console.error('❌ AIML_API_KEY not set')
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'API key not configured' }),
      }
    }
    console.log('✅ AIML API key found')

    // Build conversation history for AIML
    const conversationHistory = previousMessages
      ?.filter((m: any) => m.role && m.content)
      .map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })) || []

    // Add current message
    conversationHistory.push({
      role: 'user',
      content: message,
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

    // Call AIML API (OpenAI-compatible)
    const response = await fetch(
      `https://api.aimlapi.com/v1/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ AIML API error:', data)
      return {
        statusCode: response.status,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: data.error?.message || 'AIML API error' }),
      }
    }

    // Extract response text from AIML (GPT-3.5)
    const responseText =
      data.choices?.[0]?.message?.content ||
      'Извините, нема одговора од AI-а.'

    console.log('✅ AIML response received')
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: responseText }),
    }
  } catch (error: any) {
    console.error('❌ AI Function error:', error)
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message || 'Internal server error',
      }),
    }
  }
}
