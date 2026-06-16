"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { RATING_TYPES } from "@/constants/constant";
import { Company } from "@/types/model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { reviewSchema, ReviewFormData } from "./schema";
import InteractiveStarRating from "./InteractiveStarRating";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company;
  onSubmit: (data: ReviewFormData) => void;
  isLoading?: boolean;
}

export default function ReviewDialog({
                                       open,
                                       onOpenChange,
                                       company,
                                       onSubmit,
                                       isLoading
                                     }: Readonly<ReviewDialogProps>) {
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      overall: 0,
      salaryBenefits: 0,
      trainingLearning: 0,
      managementCaresAboutMe: 0,
      cultureFun: 0,
      officeWorkspace: 0,
      summary: "",
      experience: "",
      suggestion: "",
      recommended: undefined,
      companyId: company.accountId
    }
  });

  const handleSubmit = async (data: ReviewFormData) => {
    await onSubmit(data);
    setShowSuccess(true);
    form.reset();
  };

  const handleClearAll = () => {
    form.reset();
  };

  const handleBackToCompany = () => {
    setShowSuccess(false);
    onOpenChange(false);

    router.push(`/companies`);
  };

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="!max-w-none w-[50vw] max-h-[90vh] rounded-xl">
          <div className="flex flex-col items-center justify-center text-center space-y-6 py-6">
            <div className="w-32 h-32 relative">
              <div className="text-8xl">🤖</div>
            </div>
            <div className="space-y-3 px-4">
              <h2 className="text-3xl font-bold text-gray-900 whitespace-nowrap">
                Tuyệt vời! Chúng tôi đã nhận được đánh giá của bạn
              </h2>
              <p className="text-base text-gray-600">
                Chúng tôi sẽ thông báo cho bạn khi hoàn tất xử lý đánh giá của bạn cho {company.name}.
              </p>
            </div>
            <button
              onClick={handleBackToCompany}
              className="text-[18px] px-6 py-3 bg-white border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary/10 transition-colors cursor-pointer"
            >
              Quay lại trang công ty
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-none w-[50vw] max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Đánh giá {company.name}</DialogTitle>
          <DialogDescription className="text-base pt-2">
            Bạn chỉ mất 1 phút để hoàn thành bảng đánh giá này. Ý kiến của bạn sẽ giúp ích rất nhiều cho
            cộng đồng người đang tìm việc.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="overall"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="text-[20px] font-bold">
                      Đánh giá chung <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <InteractiveStarRating value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Tiêu đề đánh giá"
                      className="text-[16px] rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[20px] font-bold">
                    Điều làm bạn thích làm việc tại đây <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Chia sẻ những điều bạn thích về công ty này..."
                      className="min-h-[100px] resize-none text-[16px] rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="suggestion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[20px] font-bold">
                    Đề nghị cải thiện <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Những điều bạn nghĩ công ty nên cải thiện..."
                      className="min-h-[100px] resize-none text-[16px] rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-[20px] font-bold">
                Đánh giá chi tiết <span className="text-destructive">*</span>
              </h3>
              <div className="space-y-4 rounded-lg">
                {RATING_TYPES.map((rating) => (
                  <FormField
                    key={rating.value}
                    control={form.control}
                    name={rating.value as keyof ReviewFormData}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-start gap-20">
                          <FormLabel className="text-[16px] font-medium min-w-[200px]">
                            {rating.label}
                          </FormLabel>
                          <FormControl>
                            <InteractiveStarRating
                              value={field.value as number}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="recommended"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[20px] font-bold">
                    Bạn có muốn giới thiệu công ty này đến bạn bè của mình?{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(value === "true")}
                      value={field.value === undefined ? "" : field.value ? "true" : "false"}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="true"
                          id="recommended-yes"
                          className="cursor-pointer w-5 h-5"
                        />
                        <label
                          htmlFor="recommended-yes"
                          className="text-[16px] font-medium cursor-pointer"
                        >
                          Có
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="false"
                          id="recommended-no"
                          className="cursor-pointer w-5 h-5"
                        />
                        <label
                          htmlFor="recommended-no"
                          className="text-[16px] font-medium cursor-pointer"
                        >
                          Không
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 text-[18px] bg-primary hover:bg-primary/80 text-white rounded-xl py-2.5 font-medium transition-colors cursor-pointer text-center"
                disabled={isLoading}
              >
                {isLoading ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
              <button
                type="button"
                className="text-[18px] rounded-xl hover:bg-gray-100 py-2.5 px-4 font-medium border border-input transition-colors cursor-pointer text-center"
                onClick={handleClearAll}
                disabled={isLoading}
              >
                Xóa tất cả
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
