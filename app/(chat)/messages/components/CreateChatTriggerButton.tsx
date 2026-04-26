import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';

interface CreateChatTriggerButtonProps {
  mode: 'direct' | 'group';
  onClick: () => void;
}

export function CreateChatTriggerButton({ mode, onClick }: CreateChatTriggerButtonProps) {
  return (
    <Button
      size="icon"
      variant={'outline'}
      onClick={onClick}
      className="rounded-full"
      title={mode === 'group' ? 'Tạo nhóm chat' : 'Tạo chat'}
    >
      {mode === 'group' ? <Users className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
    </Button>
  );
}
