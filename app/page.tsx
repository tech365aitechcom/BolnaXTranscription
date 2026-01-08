'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { WebhookData } from '@/lib/types'
import RawDataDrawer from '@/components/RawDataDrawer'
import Pagination from '@/components/Pagination'
import {
  ArrowUpRight,
  Copy,
  ExternalLink,
  FileSearchCorner,
  RefreshCw,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ExecutionResponse {
  page_number: number
  page_size: number
  total: number
  has_more: boolean
  data: WebhookData[]
}

export default function Home() {
  const [executions, setExecutions] = useState<WebhookData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [openRawDrawer, setOpenRawDrawer] = useState(false)
  const [selectedExecution, setSelectedExecution] =
    useState<WebhookData | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [metrics, setMetrics] = useState({
    totalExecutions: 0,
    totalCost: 0,
    totalDuration: 0,
    avgCost: 0,
    avgDuration: 0,
    statusCounts: {
      busy: 0,
      completed: 0,
    },
  })

  useEffect(() => {
    fetchExecutions()
    fetchMetrics()
  }, [pageNumber, statusFilter, pageSize])

  async function fetchMetrics() {
    try {
      const response = await fetch('/api/executions/metrics', {
        cache: 'no-store',
      })

      if (!response.ok) {
        console.error('Failed to fetch metrics')
        return
      }

      const data = await response.json()
      setMetrics(data)
    } catch (err) {
      console.error('Error fetching metrics:', err)
    }
  }

  async function fetchExecutions() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page_number: pageNumber.toString(),
        page_size: pageSize.toString(),
      })

      if (statusFilter) {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/executions?${params.toString()}`, {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch executions')
      }

      const data: ExecutionResponse = await response.json()
      setExecutions(data.data || [])
      setTotalPages(Math.ceil(data.total / pageSize))
    } catch (err) {
      console.error('Error fetching executions:', err)
      setError('Failed to load executions')
    } finally {
      setLoading(false)
    }
  }

  function getTotalCost(execution: WebhookData): number {
    // Try to get total_cost first
    if (execution.total_cost !== undefined && execution.total_cost !== null) {
      // Bolna API returns cost in rupees but displays in dollars
      // Divide by 100 to convert to proper dollar amount
      return execution.total_cost / 100
    }

    // If not available, calculate from cost_breakdown
    if (execution.cost_breakdown) {
      const breakdown = execution.cost_breakdown
      const total =
        (breakdown.llm || 0) +
        (breakdown.synthesizer || 0) +
        (breakdown.transcriber || 0) +
        (breakdown.network || 0) +
        (breakdown.platform || 0) +
        (breakdown.transfer_cost || 0)
      return total / 100
    }

    return 0
  }

  function handleCopyId(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    toast.success('Execution ID copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filter executions by search query
  const filteredExecutions = executions.filter((execution) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      execution.id.toLowerCase().includes(query) ||
      execution.user_number?.toLowerCase().includes(query) ||
      execution.telephony_data?.to_number?.toLowerCase().includes(query)
    )
  })

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
        {/* Header */}
        <header className='bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-10'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-5'>
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
                      d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'
                    />
                  </svg>
                </div>
                <div>
                  <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                    Agent conversations
                  </h1>
                  <p className='text-sm text-gray-500 mt-0.5'>
                    Chat history dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Performance Metrics */}
          <div className='mb-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                  />
                </svg>
                Performance Metrics
              </h2>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  fetchExecutions()
                  fetchMetrics()
                }}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>

            {/* Top Metrics */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4'>
              <div className='bg-white rounded-lg shadow-sm p-5 border border-gray-100'>
                <div className='flex items-center justify-between mb-2'>
                  <p className=' text-gray-600'>Total Executions</p>
                  <svg
                    className='w-5 h-5 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                    />
                  </svg>
                </div>
                <p className='text-3xl font-bold text-gray-900'>
                  {metrics.totalExecutions}
                </p>
                <p className='text-sm text-gray-500 mt-1'>All call attempts</p>
              </div>

              <div className='bg-white rounded-lg shadow-sm p-5 border border-gray-100'>
                <div className='flex items-center justify-between mb-2'>
                  <p className=' text-gray-600'>Total Cost</p>
                  <svg
                    className='w-5 h-5 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <p className='text-3xl font-bold text-gray-900'>
                  ${metrics.totalCost.toFixed(2)}
                </p>
                <p className='text-sm text-gray-500 mt-1'>
                  Total campaign spend
                </p>
              </div>

              <div className='bg-white rounded-lg shadow-sm p-5 border border-gray-100'>
                <div className='flex items-center justify-between mb-2'>
                  <p className=' text-gray-600'>Total Duration</p>
                  <svg
                    className='w-5 h-5 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <p className='text-3xl font-bold text-gray-900'>
                  {metrics.totalDuration.toFixed(0)}s
                </p>
                <p className='text-sm text-gray-500 mt-1'>Total call time</p>
              </div>

              <div className='bg-white rounded-lg shadow-sm p-5 border border-gray-100'>
                <p className=' text-gray-600 mb-2'>Status Counts</p>
                <div className='flex gap-3'>
                  <div>
                    <p className=' text-gray-700'>Busy</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {metrics.statusCounts.busy}
                    </p>
                  </div>
                  <div>
                    <p className=' text-gray-700'>Completed</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {metrics.statusCounts.completed}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Metrics */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='bg-white rounded-lg shadow-sm p-5 border border-gray-100'>
                <div className='flex items-center justify-between mb-2'>
                  <p className=' text-gray-600'>Avg Cost</p>
                </div>
                <p className='text-3xl font-bold text-gray-900'>
                  ${metrics.avgCost.toFixed(2)}
                </p>
                <p className='text-sm text-gray-500 mt-1'>
                  Average cost per call
                </p>
              </div>

              <div className='bg-white rounded-lg shadow-sm p-5 border border-gray-100'>
                <div className='flex items-center justify-between mb-2'>
                  <p className=' text-gray-600'>Avg Duration</p>
                  <svg
                    className='w-5 h-5 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <p className='text-3xl font-bold text-gray-900'>
                  {metrics.avgDuration.toFixed(1)}s
                </p>
                <p className='text-sm text-gray-500 mt-1'>
                  Average call length
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className='bg-white rounded-xl shadow-sm p-4 mb-6'>
            <div className='flex flex-col md:flex-row items-center gap-4'>
              <div className='flex-1 w-full'>
                <div className='relative'>
                  <input
                    type='text'
                    placeholder='Search by Execution ID'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  <svg
                    className='absolute left-3 top-2.5 w-5 h-5 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                </div>
              </div>
              <div className='flex items-center gap-4'>
                <label className=' font-medium text-gray-700'>Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPageNumber(1)
                  }}
                  className='px-4 py-2 border border-gray-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>All</option>
                  <option value='completed'>Completed</option>
                  <option value='in-progress'>In Progress</option>
                  <option value='failed'>Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className='bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 mb-6'>
              <p className=' font-medium text-red-800'>{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
              <div className='animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4'></div>
              <p className='text-gray-500'>Loading executions...</p>
            </div>
          ) : (
            <>
              {/* Executions Table */}
              <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
                <div className='overflow-x-auto'>
                  <table className='w-full '>
                    <thead className='bg-gray-50 border-b border-gray-200'>
                      <tr>
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                          Execution ID
                        </th>
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                          User Number
                        </th>
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                          Conversation type
                        </th>
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                          Duration (s)
                        </th>
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                          Hangup by
                        </th>
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                          Batch
                        </th>
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                          Timestamp
                        </th>
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                          Cost
                        </th>
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                          Status
                        </th>
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                          Conversation data
                        </th>
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                          Trace data
                        </th>
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                          Raw data
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {filteredExecutions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={10}
                            className='px-6 py-12 text-center text-gray-500'
                          >
                            {searchQuery
                              ? 'No executions match your search'
                              : 'No executions found'}
                          </td>
                        </tr>
                      ) : (
                        filteredExecutions.map((execution) => (
                          <tr
                            key={execution.id}
                            className='hover:bg-gray-50 transition-colors'
                          >
                            <td className='px-4 py-3 whitespace-nowrap font-mono text-gray-900'>
                              <div className='flex items-center gap-2'>
                                <span>{execution.id.slice(0, 6)}...</span>
                                <button
                                  onClick={(e) => handleCopyId(execution.id, e)}
                                  className='hover:bg-gray-100 rounded p-1 transition-colors cursor-pointer'
                                  title='Copy execution ID'
                                >
                                  {copiedId === execution.id ? (
                                    <Check className='h-4 w-4 text-green-600' />
                                  ) : (
                                    <Copy className='h-4 w-4 text-gray-500' />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className='px-4 py-3 whitespace-nowrap  text-blue-600'>
                              {execution.user_number ||
                                execution.telephony_data?.to_number ||
                                '-'}
                            </td>
                            <td className='px-4 py-3 whitespace-nowrap  text-gray-700'>
                              {execution.telephony_data?.provider || 'plivo'}{' '}
                              {execution.telephony_data?.call_type ||
                                'outbound'}
                            </td>
                            <td className='px-4 py-3 whitespace-nowrap  text-gray-900'>
                              {execution.conversation_duration
                                ? Math.round(execution.conversation_duration)
                                : 0}
                            </td>
                            <td className='px-4 py-3 whitespace-nowrap  text-gray-700'>
                              {execution.telephony_data?.hangup_by || '-'}
                            </td>
                            <td className='px-4 py-3 whitespace-nowrap  text-gray-700'>
                              {execution.batch_id
                                ? execution.batch_id.slice(0, 6)
                                : '-'}
                            </td>
                            <td className='px-4 py-3 whitespace-nowrap  text-gray-700'>
                              {new Date(
                                execution.created_at
                              ).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className='px-4 py-3 whitespace-nowrap  text-gray-900'>
                              ${getTotalCost(execution).toFixed(3)}
                            </td>
                            <td className='px-4 py-3 whitespace-nowrap'>
                              <span
                                className={`px-2 py-1 text-sm font-medium rounded ${
                                  execution.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : execution.status === 'in-progress' ||
                                      execution.status === 'busy'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {execution.status === 'completed'
                                  ? 'Completed'
                                  : execution.status === 'busy'
                                  ? 'Busy'
                                  : execution.status}
                              </span>
                            </td>
                            <td className='px-4 py-3 whitespace-nowrap '>
                              <Link
                                href={`/executions/${execution.id}`}
                                className='text-blue-600 hover:underline flex items-center gap-1'
                              >
                                <span className='text-sm'>
                                  Recordings,
                                  <br />
                                  transcripts,etc
                                </span>
                                <ArrowUpRight size={18} />
                              </Link>
                            </td>
                            <td className=''>
                              <Link
                                href={`/executions/${execution.id}/log`}
                                className=' flex items-center justify-center gap-1'
                              >
                                <ExternalLink size={20} />
                              </Link>
                            </td>
                            <td className='px-2 py-1 whitespace-nowrap text-center'>
                              <button
                                onClick={() => {
                                  setSelectedExecution(execution)
                                  setOpenRawDrawer(true)
                                }}
                                className='cursor-pointer'
                              >
                                <FileSearchCorner size={20} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={setPageNumber}
                onPageSizeChange={setPageSize}
                loading={loading}
              />
            </>
          )}
        </main>
      </div>
      <RawDataDrawer
        open={openRawDrawer}
        onOpenChange={setOpenRawDrawer}
        execution={selectedExecution}
      />
    </>
  )
}
