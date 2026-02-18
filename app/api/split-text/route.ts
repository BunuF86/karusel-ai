import { NextRequest, NextResponse } from 'next/server'

interface SlideData {
  type: 'cover' | 'content' | 'cta'
  headline: string
  subtitle?: string
  emoji?: string
  item_number?: string
  bullets?: string[]
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
      bullets: ['הוסיפו פרט ראשון', 'הוסיפו פרט שני', 'הוסיפו פרט שלישי'],
    })
    slides.push({
      type: 'content',
      headline: 'נקודה שנייה',
      item_number: '2',
      bullets: ['הוסיפו פרט ראשון', 'הוסיפו פרט שני', 'הוסיפו פרט שלישי'],
    })
    slides.push({
      type: 'content',
      headline: 'נקודה שלישית',
      item_number: '3',
      bullets: ['הוסיפו פרט ראשון', 'הוסיפו פרט שני', 'הוסיפו פרט שלישי'],
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
      const bullets = dashParts.slice(1).join(' - ').split(', ').map(b => b.trim()).filter(Boolean)
      slides.push({
        type: 'content',
        headline,
        item_number: String(i + 1),
        bullets,
      })
    } else {
      slides.push({
        type: 'content',
        headline: line.length > 60 ? line.slice(0, 57) + '...' : line,
        item_number: String(i + 1),
        bullets: [],
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

// OpenAI-powered splitter
async function aiSplit(text: string, mode: string): Promise<SlideData[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.log('[split-text] No OpenAI key, using rule-based splitter')
    return ruleBasedSplit(text, mode)
  }

  const systemPrompt = `אתה מומחה ליצירת קרוסלות לאינסטגרם. המשימה שלך: לקחת טקסט ולהפוך אותו לקרוסלה.
  
  החזר JSON בלבד, ללא הסברים נוספים, בפורמט הבא:
  {
    "slides": [
      {"type": "cover", "headline": "כותרת ראשית קצרה", "subtitle": "כיתוב משנה", "emoji": "🔥"},
      {"type": "content", "headline": "כותרת", "item_number": "1", "bullets": ["נקודה א", "נקודה ב", "נקודה ג"]},
      {"type": "cta", "headline": "קריאה לפעולה", "subtext": "טקסט קצר", "button_text": "עקבו", "emoji": "👇"}
    ]
  }
  
  כללים:
  - כותרות: קצרות, מושכות, עד 50 תווים
  - כל שקופית תוכן: 2-4 נקודות (bullets)
  - מקסימום 8 שקופיות כולל cover ו-CTA
  - שפה: עברית, RTL
  - אל תמציא עובדות — השתמש רק במה שיש בטקסט`

  const userPrompt = mode === 'ai'
    ? `כתוב קרוסלה שלמה על הנושא: "${text}"`
    : `פרק את הטקסט הבא לקרוסלה:\n\n${text}`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
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
  return parsed.slides as SlideData[]
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
