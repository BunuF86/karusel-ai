'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

const THEMES = [
  {
    id: 'dark',
    name: 'כהה',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
    textColor: '#fff',
    accentColor: '#E8C87A',
  },
  {
    id: 'peach',
    name: 'אפרסק',
    gradient: '#F2D4B8',
    textColor: '#2a1a0a',
    accentColor: '#C47A3B',
  },
  {
    id: 'teal',
    name: 'טורקיז',
    gradient: '#3D9B8F',
    textColor: '#fff',
    accentColor: '#7CE4DA',
  },
  {
    id: 'ocean',
    name: 'אוקיינוס',
    gradient: 'linear-gradient(135deg, #0C2D48 0%, #2E8BC0 100%)',
    textColor: '#fff',
    accentColor: '#7ECEF4',
  },
  {
    id: 'purple',
    name: 'סגול',
    gradient: 'linear-gradient(135deg, #2D1B69 0%, #9B59B6 100%)',
    textColor: '#fff',
    accentColor: '#D7A4FF',
  },
  {
    id: 'forest',
    name: 'יער',
    gradient: 'linear-gradient(135deg, #1B4332 0%, #40916C 100%)',
    textColor: '#fff',
    accentColor: '#95D5B2',
  },
  {
    id: 'sunrise',
    name: 'זריחה',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #FFE8D6 100%)',
    textColor: '#2a1a0a',
    accentColor: '#FF6B35',
  },
  {
    id: 'mono',
    name: 'מונו',
    gradient: '#FFFFFF',
    textColor: '#111',
    accentColor: '#111',
    border: true,
  },
  {
    id: 'wine',
    name: 'יין',
    gradient: 'linear-gradient(135deg, #2C0735 0%, #9B2335 100%)',
    textColor: '#fff',
    accentColor: '#E8A0A8',
  },
  {
    id: 'arctic',
    name: 'ארקטי',
    gradient: 'linear-gradient(135deg, #E8F4FD 0%, #7FB3D3 100%)',
    textColor: '#1a2a3a',
    accentColor: '#2E6DA0',
  },
]

