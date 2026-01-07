'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { WebhookData, ConversationMessage } from '@/lib/types'
import { parseTranscript, decodeUnicode } from '@/lib/const'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function ExecutionDetailPage() {
  const params = useParams()
  const executionId = params.id as string

  const [execution, setExecution] = useState<WebhookData | null>(null)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchExecution()
  }, [executionId])

  async function fetchExecution() {
    try {
      setLoading(true)
      const response = await fetch(`/api/executions/${executionId}`, {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch execution')
      }

      const data: WebhookData = await response.json()
      setExecution(data)

      if (data.transcript) {
        const parsedMessages = parseTranscript(decodeUnicode(data.transcript))
        setMessages(parsedMessages)
      }
    } catch (err) {
      console.error('Error fetching execution:', err)
      setError('Failed to load execution')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(executionId)
    setCopied(true)
    toast.success('Execution ID copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4'></div>
          <p className='text-gray-500'>Loading execution...</p>
        </div>
      </div>
    )
  }

  if (error || !execution) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-600 mb-4'>{error || 'Execution not found'}</p>
          <Link
            href='/executions'
            className='text-blue-600 hover:text-blue-800'
          >
            ← Back to executions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      {/* Header */}
      <header className='bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-10'>
        <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2'>
                <svg
                  className='w-6 h-6 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                  />
                </svg>
              </div>
              <div>
                <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                  Conversation data
                </h1>
                <div className='flex items-center gap-2 mt-0.5'>
                  <p className='text-xs text-gray-500 font-mono'>
                    {executionId}
                  </p>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6'
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className='h-3 w-3 text-green-600' />
                    ) : (
                      <Copy className='h-3 w-3' />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Link href='/executions'>
                <Button variant='outline' size='sm'>
                  ← Agent conversations
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          <div className='bg-white rounded-xl shadow-sm p-4 border border-gray-100'>
            <p className='text-xs text-gray-500 mb-1'>Status</p>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                execution.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : execution.status === 'in-progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {execution.status}
            </span>
          </div>
          <div className='bg-white rounded-xl shadow-sm p-4 border border-gray-100'>
            <p className='text-xs text-gray-500 mb-1'>Duration</p>
            <p className='text-lg font-bold text-gray-900'>
              {execution.conversation_duration
                ? Math.round(execution.conversation_duration) + 's'
                : 'N/A'}
            </p>
          </div>
          <div className='bg-white rounded-xl shadow-sm p-4 border border-gray-100'>
            <p className='text-xs text-gray-500 mb-1'>Total Cost</p>
            <p className='text-lg font-bold text-gray-900'>
              ${(execution.total_cost / 100)?.toFixed(3) || '0.00'}
            </p>
          </div>
          <div className='bg-white rounded-xl shadow-sm p-4 border border-gray-100'>
            <p className='text-xs text-gray-500 mb-1'>Messages</p>
            <p className='text-lg font-bold text-gray-900'>{messages.length}</p>
          </div>
        </div>

        {/* Call Recording */}
        {execution.telephony_data?.recording_url && (
          <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 mb-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center space-x-3'>
                <div>
                  <h2 className='text-lg font-semibold text-gray-900'>
                    Call Recording
                  </h2>
                  <p className='text-xs text-gray-500'>
                    Listen to the full conversation
                  </p>
                </div>
              </div>
            </div>

            <audio controls preload='none' className='w-full rounded-lg'>
              <source
                src={execution.telephony_data.recording_url}
                type='audio/mpeg'
              />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Messages Container */}
        {messages.length > 0 ? (
          <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Transcription
              </h2>
            </div>
            <div className='space-y-5'>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.speaker === 'user' ? 'justify-end' : 'justify-start'
                  } animate-fade-in`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div
                    className={`flex items-end space-x-2 max-w-[85%] ${
                      msg.speaker === 'user'
                        ? 'flex-row-reverse space-x-reverse'
                        : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        msg.speaker === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                          : 'bg-gradient-to-br from-purple-500 to-purple-600'
                      }`}
                    >
                      {msg.speaker === 'user' ? 'U' : 'A'}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`rounded-2xl px-5 py-3 shadow-md ${
                        msg.speaker === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                      }`}
                    >
                      <div
                        className={`flex items-center space-x-2 mb-1.5 ${
                          msg.speaker === 'user'
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}
                      >
                        <p className='text-xs font-semibold'>
                          {msg.speaker === 'user' ? 'User' : 'Assistant'}
                        </p>
                      </div>
                      <p
                        className={`text-[15px] leading-relaxed whitespace-pre-wrap ${
                          msg.speaker === 'user'
                            ? 'text-white'
                            : 'text-gray-700'
                        }`}
                      >
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='bg-white rounded-2xl shadow-lg p-12 text-center'>
            <p className='text-gray-500'>No transcript available</p>
          </div>
        )}

        {/* Extracted Data (JSON view) */}
        {execution.extracted_data && (
          <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 my-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>
              Extracted data
            </h2>

            <pre className='bg-gray-900 text-gray-100 rounded-xl p-5 text-sm overflow-x-auto leading-relaxed'>
              {JSON.stringify(execution.extracted_data, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  )
}
