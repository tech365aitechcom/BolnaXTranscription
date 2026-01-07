'use client';

import { useState, useEffect } from 'react';
import { WebhookData, ConversationMessage } from '@/lib/types';
import { parseTranscript, decodeUnicode } from '@/lib/utils';

export default function Home() {
  const [conversation, setConversation] = useState<WebhookData | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch latest conversation with polling
  useEffect(() => {
    async function fetchLatestConversation() {
      try {
        const response = await fetch('/api/latest', { cache: 'no-store' });
        const data = await response.json();

        if (data && data.transcript) {
          setConversation(data);
          const parsedMessages = parseTranscript(decodeUnicode(data.transcript));
          setMessages(parsedMessages);
        }
      } catch (err) {
        console.error('Error fetching conversation:', err);
        setError('Failed to load conversation');
      }
    }

    // Fetch immediately on mount
    fetchLatestConversation();

    // Poll every 5 seconds for updates
    const interval = setInterval(fetchLatestConversation, 5000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Conversation Transcript
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">Real-time conversation viewer</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Transcript Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Loading transcript...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Conversation Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
                    <p className="text-xs text-gray-500">Messages</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200"></div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {messages.filter(m => m.speaker === 'user').length}
                    </p>
                    <p className="text-xs text-gray-500">User</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200"></div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {messages.filter(m => m.speaker === 'assistant').length}
                    </p>
                    <p className="text-xs text-gray-500">Assistant</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="space-y-5">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className={`flex items-end space-x-2 max-w-[85%] ${msg.speaker === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        msg.speaker === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                          : 'bg-gradient-to-br from-purple-500 to-purple-600'
                      }`}>
                        {msg.speaker === 'user' ? 'U' : 'A'}
                      </div>

                      {/* Message Bubble */}
                      <div className={`rounded-2xl px-5 py-3 shadow-md ${
                        msg.speaker === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                      }`}>
                        <div className={`flex items-center space-x-2 mb-1.5 ${
                          msg.speaker === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <p className="text-xs font-semibold">
                            {msg.speaker === 'user' ? 'User' : 'Assistant'}
                          </p>
                          <span className="text-xs opacity-60">•</span>
                          <span className="text-xs opacity-75">
                            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={`text-[15px] leading-relaxed whitespace-pre-wrap ${
                          msg.speaker === 'user' ? 'text-white' : 'text-gray-700'
                        }`}>
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Info */}
            <div className="text-center">
              <p className="text-xs text-gray-400">
                End of conversation • {messages.length} messages total
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
