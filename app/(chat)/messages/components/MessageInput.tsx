import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Paperclip, Send, X, Pilcrow, Smile, UserRound, Languages, Loader2, Volume2 } from 'lucide-react';
import { useTranslateMessageMutation } from '@/services/ai/conversationApi';
import { toast } from 'sonner';
import { COUNTRY_OPTIONS } from '@/constants/constant';
import { cn } from '@/lib/utils';
import MarkdownDisplay from '@/components/common/MarkdownDisplay';
import { useState, useRef, useCallback, type KeyboardEvent, type ChangeEvent } from 'react';
import RichTextEditor from '@/components/RichText/Editor';
import { MessageResponse } from '@/types/model';
import { getMessagePreviewText, getMessageSenderDisplayName } from '@/utils/messageUtils';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { BusinessCardModal } from '@/app/(chat)/messages/components/BusinessCardModal';
import type { SendContactCardsSubmitResult } from '@/services/chatRoom/chatRoomType';
import { IBackendError } from '@/types/api';

type RichTextSelection = {
  index: number;
  length: number;
} | null;

type RichTextEditorInstance = {
  getSelection: () => RichTextSelection;
  getLength: () => number;
  insertText: (index: number, text: string, source?: 'api' | 'user' | 'silent') => void;
  setSelection: (index: number, length?: number, source?: 'api' | 'user' | 'silent') => void;
  focus: () => void;
  root: {
    innerHTML: string;
  };
};

interface MessageInputProps {
  readonly onSendMessage: (text?: string, files?: File[], replyToMessageId?: string | null) => void | Promise<void>;
  readonly onSendContactCards?:
    | ((selectedUserIds: number[]) => Promise<SendContactCardsSubmitResult | null>)
    | ((selectedUserIds: number[]) => SendContactCardsSubmitResult | null);
  readonly replyTarget?: MessageResponse | null;
  readonly onCancelReply?: () => void;
  readonly disabled?: boolean;
  readonly onTypingChange?: (typing: boolean) => void | Promise<void>;
  readonly onTypingStop?: () => void | Promise<void>;
}

