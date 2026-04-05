import { z } from 'zod';
import { Gender } from '@/types/enum';

const MIN_LENGTH = 8;
const RE_LOWER = /[a-z]/;
const RE_UPPER = /[A-Z]/;
const RE_NUMBER = /\d/;
const RE_SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

export const isPasswordStrong = (pwd: string | undefined): boolean => {
  if (!pwd) return false;
  return (
    pwd.length >= MIN_LENGTH && RE_LOWER.test(pwd) && RE_UPPER.test(pwd) && RE_NUMBER.test(pwd) && RE_SPECIAL.test(pwd)
  );
};

export const SignInSchema = z.object({
  email: z.string().nonempty('Email không được để trống').email('Email không hợp lệ'),
  password: z.string().nonempty('Password không được để trống'),
});

export type TSignInSchema = z.infer<typeof SignInSchema>;

export const UserSignUpSchema = z
  .object({
    email: z.string().nonempty('Email không được để trống').email('Email không hợp lệ'),
    fullName: z.string().nonempty('Họ tên không được để trống'),
    username: z.string().nonempty('Tên hiển thị không được để trống'),
    gender: z.nativeEnum(Gender, { message: 'Giới tính không hợp lệ' }),
    phone: z.string().regex(/^\d{10}$/, 'Số điện thoại không hợp lệ'),
    password: z.string().nonempty('Mật khẩu không được để trống'),
    confirmPassword: z.string().nonempty('Xác nhận mật khẩu không được để trống'),
    type: z.enum(['applicant', 'recruiter']),
    companyName: z.string().optional(),
  })
  .refine((data) => isPasswordStrong(data.password), {
    message: 'Mật khẩu phải có ít nhất 8 ký tự, chữ hoa, chữ thường, số và ký tự đặc biệt',
    path: ['password'],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu và xác nhận mật khẩu không khớp',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.type === 'recruiter') {
        return !!data.companyName;
      }
      return true;
    },
    {
      message: 'Công ty không được để trống đối với nhà tuyển dụng',
      path: ['companyName'],
    },
  );

export type TUserSignUpSchema = z.infer<typeof UserSignUpSchema>;

export enum SignUpType {
  APPLICANT = 'applicant',
  RECRUITER = 'recruiter',
}

export const SignUpTypeOptions = [
  { label: 'Ứng viên', value: SignUpType.APPLICANT },
  { label: 'Nhà tuyển dụng', value: SignUpType.RECRUITER },
];

export const GenderOptions = [
  { label: 'Nam', value: Gender.NAM },
  { label: 'Nữ', value: Gender.NỮ },
];

export const CompanyAddressSchema = z.object({
  province: z.string().nonempty('Tỉnh/Thành phố không được để trống'),
  fullAddress: z.string().nonempty('Địa chỉ chi tiết không được để trống'),
});

export const CompanySignUpSchema = z
  .object({
    username: z.string().nonempty('Tên đăng nhập không được để trống'),
    email: z.string().nonempty('Email không được để trống').email('Email không hợp lệ'),
    password: z.string().nonempty('Mật khẩu không được để trống'),
    confirmPassword: z.string().nonempty('Xác nhận mật khẩu không được để trống'),

    name: z.string().nonempty('Tên công ty không được để trống'),
    description: z.string().min(50, 'Mô tả công ty phải có ít nhất 50 ký tự'),
    logo: z.instanceof(File).optional(),
    coverPhoto: z.instanceof(File).optional(),
    website: z
      .string()
      .regex(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/\S*)?$/, 'Website không hợp lệ')
      .optional()
      .or(z.literal('')),
    phone: z.string().regex(/^\d{10}$/, 'Số điện thoại không hợp lệ'),
    size: z.enum(['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'], {
      message: 'Vui lòng chọn quy mô công ty',
    }),
    country: z.string().min(1, 'Quốc gia không được để trống'),
    industry: z.string().min(1, 'Lĩnh vực không được để trống'),
    workingDays: z.string().nonempty('Ngày làm việc không được để trống'),
    overtimePolicy: z.string().nonempty('Chính sách làm thêm giờ không được để trống'),
    addresses: z.array(CompanyAddressSchema).min(1, 'Cần ít nhất một địa chỉ'),
  })
  .refine((data) => isPasswordStrong(data.password), {
    message: 'Mật khẩu phải có ít nhất 8 ký tự, chữ hoa, chữ thường, số và ký tự đặc biệt',
    path: ['password'],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu và xác nhận mật khẩu không khớp',
    path: ['confirmPassword'],
  })
  .refine((data) => data.logo !== undefined, {
    message: 'Logo không được để trống',
    path: ['logo'],
  })
  .refine((data) => data.coverPhoto !== undefined, {
    message: 'Ảnh bìa không được để trống',
    path: ['coverPhoto'],
  });

export type TCompanySignUpSchema = z.infer<typeof CompanySignUpSchema>;
export type TCompanyAddress = z.infer<typeof CompanyAddressSchema>;
