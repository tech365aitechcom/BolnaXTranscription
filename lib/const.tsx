import { ConversationMessage } from './types'

// Parse the transcript string into conversation messages
export function parseTranscript(transcript: string): ConversationMessage[] {
  const messages: ConversationMessage[] = []

  // Split by newlines and process each line
  const lines = transcript.split('\n').filter((line) => line.trim())

  for (const line of lines) {
    // Match pattern: "speaker: message"
    const match = line.match(/^(assistant|user):\s*(.+)$/)

    if (match) {
      const [, speaker, message] = match
      messages.push({
        speaker: speaker as 'assistant' | 'user',
        message: message.trim(),
      })
    }
  }

  return messages
}

// Format duration in seconds to readable format
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}m ${secs}s`
}

// Format cost to currency
export function formatCost(cost: number): string {
  return `₹${cost.toFixed(2)}`
}

// Format date to readable format
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

// Decode Unicode escape sequences (like \u0928\u092e\u0938\u094d\u0924\u0947)
export function decodeUnicode(str: string): string {
  return str.replace(/\\u[\dA-F]{4}/gi, (match) => {
    return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))
  })
}

// Get status badge color
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
