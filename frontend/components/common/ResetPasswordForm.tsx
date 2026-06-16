"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/useUser";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft } from "lucide-react";

const resetPasswordSchema = z
  .object({
    email: z.string().email("Email không hợp lệ"),
    newPassword: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Mật khẩu phải chứa chữ hoa, chữ thường và số"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const { handleResetPassword } = useUser();
  const router = useRouter();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const result = await handleResetPassword({
        email: data.email,
        newPassword: data.newPassword,
      });

      if (result.success) {
        router.push("/otp?email=" + encodeURIComponent(data.email));
      }
    } catch (error) {
      console.error("Reset password error:", error);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-md">
      <Link href="/signin">
        <Button variant="link" className="rounded-xl p-0">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại đăng nhập
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Đặt lại mật khẩu</CardTitle>
          <CardDescription>
            Nhập email và mật khẩu mới để đặt lại mật khẩu của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base" required>
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="rounded-xl"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base" required>
                      Mật khẩu mới
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="*********"
                        className="rounded-xl"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base" required>
                      Xác nhận mật khẩu mới
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="*********"
                        className="rounded-xl"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root && (
                <div className="p-3 rounded-xl text-sm bg-destructive/10 text-destructive border border-destructive/20">
                  {form.formState.errors.root.message}
                </div>
              )}

              <Button
                type="submit"
                className="rounded-xl w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}