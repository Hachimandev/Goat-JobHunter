import { Card } from '@/components/ui/card';
import { FileText, FileArchive, Download, Loader2 } from 'lucide-react';
import { MessageResponse } from '@/types/model';
import { Button } from '@/components/ui/button';

interface SharedFilesListProps {
  readonly files: MessageResponse[];
  readonly isLoading: boolean;
  readonly isError: boolean;
}

export function SharedFilesList({ files, isLoading, isError }: SharedFilesListProps) {
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-5 w-5" />;
    if (type.includes('zip') || type.includes('rar')) return <FileArchive className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const truncateFileName = (fileName: string, maxLength: number = 25) => {
    if (fileName.length <= maxLength) return fileName;

    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return `${fileName.substring(0, maxLength - 3)}...`;
    }

    const extension = fileName.substring(lastDotIndex);
    const nameWithoutExt = fileName.substring(0, lastDotIndex);
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 3);

    return `${truncatedName}...${extension}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return <div className="flex items-center justify-center py-8 text-sm text-destructive">Không thể tải files</div>;
  }

  if (files.length === 0) {
    return <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">Chưa có file nào</div>;
  }

  return (
    <div className="space-y-2">
      {files.map((message) => {
        const fileName = message.content.split('/').pop() || 'file';

        return (
          <Card key={message.messageId} className="group py-0!">
            <div className="flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors rounded-lg">
              <div className="shrink-0 text-muted-foreground">{getFileIcon(message.messageType)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" title={fileName}>
                  {truncateFileName(fileName)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(message.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={() => window.open(message.content, '_blank')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
