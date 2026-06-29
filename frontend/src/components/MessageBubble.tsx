import ReactMarkdown from 'react-markdown'
import type { Message } from '../hooks/useChat'

interface Props {
  message: Message
  isStreaming?: boolean
}

export function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 mt-0.5
        ${isUser ? 'bg-white text-black' : 'bg-white/10 text-white/70'}`}>
        {isUser ? 'J' : 'AI'}
      </div>

      <div className={`flex flex-col gap-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>

        {/* Bubble */}
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? 'bg-white text-black rounded-tr-sm'
            : message.error
              ? 'bg-red-500/10 border border-red-500/20 text-red-400 rounded-tl-sm'
              : 'bg-white/6 border border-white/8 text-white/90 rounded-tl-sm'
          }`}>
          {message.content === '' && isStreaming && !isUser ? (
            <span className="flex items-center gap-1 h-5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:300ms]" />
            </span>
          ) : isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none
              prose-p:my-1 prose-p:leading-relaxed
              prose-ul:my-1 prose-ul:pl-4
              prose-ol:my-1 prose-ol:pl-4
              prose-li:my-0.5
              prose-strong:text-white prose-strong:font-semibold
              prose-headings:text-white prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1
              prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:text-white/80
              prose-hr:border-white/10">
              <ReactMarkdown>{message.content}</ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-white/40 animate-pulse rounded-sm align-middle" />
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
