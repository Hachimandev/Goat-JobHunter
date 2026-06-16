import { useUser } from '@/hooks/useUser';
import { useState } from 'react';
import { toast } from 'sonner';

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ACCEPTED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

const useUpdateAvatar = (type: string, field: 'avatar' | 'coverPhoto' = 'avatar') => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const {
    user,
    handleUpdateApplicant,
    isUpdatingApplicant,
    handleUpdateRecruiter,
    isUpdatingRecruiter,
    handleUpdateCompany,
    isUpdatingCompany,
  } = useUser();

  const isSubmitting = isUpdatingApplicant || isUpdatingRecruiter || isUpdatingCompany;

  const handleImageDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Kích thước ảnh không được vượt quá ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        return;
      }

      setSelectedImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async () => {
    try {
      if (!selectedImage) {
        toast.error('Vui lòng chọn ảnh');
        return;
      }

      try {
        if (!user?.accountId) {
          throw new Error('User ID is missing');
        }

        const formData = new FormData();
        formData.append('accountId', String(user.accountId));

        if (field === 'coverPhoto') {
          formData.append('coverPhoto', selectedImage);
        } else {
          if (type === 'APPLICANT') {
            formData.append('avatar', selectedImage);
            await handleUpdateApplicant(formData);
          } else if (type === 'HR') {
            formData.append('avatar', selectedImage);
            await handleUpdateRecruiter(formData);
          } else if (type === 'COMPANY') {
            formData.append('logo', selectedImage);
            await handleUpdateCompany(formData);
          }
        }

        // Handle coverPhoto update for all types
        if (field === 'coverPhoto') {
          if (type === 'APPLICANT') {
            await handleUpdateApplicant(formData);
          } else if (type === 'HR') {
            await handleUpdateRecruiter(formData);
          } else if (type === 'COMPANY') {
            await handleUpdateCompany(formData);
          }
        }

        handleRemoveImage();
      } catch (updateError) {
        console.error('Error updating avatar:', updateError);
        toast.error('Không thể cập nhật ảnh. Vui lòng thử lại sau');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau');
    }
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

  return {
    selectedImage,
    previewUrl,
    isSubmitting,
    handleImageDrop,
    handleRemoveImage,
    handleSubmit,
    handleError,
  };
};

export default useUpdateAvatar;
