import z from 'zod';

export const reviewSchema = z.object({
    overall: z.number().min(1, 'Vui lòng chọn đánh giá chung').max(5),
    salaryBenefits: z.number().min(1, 'Vui lòng đánh giá').max(5),
    trainingLearning: z.number().min(1, 'Vui lòng đánh giá').max(5),
    managementCaresAboutMe: z.number().min(1, 'Vui lòng đánh giá').max(5),
    cultureFun: z.number().min(1, 'Vui lòng đánh giá').max(5),
    officeWorkspace: z.number().min(1, 'Vui lòng đánh giá').max(5),
    summary: z.string().min(10, 'Tóm tắt phải có ít nhất 10 ký tự'),
    experience: z.string().min(50, 'Kinh nghiệm phải có ít nhất 50 ký tự'),
    suggestion: z.string().min(50, 'Đề xuất phải có ít nhất 50 ký tự'),
    recommended: z.boolean({
        message: 'Vui lòng chọn có hoặc không',
    }),
    companyId: z.number('Vui lòng cung cấp ID công ty'),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
