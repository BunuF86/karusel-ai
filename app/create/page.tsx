'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

// API base URL — set NEXT_PUBLIC_API_URL on Vercel to point to our server
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

const THEMES = [
  { id: 'dark', name: 'כהה', color: '#1a1a2e' },
  { id: 'peach', name: 'אפרסק', color: '#F2D4B8' },
  { id: 'teal', name: 'טורקיז', color: '#3D9B8F' },
  { id: 'navy', name: 'נייבי', color: '#1B2A4A' },
  { id: 'sunset', name: 'שקיעה', color: '#FF6B35' },
]

interface Slide {
  type: 'cover' | 'content' | 'cta'
  headline: string
  subtitle?: string
  emoji?: string
  item_number?: string
  bullets?: string[]
  subtext?: string
  button_text?: string
}

interface GenerateResult {
  slides: { index: number; dataUrl: string }[]
  count: number
}

type Mode = 'text' | 'ai'

export default function CreatePage() {
  const [mode, setMode] = useState<Mode>('text')
  const [rawText, setRawText] = useState('')
  const [aiTopic, setAiTopic] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('dark')
  const [handle, setHandle] = useState('@bennyfarber')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSplitting, setIsSplitting] = useState(false)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [slides, setSlides] = useState<Slide[] | null>(null)
  const [step, setStep] = useState<1 | 2 | 3>(1)

  const splitText = useCallback(async () => {
    const textToSplit = mode === 'ai' ? aiTopic : rawText
    if (!textToSplit.trim()) return

    setIsSplitting(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/split-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSplit, mode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאה בפיצול הטקסט')
      setSlides(data.slides)
      setStep(2)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'שגיאה לא צפויה')
    } finally {
      setIsSplitting(false)
    }
  }, [mode, rawText, aiTopic])

  const generate = useCallback(async () => {
    if (!slides || slides.length === 0) return

    setIsGenerating(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: slides[0]?.headline || 'carousel',
          theme: selectedTheme,
          handle,
          slides,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאה ביצירת הקרוסלה')
      setResult(data)
      setStep(3)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'שגיאה לא צפויה')
    } finally {
      setIsGenerating(false)
    }
  }, [slides, selectedTheme, handle])

  const downloadAll = useCallback(async () => {
    if (!result) return
    result.slides.forEach((slide, i) => {
      const link = document.createElement('a')
      link.href = slide.dataUrl
      link.download = `karusel_slide_${String(i + 1).padStart(2, '0')}.png`
      link.click()
    })
  }, [result])

  return (
    <div className="min-h-screen bg-[#FFF0E0]">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FFF0E0]/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight text-[#111]">
            Karusel<span className="text-[#F97316]">.ai</span>
          </Link>

          {/* Step progress */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s
                    ? 'bg-[#F97316] text-white'
                    : 'bg-[#F3F4F6] text-[#9CA3AF]'
                }`}>{s}</div>
                {s < 3 && (
                  <div className={`w-8 h-0.5 rounded-full transition-all ${
                    step > s ? 'bg-[#F97316]' : 'bg-[#E5E7EB]'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-20 px-6 max-w-2xl mx-auto">

        {/* ── STEP 1: Enter content ── */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-black text-[#111] mb-1">הכניסו את התוכן</h1>
            <p className="text-[#6B7280] mb-8">הדביקו טקסט או הכניסו נושא לקרוסלה</p>

            {/* Mode toggle */}
            <div className="flex gap-1 p-1 bg-[#F3F4F6] rounded-full w-fit mb-8">
              <button
                onClick={() => setMode('text')}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  mode === 'text'
                    ? 'bg-[#FFF8F0] text-[#111] shadow-sm'
                    : 'text-[#6B7280] hover:text-[#111]'
                }`}
              >
                הכנס טקסט
              </button>
              <button
                onClick={() => setMode('ai')}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  mode === 'ai'
                    ? 'bg-[#FFF8F0] text-[#111] shadow-sm'
                    : 'text-[#6B7280] hover:text-[#111]'
                }`}
              >
                ✨ AI יכתוב בשבילי
              </button>
            </div>

            {mode === 'text' ? (
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">הטקסט שלך</label>
                <textarea
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder="הדביקו כאן נושא לקרוסלה — ה-AI יפרק אותו לשקופיות חכמות.&#10;&#10;לדוגמה: '5 כלי AI שכל יזם חייב להכיר: ChatGPT לכתיבת תוכן, Midjourney לתמונות...'"
                  className="w-full h-44 bg-[#FFF8F0] border border-black/10 rounded-2xl p-4 text-[#111] placeholder-[#9CA3AF] resize-none focus:outline-none focus:border-[#F97316] text-base leading-relaxed transition-colors"
                  dir="rtl"
                />
                <div className="text-xs text-[#9CA3AF] mt-2 text-left">{rawText.length} תווים</div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">נושא הקרוסלה</label>
                <input
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  placeholder="לדוגמה: 5 טיפים לשיווק ברשתות חברתיות"
                  className="w-full bg-[#FFF8F0] border border-black/10 rounded-2xl p-4 text-[#111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#F97316] text-base transition-colors"
                  dir="rtl"
                />
                <p className="text-xs text-[#9CA3AF] mt-2">ה-AI יכתוב קרוסלה שלמה על הנושא הזה</p>
              </div>
            )}

            {/* Handle */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-[#374151] mb-2">הידית שלך <span className="text-[#9CA3AF] font-normal">(אופציונלי)</span></label>
              <input
                value={handle}
                onChange={e => setHandle(e.target.value)}
                placeholder="@username"
                className="w-full bg-[#FFF8F0] border border-black/10 rounded-2xl p-4 text-[#111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#F97316] text-base transition-colors"
                dir="ltr"
              />
            </div>

            {error && (
              <div className="mt-5 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={splitText}
              disabled={isSplitting || (mode === 'text' ? !rawText.trim() : !aiTopic.trim())}
              className="mt-8 w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-4 rounded-full text-base disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSplitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  מפרק לשקופיות...
                </>
              ) : (
                'המשך לעיצוב →'
              )}
            </button>
          </div>
        )}

        {/* ── STEP 2: Choose theme + review ── */}
        {step === 2 && slides && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black text-[#111] mb-1">בחרו סגנון</h1>
                <p className="text-[#6B7280]">סקרו את השקופיות ובחרו עיצוב</p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-[#6B7280] hover:text-[#111] text-sm font-medium transition-colors flex items-center gap-1"
              >
                → חזרה
              </button>
            </div>

            {/* Theme selector — clean color swatches */}
            <div className="flex gap-2 flex-wrap mb-8">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                    selectedTheme === theme.id
                      ? 'border-[#F97316] bg-[#FFEDD5] text-[#9A3412]'
                      : 'border-black/8 bg-[#FFF8F0] text-[#374151] hover:border-black/20'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ background: theme.color }}
                  />
                  {theme.name}
                </button>
              ))}
            </div>

            {/* Slides list */}
            <div className="space-y-3 mb-8 max-h-[45vh] overflow-y-auto">
              {slides.map((slide, i) => (
                <SlideCard
                  key={i}
                  slide={slide}
                  index={i}
                  total={slides.length}
                  onChange={(updated) => {
                    const newSlides = [...slides]
                    newSlides[i] = updated
                    setSlides(newSlides)
                  }}
                />
              ))}
            </div>

            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={generate}
              disabled={isGenerating}
              className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-4 rounded-full text-base disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  יוצר תמונות... (10–30 שניות)
                </>
              ) : (
                'צור קרוסלה →'
              )}
            </button>
          </div>
        )}

        {/* ── STEP 3: Download ── */}
        {step === 3 && result && (
          <div className="animate-fade-in">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-[#FFEDD5] rounded-full flex items-center justify-center mx-auto mb-5">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#F97316" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <h1 className="text-3xl font-black text-[#111] mb-2">הקרוסלה מוכנה!</h1>
              <p className="text-[#6B7280]">{result.count} שקופיות מוכנות להורדה</p>
            </div>

            {/* Preview grid */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {result.slides.map((slide, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl overflow-hidden border border-black/8 relative group cursor-pointer bg-[#FFF8F0] shadow-sm"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = slide.dataUrl
                    link.download = `karusel_slide_${String(i + 1).padStart(2, '0')}.png`
                    link.click()
                  }}
                >
                  <img src={slide.dataUrl} alt={`שקופית ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded-full">הורד</span>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-[#FFF8F0]/90 text-[#111] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={downloadAll}
                className="flex-1 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-4 rounded-full text-base transition-colors"
              >
                הורד את כל התמונות
              </button>
              <button
                onClick={() => {
                  setStep(1)
                  setResult(null)
                  setSlides(null)
                  setRawText('')
                  setAiTopic('')
                }}
                className="flex-shrink-0 bg-[#FFF8F0] border border-black/10 text-[#374151] font-semibold py-4 px-6 rounded-full text-base hover:bg-[#F9FAFB] transition-colors"
              >
                קרוסלה חדשה
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Slide Card ──
function SlideCard({
  slide,
  index,
  total,
  onChange,
}: {
  slide: Slide
  index: number
  total: number
  onChange: (s: Slide) => void
}) {
  const typeLabels: Record<string, string> = {
    cover: 'כריכה',
    content: 'תוכן',
    cta: 'CTA',
  }

  return (
    <div className="bg-[#FFF8F0] border border-black/8 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-[#F97316] bg-[#FFEDD5] px-2 py-0.5 rounded-full">
          {index + 1}/{total}
        </span>
        <span className="text-xs text-[#9CA3AF]">{typeLabels[slide.type] || slide.type}</span>
      </div>

      <input
        value={slide.headline}
        onChange={e => onChange({ ...slide, headline: e.target.value })}
        className="w-full text-[#111] font-bold text-base border-b border-black/8 pb-2 mb-2 focus:outline-none focus:border-[#F97316] bg-transparent transition-colors"
        placeholder="כותרת"
        dir="rtl"
      />

      {slide.type === 'cover' && slide.subtitle !== undefined && (
        <input
          value={slide.subtitle || ''}
          onChange={e => onChange({ ...slide, subtitle: e.target.value })}
          className="w-full text-[#6B7280] text-sm border-b border-black/5 pb-2 mb-2 focus:outline-none focus:border-[#F97316] bg-transparent transition-colors"
          placeholder="כיתוב משנה"
          dir="rtl"
        />
      )}

      {slide.type === 'content' && slide.bullets && (
        <div className="space-y-1.5">
          {slide.bullets.map((b, bi) => (
            <input
              key={bi}
              value={b}
              onChange={e => {
                const newBullets = [...slide.bullets!]
                newBullets[bi] = e.target.value
                onChange({ ...slide, bullets: newBullets })
              }}
              className="w-full text-[#374151] text-sm border-b border-black/5 pb-1 focus:outline-none focus:border-[#F97316] bg-transparent transition-colors"
              placeholder={`• נקודה ${bi + 1}`}
              dir="rtl"
            />
          ))}
        </div>
      )}

      {slide.type === 'cta' && slide.subtext !== undefined && (
        <input
          value={slide.subtext || ''}
          onChange={e => onChange({ ...slide, subtext: e.target.value })}
          className="w-full text-[#6B7280] text-sm border-b border-black/5 pb-2 focus:outline-none focus:border-[#F97316] bg-transparent transition-colors"
          placeholder="טקסט נוסף"
          dir="rtl"
        />
      )}
    </div>
  )
}
