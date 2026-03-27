'use client';

import { CompanyFormData, companySchema } from '@/app/(main)/profile/components/ProfileInfo/schema';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { COUNTRY_OPTIONS } from '@/constants/constant';
import { useUser } from '@/hooks/useUser';
import { CompanyResponse } from '@/types/dto';
import { CompanySize } from '@/types/enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface CompanyUserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: CompanyResponse;
}

const CompanyUserForm = ({ open, onOpenChange, profile }: CompanyUserFormProps) => {
  const { handleUpdateCompany, isUpdatingCompany } = useUser();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      website: '',
      industry: '',
      size: '',
      country: '',
      workingDays: '',
      overtimePolicy: '',
      addresses: [{ province: '', fullAddress: '' }],
      description: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'addresses',
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        website: profile.website || '',
        industry: profile.industry || '',
        size: profile.size || '',
        country: profile.country || '',
        workingDays: profile.workingDays || '',
        overtimePolicy: profile.overtimePolicy || '',
        addresses:
          profile.addresses?.length > 0
            ? profile.addresses.map((addr) => ({
                addressId: addr.addressId,
                province: addr.province,
                fullAddress: addr.fullAddress,
              }))
            : [{ province: '', fullAddress: '' }],
        description: profile.description || '',
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: CompanyFormData) => {
    if (!profile?.accountId) {
      toast.error('Không thể cập nhật thông tin. Vui lòng thử lại sau.');
      return;
    }

    const formData = new FormData();
    formData.append('accountId', String(profile.accountId));
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone || '');
    formData.append('website', data.website || '');
    formData.append('industry', data.industry || '');
    formData.append('size', data.size || '');
    formData.append('country', data.country || '');
    formData.append('workingDays', data.workingDays || '');
    formData.append('overtimePolicy', data.overtimePolicy || '');
    formData.append('addresses', JSON.stringify(data.addresses));
    formData.append('description', data.description || '');

    await handleUpdateCompany(formData);

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
          <DialogTitle className="text-xl">Cập Nhật Thông Tin Công Ty</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Tên Công Ty</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-xl" placeholder="Tên công ty" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" disabled className="rounded-xl" placeholder="Email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-xl" placeholder="https://example.com" type="url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lĩnh vực</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-xl" placeholder="VD: Công nghệ" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quy mô</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="rounded-xl w-full">
                            <SelectValue placeholder="Chọn quy mô" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(CompanySize).map(([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quốc gia</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="rounded-xl w-full">
                            <SelectValue placeholder="Chọn quốc gia" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRY_OPTIONS.map((option) => (
                              <SelectItem key={option.label} value={option.label}>
                                {option.label}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="workingDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày làm việc</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-xl" placeholder="VD: Thứ 2 - Thứ 6" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="overtimePolicy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chính sách tăng ca</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-xl" placeholder="Chính sách tăng ca" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                  <div key={field.id} className="p-4 border rounded-xl space-y-3 bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Địa chỉ {index + 1}</span>
                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="rounded-xl min-h-32" placeholder="Mô tả về công ty của bạn" />
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
                disabled={isUpdatingCompany}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6"
              >
                {isUpdatingCompany ? (
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

export default CompanyUserForm;
