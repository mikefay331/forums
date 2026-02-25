import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import Navbar from '@/components/Navbar'
import AuthProvider from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: '$FORUMS - Back to the Basics',
  description: 'Cryptocurrency forum with token rewards for participation',
}

export default function RootLayout({
  children,
}:  {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#0d1117',
                color:  '#00ff41',
                border: '2px solid #30363d',
                fontFamily: 'Courier New, monospace',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}