'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { CreateBlogDialog } from '@/app/(social-hub)/hub/fyp/component/CreateBlogDialog';
import { useUser } from '@/hooks/useUser';
import { getDisplayImage, getDisplayImageAlt, getDisplayName } from '../../hooks/useDisplay';

export function CreateBlogTrigger() {
  const { user } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <>
      <Card className="mb-4 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={getDisplayImage(user)} alt={getDisplayImageAlt(user)} />
            <AvatarFallback>{getDisplayName(user)}</AvatarFallback>
          </Avatar>
          <Button
            variant="ghost"
            className="flex-1 justify-start rounded-full bg-accent/60 px-4 py-5 text-muted-foreground hover:bg-accent/80"
            onClick={() => setIsDialogOpen(true)}
          >
            Bạn đang nghĩ gì?
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size={'icon-lg'} className="rounded-full" onClick={() => setIsDialogOpen(true)}>
              <ImageIcon className="h-10 w-10 text-green-500" />
            </Button>
          </div>
        </div>
      </Card>

      <CreateBlogDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
