'use client'

import { useAuctionStore } from '@/lib/auction-store'
import { formatCurrency } from '@/lib/utils/format'

export function BidHistoryList() {
  const { bidHistory, myParticipantId } = useAuctionStore()

  if (bidHistory.length === 0) return null

  return (
    <div className="border-t border-border px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
      {bidHistory.slice(0, 8).map((bid, i) => {
        const isMe = bid.participantId === myParticipantId
        const isLatest = i === 0
        return (
          <div
            key={bid.id}
            className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              isLatest
                ? 'border-primary/50 bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground'
            } ${isLatest ? 'bid-pulse' : ''}`}
          >
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
              style={{ backgroundColor: bid.avatarColor }}
            >
              {bid.displayName.charAt(0).toUpperCase()}
            </span>
            <span className={isMe ? 'text-primary' : ''}>{isMe ? 'You' : bid.displayName}</span>
            <span className={`font-black ${isLatest ? 'text-primary' : 'text-foreground'}`}>
              {formatCurrency(bid.amount)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
