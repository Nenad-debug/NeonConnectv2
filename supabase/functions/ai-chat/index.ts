// Supabase Edge Function for AI Chat
// Enhanced with timeout, retry logic, and better error handling

// Type declaration for Deno environment
declare const Deno: {
  env: {
    get: (key: string) => string | undefined
  }
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
}

// Timeout configuration
const REQUEST_TIMEOUT_MS = 30000

// Helper function to implement exponential backoff retry
async function retryFetch(
  url: string,
  options: RequestInit,
  retries = 0
): Promise<Response> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  try {
    // Create abort controller for timeout
    const controller = new AbortController()
    timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    if (timeoutId) clearTimeout(timeoutId)
    return response
  } catch (error: any) {
    if (timeoutId) clearTimeout(timeoutId)

    // Check if it's a timeout or network error
    const isTimeoutError = error.name === 'AbortError'
    const isNetworkError = error instanceof TypeError

    if ((isTimeoutError || isNetworkError) && retries < RETRY_CONFIG.maxRetries) {
      const delayMs = Math.min(
        RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, retries),
        RETRY_CONFIG.maxDelayMs
      )

      console.log(`⏳ Retry attempt ${retries + 1}/${RETRY_CONFIG.maxRetries} after ${delayMs}ms`)
      await new Promise((resolve) => setTimeout(resolve, delayMs))

      return retryFetch(url, options, retries + 1)
    }

    throw error
  }
}

interface ChatRequest {
  message: string
  context?: string
  previousMessages?: Array<{ role: string; content: string }>
}

