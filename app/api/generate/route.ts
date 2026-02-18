import { NextRequest, NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

const execFileAsync = promisify(execFile)

const PYTHON_GENERATOR = '/data/.openclaw/workspace/skills/carousel-creator/generate.py'

export const maxDuration = 120 // seconds — Python generator takes longer

export async function POST(req: NextRequest) {
  let tmpDir: string | null = null

  try {
    const body = await req.json()

    if (!body.slides || !Array.isArray(body.slides) || body.slides.length === 0) {
      return NextResponse.json({ error: 'נדרש מערך שקופיות' }, { status: 400 })
    }
    if (body.slides.length > 15) {
      return NextResponse.json({ error: 'מקסימום 15 שקופיות' }, { status: 400 })
    }

    const theme = body.theme || 'dark'
    const title = body.title || 'carousel'
    const avatar = body.avatar || null           // base64 data URI of uploaded image
    const avatarPlacement = body.avatarPlacement || null  // top / bottom / side
    console.log(`[generate] theme=${theme} slides=${body.slides.length} avatar=${!!avatar}`)

    // Create temp dir
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'karusel-'))
    const inputFile = path.join(tmpDir, 'input.json')

    // Write input JSON
    const handle = body.handle || '@bennyfarber'
    const inputData: Record<string, unknown> = {
      title,
      theme,
      handle,
      slides: body.slides,
    }
    if (avatar) {
      inputData.avatar = avatar
    }
    if (avatarPlacement) {
      inputData.avatar_placement = avatarPlacement
    }

    await fs.writeFile(inputFile, JSON.stringify(inputData, null, 2), 'utf-8')

    const startTime = Date.now()

    // Call Python generator
    const { stdout, stderr } = await execFileAsync(
      'python3',
      [PYTHON_GENERATOR, '--input', inputFile, '--output', tmpDir, '--prefix', 'slide'],
      {
        timeout: 110_000,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
        },
      }
    )

    if (stderr) {
      console.log('[generate] python stderr:', stderr)
    }
    console.log('[generate] python stdout:', stdout)

    // Read output PNGs (sorted)
    const files = await fs.readdir(tmpDir)
    const pngFiles = files
      .filter(f => f.startsWith('slide_') && f.endsWith('.png'))
      .sort()

    if (pngFiles.length === 0) {
      throw new Error('Python generator produced no output files. Check logs above.')
    }

    // Read PNGs and encode as base64 data URLs
    const slideResults = await Promise.all(
      pngFiles.map(async (filename, index) => {
        const buf = await fs.readFile(path.join(tmpDir!, filename))
        const dataUrl = `data:image/png;base64,${buf.toString('base64')}`
        return { index, dataUrl }
      })
    )

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
  } finally {
    // Clean up temp dir
    if (tmpDir) {
      try {
        await fs.rm(tmpDir, { recursive: true, force: true })
      } catch {
        // ignore cleanup errors
      }
    }
  }
}
