import type { Metadata } from 'next'
import { Newsreader, Public_Sans, IBM_Plex_Mono } from 'next/font/google'
import 'overlayscrollbars/overlayscrollbars.css'
import './globals.css'

const sans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
})

const display = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
  style: ['normal', 'italic'],
})

const mono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: {
    default: 'Samaanta Development Foundation – Compliance',
    template: '%s · Samaanta Compliance',
  },
  description:
    'Administrative, governance and legal compliance workspace for Samaanta Development Foundation, FY 2083/84.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  )
}
