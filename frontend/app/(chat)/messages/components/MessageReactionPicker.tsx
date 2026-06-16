'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react';
import { Plus } from 'lucide-react';

const QUICK_REACTIONS = ['👍', '😂', '😮', '😢', '😡', '🎉', '🔥'];

interface MessageReactionPickerProps {
  onSelect: (emoji: string) => void;
  trigger: React.ReactNode;
}

export function MessageReactionPicker({ onSelect, trigger }: MessageReactionPickerProps) {
  const [open, setOpen] = useState(false);
  const [showFull, setShowFull] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-auto p-1 rounded-full" side="top" align="center">
        {showFull ? (
          <EmojiPicker
            onEmojiClick={(data: EmojiClickData) => {
              onSelect(data.emoji);
              setOpen(false);
              setShowFull(false);
            }}
            emojiStyle={EmojiStyle.NATIVE}
            theme={Theme.LIGHT}
            searchDisabled
            skinTonesDisabled
            width={300}
            height={350}
          />
        ) : (
          <div className="flex items-center gap-1">
            {QUICK_REACTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="icon"
                className="h-8 w-8 transition-transform rounded-full"
                onClick={() => {
                  onSelect(emoji);
                  setOpen(false);
                }}
              >
                {emoji}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 text-xs text-muted-foreground rounded-full"
              onClick={() => setShowFull(true)}
            >
              <Plus />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
