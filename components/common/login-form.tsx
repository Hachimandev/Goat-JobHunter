'use client';

import { SignInSchema, type TSignInSchema } from '@/app/(auth)/components/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldDescription } from '@/components/ui/field';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { signIn } = useUser();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const signInForm = useForm<TSignInSchema>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    handleSubmit,
    setError,
    control,
    formState: { isSubmitting },
  } = signInForm;

  const onSubmit = async (data: TSignInSchema) => {
    try {
      const result = await signIn(data);

      if (result.success) {
        if (result.user?.role.name === 'SUPER_ADMIN') {
          router.push('/dashboard');
          return;
        }
        router.push('/messages');
        return;
      }

      // xử lý lỗi cụ thể
      if (result.error === 'Bad credentials') {
        setError('root', {
          type: 'manual',
          message: 'Email hoặc mật khẩu không đúng',
        });
        return;
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const loginWithCongHai = async () => {
    onSubmit({
      email: 'conghai.tpma@gmail.com',
      password: '12345678x@X',
    });
  };

  const loginWithHaiTruong = async () => {
    onSubmit({
      email: 'haitruong.tpma@gmail.com',
      password: '12345678x@X',
    });
  };

  return (
    <div className={cn('flex flex-col gap-6 w-md', className)} {...props}>
      <Card>
        <CardHeader>
          <Link href="/" className="flex items-center gap-2 mb-4">
            <Image src="/logo.png" alt="GOAT Logo" className="" width={120} height={80} />
          </Link>
          <CardTitle>Đăng nhập vào tài khoản của bạn</CardTitle>
          <CardDescription>Nhập email của bạn bên dưới để đăng nhập vào tài khoản của bạn.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...signInForm}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={'text-base'} required>
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" className="rounded-xl" {...field} />
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
                    <div className={'flex items-center justify-between'}>
                      <FormLabel className={'text-base'} required>
                        Mật khẩu
                      </FormLabel>
                      <Link
                        href={'/reset-password'}
                        className={'text-muted-foreground text-sm hover:underline hover:text-primary'}
                      >
                        Quên mật khẩu ?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="*********"
                          className="rounded-xl pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {signInForm.formState.errors.root && (
                <div className="p-3 rounded-xl text-sm bg-destructive/10 text-destructive border border-destructive/20">
                  {signInForm.formState.errors.root.message}
                </div>
              )}
              <Button type="submit" className="rounded-xl w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl w-full"
                disabled={isSubmitting}
                onClick={loginWithCongHai}
              >
                Đăng nhập với account conghai.tpma@gmail.com
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl w-full"
                disabled={isSubmitting}
                onClick={loginWithHaiTruong}
              >
                Đăng nhập với account haitruong.tpma@gmail.com
              </Button>
              <FieldDescription className="text-center text-gray-400">
                Chưa có tài khoản?{' '}
                <Link
                  href={isSubmitting ? '#' : '/signup'}
                  className={`text-primary hover:underline underline underline-offset-2 ${isSubmitting ? 'pointer-events-none' : ''}`}
                >
                  Đăng ký
                </Link>
              </FieldDescription>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
