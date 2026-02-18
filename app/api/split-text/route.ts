import { NextRequest, NextResponse } from 'next/server'

interface SlideData {
  type: 'cover' | 'content' | 'cta'
  headline: string
  subtitle?: string
  emoji?: string
  item_number?: string
  body?: string
  subtext?: string
  button_text?: string
}

// Rule-based fallback splitter (when no OpenAI key)
function ruleBasedSplit(text: string, mode: string): SlideData[] {
  // Split by newlines first; if too few lines, also split by ". " (period-sentences)
  let lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length <= 2) {
    // Try splitting by ". " or "." followed by space
    const sentenceSplit = text.split(/\.\s+/).map(l => l.trim()).filter(Boolean)
    if (sentenceSplit.length > lines.length) lines = sentenceSplit
  }
  // Also try splitting by commas if still too few
  if (lines.length <= 2) {
    const commaSplit = text.split(/,\s*/).map(l => l.trim()).filter(Boolean)
    if (commaSplit.length > lines.length) lines = commaSplit
  }

  const slides: SlideData[] = []

  // If only 1-2 short lines (topic mode / AI mode), create template slides the user can edit
  if (lines.length <= 2 && text.length < 200) {
    const topic = lines[0] || 'הקרוסלה שלי'
    slides.push({
      type: 'cover',
      headline: topic.length > 60 ? topic.slice(0, 57) + '...' : topic,
      subtitle: '',
      emoji: '🚀',
    })
    // Generate 3 editable content slides as templates
    slides.push({
      type: 'content',
      headline: 'נקודה ראשונה',
      item_number: '1',
      body: 'הוסיפו כאן טקסט מעניין שמסביר את הנקודה הראשונה. כמה משפטים קצרים שנותנים ערך אמיתי.',
    })
    slides.push({
      type: 'content',
      headline: 'נקודה שנייה',
      item_number: '2',
      body: 'הוסיפו כאן טקסט מעניין שמסביר את הנקודה השנייה. כמה משפטים קצרים שנותנים ערך אמיתי.',
    })
    slides.push({
      type: 'content',
      headline: 'נקודה שלישית',
      item_number: '3',
      body: 'הוסיפו כאן טקסט מעניין שמסביר את הנקודה השלישית. כמה משפטים קצרים שנותנים ערך אמיתי.',
    })
    slides.push({
      type: 'cta',
      headline: 'רוצים עוד תוכן כזה?',
      subtext: 'עקבו אחריי לעוד טיפים',
      button_text: 'עקבו',
      emoji: '👇',
    })
    return slides
  }

  // Cover slide from first line
  const coverHeadline = lines[0] || 'הקרוסלה שלי'
  slides.push({
    type: 'cover',
    headline: coverHeadline.length > 60 ? coverHeadline.slice(0, 57) + '...' : coverHeadline,
    subtitle: '',
    emoji: '🚀',
  })

  // Content slides: each line/sentence is its own slide
  const contentLines = lines.slice(1)
  contentLines.forEach((line, i) => {
    if (!line || i >= 6) return
    // Try to split "Title - detail1, detail2" pattern
    const dashParts = line.split(' - ')
    if (dashParts.length >= 2) {
      const headline = dashParts[0].trim()
      const bodyParts = dashParts.slice(1).join(' - ').split(', ').map(b => b.trim()).filter(Boolean)
      slides.push({
        type: 'content',
        headline,
        item_number: String(i + 1),
        body: bodyParts.join('. '),
      })
    } else {
      slides.push({
        type: 'content',
        headline: line.length > 60 ? line.slice(0, 57) + '...' : line,
        item_number: String(i + 1),
        body: '',
      })
    }
  })

  // CTA slide
  slides.push({
    type: 'cta',
    headline: 'רוצים עוד תוכן כזה?',
    subtext: 'עקבו אחריי לעוד טיפים',
    button_text: 'עקבו',
    emoji: '👇',
  })

  return slides
}

