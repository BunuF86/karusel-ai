'use client'

import Link from 'next/link'

const STEPS = [
  {
    number: '01',
    title: 'הכניסו טקסט',
    desc: 'הדביקו טקסט ארוך, נושא, או תוכן מוכן — ה-AI יפצל אותו לשקופיות חכמות.',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#F97316" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L8.082 19.207a4 4 0 0 1-1.592 1.01l-3.06 1.02 1.02-3.06a4 4 0 0 1 1.01-1.592z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'בחרו סגנון',
    desc: 'בחרו מתוך 5 סגנונות עיצוב מוכנים — כהה, אפרסק, טורקיז, נייבי, שקיעה.',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#F97316" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'הורידו ופרסמו',
    desc: 'קבלו תמונות PNG מוכנות בגודל 1080×1080 לאינסטגרם. בלחיצה אחת.',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#F97316" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FFF0E0]">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FFF0E0]/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-[#111]">
            Karusel<span className="text-[#F97316]">.ai</span>
          </span>
          <Link
            href="/create"
            className="bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-5 py-2 rounded-full text-sm transition-colors"
          >
            צור קרוסלה
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-28 px-6">
        <div className="max-w-3xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#FFEDD5] text-[#9A3412] rounded-full px-4 py-1.5 text-sm font-medium mb-10">
            <span className="w-1.5 h-1.5 bg-[#F97316] rounded-full"></span>
            חינם לחלוטין — עכשיו בבטא
          </div>

          {/* Headline */}
          <h1 className="text-[56px] md:text-[72px] font-black leading-[1.05] tracking-tight text-[#111] mb-6">
            קרוסלות לאינסטגרם<br />
            <span className="text-[#F97316]">בלחיצה אחת.</span>
          </h1>

          <p className="text-xl text-[#6B7280] max-w-xl mx-auto mb-12 leading-relaxed">
            הכניסו טקסט — ה-AI יפרק אותו לשקופיות מעוצבות ומוכנות לפרסום.
            עברית, RTL, עיצוב מקצועי. בלי Canva.
          </p>

          {/* CTA */}
          <Link
            href="/create"
            className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold px-10 py-4 rounded-full text-lg transition-colors"
          >
            צרו קרוסלה עכשיו
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Style Preview */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-[#111] mb-3">5 סגנונות עיצוב</h2>
            <p className="text-[#6B7280]">כל קרוסלה בסגנון שמתאים למותג שלכם</p>
          </div>

          {/* Style swatches — clean, no gradient preview thumbnails */}
          <div className="flex gap-3 flex-wrap justify-center">
            {[
              { name: 'כהה', color: '#1a1a2e', text: 'white' },
              { name: 'אפרסק', color: '#F2D4B8', text: '#7a4a2a' },
              { name: 'טורקיז', color: '#3D9B8F', text: 'white' },
              { name: 'נייבי', color: '#1B2A4A', text: 'white' },
              { name: 'שקיעה', color: '#FF6B35', text: 'white' },
            ].map((s) => (
              <div
                key={s.name}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-black/8 bg-[#FFF8F0] shadow-sm text-sm font-medium text-[#111]"
              >
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ background: s.color }}
                />
                {s.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 border-t border-black/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-[#111] mb-3">איך זה עובד?</h2>
            <p className="text-[#6B7280]">שלושה שלבים פשוטים</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((item) => (
              <div key={item.number} className="card p-8 text-center">
                <div className="w-12 h-12 bg-[#FFEDD5] rounded-2xl flex items-center justify-center mx-auto mb-5">
                  {item.icon}
                </div>
                <div className="text-xs font-black text-[#F97316] tracking-widest mb-3">{item.number}</div>
                <h3 className="text-lg font-bold text-[#111] mb-3">{item.title}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-4xl font-black text-[#111] mb-4">מוכנים להתחיל?</h2>
          <p className="text-[#6B7280] mb-10 text-lg">חינם לחלוטין. אין צורך בהרשמה.</p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold px-10 py-4 rounded-full text-lg transition-colors"
          >
            צרו קרוסלה עכשיו
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-black/5 text-center text-[#9CA3AF] text-sm">
        Karusel.ai — מחולל קרוסלות לאינסטגרם | נבנה עם ❤️ בישראל
      </footer>
    </div>
  )
}
