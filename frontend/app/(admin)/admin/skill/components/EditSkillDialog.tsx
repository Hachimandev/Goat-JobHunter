"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import type { Skill } from "@/types/model";
import { useEffect, useMemo } from "react";
import useSkillAndCareerActions from "@/hooks/useSkillAndCareerActions";

interface Props {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly skill: Skill | null;
}

const skillSchema = z.object({
  name: z.string().min(1, { message: "Tên kỹ năng là bắt buộc" })
});

export type SkillFormValues = z.infer<typeof skillSchema>;

export default function EditSkillDialog({ open, onOpenChange, skill }: Props) {
  const { handleCreateSkill, handleUpdateSkill, isCreatingSkill, isUpdatingSkill } = useSkillAndCareerActions();
  const isEditMode = !!skill;

  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: ""
    }
  });

  useEffect(() => {
    if (skill) {
      form.reset({
        name: skill.name
      });
    } else {
      form.reset({
        name: ""
      });
    }
  }, [skill, form]);

  const onSubmit = async (data: SkillFormValues) => {
    try {
      if (isEditMode) {
        await handleUpdateSkill({
          skillId: String(skill.skillId),
          name: data.name
        });
      } else {
        await handleCreateSkill(data);
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const buttonText = useMemo(() => {

    const isSaving = isCreatingSkill || isUpdatingSkill;

    if (isSaving && isEditMode) return "Đang cập nhật...";
    if (isSaving && !isEditMode) return "Đang tạo...";
    if (!isSaving && isEditMode) return "Cập nhật";
    return "Tạo kỹ năng";
  }, [isCreatingSkill, isUpdatingSkill, isEditMode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Cập nhật kỹ năng" : "Tạo kỹ năng mới"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên kỹ năng <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: JavaScript, React..." {...field} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                Hủy
              </Button>
              <Button type="submit" className="rounded-xl" disabled={isCreatingSkill || isUpdatingSkill}>
                {buttonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}