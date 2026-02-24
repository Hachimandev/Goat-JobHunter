import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, Send, X, Pilcrow } from "lucide-react"
import { useState, useRef, type KeyboardEvent, type ChangeEvent } from "react"
import RichTextEditor from "@/components/RichText/Editor"

interface MessageInputProps {
  readonly onSendMessage: (text?: string, files?: File[]) => void
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [richMessage, setRichMessage] = useState("")
  const [isEditorMode, setIsEditorMode] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    const plainText = isEditorMode
      ? richMessage.replace(/<[^>]*>/g, '').trim()
      : message.trim()

    if (plainText || selectedFiles.length > 0) {
      onSendMessage(isEditorMode ? richMessage : message.trim(), selectedFiles)
      setMessage("")
      setRichMessage("")
      setSelectedFiles([])
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleEditorMode = () => {
    if (isEditorMode) {
      const plainText = richMessage.replace(/<[^>]*>/g, '').trim()
      setMessage(plainText)
      setRichMessage("")
    } else {
      setRichMessage(message ? `<p>${message}</p>` : "")
    }
    setIsEditorMode(!isEditorMode)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      setSelectedFiles(prev => [...prev, ...newFiles])
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="border-t border-border bg-card">
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
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 flex-shrink-0"
                  onClick={() => handleRemoveFile(index)}
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
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full ${isEditorMode ? 'bg-accent' : ''}`}
              onClick={toggleEditorMode}
              title={isEditorMode ? "Switch to simple input" : "Switch to rich text editor"}
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
            <Button
              onClick={handleSend}
              size="icon"
              className="h-8 w-8 rounded-full"
            >
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
  )
}