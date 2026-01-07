'use client'

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer'
import { WebhookData } from '@/lib/types'
import { Copy, X } from 'lucide-react'
import { toast } from 'sonner'

interface RawDataDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  execution: WebhookData | null
}

export default function RawDataDrawer({
  open,
  onOpenChange,
  execution,
}: RawDataDrawerProps) {
  const handleCopy = () => {
    if (!execution) return
    navigator.clipboard.writeText(JSON.stringify(execution, null, 2))
    toast.success('Copied raw data')
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction='right'>
      <DrawerContent
        className='
    bg-[#f8fafc]
    border-l border-slate-200
    shadow-[-8px_0_24px_rgba(0,0,0,0.08)]
    p-0
    w-[30vw]           /* 👈 30% of viewport */
    max-w-[480px]      /* 👈 optional safety limit */
    ml-auto            /* 👈 push drawer to right */
  '
      >
        {/* Header */}
        <DrawerHeader className='flex items-center justify-between px-4 py-3 border-b border-slate-200'>
          <DrawerTitle className='text-sm font-medium text-slate-800'>
            Raw call data
          </DrawerTitle>

          <div className='flex items-center gap-1'>
            <button
              onClick={handleCopy}
              className='rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition'
              title='Copy JSON'
            >
              <Copy className='w-4 h-4' />
            </button>

            <DrawerClose asChild>
              <button className='rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition'>
                <X className='w-4 h-4' />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Body */}
        <div className='h-[calc(100vh-52px)] p-4 overflow-hidden'>
          <div className='h-full overflow-auto rounded-lg bg-[#0b1220] border border-[#1e293b] px-4 py-3'>
            <pre className='text-[13px] leading-relaxed text-slate-200 whitespace-pre-wrap break-all font-mono'>
              {execution
                ? JSON.stringify(execution, null, 2)
                : 'No raw data available'}
            </pre>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