export function MessageInput({
  onSendMessage,
  onSendContactCards,
  replyTarget = null,
  onCancelReply,
  disabled = false,
  onTypingChange,
  onTypingStop,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [richMessage, setRichMessage] = useState('');
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isBusinessCardModalOpen, setIsBusinessCardModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isTranslatePopoverOpen, setIsTranslatePopoverOpen] = useState(false);
  const [selectedTargetLang, setSelectedTargetLang] = useState<string>('Vietnamese');
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const getRichTextEditorRef = useRef<(() => RichTextEditorInstance | null) | null>(null);

  const handleEditorReady = useCallback((getEditor: () => RichTextEditorInstance | null) => {
    getRichTextEditorRef.current = getEditor;
  }, []);

  const insertEmojiToSimpleInput = useCallback((emoji: string) => {
    const inputElement = textInputRef.current;

    if (!inputElement) {
      setMessage((prev) => `${prev}${emoji}`);
      return;
    }

    const selectionStart = inputElement.selectionStart ?? inputElement.value.length;
    const selectionEnd = inputElement.selectionEnd ?? selectionStart;

    setMessage((prev) => {
      const safeStart = Math.min(selectionStart, prev.length);
      const safeEnd = Math.min(selectionEnd, prev.length);
      return `${prev.slice(0, safeStart)}${emoji}${prev.slice(safeEnd)}`;
    });
  }, []);

  const insertEmojiToRichEditor = useCallback((emoji: string) => {
    const editor = getRichTextEditorRef.current?.();

    if (!editor) {
      setRichMessage((prev) => `${prev}${emoji}`);
      return;
    }

    const currentSelection = editor.getSelection();
    const insertIndex = currentSelection?.index ?? Math.max(editor.getLength() - 1, 0);

    editor.insertText(insertIndex, emoji, 'user');
    editor.setSelection(insertIndex + emoji.length, 0, 'user');
    setRichMessage(editor.root.innerHTML);
  }, []);

  const handleEmojiClick = useCallback(
    (emojiData: EmojiClickData) => {
      const emoji = emojiData.emoji;

      if (isEditorMode) {
        insertEmojiToRichEditor(emoji);
      } else {
        insertEmojiToSimpleInput(emoji);
      }

      setIsEmojiPickerOpen(true);
    },
    [insertEmojiToRichEditor, insertEmojiToSimpleInput, isEditorMode],
  );

  const handleBusinessCardSubmit = useCallback(
    async (selectedUserIds: number[]): Promise<SendContactCardsSubmitResult | null> => {
      if (!onSendContactCards) {
        return null;
      }

      return await onSendContactCards(selectedUserIds);
    },
    [onSendContactCards],
  );

  const handleSend = async () => {
    if (disabled) {
      return;
    }

    await onTypingStop?.();

    const plainText = isEditorMode ? richMessage.replace(/<[^>]*>/g, '').trim() : message.trim();

    if (plainText || selectedFiles.length > 0) {
      setMessage('');
      setRichMessage('');
      setSelectedFiles([]);
      setTranslatedText(null);
      onCancelReply?.();
      await onSendMessage(isEditorMode ? richMessage : message.trim(), selectedFiles, replyTarget?.messageId ?? null);
    }
  };

  const [translateMessage, { isLoading: isTranslating }] = useTranslateMessageMutation();

  const getSpeechLang = (language: string) => {
    const langCode = COUNTRY_OPTIONS.find((option) => option.language === language)?.langCode;
    return langCode || 'en-US';
  };
  const stopSpeaking = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };
  const handleSpeakTranslated = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error('Trình duyệt không hỗ trợ đọc văn bản.');
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (!translatedText) return;

    const plainText = translatedText.replace(/<[^>]*>/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(plainText);
    const lang = getSpeechLang(selectedTargetLang);
    utterance.lang = lang;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const performTranslate = async () => {
    if (disabled) return;

    const content = isEditorMode ? richMessage.replace(/<[^>]*>/g, '').trim() : message.trim();
    if (!content) {
      toast.error('Vui lòng nhập nội dung để dịch');
      return;
    }

    try {
      const response = await translateMessage({ content, targetLang: selectedTargetLang }).unwrap();
      const text = response?.data?.translatedText;
      if (!text) {
        toast.error('Không thể dịch văn bản');
        return;
      }
      setTranslatedText(text);

      if (isEditorMode) {
        setRichMessage(`<p>${text}</p>`);
        getRichTextEditorRef.current?.()?.focus?.();
      } else {
        setMessage(text);
        textInputRef.current?.focus();
      }
    } catch (err) {
      const msg = (err as IBackendError)?.data?.message || 'Đã có lỗi xảy ra';
      toast.error(msg);
    }
  };
  const handleTranslateClick = () => {
    const content = isEditorMode ? richMessage.replace(/<[^>]*>/g, '').trim() : message.trim();
    if (!content) {
      toast.error('Vui lòng nhập nội dung để dịch');
      return;
    }
    setIsTranslatePopoverOpen(true);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const toggleEditorMode = () => {
    if (isEditorMode) {
      const plainText = richMessage.replace(/<[^>]*>/g, '').trim();
      setMessage(plainText);
      setRichMessage('');
    } else {
      setRichMessage(message ? `<p>${message}</p>` : '');
    }
    setIsEditorMode(!isEditorMode);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const emitTypingState = (text: string) => {
    if (disabled || !onTypingChange) {
      return;
    }

    void onTypingChange(text.trim().length > 0);
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenBusinessCardModal = () => {
    setIsBusinessCardModalOpen(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const replySenderName = getMessageSenderDisplayName(replyTarget?.sender);
  const replyPreviewText = replyTarget ? getMessagePreviewText(replyTarget) : null;

  return (
    <div className="border-t border-border bg-card">
      {replyTarget && (
        <div className="px-4 pt-3 pb-2 border-b border-border bg-accent/40">
          <div className="flex items-start gap-2 rounded-lg border border-border bg-white px-3 py-2">
            <div className="min-w-0 flex-1 border-l-2 border-primary pl-2">
              <p className="text-xs text-muted-foreground">
                Đang trả lời <span className="font-medium text-foreground">{replySenderName}</span>
              </p>
              <p className="text-sm truncate" title={replyPreviewText || ''}>
                {replyPreviewText}
              </p>
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="h-6 w-6 shrink-0 rounded-full"
              onClick={onCancelReply}
              disabled={disabled}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="px-4 pt-3 pb-2 border-b border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between px-3 py-2 bg-accent rounded-lg text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col min-w-0">
                    <span className="truncate max-w-[150px]" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-5 w-5 shrink-0 rounded-full"
                  onClick={() => handleRemoveFile(index)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleAttachClick}
              disabled={disabled}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-full ${isEmojiPickerOpen ? 'bg-accent' : ''}`}
                  title="Thêm emoji"
                  disabled={disabled}
                >
                  <Smile className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="start" className="w-auto border-none p-0 shadow-lg">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  autoFocusSearch={false}
                  previewConfig={{ showPreview: false }}
                  searchDisabled={false}
                  lazyLoadEmojis={true}
                  skinTonesDisabled
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full ${isEditorMode ? 'bg-accent' : ''}`}
              onClick={toggleEditorMode}
              title={isEditorMode ? 'Switch to simple input' : 'Switch to rich text editor'}
              disabled={disabled}
            >
              <Pilcrow className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full ${isBusinessCardModalOpen ? 'bg-accent' : ''}`}
              onClick={handleOpenBusinessCardModal}
              title="Gửi danh thiếp"
              disabled={disabled || !onSendContactCards}
            >
              <UserRound className="h-5 w-5" />
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
            />
          </div>

          <div className="flex items-center gap-1">
            <Popover open={isTranslatePopoverOpen} onOpenChange={setIsTranslatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleTranslateClick}
                  disabled={disabled || isTranslating}
                  title="Dịch"
                >
                  {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                side="top"
                className="w-[500px] p-0 rounded-xl shadow-xl overflow-hidden"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <div className="bg-background">
                  <div className="flex items-center justify-between px-3 py-2 border-b">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Languages className="h-4 w-4 text-muted-foreground" />
                      Dịch nội dung
                    </div>

                    <div className="flex items-center gap-2 rounded-xl">
                      <Select value={selectedTargetLang} onValueChange={setSelectedTargetLang}>
                        <SelectTrigger className="h-3 text-xs font-semibold p-2 w-[200px] border-none shadow-none cursor-pointer rounded-full bg-primary/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {COUNTRY_OPTIONS.map((option) => (
                            <SelectItem key={option.language} value={option.language} className="cursor-pointer">
                              {option.language}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => void performTranslate()}
                        disabled={isTranslating}
                        title="Dịch"
                      >
                        {isTranslating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Languages className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        title={isSpeaking ? 'Dừng đọc' : 'Đọc bản dịch'}
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={handleSpeakTranslated}
                        disabled={!translatedText}
                      >
                        <Volume2 className={cn('h-4 w-4', isSpeaking && 'text-primary')} />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => {
                          stopSpeaking();
                          setTranslatedText(null);
                          setIsTranslatePopoverOpen(false);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="px-3 py-3 space-y-3 max-h-96 overflow-y-auto">
                    <div className="text-sm leading-relaxed font-semibold">
                      <MarkdownDisplay content={isEditorMode ? richMessage : message} />
                    </div>
                    {translatedText && (
                      <>
                        <div className="border-t pt-3 text-sm leading-relaxed text-primary font-semibold">
                          <MarkdownDisplay content={translatedText} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button onClick={() => void handleSend()} size="icon" className="h-8 w-8 rounded-full" disabled={disabled}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isEditorMode ? (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                ref={textInputRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  emitTypingState(e.target.value);
                }}
                onKeyDown={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                disabled={disabled}
                className="bg-accent/50 border-0 focus-visible:ring-1 rounded-full h-8"
              />
            </div>
          </div>
        ) : (
          <div className="bg-accent/30 rounded-lg overflow-hidden">
            <RichTextEditor
              value={richMessage}
              onChange={(value) => {
                setRichMessage(value);
                emitTypingState(value.replace(/<[^>]*>/g, ''));
              }}
              onEditorReady={handleEditorReady}
              placeholder="Nhập tin nhắn..."
              maxHeight={200}
              allowImage={false}
              allowHeader={false}
              allowFont={false}
              allowSize={false}
              allowLink={false}
              allowBackground={false}
            />
          </div>
        )}

        <BusinessCardModal
          open={isBusinessCardModalOpen}
          onOpenChange={setIsBusinessCardModalOpen}
          onSubmit={handleBusinessCardSubmit}
        />
      </div>
    </div>
  );
}
