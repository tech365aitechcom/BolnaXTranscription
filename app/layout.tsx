import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Transcription Viewer',
  description: 'Real-time conversation transcription viewer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body>
        <Toaster />
        {children}
      </body>
    </html>
  )
}
