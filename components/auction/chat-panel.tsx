'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuctionStore } from '@/lib/auction-store'
import { sendChatMessage } from '@/app/actions/rooms'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'

interface Props {
  roomCode: string
  myId: string | null
}

export function ChatPanel({ roomCode, myId }: Props) {
  const { chatMessages, myParticipantId, applyChat } = useAuctionStore()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages.length])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() || !myId || sending) return
    const outgoing = message.trim()
    setSending(true)
    setError('')
    const result = await sendChatMessage({ roomCode, participantId: myId, message: outgoing })
    if (result.error) {
      setError(result.error)
    } else {
      if (result.message) applyChat(result.message)
      setMessage('')
    }
    setSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      handleSend(e as unknown as React.FormEvent)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-2">
          {chatMessages.map(msg => {
            const isMe = msg.participantId === myParticipantId
            const isSystem = msg.messageType === 'system'

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center py-1">
                  <span className="text-[10px] text-muted-foreground bg-accent rounded-full px-3 py-1">{msg.message}</span>
                </div>
              )
            }

            return (
              <div key={msg.id} className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: msg.avatarColor }}
                >
                  {msg.displayName.charAt(0).toUpperCase()}
                </div>
                <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                  {!isMe && (
                    <span className="text-[10px] text-muted-foreground">{msg.displayName}</span>
                  )}
                  <div
                    className={`rounded-2xl px-3 py-1.5 text-xs leading-relaxed break-words ${
                      isMe
                        ? 'bg-primary/20 text-primary rounded-tr-sm'
                        : 'bg-accent text-foreground rounded-tl-sm'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
        {chatMessages.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No messages yet. Say something!
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-border p-3">
        <form onSubmit={handleSend}>
          <Input
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say something..."
            className="bg-card border-border text-sm h-9"
            maxLength={300}
            disabled={!myId}
          />
        </form>
        {error && <p className="mt-2 text-[10px] text-destructive">{error}</p>}
      </div>
    </div>
  )
}