const QUICK_EMOJIS = [
  '🚀', '💡', '🔥', '⭐', '💎', '🎯', '✨', '🌟',
  '📈', '💰', '🧠', '🎨', '🤝', '🌱', '⚡', '🏆',
  '📱', '💻', '🎤', '📊', '🔑', '🌍', '❤️', '👑',
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
type VisualType = 'none' | 'image' | 'emoji'
type AvatarPlacement = 'top' | 'bottom' | 'side'

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

  // Visual element state
  const [visualType, setVisualType] = useState<VisualType>('none')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedEmoji, setSelectedEmoji] = useState<string>('🚀')
  const [avatarPlacement, setAvatarPlacement] = useState<AvatarPlacement>('top')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

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
      // Determine avatar to pass
      let avatar: string | null = null
      if (visualType === 'image' && uploadedImage) {
        avatar = uploadedImage
      }
      // For emoji: inject into cover slide emoji field rather than as avatar image
      const processedSlides = slides.map((s, i) => {
        if (visualType === 'emoji' && i === 0 && s.type === 'cover') {
          return { ...s, emoji: selectedEmoji }
        }
        return s
      })

      const res = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: slides[0]?.headline || 'carousel',
          theme: selectedTheme,
          handle,
          slides: processedSlides,
          avatar,
          avatarPlacement: avatar ? avatarPlacement : null,
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
  }, [slides, selectedTheme, handle, visualType, uploadedImage, selectedEmoji, avatarPlacement])

  const downloadAll = useCallback(() => {
    if (!result) return
    result.slides.forEach((slide, i) => {
      const link = document.createElement('a')
      link.href = slide.dataUrl
      link.download = `karusel_slide_${String(i + 1).padStart(2, '0')}.png`
      link.click()
    })
  }, [result])

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white" dir="rtl">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/6 bg-[#0D0D0D]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-base font-bold tracking-tight">
            Karusel<span className="text-[#F97316]">.ai</span>
          </Link>

          {/* Progress steps */}
          <div className="flex items-center gap-1.5" dir="ltr">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  step > s
                    ? 'bg-[#F97316] text-white'
                    : step === s
                    ? 'border border-[#F97316] text-[#F97316] bg-transparent'
                    : 'border border-white/15 text-white/25 bg-transparent'
                }`}>{s}</div>
                {s < 3 && (
                  <div className={`w-6 h-px transition-all ${step > s ? 'bg-[#F97316]' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-6 max-w-xl mx-auto">

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-1">הכניסו תוכן</h1>
              <p className="text-white/40 text-sm">טקסט מוכן או נושא לכתיבה</p>
            </div>

            {/* Mode toggle */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-full w-fit mb-6 border border-white/8">
              <button
                onClick={() => setMode('text')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  mode === 'text'
                    ? 'bg-white/10 text-white'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                טקסט מוכן
              </button>
              <button
                onClick={() => setMode('ai')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  mode === 'ai'
                    ? 'bg-white/10 text-white'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                ✨ AI יכתוב
              </button>
            </div>

            {mode === 'text' ? (
              <div>
                <textarea
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder="הדביקו כאן טקסט — ה-AI יפרק לשקופיות חכמות.&#10;&#10;לדוגמה: '5 כלי AI שכל יזם חייב להכיר...'"
                  className="w-full h-44 bg-white/4 border border-white/8 rounded-xl p-4 text-white placeholder-white/25 resize-none focus:outline-none focus:border-[#F97316]/50 text-sm leading-relaxed transition-colors"
                  dir="rtl"
                />
                <div className="text-[11px] text-white/25 mt-1.5 text-left" dir="ltr">{rawText.length}</div>
              </div>
            ) : (
              <div>
                <input
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  placeholder="לדוגמה: 5 טיפים לשיווק ברשתות חברתיות"
                  className="w-full bg-white/4 border border-white/8 rounded-xl p-4 text-white placeholder-white/25 focus:outline-none focus:border-[#F97316]/50 text-sm transition-colors"
                  dir="rtl"
                />
                <p className="text-[11px] text-white/25 mt-1.5">ה-AI יכתוב קרוסלה שלמה על הנושא</p>
              </div>
            )}

            {/* Handle */}
            <div className="mt-5">
              <label className="block text-xs font-medium text-white/40 mb-2">
                ידית אינסטגרם <span className="text-white/20">(אופציונלי)</span>
              </label>
              <input
                value={handle}
                onChange={e => setHandle(e.target.value)}
                placeholder="@username"
                className="w-full bg-white/4 border border-white/8 rounded-xl p-3 text-white placeholder-white/25 focus:outline-none focus:border-[#F97316]/50 text-sm transition-colors"
                dir="ltr"
              />
            </div>

            {error && (
              <div className="mt-5 bg-red-950/50 border border-red-800/50 rounded-xl p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={splitText}
              disabled={isSplitting || (mode === 'text' ? !rawText.trim() : !aiTopic.trim())}
              className="mt-8 w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-3.5 rounded-full text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSplitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  מפרק לשקופיות...
                </>
              ) : (
                'המשך →'
              )}
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && slides && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">בחרו סגנון</h1>
                <p className="text-white/40 text-sm">{slides.length} שקופיות</p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-white/30 hover:text-white/60 text-sm transition-colors"
              >
                ← חזרה
              </button>
            </div>

            {/* ── Theme selector — 5×2 grid ── */}
            <div className="mb-8">
              <label className="block text-xs font-medium text-white/40 mb-3">ערכת צבעים</label>
              <div className="grid grid-cols-5 gap-2">
                {THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    title={theme.name}
                    className={`relative rounded-xl overflow-hidden aspect-square transition-all group ${
                      selectedTheme === theme.id
                        ? 'ring-2 ring-[#F97316] ring-offset-2 ring-offset-[#0D0D0D]'
                        : 'ring-1 ring-white/10 hover:ring-white/25'
                    }`}
                    style={{
                      background: theme.gradient,
                      border: theme.border ? '1px solid #ccc' : undefined,
                    }}
                  >
                    {/* Mini mockup inside swatch */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                      <div
                        className="font-black text-[6px] leading-tight text-center mb-0.5"
                        style={{ color: theme.textColor }}
                      >
                        כותרת
                      </div>
                      <div
                        className="w-4 h-px mb-0.5"
                        style={{ background: theme.accentColor }}
                      />
                      <div
                        className="text-[4px] opacity-60"
                        style={{ color: theme.textColor }}
                      >
                        • פרט
                      </div>
                    </div>
                    {/* Theme name label */}
                    <div
                      className="absolute bottom-0 left-0 right-0 text-center text-[8px] font-semibold py-0.5"
                      style={{
                        background: 'rgba(0,0,0,0.45)',
                        color: '#fff',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {theme.name}
                    </div>
                    {/* Selected checkmark */}
                    {selectedTheme === theme.id && (
                      <div className="absolute top-1 right-1 w-3 h-3 bg-[#F97316] rounded-full flex items-center justify-center">
                        <svg width="6" height="5" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Visual element picker ── */}
            <div className="mb-8">
              <label className="block text-xs font-medium text-white/40 mb-3">אלמנט ויזואלי</label>
              <div className="flex gap-2 mb-4">
                {([
                  { id: 'none', label: 'ללא', icon: '—' },
                  { id: 'image', label: 'תמונה / לוגו', icon: '🖼' },
                  { id: 'emoji', label: 'אימוג׳י', icon: '😊' },
                ] as { id: VisualType; label: string; icon: string }[]).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setVisualType(opt.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border flex-1 justify-center ${
                      visualType === opt.id
                        ? 'border-[#F97316] bg-[#F97316]/10 text-white'
                        : 'border-white/8 bg-white/4 text-white/50 hover:border-white/20 hover:text-white/80'
                    }`}
                  >
                    <span>{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Image upload UI */}
              {visualType === 'image' && (
                <div className="space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                      uploadedImage
                        ? 'border-[#F97316]/50 bg-[#F97316]/5'
                        : 'border-white/15 bg-white/3 hover:border-white/30'
                    }`}
                  >
                    {uploadedImage ? (
                      <div className="flex items-center justify-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={uploadedImage}
                          alt="uploaded"
                          className="w-12 h-12 rounded-lg object-cover border border-white/15"
                        />
                        <div className="text-right">
                          <div className="text-sm font-medium text-white">תמונה נטענה ✓</div>
                          <div className="text-xs text-white/40 mt-0.5">לחץ להחלפה</div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-2xl mb-2">📁</div>
                        <div className="text-sm text-white/60">לחצו להעלאת תמונה</div>
                        <div className="text-xs text-white/30 mt-1">PNG, JPG, SVG — עד 5MB</div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Placement selector */}
                  {uploadedImage && (
                    <div>
                      <label className="block text-xs text-white/40 mb-2">מיקום התמונה</label>
                      <div className="flex gap-2">
                        {([
                          { id: 'top', label: 'למעלה' },
                          { id: 'bottom', label: 'למטה' },
                          { id: 'side', label: 'בצד' },
                        ] as { id: AvatarPlacement; label: string }[]).map(p => (
                          <button
                            key={p.id}
                            onClick={() => setAvatarPlacement(p.id)}
                            className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                              avatarPlacement === p.id
                                ? 'border-[#F97316] bg-[#F97316]/10 text-white'
                                : 'border-white/8 bg-white/4 text-white/50 hover:border-white/20'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Emoji picker */}
              {visualType === 'emoji' && (
                <div>
                  <div className="grid grid-cols-8 gap-1.5 p-3 bg-white/4 border border-white/8 rounded-xl">
                    {QUICK_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setSelectedEmoji(emoji)}
                        className={`w-8 h-8 flex items-center justify-center text-lg rounded-lg transition-all ${
                          selectedEmoji === emoji
                            ? 'bg-[#F97316]/20 ring-1 ring-[#F97316]'
                            : 'hover:bg-white/8'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-white/30 mt-2">האימוג׳י יוצג בשקופית הכיסוי</p>
                </div>
              )}
            </div>

            {/* Slides list */}
            <div className="space-y-2 mb-8 max-h-[40vh] overflow-y-auto pr-1">
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
              <div className="mb-5 bg-red-950/50 border border-red-800/50 rounded-xl p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={generate}
              disabled={isGenerating}
              className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-3.5 rounded-full text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  יוצר תמונות... (כ-30 שניות)
                </>
              ) : (
                'צור קרוסלה →'
              )}
            </button>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && result && (
          <div>
            <div className="text-center mb-10">
              <div className="w-12 h-12 bg-[#F97316]/15 border border-[#F97316]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#F97316" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">מוכן להורדה</h1>
              <p className="text-white/40 text-sm">{result.count} שקופיות</p>
            </div>

            {/* Preview grid */}
            <div className="grid grid-cols-3 gap-2 mb-8">
              {result.slides.map((slide, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl overflow-hidden relative group cursor-pointer border border-white/6"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = slide.dataUrl
                    link.download = `karusel_slide_${String(i + 1).padStart(2, '0')}.png`
                    link.click()
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={slide.dataUrl} alt={`שקופית ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </div>
                  <div className="absolute bottom-1.5 right-1.5 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={downloadAll}
                className="flex-1 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-3.5 rounded-full text-sm transition-colors"
              >
                הורד הכל
              </button>
              <button
                onClick={() => {
                  setStep(1)
                  setResult(null)
                  setSlides(null)
                  setRawText('')
                  setAiTopic('')
                  setUploadedImage(null)
                  setVisualType('none')
                }}
                className="flex-shrink-0 bg-white/5 border border-white/8 text-white/60 font-medium py-3.5 px-5 rounded-full text-sm hover:bg-white/8 hover:text-white/80 transition-colors"
              >
                חדש
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
    cta: 'קריאה לפעולה (שקופית אחרונה)',
  }

  return (
    <div className="bg-white/3 border border-white/6 rounded-xl p-4 hover:border-white/12 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold text-[#F97316] bg-[#F97316]/10 px-2 py-0.5 rounded-full">
          {index + 1}/{total}
        </span>
        <span className="text-[10px] text-white/30">{typeLabels[slide.type] || slide.type}</span>
      </div>

      <input
        value={slide.headline}
        onChange={e => onChange({ ...slide, headline: e.target.value })}
        className="w-full text-white font-semibold text-sm border-b border-white/8 pb-2 mb-2 focus:outline-none focus:border-[#F97316]/40 bg-transparent transition-colors placeholder-white/20"
        placeholder="כותרת"
        dir="rtl"
      />

      {slide.type === 'cover' && slide.subtitle !== undefined && (
        <input
          value={slide.subtitle || ''}
          onChange={e => onChange({ ...slide, subtitle: e.target.value })}
          className="w-full text-white/50 text-xs border-b border-white/5 pb-2 mb-2 focus:outline-none focus:border-[#F97316]/30 bg-transparent transition-colors placeholder-white/15"
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
              className="w-full text-white/60 text-xs border-b border-white/5 pb-1 focus:outline-none focus:border-[#F97316]/30 bg-transparent transition-colors placeholder-white/15"
              placeholder={`• פרט ${bi + 1}`}
              dir="rtl"
            />
          ))}
        </div>
      )}

      {slide.type === 'cta' && slide.subtext !== undefined && (
        <input
          value={slide.subtext || ''}
          onChange={e => onChange({ ...slide, subtext: e.target.value })}
          className="w-full text-white/50 text-xs border-b border-white/5 pb-2 focus:outline-none focus:border-[#F97316]/30 bg-transparent transition-colors placeholder-white/15"
          placeholder="טקסט נוסף"
          dir="rtl"
        />
      )}
    </div>
  )
}
