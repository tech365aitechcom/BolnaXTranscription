'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
      } else if (result?.ok) {
        toast.success('Login successful!')
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      toast.error('An error occurred during login')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* Logo/Header */}
        <div className='text-center mb-8'>
          <div className='inline-flex bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 mb-4'>
            <svg
              className='w-12 h-12 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'
              />
            </svg>
          </div>
          <h1 className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2'>
            Agent Dashboard
          </h1>
          <p className='text-gray-600'>Sign in to access your bot analytics</p>
        </div>

        {/* Login Card */}
        <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Email Input */}
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Email Address
              </label>
              <input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                placeholder='you@example.com'
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Password
              </label>
              <input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                placeholder='••••••••'
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <Button
              type='submit'
              className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl'
              disabled={loading}
            >
              {loading ? (
                <div className='flex items-center justify-center gap-2'>
                  <div className='animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full'></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className='text-center mt-6 text-sm text-gray-500'>
          <p>Protected by Bolna Agent Dashboard</p>
        </div>
      </div>
    </div>
  )
}
