'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useUser } from '@/hooks/useUser';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function OTPForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const { resendCode, verifyCode, isVerifying } = useUser();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState('');

  const onSubmit = async () => {
    console.log('Submitted OTP:', otp);

    if (!searchParams.get('email')) {
      toast.error('Lỗi khi xác thực OTP. Vui lòng thử lại.');
      return;
    }

    try {
      const result = await verifyCode({
        email: searchParams.get('email')!,
        verificationCode: otp,
      });

      if (result.success) {
        router.push('/signin');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
    }
  };

  const onResend = async () => {
    try {
      if (!searchParams.get('email')) {
        toast.error('Lỗi khi gửi lại mã. Vui lòng thử lại.');
        return;
      }

      const result = await resendCode(searchParams.get('email')!);

      if (result.success) {
        toast.success('Mã xác thực đã được gửi lại đến email của bạn.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Nhập mã xác thực</CardTitle>
        <CardDescription>Chúng tôi đã gửi mã 6 chữ số đến email của bạn.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="otp">Mã xác thực</FieldLabel>
            <InputOTP maxLength={6} id="otp" required value={otp} onChange={setOtp}>
              <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                <InputOTPSlot className="rounded-xl!" index={0} />
                <InputOTPSlot className="rounded-xl!" index={1} />
                <InputOTPSlot className="rounded-xl!" index={2} />
                <InputOTPSlot className="rounded-xl!" index={3} />
                <InputOTPSlot className="rounded-xl!" index={4} />
                <InputOTPSlot className="rounded-xl!" index={5} />
              </InputOTPGroup>
            </InputOTP>
          </Field>
          <FieldGroup>
            <Button type="submit" onClick={onSubmit} className="rounded-xl w-full">
              {isVerifying ? 'Đang xác thực...' : 'Xác thực'}
            </Button>
            <FieldDescription className="text-center text-gray-400">
              Không nhận được mã?{' '}
              <Button variant={'link'} className="p-0" onClick={onResend}>
                Gửi lại
              </Button>
            </FieldDescription>
          </FieldGroup>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
