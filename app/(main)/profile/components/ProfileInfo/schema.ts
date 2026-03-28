import { z } from 'zod';
import { Education, Gender, Level } from '@/types/enum';

export const userSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  username: z.string().min(1, 'Vui lòng nhập tên hiển thị'),
  dob: z.date(),
  gender: z.nativeEnum(Gender),
  email: z.string().email(),
  phone: z.string().optional(),
  addresses: z
    .array(
      z.object({
        addressId: z.number().optional(),
        province: z.string().min(1, 'Vui lòng nhập tỉnh/thành phố'),
        fullAddress: z.string().min(1, 'Vui lòng nhập địa chỉ chi tiết'),
      }),
    )
    .min(1, 'Phải có ít nhất một địa chỉ'),

  // Fields cho Applicant
  education: z.nativeEnum(Education).optional(),
  level: z.nativeEnum(Level).optional(),
  availableStatus: z.boolean().optional(),

  // Fields cho Recruiter
  position: z.string().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;

export const companySchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên công ty'),
  email: z.string().email(),
  phone: z.string().optional(),
  website: z.string().optional().or(z.literal('')),
  industry: z.string().optional(),
  size: z.string().optional(),
  country: z.string().optional(),
  workingDays: z.string().optional(),
  overtimePolicy: z.string().optional(),
  addresses: z
    .array(
      z.object({
        addressId: z.number().optional(),
        province: z.string().min(1, 'Vui lòng nhập tỉnh/thành phố'),
        fullAddress: z.string().min(1, 'Vui lòng nhập địa chỉ chi tiết'),
      }),
    )
    .min(1, 'Phải có ít nhất một địa chỉ'),
  description: z.string().optional(),
});

export type CompanyFormData = z.infer<typeof companySchema>;
