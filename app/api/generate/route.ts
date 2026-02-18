import { NextRequest, NextResponse } from 'next/server'
import { generateCarousel, CarouselInput } from '@/lib/renderer'

export const maxDuration = 60 // seconds (Vercel Pro)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CarouselInput

    if (!body.slides || !Array.isArray(body.slides) || body.slides.length === 0) {
      return NextResponse.json({ error: 'נדרש מערך שקופיות' }, { status: 400 })
    }

    if (body.slides.length > 15) {
      return NextResponse.json({ error: 'מקסימום 15 שקופיות' }, { status: 400 })
    }

    console.log(`[generate] theme=${body.theme || 'dark'} slides=${body.slides.length}`)

    const startTime = Date.now()
    const slideResults = await generateCarousel(body)
    const elapsed = Date.now() - startTime

    console.log(`[generate] done in ${elapsed}ms — ${slideResults.length} slides`)

    return NextResponse.json({
      slides: slideResults,
      count: slideResults.length,
      elapsed,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[generate] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
