import { ApplicantFormData, applicantSchema } from '@/app/(main)/profile/components/ProfileInfo/schema';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/example-date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUser } from '@/hooks/useUser';
import { ApplicantResponse } from '@/types/dto';
import { Education, Gender, Level } from '@/types/enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { capitalize } from 'lodash';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ApplicantUserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ApplicantResponse;
}

const ApplicantUserForm = ({ open, onOpenChange, profile }: ApplicantUserFormProps) => {
  const { handleUpdateApplicant, isUpdatingApplicant } = useUser();

  const form = useForm<ApplicantFormData>({
    resolver: zodResolver(applicantSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      phone: '',
      dob: new Date(),
      gender: Gender.NAM,
      education: Education.SCHOOL,
      level: Level.INTERN,
      availableStatus: true,
      headline: '',
      bio: '',
      addresses: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'addresses',
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    form.reset({
      fullName: profile.fullName || '',
      username: profile.username || '',
      email: profile.email || '',
      phone: profile.phone || '',
      dob: profile.dob ? new Date(profile.dob) : new Date(),
      gender: profile.gender || Gender.NAM,
      education: profile.education || Education.SCHOOL,
      level: profile.level || Level.INTERN,
      availableStatus: profile.availableStatus ?? true,
      headline: profile.headline || '',
      bio: profile.bio || '',
      addresses:
        profile.addresses?.length > 0
          ? profile.addresses.map((addr) => ({
              addressId: addr.addressId,
              province: addr.province,
              fullAddress: addr.fullAddress,
            }))
          : [],
    });
  }, [profile, form]);

  const onSubmit = async (data: ApplicantFormData) => {
    if (!profile?.accountId) {
      toast.error('Không thể cập nhật thông tin. Vui lòng thử lại sau.');
      return;
    }

    const dobFormatted = data.dob.toLocaleDateString('sv-SE');

    const formData = new FormData();
    formData.append('accountId', String(profile.accountId));
    formData.append('fullName', data.fullName);
    formData.append('username', data.username);
    formData.append('dob', dobFormatted);
    formData.append('gender', data.gender);
    formData.append('email', data.email);
    formData.append('phone', data.phone || '');
    formData.append('addresses', JSON.stringify(data.addresses));
    formData.append('education', data.education || '');
    formData.append('level', data.level || '');
    formData.append('availableStatus', String(data.availableStatus ?? true));
    formData.append('headline', data.headline || '');
    formData.append('bio', data.bio || '');

    await handleUpdateApplicant(formData);

    onOpenChange(false);
    form.reset();
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl! max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Cập Nhật Thông Tin Ứng Viên</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Họ và tên</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-xl" />
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
                      <FormLabel required>Tên hiển thị</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" disabled className="rounded-xl" />
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
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-xl" placeholder="Số điện thoại" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày sinh</FormLabel>
                      <FormControl>
                        <DatePicker
                          {...field}
                          placeholder="Ngày sinh"
                          value={field.value}
                          onChange={field.onChange}
                          className="rounded-xl w-full border border-gray-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giới tính</FormLabel>
                      <FormControl>
                        <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-row">
                          {Object.entries(Gender).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-3">
                              <RadioGroupItem value={value} id={`applicant-gender-${key}`} />
                              <Label htmlFor={`applicant-gender-${key}`}>{capitalize(key)}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Học vấn</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="rounded-xl w-full">
                            <SelectValue placeholder="Chọn học vấn" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(Education).map(([key, value]) => (
                              <SelectItem key={key} value={value}>
                                {capitalize(key)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trình độ</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="rounded-xl w-full">
                            <SelectValue placeholder="Chọn trình độ" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(Level).map(([key, value]) => (
                              <SelectItem key={key} value={value}>
                                {capitalize(key)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="availableStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái tài khoản</FormLabel>
                    <FormControl>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2">
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                              <Label className="cursor-pointer">{field.value ? 'Công khai hồ sơ' : 'Ẩn hồ sơ'}</Label>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent align="start">
                            <p>
                              {field.value
                                ? 'Hồ sơ của bạn có thể được tìm thấy bởi nhà tuyển dụng'
                                : 'Hồ sơ của bạn sẽ bị ẩn khỏi nhà tuyển dụng'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label required>Địa chỉ</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ province: '', fullAddress: '' })}
                    className="rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm địa chỉ
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="px-4 py-3 border rounded-xl space-y-3 bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Địa chỉ {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-full"
                        size="icon-sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name={`addresses.${index}.province`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Tỉnh/Thành phố</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="VD: Hồ Chí Minh" className="rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`addresses.${index}.fullAddress`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Địa chỉ chi tiết</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="VD: 123 Đường ABC, Quận 1" className="rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headline</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-xl" placeholder="Headline của bạn" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="rounded-xl min-h-28" placeholder="Giới thiệu ngắn về bạn" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 pt-4 justify-end items-center">
              <Button type="button" variant="outline" onClick={handleCancel} className="rounded-xl px-6">
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingApplicant}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6"
              >
                {isUpdatingApplicant ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Đang lưu...
                  </>
                ) : (
                  'Cập nhật'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicantUserForm;
