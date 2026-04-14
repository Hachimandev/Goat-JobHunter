import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Send, X, Pilcrow } from 'lucide-react';
import { useState, useRef, type KeyboardEvent, type ChangeEvent } from 'react';
import RichTextEditor from '@/components/RichText/Editor';
import { MessageType } from '@/types/model';
import { MessageTypeEnum } from '@/types/enum';
import { extractPlainTextFromHtml } from '@/utils/extractPlainTextFromHtml';

interface MessageInputProps {
  readonly onSendMessage: (text?: string, files?: File[], replyToMessageId?: string | null) => void | Promise<void>;
  readonly replyTarget?: MessageType | null;
  readonly onCancelReply?: () => void;
  readonly disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  replyTarget = null,
  onCancelReply,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [richMessage, setRichMessage] = useState('');
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getReplyPreviewText = (target: MessageType) => {
    if (target.isHidden) {
      return 'Tin nhắn đã được thu hồi';
    }

    if (target.messageType === MessageTypeEnum.IMAGE) {
      return '[Hình ảnh]';
    }

    if (target.messageType === MessageTypeEnum.VIDEO) {
      return '[Video]';
    }

    if (target.messageType === MessageTypeEnum.AUDIO) {
      return '[Âm thanh]';
    }

    if (target.messageType === MessageTypeEnum.FILE) {
      return '[Tệp đính kèm]';
    }

    const plainText = extractPlainTextFromHtml(target.content || '').trim();

    if (!plainText) {
      return '[Tin nhắn văn bản]';
    }

    return plainText.length > 80 ? `${plainText.slice(0, 80)}...` : plainText;
  };

  const handleSend = async () => {
    if (disabled) {
      return;
    }

    const plainText = isEditorMode ? richMessage.replace(/<[^>]*>/g, '').trim() : message.trim();

    if (plainText || selectedFiles.length > 0) {
      await onSendMessage(isEditorMode ? richMessage : message.trim(), selectedFiles, replyTarget?.messageId ?? null);
      setMessage('');
      setRichMessage('');
      setSelectedFiles([]);
      onCancelReply?.();
    }
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

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const replySenderName = replyTarget?.sender.fullName || replyTarget?.sender.username || 'Người dùng';
  const replyPreviewText = replyTarget ? getReplyPreviewText(replyTarget) : null;

  return (
    <div className="border-t border-border bg-card">
      {replyTarget && (
        <div className="px-4 pt-3 pb-2 border-b border-border bg-accent/20">
          <div className="flex items-start gap-2 rounded-lg border border-border/70 bg-background/70 px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">
                Đang trả lời <span className="font-medium text-foreground">{replySenderName}</span>
              </p>
              <p className="text-sm truncate" title={replyPreviewText || ''}>
                {replyPreviewText}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
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
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg text-sm"
              >
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col min-w-0">
                  <span className="truncate max-w-[150px]" title={file.name}>
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 shrink-0"
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
            <Button onClick={() => void handleSend()} size="icon" className="h-8 w-8 rounded-full" disabled={disabled}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isEditorMode ? (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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
              onChange={setRichMessage}
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
      </div>
    </div>
  );
}
