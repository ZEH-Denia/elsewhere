export type CallStatus = 'idle' | 'ringing' | 'connected' | 'ended'

const statusLabels: Record<CallStatus, string> = {
  idle: '信号待接通',
  ringing: '等待接听',
  connected: '通话中',
  ended: '通话已结束',
}

function PhoneSymbol() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M16.8 8.5 21 17l-4.7 3.6c2.3 5.1 6 8.8 11.1 11.1l3.6-4.7 8.5 4.2-.8 7.1c-.2 1.7-1.7 2.9-3.4 2.7C18.5 39.5 8.5 29.5 7 12.7c-.2-1.7 1-3.2 2.7-3.4l7.1-.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M28 8c6.5 1.3 10.7 5.5 12 12M29.5 14c3.3.8 5.7 3.2 6.5 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function CallState({ status, showLabel = true }: { status: CallStatus; showLabel?: boolean }) {
  return (
    <div className="call-state" data-state={status}>
      {status === 'ended'
        ? <span className="signal-flatline" aria-hidden="true" />
        : <div className="signal-lines" data-state={status} aria-hidden="true"><i /><i /><i /><i /><i /></div>}
      {showLabel && <span>{statusLabels[status]}</span>}
    </div>
  )
}

export function HomeSignal() {
  return (
    <div className="home-signal">
      <PhoneSymbol />
      <p>另一个你<span className="sr-only">，{statusLabels.idle}</span></p>
      <CallState status="idle" showLabel={false} />
    </div>
  )
}

export function CallCard({
  className = '',
  object = false,
  compact = false,
  status = 'idle',
}: {
  className?: string
  object?: boolean
  compact?: boolean
  status?: CallStatus
}) {
  return (
    <div className={`call-visual${object ? ' is-object' : ''}${className ? ` ${className}` : ''}`}>
      <div className="parallel-outline" aria-hidden="true" />
      <div className={`call-card${object ? ' is-object' : ''}`} data-call-status={status}>
        {!compact && (
          <div className="call-card-top" aria-hidden="true">
            <span>PARALLEL CALL</span>
            <span>001</span>
          </div>
        )}
        <div className="caller-main">
          <div className="phone-symbol"><PhoneSymbol /></div>
          <div className="caller-copy">
            <p className="caller-name">另一个你</p>
            {!compact && <p className="caller-origin">来自平行世界的自己</p>}
          </div>
          <CallState status={status} showLabel={object || status !== 'idle'} />
        </div>
        {!compact && (
          <div className="world-labels">
            <span><i aria-hidden="true" />现实 · 工程</span>
            <span><i aria-hidden="true" />平行 · 音乐</span>
          </div>
        )}
      </div>
    </div>
  )
}
