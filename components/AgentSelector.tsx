'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export default function AgentSelector() {
  const { data: session } = useSession()
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const agents = session?.user?.agents || []

  // Initialize selected agent from localStorage or default to first agent
  useEffect(() => {
    if (agents.length > 0) {
      const stored = localStorage.getItem('selectedAgentId')
      if (stored && agents.some((a) => a.bolnaAgentId === stored)) {
        setSelectedAgentId(stored)
      } else {
        // Default to "All Agents" (null)
        setSelectedAgentId(null)
      }
    }
  }, [agents])

  // Save to localStorage when selection changes
  const handleSelectAgent = (agentId: string | null) => {
    setSelectedAgentId(agentId)
    if (agentId) {
      localStorage.setItem('selectedAgentId', agentId)
    } else {
      localStorage.removeItem('selectedAgentId')
    }
    setIsOpen(false)
    // Reload the page to fetch data for selected agent
    window.location.reload()
  }

  // Don't show selector if user has 0 or 1 bot
  if (agents.length <= 1) {
    return null
  }

  const selectedAgent = selectedAgentId
    ? agents.find((a) => a.bolnaAgentId === selectedAgentId)
    : null

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
      >
        <div className='flex items-center gap-2'>
          {selectedAgent ? (
            <>
              <div
                className='w-3 h-3 rounded-full'
                style={{ backgroundColor: selectedAgent.color || '#3B82F6' }}
              />
              <span className='font-medium text-gray-700'>
                {selectedAgent.name}
              </span>
            </>
          ) : (
            <>
              <div className='w-3 h-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600' />
              <span className='font-medium text-gray-700'>All Agents</span>
            </>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className='fixed inset-0 z-10'
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className='absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden'>
            {/* All Agents option */}
            <button
              onClick={() => handleSelectAgent(null)}
              className='w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left'
            >
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600' />
                <div>
                  <p className='font-medium text-gray-900'>All Agents</p>
                  <p className='text-xs text-gray-500'>
                    View data from all bots
                  </p>
                </div>
              </div>
              {selectedAgentId === null && (
                <Check className='h-4 w-4 text-blue-600' />
              )}
            </button>

            <div className='border-t border-gray-200' />

            {/* Individual agents */}
            {agents.map((agent) => (
              <button
                key={agent.bolnaAgentId}
                onClick={() => handleSelectAgent(agent.bolnaAgentId)}
                className='w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left'
              >
                <div className='flex items-center gap-2'>
                  <div
                    className='w-3 h-3 rounded-full'
                    style={{ backgroundColor: agent.color || '#3B82F6' }}
                  />
                  <div>
                    <p className='font-medium text-gray-900'>{agent.name}</p>
                    {agent.description && (
                      <p className='text-xs text-gray-500'>
                        {agent.description}
                      </p>
                    )}
                  </div>
                </div>
                {selectedAgentId === agent.bolnaAgentId && (
                  <Check className='h-4 w-4 text-blue-600' />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
