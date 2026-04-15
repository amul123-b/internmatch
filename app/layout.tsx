import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/app/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InternMatch - AI Internship Platform',
  description: 'AI-powered internship matchmaking, tailored cover letters, and roadmap generation. Secure your dream career explicitly tailored for Gen-Z.',
  keywords: ['internships', 'AI', 'job match', 'resume builder'],
  authors: [{ name: 'InternMatch' }]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
<body className="bg-black text-white">        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}