"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skill } from "@/types/model";
import { X } from "lucide-react";

interface BadgeItemProps {
  item: Skill;
  onRemove: (item: Skill) => void;
  disabled?: boolean;
}

export default function BadgeItem({
  item,
  onRemove,
  disabled = false,
}: Readonly<BadgeItemProps>) {
  return (
    <Badge
      variant="default"
      className="text-sm py-1 px-3 rounded-full flex items-center gap-2 w-fit"
    >
      <span>{item.name}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full"
        onClick={() => onRemove(item)}
        disabled={disabled}
      >
        <X className="h-3 w-3" />
      </Button>
    </Badge>
  );
}
