'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ROLE } from '@/constants/constant';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useFetchUserByIdQuery } from '@/services/user/userApi';
import LoaderSpin from '@/components/common/LoaderSpin';
import { useUser } from '@/hooks/useUser';

const userFormSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  role: z.enum(ROLE),
  fullName: z.string().optional(),
  username: z.string().optional(),
  phone: z.string().optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

const UserFormPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const [isFormReady, setIsFormReady] = useState(false);
  const {
    isUpdatingApplicant,
    isUpdatingRecruiter,
    isCreatingUser,
    handleCreateUser,
    handleUpdateApplicant,
    handleUpdateRecruiter,
  } = useUser();
  const isLoading = useMemo(
    () => isUpdatingApplicant || isUpdatingRecruiter || isCreatingUser,
    [isUpdatingApplicant, isUpdatingRecruiter, isCreatingUser],
  );

  const {
    data: userData,
    isLoading: isLoadingUser,
    isFetching: isFetchingUser,
    isSuccess,
    isError,
  } = useFetchUserByIdQuery(userId!, {
    skip: !userId,
  });

  const user = useMemo(() => userData?.data, [userData]);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      role: ROLE.APPLICANT,
      fullName: '',
      username: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (!userId || (userId && (isSuccess || isError))) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsFormReady(true);
    }
  }, [userId, isSuccess, isError]);

  useEffect(() => {
    if (user && isSuccess) {
      form.reset({
        email: user?.email || '',
        role: user.role?.name as typeof ROLE.APPLICANT | typeof ROLE.HR | typeof ROLE.SUPER_ADMIN,
        fullName: user.fullName || '',
        username: user.username || '',
        phone: user?.phone || '',
      });
    }
  }, [form, user, isSuccess]);

  const handleSubmit = async (data: UserFormData) => {
    try {
      if (userId) {
        const formData = new FormData();
        formData.append('fullName', data.fullName!);
        formData.append('username', data.username!);
        formData.append('phone', data.phone!);
        formData.append('email', data.email);

        switch (data.role) {
          case ROLE.APPLICANT:
            await handleUpdateApplicant(formData);
            break;
          case ROLE.HR:
            await handleUpdateRecruiter(formData);
            break;
          case ROLE.SUPER_ADMIN:
            // Handle SUPER_ADMIN update if needed
            break;
          default:
            break;
        }
        toast.success('Cập nhật người dùng thành công!');
      } else {
        // Create new user
        await handleCreateUser({
          email: data.email,
          role: data.role,
          fullName: data.fullName,
          username: data.username,
          phone: data.phone,
        });

        toast.success('Thêm người dùng thành công!');
      }
      router.push('/admin/user');
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error(userId ? 'Không thể cập nhật người dùng' : 'Không thể thêm người dùng');
    }
  };

  const buttonText = useMemo(() => {
    if (isLoading) return 'Đang xử lý...';

    if (userId) return 'Cập nhật';

    return 'Tạo tài khoản';
  }, [isLoading, userId]);

  if (isLoadingUser || isFetchingUser) {
    return <LoaderSpin />;
  }

  if (isError) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto">
        <Link href="/admin/user">
          <Button variant="link" className="rounded-xl p-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </Link>
        <Card className="p-6">
          <div className="text-center">
            <p className="text-lg font-medium text-destructive">Không tìm thấy người dùng</p>
            <p className="text-sm text-muted-foreground mt-2">Người dùng không tồn tại hoặc đã bị xóa</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="space-y-2">
        <Link href="/admin/user">
          <Button variant="link" className="rounded-xl mb-4 p-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{user ? 'Chỉnh sửa người dùng' : 'Tạo tài khoản người dùng'}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {user ? 'Cập nhật thông tin người dùng' : 'Nhập thông tin của bạn bên dưới để tạo tài khoản người dùng.'}
        </p>
      </div>

      {!isFormReady && <LoaderSpin />}

      {isFormReady && (
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required className="capitalize">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="user@example.com"
                          className="rounded-xl"
                          disabled={isLoading || !!userId}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Vai trò</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || !!userId}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl w-full">
                            <SelectValue placeholder="Chọn vai trò" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          <SelectItem value={ROLE.APPLICANT}>Ứng viên</SelectItem>
                          <SelectItem value={ROLE.HR}>Nhà tuyển dụng</SelectItem>
                          <SelectItem value={ROLE.SUPER_ADMIN}>Quản trị viên</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">Họ và tên</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Nguyễn Văn A"
                            className="rounded-xl"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">Tên hiển thị</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="nguyenvana"
                            className="rounded-xl"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">Số điện thoại</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="0123456789"
                            className="rounded-xl"
                            maxLength={10}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="rounded-xl w-full" disabled={isLoading}>
                  {buttonText}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserFormPage;
