import type { Metadata } from 'next'
import { Bitter, Lato, IBM_Plex_Mono } from 'next/font/google'
import 'overlayscrollbars/overlayscrollbars.css'
import './globals.css'

const sans = Lato({
  variable: '--font-lato',
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
})

const display = Bitter({
  variable: '--font-bitter',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
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
