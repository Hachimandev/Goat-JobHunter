'use client';

import { PasswordFormData, passwordSchema } from '@/app/(main)/profile/components/ProfilePassword/schema';
import CheckPasswordStrength from '@/components/common/CheckPasswordStrength';
import LoaderSpin from '@/components/common/LoaderSpin';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUser } from '@/hooks/useUser';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function ProfilePassword() {
  const { updatePassword, isUpdatingPassword } = useUser();

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: PasswordFormData) => {
    try {
      const result = await updatePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      if (result.success) {
        form.reset();
        toast.success('Cập nhật mật khẩu thành công!');
        return;
      }

      if (result.error === 'Invalid old password') {
        form.setError('oldPassword', {
          type: 'manual',
          message: 'Mật khẩu cũ không đúng',
        });
        return;
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Có lỗi xảy ra khi cập nhật mật khẩu');
    }
  };

  return (
    <Card className="p-6 gap-2">
      <CardHeader className="px-0">
        <CardTitle className="text-lg font-semibold">Đổi mật khẩu</CardTitle>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu cũ</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Nhập mật khẩu cũ" className="rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu mới</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Nhập mật khẩu mới" className="rounded-xl" />
                </FormControl>
                <FormMessage />
                {field.value && <CheckPasswordStrength password={field.value} />}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Xác nhận mật khẩu" className="rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-4 justify-end">
            <Button
              type="reset"
              variant="outline"
              disabled={isUpdatingPassword}
              className="rounded-xl"
              onClick={() => {
                form.reset();
                form.clearErrors();
              }}
            >
              Hủy
            </Button>

            <Button
              type="submit"
              disabled={isUpdatingPassword}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl min-w-10"
            >
              {isUpdatingPassword ? (
                <LoaderSpin />
              ) : (
                <>
                  <Pencil className="mr-1 h-4 w-4" />
                  Cập nhật
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
