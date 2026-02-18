import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Karusel.ai — מחולל קרוסלות לאינסטגרם',
  description: 'צרו קרוסלות ממותגות לאינסטגרם בשניות. עברית, AI, עיצוב מקצועי.',
  openGraph: {
    title: 'Karusel.ai',
    description: 'מחולל קרוסלות לאינסטגרם — עברית, AI, עיצוב מקצועי',
    locale: 'he_IL',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
