'use client';

import { WebhookData } from '@/lib/types';
import { formatDuration, formatCost, formatDate, getStatusColor, decodeUnicode, parseTranscript } from '@/lib/utils';

interface ConversationCardProps {
  conversation: WebhookData;
  onClick: () => void;
}

export default function ConversationCard({ conversation, onClick }: ConversationCardProps) {
  const messages = parseTranscript(decodeUnicode(conversation.transcript));
  const messageCount = messages.length;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6 border border-gray-200"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {conversation.extracted_data?.caller_name || 'Unknown Caller'}
          </h3>
          <p className="text-sm text-gray-500">{formatDate(conversation.created_at)}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
          {conversation.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Duration</p>
          <p className="text-sm font-medium text-gray-900">{formatDuration(conversation.conversation_duration)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Cost</p>
          <p className="text-sm font-medium text-gray-900">{formatCost(conversation.total_cost)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Messages</p>
          <p className="text-sm font-medium text-gray-900">{messageCount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Caller</p>
          <p className="text-sm font-medium text-gray-900">{conversation.user_number}</p>
        </div>
      </div>

      {conversation.extracted_data && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Call Outcome</p>
          <p className="text-sm text-gray-700">{conversation.extracted_data.call_outcome}</p>
          {conversation.extracted_data.interested_in && (
            <p className="text-xs text-gray-600 mt-1">
              <span className="font-medium">Interested in:</span> {conversation.extracted_data.interested_in}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
