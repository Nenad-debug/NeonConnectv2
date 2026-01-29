// Netlify Serverless Function for AI Chat (lives in frontend/ so base dir finds it)
// Enhanced with timeout, retry logic, and better error handling

const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
}

const REQUEST_TIMEOUT_MS = 30000

async function retryFetch(
  url: string,
  options: RequestInit,
  retries = 0
): Promise<Response> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  try {
    const controller = new AbortController()
    timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    const response = await fetch(url, { ...options, signal: controller.signal })
    if (timeoutId) clearTimeout(timeoutId)
    return response
  } catch (error: any) {
    if (timeoutId) clearTimeout(timeoutId)
    const isTimeoutError = error.name === 'AbortError'
    const isNetworkError = error instanceof TypeError
    if ((isTimeoutError || isNetworkError) && retries < RETRY_CONFIG.maxRetries) {
      const delayMs = Math.min(
        RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, retries),
        RETRY_CONFIG.maxDelayMs
      )
      await new Promise((resolve) => setTimeout(resolve, delayMs))
      return retryFetch(url, options, retries + 1)
    }
    throw error
  }
}

export const handler = async (event: any) => {
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
    let body = event.body
    if (typeof body === 'string') body = JSON.parse(body)
    const { message, context, previousMessages } = body || {}

    if (!message || typeof message !== 'string') {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Nevazeća poruka - obavezna je tekstualna poruka' }),
      }
    }
    if (message.length > 5000) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Poruka je preslužna (max 5000 karaktera)' }),
      }
    }

    const apiKey = process.env.AIML_API_KEY
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'AI servis nije dostupan - pokušajte kasnije' }),
      }
    }

    const conversationHistory = previousMessages
      ?.filter((m: any) => m.role && m.content)
      .map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })) || []
    conversationHistory.push({ role: 'user', content: message })

    const systemPrompts: Record<string, string> = {
      profile_setup: `Си NeonConnect AI асистент за постављање профила. Помози кориснику да попуни и унапреди свој профил. Кориснику је покренут Profile Wizard - буди као квалификован саветник, давај мотивацију, питај додатна питања ако је одговор нејасан. На крају препоручи добре послове базирано на профилу. Буди подстицајан и позитиван.`,
      job_search: `Си NeonConnect AI асистент за претрагу посла. Помози кориснику да пронађе идеалну позицију. О NeonConnect: платформа за запошљавање са AI препорукама. Помози да филтрира послове, разуме шта компаније траже, припреми апликацију. Буди користан и подстиче апликације.`,
      employer: `Си NeonConnect AI асистент за послодавце. Помози компанијама да нађу идеалне кандидате. Функције: објављивање послова, управљање апликацијама, AI препоруке, контакт са кандидатима. Буди стручан.`,
      general: `Си NeonConnect AI асистент. Помоћ корисницима да користе платформу - претрага послова, профил, пријаве, савети за каријеру и интервју. Буди користан и кратак.`,
      default: 'Си AI асистент на NeonConnect платформи за запошљавање. Помоћ са питањима и функционалностима.',
    }
    const systemPrompt = systemPrompts[context] || systemPrompts.default

    let aimlResponse: Response
    try {
      aimlResponse = await retryFetch(
        'https://api.aimlapi.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'system', content: systemPrompt }, ...conversationHistory],
            temperature: 0.7,
            max_tokens: 1024,
          }),
        }
      )
    } catch (fetchError: any) {
      return {
        statusCode: 503,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'AI servis privremeno nedostupan - pokušajte za nekoliko sekundi' }),
      }
    }

    const data = await aimlResponse.json()
    if (!aimlResponse.ok) {
      const msg = aimlResponse.status === 429
        ? 'Previše zahteva - pokušajte za nekoliko sekundi'
        : (data.error?.message || 'AI servis je vratio grešku')
      return {
        statusCode: aimlResponse.status === 401 ? 500 : aimlResponse.status,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: msg }),
      }
    }

    const responseText =
      data.choices?.[0]?.message?.content ||
      'Izvinjavam se, nisam mogao da generiram odgovor. Pokušajte ponovo.'

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: responseText }),
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Greška na serveru - pokušajte kasnije' }),
    }
  }
}
