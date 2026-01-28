// Netlify Serverless Function for Google Gemini API
// Deploy automatically with: netlify deploy

module.exports = async (req: any, res: any) => {
  console.log('📨 Function invoked')
  console.log('Method:', req.method)
  console.log('Headers:', req.headers)
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    return res.status(200).end()
  }

  try {
    // Parse body
    let body = req.body
    if (typeof body === 'string') {
      body = JSON.parse(body)
    }
    const { message, context, previousMessages } = body

    console.log('📨 Function called with:', { message, context })

    // Validate input
    if (!message || typeof message !== 'string') {
      console.error('❌ Invalid message:', message)
      return res.status(400).json({ error: 'Invalid message' })
    }

    // Get Gemini API key from environment
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      console.error('❌ GOOGLE_GEMINI_API_KEY is not set in environment variables')
      console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('GOOGLE')))
      return res.status(500).json({ error: 'API key not configured' })
    }
    console.log('✅ API key loaded, starting Gemini API call...')

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
      console.error('❌ Gemini API error:', data)
      return res.status(response.status).json({
        error: data.error?.message || 'Gemini API error',
      })
    }

    // Extract response text
    const responseText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Извините, нема одговора од AI-а.'

    console.log('✅ Gemini response received')
    return res.status(200).json({ response: responseText })
  } catch (error: any) {
    console.error('❌ AI Function error:', error)
    return res.status(500).json({
      error: error.message || 'Internal server error',
      details: error.toString(),
    })
  }
}
