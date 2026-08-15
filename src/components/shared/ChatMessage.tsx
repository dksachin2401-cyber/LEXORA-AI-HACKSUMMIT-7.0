import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'ai';
  content: string;
  timestamp?: string;
  isTyping?: boolean;
}

export function ChatMessage({ role, content, timestamp, isTyping }: ChatMessageProps) {
  const isAi = role === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex gap-3', isAi ? 'justify-start' : 'justify-end')}
    >
      {isAi && (
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center mt-1">
          <Bot className="w-4 h-4 text-amber-500" />
        </div>
      )}
      <div className={cn('max-w-[75%] space-y-1', !isAi && 'items-end')}>
        <div
          className={cn(
            'px-4 py-3 text-sm leading-relaxed',
            isAi
              ? 'chat-bubble-ai text-slate-800 dark:text-slate-200'
              : 'chat-bubble-user text-slate-800 dark:text-slate-200'
          )}
        >
          {isTyping ? (
            <div className="flex items-center gap-1 py-1">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{content}</div>
          )}
        </div>
        {timestamp && (
          <p
            className={cn(
              'text-[11px] text-slate-400 dark:text-slate-500 px-1',
              !isAi && 'text-right'
            )}
          >
            {timestamp}
          </p>
        )}
      </div>
      {!isAi && (
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center mt-1">
          <User className="w-4 h-4 text-cyan-500" />
        </div>
      )}
    </motion.div>
  );
}

export default ChatMessage;
