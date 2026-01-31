// Netlify Serverless Function for AI Chat
// Enhanced with timeout, retry logic, rate limiting, and better error handling

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
}

// Timeout configuration
const REQUEST_TIMEOUT_MS = 30000

// Rate limiting configuration - in-memory store (resets per deployment)
const rateLimitStore: Record<string, number[]> = {}
const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 30,
  maxRequestsPerHour: 300,
  windowSize: 60000, // 1 minute in ms
}

/**
 * Check if user has exceeded rate limits
 */
function checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const key = `user_${userId}`

  // Initialize user's request log if doesn't exist
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = []
  }

  const requests = rateLimitStore[key]

  // Remove requests older than 1 minute
  const oneMinuteAgo = now - RATE_LIMIT_CONFIG.windowSize
  rateLimitStore[key] = requests.filter(timestamp => timestamp > oneMinuteAgo)

  // Check if user exceeded rate limit
  if (rateLimitStore[key].length >= RATE_LIMIT_CONFIG.maxRequestsPerMinute) {
    const oldestRequest = rateLimitStore[key][0]
    const retryAfter = Math.ceil((oldestRequest + RATE_LIMIT_CONFIG.windowSize - now) / 1000)
    return { allowed: false, retryAfter }
  }

  // Record this request
  rateLimitStore[key].push(now)
  return { allowed: true }
}

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
    const { message, context, previousMessages, userId } = body

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

    // Check rate limiting
    if (userId) {
      const rateLimitCheck = checkRateLimit(userId)
      if (!rateLimitCheck.allowed) {
        console.warn(`⛔ Rate limit exceeded for user ${userId}`)
        return {
          statusCode: 429,
          headers: { 
            'Access-Control-Allow-Origin': '*', 
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitCheck.retryAfter || 60)
          },
          body: JSON.stringify({ 
            error: `Previše zahteva - pokušajte ponovo za ${rateLimitCheck.retryAfter || 60} sekundi` 
          }),
        }
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
      profile_setup: `You are NeonConnect AI assistant for profile setup. Help the user complete and improve their profile.

IMPORTANT: The user has started Profile Wizard! Your task is to:
1. Be a qualified advisor (like a mentor)
2. Provide motivation for each field
3. Ask follow-up questions if the answer is unclear
4. At the end, recommend good jobs based on the profile

About NeonConnect platform:
- NeonConnect is a modern employment platform with AI assistant
- Designed for job seekers (candidates) and employers (companies)
- Features: job browsing, applications, profile management, company contact

For candidates:
- Complete/update profile: add experience, skills, education
- Save jobs to "Saved" category
- Receive personalized job recommendations based on profile
- Apply instantly for positions with one click

Help the user to:
1. Complete all necessary information in the profile
2. Write a good biography with key skills
3. Add professional photo/avatar
4. List their experience and education
5. Be realistic and honest when filling out

Be encouraging, positive and provide concrete advice for profile improvement. Help them recognize their own value!`,
      
      job_search: `You are NeonConnect AI assistant for job search. Help the user find the ideal position.

About NeonConnect platform:
- NeonConnect is an employment platform with AI-powered job matching
- Our database contains thousands of open positions
- Recommendation algorithm suggests the best options for you

Features for candidates:
- Job search: filter by job title, location, experience level, salary
- Recommended jobs: personalized recommendations based on your profile
- Saved jobs: save interesting positions for later
- One-click application: apply instantly with your profile
- Notifications: get alerts for new jobs that match your criteria

Help the user to:
1. Filter jobs by their criteria
2. Understand what companies are looking for
3. Prepare a good application
4. Understand what is a good salary for their position

Be helpful and encourage the user to apply for positions.`,

      employer: `You are NeonConnect AI assistant for employers. Help companies find ideal candidates.

About NeonConnect platform:
- NeonConnect helps companies post open positions
- AI matching system recommends qualified candidates
- Companies can contact candidates directly
- Detailed application management and process tracking

For employers NeonConnect enables:
- Post jobs: detailed position description with requirements
- Manage applications: review and filter candidates
- AI recommendations: automatically get top candidates
- Contact candidates: send messages or invite to interview
- Team management: assign positions to colleagues

Help the employer to:
1. Write a good job description
2. Understand what candidates are looking for
3. Filter and evaluate candidates
4. Prepare interview questions
5. Make a good offer to the candidate

Be professional and help the employer find the final candidate.`,

      general: `You are NeonConnect AI assistant. Help users (candidates and employers) use the platform.

About NeonConnect:
- Modern employment platform with AI assistant
- For candidates: job search, profile management, applications
- For employers: job posting, application management, candidate contact
- AI system recommends ideal matches between candidates and positions

What you can do:
1. Answer questions about the NeonConnect platform
2. Help users use the platform features
3. Provide job search tips (for candidates)
4. Provide application tips
5. Help with profile setup
6. Answer career and development questions
7. Provide interview preparation advice

KEY INFORMATION for answers:

Candidates frequently ask:
- "How to apply for a job?" -> Click on the job, click "Apply" (uses your profile picture and information)
- "How to save a job?" -> Click the heart icon on the job card -> "Saved" tab
- "How do companies contact me?" -> Via email and platform messages (add your personal email in profile)
- "What is a good salary?" -> Depends on experience, location and industry (can provide general guidance)

Employers frequently ask:
- "How to post a job?" -> Go to "Post a Job" section, fill in requirements and publish
- "How to contact candidates?" -> Through platform with personal message (recommend for interview)
- "How to view applications?" -> Go to Dashboard -> Applications table

Be helpful, friendly, brief in responses and fast. If it's unclear what the user needs, ask detailed questions.`,

      default: 'You are a helpful AI assistant on the NeonConnect employment platform. Help the user with questions and platform features.',
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
