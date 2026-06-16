import * as z from "zod";
import { InterviewType } from "@/types/enum";

export const acceptSchema = z.object({
  interviewDate: z.instanceof(Date, {error: "Vui lòng chọn ngày phỏng vấn"}).refine((date) => date > new Date(), {
    message: "Ngày phỏng vấn phải là ngày trong tương lai",
  }),
  location: z.string().min(1, "Vui lòng nhập địa điểm phỏng vấn"),
  interviewType: z.enum(InterviewType, {error: "Vui lòng chọn hình thức phỏng vấn"}),
  notes: z.string().optional(),
});

export const rejectSchema = z.object({
  reason: z.string().min(10, "Lý do từ chối phải có ít nhất 10 ký tự"),
});

export type AcceptFormData = z.infer<typeof acceptSchema>;
export type RejectFormData = z.infer<typeof rejectSchema>;