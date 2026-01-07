import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Transcription Viewer',
  description: 'Real-time conversation transcription viewer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
