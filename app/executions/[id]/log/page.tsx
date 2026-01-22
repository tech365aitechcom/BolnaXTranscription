'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ExecutionLog } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface LogsResponse {
  data: ExecutionLog[]
}

export default function ExecutionLogPage() {
  const params = useParams()
  const executionId = params.id as string

  const [logs, setLogs] = useState<ExecutionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [executionId])

  async function fetchLogs() {
    try {
      setLoading(true)
      const response = await fetch(`/api/executions/${executionId}/log`, {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch logs')
      }

      const data: LogsResponse = await response.json()
      setLogs(data.data || [])
    } catch (err) {
      console.error('Error fetching logs:', err)
      setError('Failed to load execution logs')
      toast.error('Failed to load execution logs')
    } finally {
      setLoading(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    await fetchLogs()
    setRefreshing(false)
    toast.success('Logs refreshed')
  }

  function handleDownloadLogs() {
    try {
      const logsText = logs
        .map((log) => {
          return `[${log.created_at}] [${log.type.toUpperCase()}] [${log.component}] [${log.provider}]\n${log.data}\n${'='.repeat(100)}\n`
        })
        .join('\n')

      const blob = new Blob([logsText], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `execution-logs-${executionId}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Logs downloaded successfully')
    } catch (err) {
      console.error('Error downloading logs:', err)
      toast.error('Failed to download logs')
    }
  }

  function formatTimestamp(timestamp: string) {
    try {
      const date = new Date(timestamp)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
        hour12: false,
      })
    } catch {
      return timestamp
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4'></div>
          <p className='text-gray-500'>Loading execution logs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-600 mb-4'>{error}</p>
          <div className='flex items-center gap-2 justify-center'>
            <Link
              href={`/executions/${executionId}`}
              className='text-blue-600 hover:text-blue-800'
            >
              ← Back to conversation
            </Link>
            <span className='text-gray-400'>|</span>
            <Link
              href='/executions'
              className='text-blue-600 hover:text-blue-800'
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      {/* Header */}
      <header className='bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5'>
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
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
              </div>
              <div>
                <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                  Agent execution logs
                </h1>
                <p className='text-xs text-gray-500'>
                  Displaying every request and response
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
              <Button
                variant='default'
                size='sm'
                onClick={handleDownloadLogs}
                disabled={logs.length === 0}
              >
                <Download className='h-4 w-4 mr-1' />
                Download logs
              </Button>
              <Link href={`/executions/${executionId}`}>
                <Button variant='outline' size='sm'>
                  ← Back to conversation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {logs.length === 0 ? (
          <div className='bg-white rounded-2xl shadow-lg p-12 text-center'>
            <svg
              className='w-16 h-16 text-gray-300 mx-auto mb-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
            <p className='text-gray-500 text-lg mb-2'>No logs available</p>
            <p className='text-gray-400 text-sm'>
              This execution does not have any logs yet
            </p>
          </div>
        ) : (
          <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
            {/* Table */}
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 border-b border-gray-200'>
                  <tr>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-48'>
                      Timestamp
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                      Log data
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32'>
                      Direction
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {logs.map((log, index) => (
                    <tr
                      key={index}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono'>
                        {formatTimestamp(log.created_at)}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-900'>
                        <div className='max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
                          <pre className='whitespace-pre-wrap break-words font-sans'>
                            {log.data}
                          </pre>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            log.type === 'request'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {log.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className='bg-gray-50 px-6 py-4 border-t border-gray-200'>
              <p className='text-sm text-gray-600'>
                Total logs: <span className='font-semibold'>{logs.length}</span>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
