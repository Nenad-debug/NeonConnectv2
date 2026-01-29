// Netlify Serverless Function for AI Chat
// Enhanced with timeout, retry logic, and better error handling

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
  let timeoutId: any = null
  try {
    // Create abort controller for timeout
    const controller = new AbortController()
    timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
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

export const handler = async (event: any) => {
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
      console.error('❌ Invalid message format')
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Nevazeća poruka - obavezna je tekstualna poruka' }),
      }
    }

    // Sanitize message to prevent injection attacks
    if (message.length > 5000) {
      console.error('❌ Message too long')
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Poruka je preslužna (max 5000 karaktera)' }),
      }
    }

    // Get AIML API key
    const apiKey = process.env.AIML_API_KEY
    if (!apiKey) {
      console.error('❌ AIML_API_KEY not set')
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'AI servis nije dostupan - pokušajte kasnije' }),
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
      profile_setup: `Си NeonConnect AI асистент за постављање профила. Помози кориснику да попуни и унапреди свој профил коначних.

ВАЖНО: Кориснику је покренут Profile Wizard! Твој задатак је да:
1. Буди као квалификован саветник (kao mentor)
2. Даваш мотивацију за сваку поља
3. Питаш дополнитних питања ако је одговор неасан
4. На крају препоручи добре послове базирано на профилу

О NeonConnect платформи:
- NeonConnect је модерна платформа за запошљавање са AI асистентом
- Намењена је за кандидате (тражиће посла) и послодавце (компаније)
- Омогућава: прегледање послова, пријаву на позиције, управљање профилом, контакт са компанијама

За кандидате:
- Наставак/профил: додај искуство, вештине, образовање
- Премести послове у "Сачувано" категорију
- Прими препоруке посла базирано на твом профилу
- Примени одмах за позиције са само једним кликом

Помози кориснику да:
1. Допуни све неопходне информације у профилу
2. Напише добру биографију са кључним вештинама
3. Додаст професионалну слику/аватар
4. Наведе своју искуства и образовање
5. Буде реалан и искрен при попуњавању

Буди подстицајан, позитиван и дај конкретне савете за побољшање профила. Помогни му да препознa своју вредност!`,
      
      job_search: `Си NeonConnect AI асистент за претрагу посла. Помози кориснику да пронађе идеалну позицију.

О NeonConnect платформи:
- NeonConnect је платформа за запошљавање са препорукама управљаним помоћу AI
- Наша база садржи хиљаде отворених позиција
- Алгоритам препорука подстиче најбоље опције за тебе

Функционалности за кандидате:
- Претрага послова: филтер по занимању, локацији, нивоу искуства, плати
- Препоручени послови: персонализоване препоруке на основу твог профила
- Сачувани послови: одложи интересантне позиције за касније
- Једна клик пријава: пријави се одмах са својим профилом
- Известување: добиј алерте за нове послове који се подударају са твоим критеријумима

Помози кориснику:
1. Да суфилтира послове по својим критеријумима
2. Да разуме шта компаније траже
3. Да припреми добру аппликацију
4. Да разуме шта је добра плата за негову позицију

Буди користан и подстиче кориснику да аплицира на позиције.`,

      employer: `Си NeonConnect AI асистент за послодавце. Помози компанијама да нађе идеалне кандидате.

О NeonConnect платформи:
- NeonConnect помоћ компанијама да пријављују отворене позиције
- AI мечинг систему препоручује квалификоване кандидате
- Компаније могу контактирати кандидате директно
- Детаљна управљање апликацијама и праћење процеса

За послодавце NeonConnect омогућава:
- Објављивање poslova: детаљан опис позиције са захтевима
- Управљање апликацијама: преглед и филтрирање кандидата
- AI препоруке: аутоматски примљене најдобрије кандидате
- Контакт са кандидатима: пошаљи поруку или позови на интервју
- Управљање тимом: додели позиције колегама

Помози послодавцу:
1. Да напише добар описа посла
2. Да разуме шта kandidati tražu
3. Да филтира и процени кандидате
4. Да припреми интервју питања
5. Да направи добру понуду за кандидата

Буди стручан и помози послодавцу да нађе финалног кандидата.`,

      general: `Си NeonConnect AI асистент. Помоћ корисницима (кандидатима и послодавцима) да користе платформу.

О NeonConnect:
- Модерна платформа за запошљавање са AI асистентом
- За кандидате: претрага послова, управљање профилом, пријава на позиције
- За послодавце: објављивање послова, управљање апликацијама, контакт са кандидатима
- AI система препоручује идеалне мачеве између кандидата и позиција

Шта можеш радити:
1. Одговорити на питања о NeonConnect платформи
2. Помоћ кориснику да користи функционалности
3. Дати савете за претрагу посла (за кандидате)
4. Дати савете за пријаву на позиције
5. Помоћ са постављањем профила
6. Одговорити на питања о каријери и развоју
7. Дати советеу припреми за интервју

КЉУЧНЕ ИНФОРМАЦИЈЕ за одговоре:

Кандидати питају често:
- "Како пријавити на посао?" → Кликни на посао, кликни "Пријави се" (користи своју профилну слику и информације)
- "Како сачувати посао?" → Кликни иконицу са срцем на картички посла → "Сачувано" табе
- "Како компаније контактирају?" → Преко e-mail и поруке на платформи (додај лични email у профилу)
- "Шта је добра плата?" → Зависи од искуства, локације и индустрије (могу дати опште наводе)

Послодавци питају честоа:
- "Како објавити посао?" → Иди на "Пост a Job" одељак, попуни захтеве и обаљави
- "Како контактирати кандидате?" → Кроз платформу са персоналном поруком (препоручи интервју)
- "Како гледати аппликације?" → Иди на Dashboard → Applications tabela

Буди користан, пријатан, краћ у одговорима и брз. Ако није јасно шта кориснику требa, питај детаљне питања.`,

      default: 'Си помоћни AI асистент на NeonConnect платформи за запошљавање. Помоћ кориснику са питањима и функционалностима.',
    }

    const systemPrompt = systemPrompts[context] || systemPrompts.default

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
      return {
        statusCode: 503,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'AI servis privremeno nedostupan - pokušajte za nekoliko sekundi',
        }),
      }
    }

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ AIML API error:', data)

      // Handle specific error cases
      if (response.status === 401) {
        return {
          statusCode: 500,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Greška autentifikacije AI servisa' }),
        }
      } else if (response.status === 429) {
        return {
          statusCode: 429,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'Previše zahteva - pokušajte za nekoliko sekundi',
          }),
        }
      }

      return {
        statusCode: response.status,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: data.error?.message || 'AI servis je vratio grešku',
        }),
      }
    }

    // Extract response text from AIML (GPT-3.5)
    const responseText =
      data.choices?.[0]?.message?.content ||
      'Izvinjavam se, nisam mogao da generiram odgovor. Pokušajte ponovo.'

    console.log('✅ AIML response received successfully')
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: responseText }),
    }
  } catch (error: any) {
    console.error('❌ AI Function error:', error.message)

    // Generic error response
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Greška na serveru - pokušajte kasnije',
      }),
    }
  }
}
