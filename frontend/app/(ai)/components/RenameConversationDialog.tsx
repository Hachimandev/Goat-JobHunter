import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RenameConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTitle: string;
  onConfirm: (newTitle: string) => void;
}

const RenameConversationDialog = ({
  open,
  onOpenChange,
  currentTitle,
  onConfirm
}: RenameConversationDialogProps) => {
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNewTitle(currentTitle);
    }
  }, [open, currentTitle]);

  const handleConfirm = () => {

    if (!newTitle.trim()) {
      toast.error("Tên cuộc trò chuyện không được để trống.");
      return;
    }

    if (newTitle !== currentTitle) {
      onConfirm(newTitle.trim());
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    setNewTitle("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Đổi tên cuộc trò chuyện</DialogTitle>
          <DialogDescription>
            Nhập tên mới cho cuộc trò chuyện của bạn
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Tên cuộc trò chuyện</Label>
            <Input
              id="title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirm();
                }
              }}
              placeholder="Nhập tên mới..."
              className="rounded-xl"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="rounded-xl"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!newTitle.trim() || newTitle === currentTitle}
            className="rounded-xl"
          >
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameConversationDialog;