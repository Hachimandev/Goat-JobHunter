'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dropzone, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone';
import { useCreateApplicationMutation } from '@/services/application/applicationApi';
import { Job } from '@/types/model';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Leaf, Loader2, Mail, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { useResumeAction } from '@/app/(main)/resumes/hooks/useResumeAction';
import { IBackendError } from '@/types/api';
import CustomPagination from '@/components/common/CustomPagination';

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

const applicationSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  resumeSelectionType: z.enum(['library', 'upload']),
  resumeId: z.number().optional(),
  coverLetter: z.string().min(50, 'Thư giới thiệu phải có ít nhất 50 ký tự'),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job;
  accountId?: number;
  userEmail?: string;
}

export default function ResumeDialog({ open, onOpenChange, job, accountId, userEmail }: Readonly<ResumeDialogProps>) {
  const { resumes, isProcessing, handleCreateResume } = useResumeAction({ initialPage: 1, itemsPerPage: 10 });

  const [createApplication, { isLoading: isCreatingApplication }] = useCreateApplicationMutation();
  const [selectedResumeId, setSelectedResumeId] = useState<number | undefined>(undefined);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      email: userEmail || '',
      resumeSelectionType: 'library',
      coverLetter: '',
    },
  });

  const resumeSelectionType = form.watch('resumeSelectionType');
  const isSubmitting = isProcessing || isCreatingApplication;

  const handleResumeSelect = (resumeId: number) => {
    setSelectedResumeId(resumeId);
    form.setValue('resumeId', resumeId);
  };

  const handleDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleFileChange = (selectedFile: File) => {
    if (!Object.keys(ACCEPTED_FILE_TYPES).includes(selectedFile.type)) {
      toast.error('Chỉ chấp nhận file PDF, DOC, DOCX');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('Kích thước file không được vượt quá 2MB');
      return;
    }

    setUploadedFile(selectedFile);
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      if (!accountId) {
        toast.error('Vui lòng đăng nhập để ứng tuyển');
        return;
      }

      let finalResumeId: number | undefined;

      // Handle upload if selection type is upload
      if (data.resumeSelectionType === 'upload') {
        if (!uploadedFile) {
          toast.error('Vui lòng tải lên CV của bạn');
          return;
        }

        const uploadToast = toast.loading('Đang tải lên CV...');

        try {
          const formData = new FormData();
          formData.append('fileUrl', uploadedFile);
          const createdResume = await handleCreateResume(formData);

          if (createdResume) {
            finalResumeId = createdResume.resumeId;
            toast.success('Tải lên CV thành công!', { id: uploadToast });
          } else {
            toast.error('Không thể tải lên CV. Vui lòng thử lại', { id: uploadToast });
            return;
          }
        } catch (uploadError) {
          toast.error('Không thể tải lên CV. Vui lòng thử lại', { id: uploadToast });
          return;
        }
      } else {
        finalResumeId = selectedResumeId;
      }

      if (!finalResumeId) {
        toast.error('Vui lòng chọn hoặc tải lên CV');
        return;
      }

      const applicationToast = toast.loading('Đang gửi đơn ứng tuyển...');
      try {
        await createApplication({
          email: data.email,
          coverLetter: data.coverLetter,
          jobId: job.jobId,
          resumeId: finalResumeId,
        }).unwrap();

        toast.success('Ứng tuyển thành công!', {
          id: applicationToast,
          duration: 3000,
        });

        onOpenChange(false);
        form.reset();
        setUploadedFile(null);
        setSelectedResumeId(undefined);
      } catch (applicationError) {
        if (
          (applicationError as IBackendError)?.data?.message?.includes(
            'You can submit a maximum of 3 applications for this job.',
          )
        ) {
          toast.error('Bạn đã đạt đến giới hạn 3 đơn ứng tuyển cho công việc này.', {
            id: applicationToast,
          });
          return;
        }

        toast.error('Không thể gửi đơn ứng tuyển. Vui lòng thử lại sau', {
          id: applicationToast,
        });
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau');
    }
  };

  const handleCancel = () => {
    form.reset();
    setUploadedFile(null);
    setSelectedResumeId(undefined);
    onOpenChange(false);
  };

  const handleError = (error: Error) => {
    toast.error(error.message);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Ứng tuyển <span className="text-green-600">{job.title}</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-green-600" />
                    <FormLabel className="text-base font-semibold">Email liên hệ</FormLabel>
                  </div>
                  <FormControl>
                    <Input {...field} type="email" placeholder="your@email.com" className="rounded-lg" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resumeSelectionType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <FormLabel className="text-base font-semibold">Chọn CV để ứng tuyển</FormLabel>
                  </div>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value="library" id="library" />
                          <Label htmlFor="library" className="flex-1 cursor-pointer font-medium">
                            Chọn CV khác trong thư viện CV của tôi
                          </Label>
                        </div>

                        {resumeSelectionType === 'library' && (
                          <div className="space-y-3 p-4 border border-green-600 rounded-lg bg-green-50/50 max-h-[400px] overflow-y-auto">
                            {resumes
                              .filter((r) => r.public)
                              .map((resume) => (
                                <div
                                  key={resume.resumeId}
                                  className={cn(
                                    'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors',
                                    selectedResumeId === resume.resumeId
                                      ? 'border-green-600 bg-green-50'
                                      : 'border-gray-200 hover:border-green-300',
                                  )}
                                  onClick={() => handleResumeSelect(resume.resumeId)}
                                >
                                  <span className="text-sm">{resume.title}</span>
                                  <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    className="text-green-600 p-0 h-auto"
                                    onClick={() => window.open(resume.fileUrl, '_blank')}
                                  >
                                    Xem
                                  </Button>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value="upload" id="upload" />
                          <Label htmlFor="upload" className="flex-1 cursor-pointer">
                            Tải lên CV từ máy tính, chọn hoặc kéo thả
                          </Label>
                        </div>

                        {resumeSelectionType === 'upload' && (
                          <div>
                            {!uploadedFile ? (
                              <Dropzone
                                accept={ACCEPTED_FILE_TYPES}
                                maxFiles={1}
                                maxSize={MAX_FILE_SIZE}
                                onDrop={handleDrop}
                                onError={handleError}
                                disabled={isSubmitting}
                                className="border-dashed border-2 border-gray-300 rounded-lg p-6"
                              >
                                <DropzoneEmptyState customCaption>
                                  <div className="flex flex-col items-center gap-2">
                                    <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2">
                                      Chọn CV
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center">
                                      Hỗ trợ định dạng .doc, .docx, pdf có kích thước dưới {MAX_FILE_SIZE / 1024 / 1024}
                                      MB
                                    </p>
                                  </div>
                                </DropzoneEmptyState>
                              </Dropzone>
                            ) : (
                              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <FileText className="w-8 h-8 text-green-600 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {(uploadedFile.size / 1024).toFixed(2)} KB
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={removeFile}
                                  disabled={isSubmitting}
                                  className="shrink-0 hover:bg-red-50 hover:text-red-600"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coverLetter"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-600" />
                    <FormLabel className="text-base font-semibold">Thư giới thiệu</FormLabel>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Một thư giới thiệu ngắn gọn, chỉn chu sẽ giúp bạn trở nên chuyên nghiệp và gây ấn tượng hơn với nhà tuyển dụng."
                      className="min-h-[150px] rounded-lg resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isSubmitting && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isProcessing ? 'Đang tải lên CV...' : 'Đang gửi đơn ứng tuyển...'}</span>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="rounded-lg"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isProcessing ? 'Đang tải lên...' : 'Đang gửi...'}
                  </>
                ) : (
                  'Nộp hồ sơ ứng tuyển'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
