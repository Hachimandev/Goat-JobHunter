import { z } from 'zod';
import { Education, Gender, Level } from '@/types/enum';

const optionalProfileAddressSchema = z
  .object({
    addressId: z.number().optional(),
    province: z.string().trim(),
    fullAddress: z.string().trim(),
  })
  .superRefine((value, ctx) => {
    const hasProvince = value.province.length > 0;
    const hasFullAddress = value.fullAddress.length > 0;

    if (hasProvince !== hasFullAddress) {
      const message = 'Vui lòng nhập đầy đủ tỉnh/thành phố và địa chỉ chi tiết hoặc xóa dòng địa chỉ này';

      if (!hasProvince) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message,
          path: ['province'],
        });
      }

      if (!hasFullAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message,
          path: ['fullAddress'],
        });
      }
    }
  });

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

export const applicantSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  username: z.string().min(1, 'Vui lòng nhập tên hiển thị'),
  email: z.string().email(),
  phone: z.string().optional(),
  dob: z.date(),
  gender: z.nativeEnum(Gender),
  education: z.nativeEnum(Education).optional(),
  level: z.nativeEnum(Level).optional(),
  availableStatus: z.boolean().optional(),
  headline: z.string().optional(),
  bio: z.string().optional(),
  addresses: z
    .array(optionalProfileAddressSchema)
    .transform((addresses) => addresses.filter((address) => address.province && address.fullAddress)),
});
export type ApplicantFormData = z.infer<typeof applicantSchema>;

export const recruiterSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  username: z.string().min(1, 'Vui lòng nhập tên hiển thị'),
  email: z.string().email(),
  phone: z.string().optional(),
  dob: z.date(),
  gender: z.nativeEnum(Gender),
  position: z.string().optional(),
  headline: z.string().optional(),
  bio: z.string().optional(),
  addresses: z
    .array(optionalProfileAddressSchema)
    .transform((addresses) => addresses.filter((address) => address.province && address.fullAddress)),
});
export type RecruiterFormData = z.infer<typeof recruiterSchema>;
