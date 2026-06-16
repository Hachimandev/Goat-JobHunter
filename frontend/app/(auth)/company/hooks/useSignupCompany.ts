import { useUser } from '@/hooks/useUser';
import { useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { toast } from 'sonner';
import { TCompanySignUpSchema } from '../../components/schemas';
import { useRouter } from 'next/navigation';

interface UseSignupCompanyReturn {
  setValue: UseFormSetValue<TCompanySignUpSchema>;
}

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ACCEPTED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

const useSignupCompany = ({ setValue }: UseSignupCompanyReturn) => {
  const router = useRouter();

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);

  const { companySignUp, isSigningUpCompany } = useUser();

  const isSubmitting = isSigningUpCompany;

  const handleLogoDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Kích thước ảnh không được vượt quá ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        return;
      }

      setLogoFile(file);
      setValue('logo', file, { shouldValidate: true });

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPhotoDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Kích thước ảnh không được vượt quá ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        return;
      }

      setCoverPhotoFile(file);
      setValue('coverPhoto', file, { shouldValidate: true });

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setValue('logo', undefined);
  };

  const handleRemoveCoverPhoto = () => {
    setCoverPhotoFile(null);
    setCoverPhotoPreview(null);
    setValue('coverPhoto', undefined);
  };

  const handleError = (error: Error) => {
    if (error.message.includes('File type must be one of')) {
      toast.error('Định dạng ảnh không hợp lệ');
      return;
    }

    if (error.message.includes('File is larger than')) {
      toast.error(`Kích thước ảnh không được vượt quá ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return;
    }

    console.error('Dropzone error:', error);
    toast.error('Lỗi khi chọn ảnh. Vui lòng thử lại.');
  };

  const handleSubmit = async (data: TCompanySignUpSchema) => {
    try {
      if (!logoFile || !coverPhotoFile) {
        toast.error('Vui lòng chọn cả logo và ảnh bìa cho công ty');
        return;
      }

      const formData = new FormData();
      formData.append('logo', data.logo as File);
      formData.append('coverPhoto', data.coverPhoto as File);
      formData.append('username', data.username);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('confirmPassword', data.confirmPassword);
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('phone', data.phone);
      formData.append('size', data.size);
      formData.append('country', data.country);
      formData.append('industry', data.industry);
      formData.append('workingDays', data.workingDays);
      formData.append('overtimePolicy', data.overtimePolicy);
      if (data.website) {
        formData.append('website', data.website);
      }
      formData.append('addresses', JSON.stringify(data.addresses));

      const result = await companySignUp(formData);

      if (result.success) {
        router.push('/otp?email=' + encodeURIComponent(data.email));
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau');
    }
  };

  return {
    logoFile,
    coverPhotoFile,
    logoPreview,
    coverPhotoPreview,

    isSubmitting,

    handleLogoDrop,
    handleCoverPhotoDrop,
    handleRemoveLogo,
    handleRemoveCoverPhoto,
    handleError,
    handleSubmit,
  };
};

export default useSignupCompany;
