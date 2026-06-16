import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { acceptSchema, AcceptFormData } from "./schema";
import { useEffect } from "react";
import { InterviewType } from "@/types/enum";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { capitalize } from "lodash";
import { DatePicker } from "@/components/ui/example-date-picker";

interface AcceptFormProps {
  onSubmit: (data: AcceptFormData) => Promise<void>;
  open: boolean;
}

const AcceptForm = ({ onSubmit, open }: AcceptFormProps) => {
  const form = useForm<AcceptFormData>({
    resolver: zodResolver(acceptSchema),
    defaultValues: {
      interviewDate: undefined,
      interviewType: InterviewType.PERSON,
      location: "",
      notes: ""
    }
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
        id="accept-form"
      >
        <FormField
          control={form.control}
          name="interviewDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Thời gian phỏng vấn</FormLabel>
              <FormControl>
                <DatePicker
                  {...field}
                  placeholder="Ngày phỏng vấn"
                  value={field.value}
                  onChange={field.onChange}
                  className="rounded-xl w-full border border-gray-300"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="interviewType"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Hình thức phỏng vấn</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="rounded-xl w-full">
                    <SelectValue placeholder="Chọn hình thức phỏng vấn" />
                  </SelectTrigger>
                  <SelectContent side="bottom" className="rounded-xl">
                    {Object.entries(InterviewType).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {capitalize(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Địa điểm phỏng vấn</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập địa chỉ phỏng vấn"
                  {...field}
                  className="rounded-xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lưu ý thêm</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Thêm ghi chú nếu cần..."
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

export default AcceptForm;