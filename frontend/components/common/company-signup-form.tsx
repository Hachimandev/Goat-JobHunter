'use client';

import { TCompanySignUpSchema, CompanySignUpSchema } from '@/app/(auth)/components/schemas';
import CheckPasswordStrength from '@/components/common/CheckPasswordStrength';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldDescription } from '@/components/ui/field';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dropzone, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { COMPANY_INDUSTRY_OPTIONS, COMPANY_SIZE_OPTIONS, COUNTRY_OPTIONS } from '@/constants/constant';
import useSignupCompany from '@/app/(auth)/company/hooks/useSignupCompany';

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export function CompanySignupForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [step, setStep] = useState(1);

  const signUpForm = useForm<TCompanySignUpSchema>({
    resolver: zodResolver(CompanySignUpSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      description: '',
      logo: undefined,
      coverPhoto: undefined,
      website: '',
      phone: '',
      size: undefined,
      country: '',
      industry: '',
      workingDays: '',
      overtimePolicy: '',
      addresses: [{ province: '', fullAddress: '' }],
    },
  });

  const { handleSubmit, control, trigger, setValue } = signUpForm;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'addresses',
  });

  const {
    logoFile,
    coverPhotoFile,
    logoPreview,
    coverPhotoPreview,

    isSubmitting,

    handleLogoDrop,
    handleCoverPhotoDrop,
    handleRemoveLogo,
    handleRemoveCoverPhoto,
    handleError,
    handleSubmit: onSubmit,
  } = useSignupCompany({ setValue });

  const handleNextStep = async () => {
    const fieldsToValidate = ['username', 'email', 'password', 'confirmPassword'] as const;
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  return (
    <div className={cn('w-full py-4', className)} {...props}>
      <Card className={cn('w-full', step === 1 ? 'max-w-3xl mx-auto' : 'max-w-6xl mx-auto')}>
        <CardHeader>
          <Link href="/" className="flex items-center gap-2 mb-2">
            <Image src="/logo.png" alt="GOAT Logo" className="" width={120} height={80} />
          </Link>
          <CardTitle>Đăng ký tài khoản công ty</CardTitle>
          <CardDescription>
            <FieldDescription className="text-start text-xs text-muted-foreground">
              Khi tạo tài khoản, bạn đồng ý với{' '}
              <Link
                href="/legal/terms-of-service"
                target="_blank"
                className="text-primary hover:underline underline-offset-2"
              >
                Điều Khoản Dịch Vụ
              </Link>
              ,{' '}
              <Link
                href="/legal/user-policy"
                target="_blank"
                className="text-primary hover:underline underline-offset-2"
              >
                Chính Sách Người Dùng
              </Link>{' '}
              và{' '}
              <Link
                href="/legal/community-standards"
                target="_blank"
                className="text-primary hover:underline underline-offset-2"
              >
                Tiêu Chuẩn Cộng Đồng
              </Link>
              .
            </FieldDescription>
          </CardDescription>

          <p className="text-sm font-medium text-foreground mt-4">
            {step === 1 ? 'Bước 1/2: Tạo tài khoản đăng nhập' : 'Bước 2/2: Nhập thông tin công ty của bạn'}
          </p>
          {/* Progress indicator */}
          <div className="flex gap-2">
            <div className="h-2 flex-1 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={cn(
                  'h-full bg-primary rounded-full transition-transform duration-500 ease-in-out origin-left',
                  step >= 1 ? 'scale-x-100' : 'scale-x-0',
                )}
              />
            </div>
            <div className="h-2 flex-1 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={cn(
                  'h-full bg-primary rounded-full transition-transform duration-500 ease-in-out origin-left',
                  step >= 2 ? 'scale-x-100' : 'scale-x-0',
                )}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="w-full">
          <Form {...signUpForm}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
              {/* Step 1: Account Information */}
              {step === 1 && (
                <div
                  className="space-y-4"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleNextStep();
                    }
                  }}
                >
                  <FormField
                    control={control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Tên đăng nhập</FormLabel>
                        <FormControl>
                          <Input placeholder="goat" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="goat@example.com" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Mật khẩu</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="*********" className="rounded-xl" {...field} />
                        </FormControl>
                        {field.value && <CheckPasswordStrength password={field.value} />}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Xác nhận mật khẩu</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="*********" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="button" onClick={handleNextStep} className="rounded-xl w-full">
                    Tiếp theo
                  </Button>
                </div>
              )}

              {/* Step 2: Company Information */}
              {step === 2 && (
                <div className="space-y-3 w-full max-h-[60vh] overflow-y-auto px-2">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full">
                    <div className="space-y-2">
                      <FormLabel required>Logo</FormLabel>
                      {!logoPreview ? (
                        <Dropzone
                          accept={ACCEPTED_IMAGE_TYPES}
                          maxFiles={1}
                          maxSize={MAX_FILE_SIZE}
                          onDrop={handleLogoDrop}
                          onError={handleError}
                          disabled={isSubmitting}
                          className="rounded-xl h-[180px]"
                        >
                          <DropzoneEmptyState customCaption>
                            <div className="flex flex-col items-center gap-1">
                              <p className="text-xs font-medium text-foreground">Tải logo</p>
                            </div>
                          </DropzoneEmptyState>
                        </Dropzone>
                      ) : (
                        <div className="relative border-2 border-dashed rounded-xl overflow-hidden h-[180px]">
                          <div className="relative h-full w-full bg-muted">
                            <Image src={logoPreview} alt="Logo preview" fill className="object-contain" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm p-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[10px] font-medium truncate flex-1">{logoFile?.name}</p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleRemoveLogo}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-5 w-5 shrink-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cover Photo Upload - Takes 3 columns */}
                    <div className="md:col-span-3 space-y-2">
                      <FormLabel required>Ảnh bìa công ty</FormLabel>
                      {!coverPhotoPreview ? (
                        <Dropzone
                          accept={ACCEPTED_IMAGE_TYPES}
                          maxFiles={1}
                          maxSize={MAX_FILE_SIZE}
                          onDrop={handleCoverPhotoDrop}
                          onError={handleError}
                          disabled={isSubmitting}
                          className="rounded-xl h-[180px]"
                        >
                          <DropzoneEmptyState customCaption>
                            <div className="flex flex-col items-center gap-1.5">
                              <p className="text-sm font-medium text-foreground">Kéo thả hoặc click để tải ảnh bìa</p>
                              <p className="text-xs text-muted-foreground">JPG, PNG, WEBP (max 5MB)</p>
                            </div>
                          </DropzoneEmptyState>
                        </Dropzone>
                      ) : (
                        <div className="relative border-2 border-dashed rounded-xl overflow-hidden h-[180px]">
                          <div className="relative h-full w-full bg-muted">
                            <Image src={coverPhotoPreview} alt="Cover photo preview" fill className="object-cover" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm p-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[10px] font-medium truncate flex-1">{coverPhotoFile?.name}</p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleRemoveCoverPhoto}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-5 w-5 shrink-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company Name & Industry */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    <FormField
                      control={control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Tên công ty</FormLabel>
                          <FormControl>
                            <Input placeholder="Công ty TNHH ABC" className="rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>SĐT</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="0123456789"
                              className="rounded-xl"
                              maxLength={10}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Description */}
                  <FormField
                    control={control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Mô tả</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Giới thiệu về công ty..."
                            className="rounded-xl resize-none"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Contact & Details */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full">
                    <FormField
                      control={control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Lĩnh vực</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl w-full cursor-pointer">
                                <SelectValue placeholder="Chọn" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent position="popper" className="w-full">
                              {COMPANY_INDUSTRY_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Quy mô</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl w-full cursor-pointer">
                                <SelectValue placeholder="Chọn" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent position="popper" className="w-full">
                              {COMPANY_SIZE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Quốc gia</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl w-full cursor-pointer">
                                <SelectValue placeholder="Chọn" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent position="popper" className="w-full">
                              {COUNTRY_OPTIONS.map((country) => (
                                <SelectItem key={country.label} value={country.value} className="cursor-pointer">
                                  {country.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="workingDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Ngày làm việc</FormLabel>
                          <FormControl>
                            <Input placeholder="T2 - T6" className="rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Website & Overtime Policy */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    <FormField
                      control={control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input type="url" placeholder="https://example.com" className="rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="overtimePolicy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Chính sách OT</FormLabel>
                          <FormControl>
                            <Input placeholder="Có hỗ trợ" className="rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Addresses Section - Compact */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel required>Địa chỉ</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ province: '', fullAddress: '' })}
                        className="rounded-xl h-7 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Thêm
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {fields.map((field, index) => (
                        <div key={field.id} className="border rounded-xl p-2">
                          <div className="flex items-start gap-2">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                              <FormField
                                control={control}
                                name={`addresses.${index}.province`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input placeholder="Tỉnh/TP" className="rounded-xl h-9 text-sm" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={control}
                                name={`addresses.${index}.fullAddress`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        placeholder="Địa chỉ chi tiết"
                                        className="rounded-xl h-9 text-sm"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 shrink-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={handlePrevStep} className="rounded-xl flex-1">
                      Quay lại
                    </Button>
                    <Button type="submit" className="rounded-xl flex-1" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang tạo tài khoản...
                        </>
                      ) : (
                        'Tạo tài khoản công ty'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <FieldDescription className="text-center text-gray-400">
                Đã có tài khoản?{' '}
                <Link
                  href={isSubmitting ? '#' : '/signin'}
                  className={`text-primary hover:underline underline underline-offset-2 ${isSubmitting ? 'pointer-events-none' : ''}`}
                >
                  Đăng nhập
                </Link>
              </FieldDescription>
              <FieldDescription className="text-center text-gray-400 mt-4">
                Bạn là người dùng cá nhân?{' '}
                <Link href="/signup" className="text-primary hover:underline underline-offset-2">
                  Đăng ký tài khoản
                </Link>
              </FieldDescription>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
