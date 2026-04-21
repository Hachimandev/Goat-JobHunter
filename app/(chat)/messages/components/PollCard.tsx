'use client';

import React, { useMemo, useState } from 'react';
import { format, isBefore, isToday, isTomorrow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Poll } from '@/types/model';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import PollVoteDialog from './PollVoteDialog';

interface PollCardProps {
  poll: Poll;
}

export default function PollCard({ poll }: Readonly<PollCardProps>) {
  const totalVotes = useMemo(() => poll.options.reduce((s, o) => s + (o.voteCount || 0), 0), [poll]);
  const isVoted = useMemo(() => poll.options.some((o) => o.accountVoted), [poll]);

  const expiresText = useMemo(() => {
    if (!poll.expiresAt) return 'Không thời hạn';
    const exp = new Date(poll.expiresAt);
    const now = new Date();
    if (isBefore(exp, now)) return 'Bình chọn đã kết thúc';
    const time = format(exp, "HH'h'mm", { locale: vi });
    if (isToday(exp)) return `Kết thúc lúc ${time} hôm nay`;
    if (isTomorrow(exp)) return `Kết thúc lúc ${time} ngày mai`;
    return `Kết thúc lúc ${time} ngày ${format(exp, 'dd/MM/yyyy')}`;
  }, [poll.expiresAt]);

  const choiceText = poll.multipleChoice ? 'Chọn nhiều đáp án' : 'Chọn một đáp án';
  const [voteOpen, setVoteOpen] = useState(false);

  return (
    <div className="flex flex-col justify-center my-3 w-110 rounded-xl bg-muted/50 text-muted-foreground mx-auto">
      <div className="flex flex-col items-start gap-2 p-2">
        <span className="text-sm font-bold">{poll.question}</span>
        <span className="text-xs font-bold">{expiresText}</span>
        <span className="text-xs font-bold">{choiceText}</span>
      </div>
      {poll.options.map((opt) => {
        const percent = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
        return (
          <div key={opt.optionId} className="flex items-center gap-3 p-2">
            <div className="flex justify-center items-center gap-1">
              <div className="w-100">
                <div className="h-10 bg-muted rounded-xl mt-1 overflow-hidden relative">
                  <div className="bg-primary h-full" style={{ width: `${percent}%` }} />
                  <div
                    className={`text-sm font-bold ${percent > 0 ? 'text-white' : 'text-primary'} truncate absolute top-2 left-1 p-1`}
                  >
                    {opt.text}
                  </div>
                  <div className="text-sm font-bold text-primary truncate absolute top-2 right-1 p-1">
                    {opt.accountVoted && <Check className="h-4 w-4" />}
                  </div>
                </div>
              </div>
              <div className="text-sm font-bold text-primary ml-2">{opt.voteCount}</div>
            </div>
          </div>
        );
      })}
      <div className="px-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full mb-2 mt-1 text-primary bg-transparent border border-primary hover:text-primary hover:bg-primary/20 rounded-xl"
          onClick={() => setVoteOpen(true)}
        >
          {isVoted ? 'Đổi bình chọn' : 'Bình chọn'}
        </Button>
      </div>

      <PollVoteDialog open={voteOpen} onOpenChange={setVoteOpen} poll={poll} />
    </div>
  );
}
