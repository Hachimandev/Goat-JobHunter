import { z } from "zod";
import { Level, WorkingType } from "@/types/enum";

export const jobSchema = z
  .object({
    title: z
      .string()
      .min(1, "Tiêu đề không được để trống")
      .min(10, "Tiêu đề phải có ít nhất 10 ký tự")
      .max(200, "Tiêu đề không được vượt quá 200 ký tự"),
    description: z
      .string()
      .min(1, "Mô tả không được để trống")
      .min(50, "Mô tả phải có ít nhất 50 ký tự"),
    location: z
      .string()
      .min(1, "Địa điểm không được để trống")
      .max(255, "Địa điểm không được vượt quá 255 ký tự"),
    salary: z
      .number({
        error: "Mức lương phải là số",
      })
      .min(1, "Mức lương phải lớn hơn hoặc bằng 1"),
    quantity: z
      .number({
        error: "Số lượng phải là số",
      })
      .min(1, "Số lượng phải lớn hơn 0"),
    level: z.union([z.enum(Level), z.string()]),
    workingType: z.union([z.enum(WorkingType), z.string()]),
    startDate: z.string().min(1, "Ngày bắt đầu không được để trống"),
    endDate: z.string().min(1, "Ngày kết thúc không được để trống"),
    skills: z
      .array(
        z.object({
          skillId: z.string().or(z.number()),
          name: z.string(),
        }),
      )
      .min(1, "Phải chọn ít nhất 1 kỹ năng")
      .max(10, "Chỉ được chọn tối đa 10 kỹ năng"),
    career: z.string().min(1, "Ngành nghề không được để trống"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    },
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu",
      path: ["endDate"],
    },
  );

export type JobFormData = z.infer<typeof jobSchema>;