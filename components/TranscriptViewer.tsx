'use client'

import { WebhookData } from '@/lib/types'
import {
  parseTranscript,
  decodeUnicode,
  formatDuration,
  formatCost,
  formatDate,
} from '@/lib/const'

interface TranscriptViewerProps {
  conversation: WebhookData
  onClose: () => void
}

export default function TranscriptViewer({
  conversation,
  onClose,
}: TranscriptViewerProps) {
  const messages = parseTranscript(decodeUnicode(conversation.transcript))

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6'>
          <div className='flex justify-between items-start'>
            <div>
              <h2 className='text-2xl font-bold mb-2'>
                {conversation.extracted_data?.caller_name || 'Unknown Caller'}
              </h2>
              <p className='text-blue-100'>
                {formatDate(conversation.created_at)}
              </p>
            </div>
            <button
              onClick={onClose}
              className='text-white hover:bg-blue-800 rounded-full p-2 transition-colors'
              aria-label='Close'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          <div className='grid grid-cols-4 gap-4 mt-4'>
            <div>
              <p className='text-blue-200 text-xs'>Duration</p>
              <p className='font-semibold'>
                {formatDuration(conversation.conversation_duration)}
              </p>
            </div>
            <div>
              <p className='text-blue-200 text-xs'>Cost</p>
              <p className='font-semibold'>
                {formatCost(conversation.total_cost)}
              </p>
            </div>
            <div>
              <p className='text-blue-200 text-xs'>Status</p>
              <p className='font-semibold capitalize'>{conversation.status}</p>
            </div>
            <div>
              <p className='text-blue-200 text-xs'>Messages</p>
              <p className='font-semibold'>{messages.length}</p>
            </div>
          </div>
        </div>

        {/* Call Details */}
        <div className='bg-gray-50 p-4 border-b border-gray-200'>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-gray-600'>From:</span>{' '}
              <span className='font-medium'>{conversation.agent_number}</span>
            </div>
            <div>
              <span className='text-gray-600'>To:</span>{' '}
              <span className='font-medium'>{conversation.user_number}</span>
            </div>
            {conversation.extracted_data?.appointment_booked && (
              <div>
                <span className='text-gray-600'>Appointment:</span>{' '}
                <span className='font-medium capitalize'>
                  {conversation.extracted_data.appointment_booked}
                </span>
              </div>
            )}
            {conversation.telephony_data?.hangup_reason && (
              <div>
                <span className='text-gray-600'>Hangup:</span>{' '}
                <span className='font-medium'>
                  {conversation.telephony_data.hangup_reason}
                </span>
              </div>
            )}
          </div>

          {conversation.telephony_data?.recording_url && (
            <div className='mt-3'>
              <audio
                controls
                className='w-full'
                src={conversation.telephony_data.recording_url}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>

        {/* Transcript */}
        <div className='flex-1 overflow-y-auto p-6'>
          <h3 className='text-lg font-semibold mb-4 text-gray-900'>
            Conversation Transcript
          </h3>
          <div className='space-y-4'>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.speaker === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    msg.speaker === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className='text-xs font-semibold mb-1 opacity-75'>
                    {msg.speaker === 'user' ? 'User' : 'Assistant'}
                  </p>
                  <p className='text-sm whitespace-pre-wrap'>{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extracted Data */}
        {conversation.extracted_data && (
          <div className='bg-gray-50 p-6 border-t border-gray-200'>
            <h3 className='text-lg font-semibold mb-3 text-gray-900'>
              Extracted Information
            </h3>
            <div className='grid grid-cols-2 gap-3 text-sm'>
              {Object.entries(conversation.extracted_data).map(
                ([key, value]) => {
                  if (value && value !== 'null') {
                    return (
                      <div key={key}>
                        <span className='text-gray-600 capitalize'>
                          {key.replace(/_/g, ' ')}:
                        </span>{' '}
                        <span className='font-medium'>{value}</span>
                      </div>
                    )
                  }
                  return null
                }
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
