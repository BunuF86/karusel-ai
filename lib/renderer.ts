/**
 * Carousel Renderer — Node.js Playwright + Nunjucks
 */

import path from 'path'
import fs from 'fs'
import nunjucks from 'nunjucks'
import { chromium } from 'playwright'

const TEMPLATES_DIR = path.join(process.cwd(), 'templates')
const ASSETS_DIR = path.join(process.cwd(), 'public', 'assets')
const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts')

const njkEnv = nunjucks.configure(TEMPLATES_DIR, {
  autoescape: false,
  throwOnUndefined: false,
})

const TEMPLATE_MAP: Record<string, Record<string, string>> = {
  dark:   { cover: 'cover_dark.html',   content: 'content_dark.html',   cta: 'cta_dark.html' },
  peach:  { cover: 'cover_peach.html',  content: 'content_peach.html',  cta: 'cta_bibas.html' },
  teal:   { cover: 'cover_teal.html',   content: 'content_teal.html',   cta: 'cta_bibas.html' },
  navy:   { cover: 'cover_navy.html',   content: 'content_navy.html',   cta: 'cta_navy.html' },
  sunset: { cover: 'cover_sunset.html', content: 'content_sunset.html', cta: 'cta_sunset.html' },
}

export interface SlideInput {
  type: 'cover' | 'content' | 'cta'
  headline: string
  subtitle?: string
  emoji?: string
  item_number?: string
  bullets?: string[]
  subtext?: string
  button_text?: string
  logo?: string
}

export interface CarouselInput {
  title: string
  theme?: string
  handle?: string
  slides: SlideInput[]
}

export interface SlideResult {
  index: number
  dataUrl: string
}

// Cache for base64-encoded font CSS
let fontCssCache: string | null = null

function getFontCss(): string {
  if (fontCssCache) return fontCssCache

  const fonts = [
    { file: 'heebo-400.ttf', weight: '400' },
    { file: 'heebo-700.ttf', weight: '700' },
    { file: 'heebo-900.ttf', weight: '900' },
  ]

  let css = ''
  for (const { file, weight } of fonts) {
    const fontPath = path.join(FONTS_DIR, file)
    if (fs.existsSync(fontPath)) {
      const b64 = fs.readFileSync(fontPath).toString('base64')
      css += `
@font-face {
  font-family: 'Heebo';
  font-style: normal;
  font-weight: ${weight};
  font-display: block;
  src: url('data:font/truetype;base64,${b64}') format('truetype');
}
`
    }
  }

  fontCssCache = css
  return css
}

function injectFonts(html: string): string {
  const fontCss = getFontCss()
  if (!fontCss) return html

  // Remove Google Fonts link tag and inject local fonts instead
  const cleaned = html.replace(
    /<link[^>]*fonts\.googleapis\.com[^>]*>/gi,
    ''
  )
  const styleTag = `<style>\n${fontCss}\n</style>`

  // Inject before </head> or after <head>
  if (cleaned.includes('</head>')) {
    return cleaned.replace('</head>', `${styleTag}\n</head>`)
  }
  return styleTag + cleaned
}

function computeHeadlineSize(text: string, base: number, templateType: string): string {
  const length = text.length
  if (templateType === 'cover') {
    if (length > 40) return `${Math.max(48, base - (length - 40))}px`
    return `${base}px`
  } else {
    if (length > 30) return `${Math.max(36, base - (length - 30))}px`
    return `${base}px`
  }
}

