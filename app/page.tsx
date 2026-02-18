'use client'

import Link from 'next/link'

const ALL_THEMES = [
  { name: 'כהה',     gradient: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)', textColor: '#fff',     accent: '#E8C87A' },
  { name: 'אפרסק',  gradient: '#F2D4B8',                                              textColor: '#2a1a0a',  accent: '#C47A3B' },
  { name: 'טורקיז', gradient: '#3D9B8F',                                              textColor: '#fff',     accent: '#7CE4DA' },
  { name: 'אוקיינוס', gradient: 'linear-gradient(135deg, #0C2D48 0%, #2E8BC0 100%)', textColor: '#fff',   accent: '#7ECEF4' },
  { name: 'סגול',   gradient: 'linear-gradient(135deg, #2D1B69 0%, #9B59B6 100%)',   textColor: '#fff',     accent: '#D7A4FF' },
  { name: 'יער',    gradient: 'linear-gradient(135deg, #1B4332 0%, #40916C 100%)',   textColor: '#fff',     accent: '#95D5B2' },
  { name: 'זריחה',  gradient: 'linear-gradient(135deg, #FF6B35 0%, #FFE8D6 100%)',   textColor: '#2a1a0a',  accent: '#FF6B35' },
  { name: 'מונו',   gradient: '#FFFFFF',                                               textColor: '#111',     accent: '#111', border: true },
  { name: 'יין',    gradient: 'linear-gradient(135deg, #2C0735 0%, #9B2335 100%)',   textColor: '#fff',     accent: '#E8A0A8' },
  { name: 'ארקטי',  gradient: 'linear-gradient(135deg, #E8F4FD 0%, #7FB3D3 100%)',  textColor: '#1a2a3a',  accent: '#2E6DA0' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white" dir="rtl">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/6 bg-[#0D0D0D]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-base font-bold tracking-tight">
            Karusel<span className="text-[#F97316]">.ai</span>
          </span>
          <Link
            href="/create"
            className="bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-4 py-1.5 rounded-full text-sm transition-colors"
          >
            צור קרוסלה
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">

          <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/60 rounded-full px-3 py-1 text-xs font-medium mb-10 tracking-wide">
            <span className="w-1.5 h-1.5 bg-[#F97316] rounded-full animate-pulse" />
            בטא פתוחה — חינם לחלוטין
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-[1.02] tracking-tight mb-6">
            קרוסלות לאינסטגרם
            <br />
            <span className="text-[#F97316]">ברצינות.</span>
          </h1>

          <p className="text-lg text-white/50 max-w-lg mx-auto mb-10 leading-relaxed">
            הכניסו טקסט. ה-AI יפצל לשקופיות מעוצבות ומוכנות לפרסום —
            עברית, RTL, 1080×1080. בלי Canva. בלי עיצוב.
          </p>

          <Link
            href="/create"
            className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold px-8 py-3.5 rounded-full text-base transition-colors"
          >
            התחילו עכשיו — חינם
          </Link>
        </div>
      </section>

      {/* Visual divider */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px bg-gradient-to-l from-transparent via-white/10 to-transparent" />
      </div>

      {/* Themes section — 10 themes in 5×2 grid */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-2">10 סגנונות עיצוב מקצועיים</h2>
            <p className="text-white/40 text-sm">כל קרוסלה נראית כאילו עיצב אותה גרפיקאי</p>
          </div>

          <div className="grid grid-cols-5 gap-3 max-w-3xl mx-auto">
            {ALL_THEMES.map((s) => (
              <Link
                key={s.name}
                href="/create"
                className="group relative rounded-2xl overflow-hidden aspect-square border hover:border-[#F97316]/40 transition-all cursor-pointer"
                style={{
                  background: s.gradient,
                  borderColor: s.border ? '#ccc' : 'rgba(255,255,255,0.08)',
                }}
              >
                {/* Mini slide mockup */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                  <div
                    className="font-black leading-tight mb-1.5"
                    style={{ color: s.textColor, fontSize: '10px', lineHeight: '1.3' }}
                  >
                    כותרת<br />ראשית
                  </div>
                  <div
                    className="w-6 h-0.5 rounded-full mb-1.5"
                    style={{ background: s.accent }}
                  />
                  <div
                    className="opacity-60 leading-snug"
                    style={{ color: s.textColor, fontSize: '7px' }}
                  >
                    • פרט ראשון<br />• פרט שני
                  </div>
                </div>
                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 text-center py-1"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <span style={{ fontSize: '9px', fontWeight: 600, color: '#fff' }}>
                    {s.name}
                  </span>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#F97316]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px bg-gradient-to-l from-transparent via-white/10 to-transparent" />
      </div>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-12 text-center">איך זה עובד</h2>

          <div className="space-y-0">
            {[
              {
                step: '1',
                title: 'הכניסו נושא',
                body: 'הדביקו נושא לקרוסלה, רשימה, או טקסט ארוך — ה-AI יפצל אותו לשקופיות בעצמו.',
              },
              {
                step: '2',
                title: 'בחרו סגנון ותמונה',
                body: 'בחרו מ-10 עיצובים מוכנים. אפשר להוסיף תמונה, לוגו, או אימוג׳י אישי.',
              },
              {
                step: '3',
                title: 'הורידו ופרסמו',
                body: 'קבלו PNG בגודל 1080×1080 לכל שקופית. מוכן לאינסטגרם. פרסמו מיד.',
              },
            ].map((item, i, arr) => (
              <div key={i} className="flex gap-6 group">
                {/* Left column: line + dot */}
                <div className="flex flex-col items-center" style={{ direction: 'ltr' }}>
                  <div className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-xs font-bold text-white/50 flex-shrink-0 group-hover:border-[#F97316]/50 group-hover:text-[#F97316] transition-all">
                    {item.step}
                  </div>
                  {i < arr.length - 1 && (
                    <div className="w-px flex-1 bg-white/6 my-1" style={{ minHeight: '32px' }} />
                  )}
                </div>
                {/* Right column: content */}
                <div className="pb-10 flex-1">
                  <h3 className="font-semibold text-white text-base mb-1">{item.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px bg-gradient-to-l from-transparent via-white/10 to-transparent" />
      </div>

      {/* Bottom CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-3xl font-black text-white mb-3">מוכנים?</h2>
        <p className="text-white/40 mb-8 text-sm">אין הרשמה. אין כרטיס אשראי. פשוט עובד.</p>
        <Link
          href="/create"
          className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold px-8 py-3.5 rounded-full text-base transition-colors"
        >
          צרו קרוסלה עכשיו
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-white/6 text-center text-white/20 text-xs">
        Karusel.ai — נבנה עם ❤️ בישראל
      </footer>
    </div>
  )
}