// AI-powered splitter (Groq or OpenAI)
async function aiSplit(text: string, mode: string): Promise<SlideData[]> {
  // Try Groq first (free), then OpenAI
  const groqKey = process.env.GROQ_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY
  
  if (!groqKey && !openaiKey) {
    console.log('[split-text] No AI key, using rule-based splitter')
    return ruleBasedSplit(text, mode)
  }

  const apiUrl = groqKey 
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions'
  const apiKey = groqKey || openaiKey
  const model = groqKey ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini'

  console.log(`[split-text] Using ${groqKey ? 'Groq' : 'OpenAI'} with ${model}`)

  const systemPrompt = `אתה מומחה ליצירת קרוסלות לאינסטגרם בעברית. המשימה שלך: לקחת טקסט או נושא ולהפוך אותו לקרוסלה מקצועית.
  
  החזר JSON בלבד, ללא הסברים נוספים, בפורמט הבא:
  {
    "slides": [
      {"type": "cover", "headline": "כותרת ראשית קצרה ומושכת", "subtitle": "", "emoji": "🔥"},
      {"type": "content", "headline": "כותרת שקופית", "item_number": "1", "body": "טקסט זורם ומעניין שמסביר את הנקודה. כמה משפטים קצרים שנותנים ערך אמיתי ופרקטי."},
      {"type": "cta", "headline": "קריאה לפעולה", "subtext": "טקסט משכנע קצר", "button_text": "עקבו", "emoji": "👇"}
    ]
  }
  
  כללים חשובים:
  - כותרת cover: קצרה, מושכת, עד 40 תווים, בלי subtitle
  - כל שקופית תוכן: כותרת חזקה + שדה body עם 2-3 משפטים זורמים בעברית טבעית (לא נקודות, לא רשימות!)
  - שדה body: טקסט פסקאות רציף, מעניין, שימושי — כ-15-30 מילים לשקופית
  - 4-6 שקופיות תוכן (לא פחות מ-3!)
  - מקסימום 8 שקופיות כולל cover ו-CTA
  - שפה: עברית טבעית, לא פורמלית מדי
  - כותרות: בלי מקף בהתחלה. כלל קריטי: אסור מילה בודדת בשורה! מינימום 2 מילים בכל שורה תמיד. אם הכותרת היא מילה אחת — הוסף מילה נוספת (לדוגמה: במקום "ChatGPT" תכתוב "הכלי ChatGPT" או "כלי ChatGPT")
  - התוכן חייב להיות מעניין, פרקטי ושימושי — לא גנרי
  - אם קיבלת נושא קצר — תמציא תוכן איכותי ורלוונטי על הנושא
  - אימוג'י ב-cover שמתאים לנושא`

  const userPrompt = mode === 'ai'
    ? `כתוב קרוסלה שלמה ומפורטת על הנושא: "${text}". צור לפחות 4 שקופיות תוכן עם נקודות מעשיות.`
    : `פרק את הטקסט הבא לקרוסלה מקצועית:\n\n${text}`

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI error: ${err}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response from OpenAI')

  const parsed = JSON.parse(content)
  // Post-process: enforce min 2 words per line in headlines and body
  const slides = (parsed.slides as SlideData[]).map(s => {
    // Fix single-word headlines
    if (s.headline) {
      const lines = s.headline.split('\n')
      s.headline = lines.map(line => {
        const words = line.trim().split(/\s+/)
        if (words.length === 1 && words[0].length > 0) {
          // Single word line — prefix with a relevant word
          return `הכלי ${line.trim()}`
        }
        return line
      }).join('\n')
    }
    // Fix single-word lines in body text
    if (s.body) {
      const lines = s.body.split('\n')
      s.body = lines.map(line => {
        const words = line.trim().split(/\s+/)
        if (words.length === 1 && words[0].length > 0) {
          return `${line.trim()} —`
        }
        return line
      }).join('\n')
    }
    return s
  })
  return slides
}

export async function POST(req: NextRequest) {
  try {
    const { text, mode = 'text' } = await req.json()

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'נדרש טקסט' }, { status: 400 })
    }

    if (text.length > 10000) {
      return NextResponse.json({ error: 'הטקסט ארוך מדי (מקסימום 10,000 תווים)' }, { status: 400 })
    }

    const slides = await aiSplit(text.trim(), mode)

    return NextResponse.json({ slides, count: slides.length })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[split-text] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
