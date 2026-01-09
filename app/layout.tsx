import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import SessionProvider from '@/components/SessionProvider'

export const metadata: Metadata = {
  title: 'AI Agents Call Analytics Platform | 365aitech',
  description:
    'Comprehensive AI-powered call analytics platform for tracking, analyzing, and optimizing agent conversations. View real-time transcriptions, performance metrics, call recordings, and detailed conversation insights all in one place.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body>
        <SessionProvider>
          <Toaster />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
