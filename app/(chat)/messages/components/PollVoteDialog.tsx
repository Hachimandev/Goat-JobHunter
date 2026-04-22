'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { format, isBefore, isToday, isTomorrow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Poll } from '@/types/model';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useVotePollMutation, useFetchVotesForPollQuery } from '@/services/poll/vote/voteApi';
import { usePinMessageMutation } from '@/services/chatRoom/pinned_message/pinnedMessageApi';
import { IBackendError } from '@/types/api';
import { Settings, Loader2, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUser } from '@/hooks/useUser';
import { isCompanyResponse } from '@/utils/slug';
import { CompanyResponse, MeResponse, UserResponse } from '@/types/dto';
import { useAddOptionsMutation, useClosePollMutation } from '@/services/poll/pollApi';
import { text } from 'stream/consumers';

interface PollVoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poll: Poll;
}

export default function PollVoteDialog({ open, onOpenChange, poll }: Readonly<PollVoteDialogProps>) {
  const { user: currentUser } = useUser();
  const totalVotes = useMemo(() => poll.options.reduce((s, o) => s + (o.voteCount || 0), 0), [poll]);

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

  const [selectedSingle, setSelectedSingle] = useState<string | undefined>(undefined);
  const [selectedMulti, setSelectedMulti] = useState<Record<string, boolean>>({});
  const [newOptions, setNewOptions] = useState<{ id: string; text: string }[]>([]);
  const [pollMenuOpen, setPollMenuOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (poll.multipleChoice) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedMulti(() => {
        const map: Record<string, boolean> = {};
        for (const o of poll.options) {
          map[o.optionId] = o.accountVoted || false;
        }
        return map;
      });
    } else {
      const votedOption = poll.options.find((o) => o.accountVoted);
      setSelectedSingle(votedOption?.optionId);
    }

    setNewOptions([]);
  }, [open, poll.multipleChoice, poll.options]);

  const handleToggleMulti = (optId: string, checked: boolean) => {
    setSelectedMulti((prev) => ({ ...prev, [optId]: checked }));
  };

  const handleRemoveNewOption = (optionId: string) => {
    setNewOptions((prev) => prev.filter((o) => o.id !== optionId));
    setSelectedMulti((prev) => {
      const copy = { ...prev };
      delete copy[optionId];
      return copy;
    });
    if (selectedSingle === optionId) {
      setSelectedSingle(undefined);
    }
  };

  const [votePoll, { isLoading: isVoting }] = useVotePollMutation();
  const [pinMessage, { isLoading: isPinning }] = usePinMessageMutation();
  const [closePoll, { isLoading: isClosing }] = useClosePollMutation();
  const [addOptions, { isLoading: isAddingOptions }] = useAddOptionsMutation();

  const { data: votesData } = useFetchVotesForPollQuery(
    { chatRoomId: poll.chatRoomId, pollId: poll.pollId },
    { skip: !poll.pollId },
  );

  const votesByOption = useMemo(() => {
    const list = votesData?.data ?? [];
    const map: Record<string, { accountId: number; fullName: string; avatar?: string }[]> = {};
    for (const v of list) {
      const oid = v.option.optionId;
      if (!map[oid]) map[oid] = [];
      map[oid].push(v.account);
    }
    return map;
  }, [votesData]);

  const getOptionVoteCount = useCallback(
    (optionId: string): number => {
      const baseCount = poll.options.find((o) => o.optionId === optionId)?.voteCount || 0;
      const isSelected = poll.multipleChoice ? selectedMulti[optionId] : selectedSingle === optionId;
      const wasVoted = poll.options.find((o) => o.optionId === optionId)?.accountVoted || false;

      if (isSelected && !wasVoted) return baseCount + 1;
      else if (!isSelected && wasVoted) return Math.max(0, baseCount - 1);
      return baseCount;
    },
    [poll.options, selectedMulti, selectedSingle, poll.multipleChoice],
  );

  const dynamicTotalVotes = useMemo(() => {
    let total = totalVotes;
    for (const opt of poll.options) {
      const wasVoted = opt.accountVoted || false;
      const isSelected = poll.multipleChoice ? selectedMulti[opt.optionId] : selectedSingle === opt.optionId;

      if (isSelected && !wasVoted) total += 1;
    }
    return total;
  }, [totalVotes, selectedSingle, selectedMulti, poll.options, poll.multipleChoice]);

  const handleConfirm = async () => {
    const texts = newOptions.map((o) => o.text.trim()).filter((text) => text.length > 0);
    if (texts.length > 0) {
      await handleAddOptions(texts);
      return;
    }
    await handleVote();
  };

  const handleAddOptions = async (texts: string[]) => {
    try {
      await addOptions({ chatRoomId: Number(poll.chatRoomId), pollId: poll.pollId, texts: texts }).unwrap();
      toast.success('Thêm lựa chọn thành công');
      setNewOptions([]);
    } catch (err) {
      const e = err as IBackendError;
      const msg = e?.data?.message || 'Không thể gửi bình chọn';
      toast.error(msg);
    }
  };

  const handleVote = async () => {
    const selected = poll.multipleChoice
      ? Object.entries(selectedMulti)
          .filter(([, v]) => v)
          .map(([k]) => k)
      : selectedSingle
        ? [selectedSingle]
        : [];

    try {
      await votePoll({ chatRoomId: Number(poll.chatRoomId), pollId: poll.pollId, optionIds: selected }).unwrap();
      toast.success('Bình chọn thành công');
      onOpenChange(false);
    } catch (err: unknown) {
      const e = err as IBackendError;
      const msg = e?.data?.message || 'Không thể gửi bình chọn';
      toast.error(msg);
    }
  };

  const handlePinned = async () => {
    if (isPinning) return;
    try {
      await pinMessage({ chatRoomId: poll.chatRoomId, messageId: poll.messageId }).unwrap();
      toast.success('Ghim bình chọn thành công');
      setPollMenuOpen(false);
    } catch (err) {
      toast.error((err as IBackendError)?.data?.message || 'Đã có lỗi xảy ra');
    }
  };

  const handleClosePoll = async () => {
    if (isClosing) return;
    try {
      await closePoll({ chatRoomId: poll.chatRoomId, pollId: poll.pollId }).unwrap();
      toast.success('Đóng bình chọn thành công');
      setPollMenuOpen(false);
    } catch (err) {
      toast.error((err as IBackendError)?.data?.message || 'Đã có lỗi xảy ra');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full rounded-xl p-0 gap-0 max-h-[80vh] overflow-auto">
        <DialogHeader className="px-5 pt-5 pb-2 border-b">
          <DialogTitle>Bình chọn {poll.isClosed ? '(Đã đóng)' : ''}</DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-4">
          <div className="flex flex-col items-start gap-2">
            <span className="text-sm font-bold">{poll.question}</span>
            <span className="text-xs font-bold text-muted-foreground">
              {poll.createdBy} - {format(poll.createdAt, 'dd/MM/yyyy HH:mm')}
            </span>
            <span className="text-xs font-bold text-muted-foreground">{expiresText}</span>
            <span className="text-xs font-bold text-muted-foreground">{choiceText}</span>
          </div>

          <div className="space-y-2">
            {!poll.multipleChoice ? (
              <RadioGroup
                value={selectedSingle || ''}
                onValueChange={(v) => setSelectedSingle(v)}
                disabled={poll.isClosed}
              >
                {poll.options.map((opt) => {
                  const voteCount = getOptionVoteCount(opt.optionId);
                  const percent = dynamicTotalVotes > 0 ? Math.round((voteCount / dynamicTotalVotes) * 100) : 0;
                  const voters = votesByOption[opt.optionId] ?? [];
                  const isSelected = selectedSingle === opt.optionId;

                  const otherVoters = currentUser
                    ? voters.filter((v) => v.accountId !== currentUser.accountId)
                    : voters;
                  const displayVoters =
                    isSelected && currentUser
                      ? [
                          {
                            accountId: currentUser.accountId,
                            fullName: isCompanyResponse(currentUser as MeResponse)
                              ? (currentUser as CompanyResponse).name
                              : (currentUser as UserResponse).fullName,
                            avatar: isCompanyResponse(currentUser as MeResponse)
                              ? (currentUser as CompanyResponse).logo
                              : (currentUser as UserResponse).avatar,
                          },
                          ...otherVoters,
                        ]
                      : otherVoters;
                  const shown = displayVoters.slice(0, 2);
                  const rest = Math.max(0, displayVoters.length - shown.length);

                  return (
                    <div
                      key={opt.optionId}
                      onClick={() => !poll.isClosed && setSelectedSingle(opt.optionId)}
                      className={`cursor-pointer rounded-xl transition-all`}
                    >
                      <div className="flex justify-center items-center gap-3">
                        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                          <RadioGroupItem value={opt.optionId} />
                        </div>
                        <div className="relative flex-1">
                          <div
                            className="h-10 bg-muted rounded-xl mt-1 overflow-hidden relative cursor-pointer"
                            onClick={(e) => {
                              if (poll.isClosed) return;
                              e.stopPropagation();
                              setSelectedSingle(opt.optionId);
                            }}
                          >
                            <div
                              className="bg-primary h-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                            <div
                              className={
                                percent > 0
                                  ? 'text-sm font-bold text-white truncate absolute top-2 left-1 p-1 transition-colors duration-300'
                                  : 'text-sm font-bold text-primary truncate absolute top-2 left-1 p-1 transition-colors duration-300'
                              }
                            >
                              {opt.text}
                            </div>
                            <div className="absolute bottom-2 right-2 flex items-center">
                              <div className="flex -space-x-2 items-center">
                                {shown.map((a, idx) => (
                                  <div
                                    key={`${a.accountId}-${idx}`}
                                    className={
                                      'h-6 w-6 rounded-full ring-2 ring-white overflow-hidden bg-muted flex items-center justify-center transition-all duration-300 ' +
                                      (idx === 0 ? 'z-20' : idx === 1 ? 'z-10' : 'z-0')
                                    }
                                  >
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={a.avatar || '/placeholder.svg'} alt={a.fullName} />
                                      <AvatarFallback>{a.fullName?.charAt(0) ?? 'U'}</AvatarFallback>
                                    </Avatar>
                                  </div>
                                ))}

                                {rest > 0 && (
                                  <div className="h-6 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-primary ring-2 ring-white">
                                    +{rest}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-sm font-bold text-primary shrink-0 transition-all duration-300">
                          {voteCount}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {newOptions.map((newOpt) => {
                  return (
                    <div
                      key={newOpt.id}
                      onClick={() => !poll.isClosed && setSelectedSingle(newOpt.id)}
                      className="cursor-pointer rounded-xl transition-all"
                    >
                      <div className="flex justify-center items-center gap-3 w-full">
                        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                          <RadioGroupItem value={newOpt.id} />
                        </div>
                        <div className="relative flex-1">
                          <div className="h-10 bg-muted rounded-xl mt-1 overflow-hidden relative cursor-pointer flex items-center px-3 ">
                            {newOpt.text ? (
                              <span className="text-sm font-bold text-primary truncate">{newOpt.text}</span>
                            ) : (
                              <input
                                type="text"
                                placeholder="Nhập lựa chọn..."
                                value={newOpt.text}
                                onChange={(e) => {
                                  setNewOptions((prev) =>
                                    prev.map((opt) => (opt.id === newOpt.id ? { ...opt, text: e.target.value } : opt)),
                                  );
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full h-full text-sm bg-transparent border-0 outline-none placeholder:text-muted-foreground focus:ring-0"
                                autoFocus
                              />
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveNewOption(newOpt.id);
                          }}
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors shrink-0 cursor-pointer"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </RadioGroup>
            ) : (
              <>
                {poll.options.map((opt) => {
                  const voteCount = getOptionVoteCount(opt.optionId);
                  const percent = dynamicTotalVotes > 0 ? Math.round((voteCount / dynamicTotalVotes) * 100) : 0;
                  const voters = votesByOption[opt.optionId] ?? [];
                  const isSelected = selectedMulti[opt.optionId];

                  const otherVoters = currentUser
                    ? voters.filter((v) => v.accountId !== currentUser.accountId)
                    : voters;
                  const displayVoters =
                    isSelected && currentUser
                      ? [
                          {
                            accountId: currentUser.accountId,
                            fullName: isCompanyResponse(currentUser as MeResponse)
                              ? (currentUser as CompanyResponse).name
                              : (currentUser as UserResponse).fullName,
                            avatar: isCompanyResponse(currentUser as MeResponse)
                              ? (currentUser as CompanyResponse).logo
                              : (currentUser as UserResponse).avatar,
                          },
                          ...otherVoters,
                        ]
                      : otherVoters;
                  const shown = displayVoters.slice(0, 3);
                  const rest = Math.max(0, displayVoters.length - shown.length);

                  return (
                    <div
                      key={opt.optionId}
                      onClick={() => {
                        if (poll.isClosed) return;
                        handleToggleMulti(opt.optionId, !selectedMulti[opt.optionId]);
                      }}
                      className={`cursor-pointer rounded-xl transition-all`}
                    >
                      <div className="flex justify-center items-center gap-3">
                        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={Boolean(selectedMulti[opt.optionId])}
                            onCheckedChange={(v) => handleToggleMulti(opt.optionId, Boolean(v))}
                            disabled={poll.isClosed}
                          />
                        </div>
                        <div className="relative flex-1">
                          <div
                            className="h-10 bg-muted rounded-xl mt-1 overflow-hidden relative cursor-pointer"
                            onClick={(e) => {
                              if (poll.isClosed) return;
                              e.stopPropagation();
                              handleToggleMulti(opt.optionId, !selectedMulti[opt.optionId]);
                            }}
                          >
                            <div
                              className="bg-primary h-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />

                            <div
                              className={
                                percent > 0
                                  ? 'text-sm font-bold text-white truncate absolute top-2 left-1 p-1 transition-colors duration-300'
                                  : 'text-sm font-bold text-primary truncate absolute top-2 left-1 p-1 transition-colors duration-300'
                              }
                            >
                              {opt.text}
                            </div>

                            <div className="absolute bottom-2 right-2 flex items-center transition-all duration-300">
                              <div className="flex -space-x-2 items-center">
                                {shown.map((a, idx) => (
                                  <div
                                    key={`${a.accountId}-${idx}`}
                                    className={
                                      'h-6 w-6 rounded-full ring-2 ring-white overflow-hidden bg-muted flex items-center justify-center transition-all duration-300 ' +
                                      (idx === 0 ? 'z-20' : idx === 1 ? 'z-10' : 'z-0')
                                    }
                                  >
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={a.avatar || '/placeholder.svg'} alt={a.fullName} />
                                      <AvatarFallback>{a.fullName?.charAt(0) ?? 'U'}</AvatarFallback>
                                    </Avatar>
                                  </div>
                                ))}

                                {rest > 0 && (
                                  <div className="h-6 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-primary ring-2 ring-white">
                                    +{rest}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-sm font-bold text-primary shrink-0 transition-all duration-300">
                          {voteCount}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {newOptions.map((newOpt) => {
                  return (
                    <div
                      key={newOpt.id}
                      onClick={() => {
                        if (poll.isClosed) return;
                        handleToggleMulti(newOpt.id, !selectedMulti[newOpt.id]);
                      }}
                      className="cursor-pointer rounded-xl transition-all"
                    >
                      <div className="flex justify-center items-center gap-3">
                        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={Boolean(selectedMulti[newOpt.id])}
                            onCheckedChange={(v) => handleToggleMulti(newOpt.id, Boolean(v))}
                            disabled={poll.isClosed}
                          />
                        </div>
                        <div className="relative flex-1">
                          <div className="h-10 bg-muted rounded-xl mt-1 overflow-hidden relative cursor-pointer flex items-center px-3">
                            {newOpt.text ? (
                              <span className="text-sm font-bold text-primary truncate">{newOpt.text}</span>
                            ) : (
                              <input
                                type="text"
                                placeholder="Nhập lựa chọn..."
                                value={newOpt.text}
                                onChange={(e) => {
                                  setNewOptions((prev) =>
                                    prev.map((opt) => (opt.id === newOpt.id ? { ...opt, text: e.target.value } : opt)),
                                  );
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full h-full text-sm bg-transparent border-0 outline-none placeholder:text-muted-foreground focus:ring-0"
                                autoFocus
                              />
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveNewOption(newOpt.id);
                          }}
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors shrink-0"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {poll.allowAddOption && !poll.isClosed && poll.options.length + newOptions.length < 10 && (
            <div
              className="font-bold text-primary cursor-pointer flex items-center gap-2 hover:opacity-80 transition-opacity mt-4"
              onClick={() => {
                const newId = `new-${Date.now()}`;
                setNewOptions((prev) => [...prev, { id: newId, text: '' }]);
              }}
            >
              + Thêm lựa chọn
            </div>
          )}
        </div>

        <DialogFooter className="p-3 border-t">
          <div className="relative">
            <button
              onClick={() => setPollMenuOpen(!pollMenuOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <Settings className="h-5 w-5" />
            </button>
            {pollMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 bg-background border border-border rounded-lg shadow-lg z-50 min-w-[200px] overflow-hidden">
                <div
                  onClick={handlePinned}
                  className={`px-4 py-2 flex items-center gap-2 text-sm ${
                    isPinning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted cursor-pointer'
                  }`}
                  style={{ pointerEvents: isPinning ? 'none' : 'auto' }}
                >
                  {isPinning ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {'Ghim bình chọn'}
                </div>
                {!poll.isClosed && poll.createdBy === currentUser?.email && (
                  <div
                    onClick={handleClosePoll}
                    className={`px-4 py-2 flex items-center gap-2 text-sm ${
                      isClosing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted cursor-pointer'
                    }`}
                    style={{ pointerEvents: isClosing ? 'none' : 'auto' }}
                  >
                    {isClosing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Đóng bình chọn
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isVoting || isAddingOptions}>
              Đóng
            </Button>
            {!poll.isClosed && (
              <Button onClick={handleConfirm} disabled={isVoting || isAddingOptions}>
                {isVoting || isAddingOptions ? 'Đang gửi...' : 'Xác nhận'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