function buildSlideContext(slide: SlideInput, idx: number, total: number, theme: string, handle: string) {
  const ctx: Record<string, unknown> = {
    slide_num: idx + 1,
    total_slides: total,
    theme,
    handle,
    ...slide,
  }

  const stype = slide.type || 'content'
  const headline = slide.headline || ''

  if (stype === 'cover') {
    ctx.headline_size = computeHeadlineSize(headline, 72, 'cover')
    ctx.subtitle_size = '32px'
  } else if (stype === 'content') {
    ctx.headline_size = computeHeadlineSize(headline, 52, 'content')
    const n = (slide.bullets || []).length
    ctx.bullet_size = n <= 2 ? '38px' : n === 3 ? '34px' : '30px'
    ctx.para_size = '34px'
  } else if (stype === 'cta') {
    ctx.headline_size = computeHeadlineSize(headline, 64, 'cover')
    ctx.sub_size = '30px'
  }

  return ctx
}

let avatarB64Cache: string | null = null
let avatarFaceB64Cache: string | null = null

function getAvatarB64(): string {
  if (avatarB64Cache !== null) return avatarB64Cache
  const avatarPath = path.join(ASSETS_DIR, 'avatar.png')
  if (fs.existsSync(avatarPath)) {
    avatarB64Cache = `data:image/png;base64,${fs.readFileSync(avatarPath).toString('base64')}`
  } else {
    avatarB64Cache = ''
  }
  return avatarB64Cache
}

function getAvatarFaceB64(): string {
  if (avatarFaceB64Cache !== null) return avatarFaceB64Cache
  const facePath = path.join(ASSETS_DIR, 'avatar_face.png')
  if (fs.existsSync(facePath)) {
    avatarFaceB64Cache = `data:image/png;base64,${fs.readFileSync(facePath).toString('base64')}`
  } else {
    avatarFaceB64Cache = ''
  }
  return avatarFaceB64Cache
}

export async function generateCarousel(input: CarouselInput): Promise<SlideResult[]> {
  const theme = input.theme || 'dark'
  const handle = input.handle || '@karusel'
  const slides = input.slides || []
  const total = slides.length

  const themeTemplates = TEMPLATE_MAP[theme] || TEMPLATE_MAP['dark']

  const avatarPath = getAvatarB64()
  const avatarFacePath = getAvatarFaceB64()

  // Render all HTML strings first
  const htmlSlides: Array<{ html: string; index: number }> = []

  for (let idx = 0; idx < slides.length; idx++) {
    const slide = slides[idx]
    const stype = slide.type || 'content'
    const templateName = themeTemplates[stype] || themeTemplates['content']

    const ctx = buildSlideContext(slide, idx, total, theme, handle)
    if (avatarPath) ctx.avatar_path = avatarPath
    if (avatarFacePath) ctx.avatar_face_path = avatarFacePath

    try {
      let html = njkEnv.render(templateName, ctx)
      // Inject local fonts
      html = injectFonts(html)
      htmlSlides.push({ html, index: idx })
    } catch (e) {
      console.error(`Template render error for slide ${idx + 1}:`, e)
      const fallbackHtml = injectFonts(`<html><body style="width:1080px;height:1080px;background:#1a1a2e;display:flex;align-items:center;justify-content:center;font-family:'Heebo',sans-serif;color:white;direction:rtl;font-size:48px;font-weight:bold;">${slide.headline || ''}</body></html>`)
      htmlSlides.push({ html: fallbackHtml, index: idx })
    }
  }

  // Launch browser once, render all slides
  const results: SlideResult[] = []

  const browser = await chromium.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
  })

  try {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 1080, height: 1080 })

    for (const { html, index } of htmlSlides) {
      // Use domcontentloaded since fonts are embedded (no network needed)
      await page.setContent(html, { waitUntil: 'domcontentloaded' })
      await page.setViewportSize({ width: 1080, height: 1080 })
      // Short wait for rendering to complete
      await page.waitForTimeout(800)

      const screenshotBuf = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width: 1080, height: 1080 },
      })

      const dataUrl = `data:image/png;base64,${Buffer.from(screenshotBuf).toString('base64')}`
      results.push({ index, dataUrl })
    }

    await browser.close()
  } catch (e) {
    await browser.close()
    throw e
  }

  return results
}
