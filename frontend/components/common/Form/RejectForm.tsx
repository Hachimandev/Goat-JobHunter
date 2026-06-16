import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { rejectSchema, RejectFormData } from "./schema";
import { useEffect } from "react";

interface RejectFormProps {
  onSubmit: (data: RejectFormData) => Promise<void>;
  open: boolean;
}

const RejectForm = ({ onSubmit, open }: RejectFormProps) => {
  const form = useForm<RejectFormData>({
    resolver: zodResolver(rejectSchema),
    defaultValues: {
      reason: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        id="reject-form"
      >
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2" required>
                Lý do từ chối
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập lý do từ chối ứng viên..."
                  rows={5}
                  {...field}
                  className="rounded-xl resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default RejectForm;