export async function handler(req: Request): Promise<Response> {
  console.log('📨 AI Function invoked')
  console.log('Method:', req.method)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    // Parse body
    const body: ChatRequest = await req.json()
    const { message, context, previousMessages } = body

    console.log('📨 Message received:', { message, context })

    // Validate input
    if (!message || typeof message !== 'string') {
      console.error('❌ Invalid message format')
      return new Response(
        JSON.stringify({ error: 'Nevazeća poruka - obavezna je tekstualna poruka' }),
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        }
      )
    }

    // Sanitize message to prevent injection attacks
    if (message.length > 5000) {
      console.error('❌ Message too long')
      return new Response(
        JSON.stringify({ error: 'Poruka je preslužna (max 5000 karaktera)' }),
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        }
      )
    }

    // Get AIML API key from environment
    const apiKey = Deno.env.get('AIML_API_KEY')
    if (!apiKey) {
      console.error('❌ AIML_API_KEY not set')
      return new Response(
        JSON.stringify({ error: 'AI servis nije dostupan - pokušajte kasnije' }),
        {
          status: 500,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        }
      )
    }
    console.log('✅ AIML API key found')

    // Build conversation history for AIML
    const conversationHistory = (previousMessages || [])
      .filter((m: any) => m.role && m.content)
      .map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }))

    // Add current message
    conversationHistory.push({
      role: 'user',
      content: message,
    })

    // System prompt based on context
    const systemPrompts: Record<string, string> = {
      profile_setup: `Си NeonConnect AI асистент за постављање профила. Помози кориснику да попуни и унапреди свој профил.

ВАЖНО: Кориснику је покренут Profile Wizard! Твој задатак је да:
1. Буди као квалификован саветник
2. Даваш мотивацију за сваку поље
3. Питаш дополнитних питања ако је одговор неасан
4. На крају препоручи добре послове базирано на профилу

О NeonConnect платформи:
- NeonConnect је модерна платформа за запошљавање са AI асистентом
- Намењена је за кандидате и послодавце
- Омогућава: прегледање послова, пријаву на позиције, управљање профилом

За кандидате:
- Наставак/профил: додај искуство, вештине, образовање
- Премести послове у "Сачувано" категорију
- Прими препоруке посла базирано на твом профилу
- Примени одмах за позиције

Помози кориснику да:
1. Допуни све неопходне информације у профилу
2. Напише добру биографију са кључним вештинама
3. Додаст професионалну слику/аватар
4. Наведе своју искуства и образовање
5. Буде реалан и искрен при попуњавању

Буди подстицајан, позитиван и дај конкретне савете!`,

      job_search: `Си NeonConnect AI асистент за претрагу посла. Помози кориснику да пронађе идеалну позицију.

О NeonConnect платформи:
- Модерна платформа за запошљавање са AI препорукама
- Наша база садржи хиљаде отворених позиција
- Алгоритам препорука подстиче најбоље опције за тебе

Функционалности:
- Претрага послова: филтер по занимању, локацији, нивоу искуства
- Препоручени послови: персонализоване препоруке
- Сачувани послови: одложи интересантне позиције
- Једна клик пријава: пријави се одмах са својим профилом
- Известување: добиј алерте за нове послове

Помози кориснику:
1. Да суфилтира послове по својим критеријумима
2. Да разуме шта компаније траже
3. Да припреми добру аппликацију
4. Да разуме плате за позицију

Буди користан и подстиче кориснику да аплицира!`,

      employer: `Си NeonConnect AI асистент за послодавце. Помози компанијама да нађе идеалне кандидате.

О NeonConnect платформи:
- NeonConnect помоћ компанијама да пријављују отворене позиције
- AI мечинг систему препоручује квалификоване кандидате
- Компаније могу контактирати кандидате директно
- Детаљна управљање апликацијама

За послодавце омогућава:
- Објављивање послова: детаљан опис позиције са захтевима
- Управљање апликацијама: преглед и филтрирање кандидата
- AI препоруке: аутоматски найквалификованији кандидати
- Контакт са кандидатима: пошаљи поруку или позови на интервју

Помози послодавцу:
1. Да напише добар описа посла
2. Да разуме шта kandidati tražu
3. Да филтира и процени кандидате
4. Да припреми интервју питања
5. Да направи добру понуду

Буди стручан и помози послодавцу да нађе финалног кандидата!`,

      general: `Си NeonConnect AI асистент. Помоћ корисницима да користе платформу.

О NeonConnect:
- Модерна платформа за запошљавање са AI асистентом
- За кандидате: претрага послова, управљање профилом, пријава
- За послодавце: објављивање послова, управљање апликацијама
- AI система препоручује идеалне мачеве

Шта можеш радити:
1. Одговорити на питања о NeonConnect платформи
2. Помоћ кориснику да користи функционалности
3. Дати савете за претрагу посла
4. Помоћ са постављањем профила
5. Одговорити на питања о каријери
6. Дати советеу припреми за интервју

Кандидати питају честоа:
- "Како пријавити на посао?" → Кликни на посао, кликни "Пријави се"
- "Како сачувати посао?" → Кликни иконицу са срцем → "Сачувано"
- "Како компаније контактирају?" → Преко e-mail и поруке

Послодавци питају честоа:
- "Како објавити посао?" → Иди на "Post a Job", попуни захтеве
- "Како контактирати кандидате?" → Преко платформе са персоналном поруком
- "Како гледати аппликације?" → Dashboard → Applications

Буди користан, пријатан, краћ у одговорима!`,

      default: 'Си помоћни AI асистент на NeonConnect платформи за запошљавање. Помоћ кориснику са питањима и функционалностима.',
    }

    const systemPrompt = systemPrompts[context || 'general'] || systemPrompts.default

    // Call AIML API with retry logic
    console.log('🔄 Calling AIML API with timeout and retry...')
    let response: Response
    try {
      response = await retryFetch(
        'https://api.aimlapi.com/v1/chat/completions',
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
    } catch (fetchError: any) {
      console.error('❌ AIML API request failed after retries:', fetchError.message)
      return new Response(
        JSON.stringify({
          error: 'AI servis privremeno nedostupan - pokušajte za nekoliko sekundi',
        }),
        {
          status: 503,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        }
      )
    }

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ AIML API error:', data)

      // Handle specific error cases
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Greška autentifikacije AI servisa' }),
          {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          }
        )
      } else if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: 'Previše zahteva - pokušajte za nekoliko sekundi',
          }),
          {
            status: 429,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          }
        )
      }

      return new Response(
        JSON.stringify({
          error: data.error?.message || 'AI servis je vratio grešku',
        }),
        {
          status: response.status,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        }
      )
    }

    // Extract response text from AIML (GPT-3.5)
    const responseText =
      data.choices?.[0]?.message?.content ||
      'Izvinjavam se, nisam mogao da generiram odgovor. Pokušajte ponovo.'

    console.log('✅ AIML response received successfully')
    return new Response(JSON.stringify({ response: responseText }), {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('❌ AI Function error:', error.message)

    // Generic error response
    return new Response(
      JSON.stringify({
        error: 'Greška na serveru - pokušajte kasnije',
      }),
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      }
    )
  }
}
