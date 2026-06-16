import {
  useDeleteBlogMutation,
  useEnableBlogsMutation,
  useDisableBlogsMutation,
  useCreateBlogMutation,
  useUpdateBlogMutation,
} from '@/services/blog/blogApi';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { BlogActionType } from '@/types/enum';
import { useUser } from '@/hooks/useUser';
import { CreateBlogDto } from '@/types/dto';
import { useSaveBlogsMutation, useUnsaveBlogsMutation } from '@/services/user/savedBlogsApi';
import { extractPlainTextFromHtml } from '@/utils/extractPlainTextFromHtml';

const isEmptyBlogContent = (content: string): boolean => {
  return !extractPlainTextFromHtml(content).trim();
};

const useBlogActions = () => {
  const { isSignedIn, user } = useUser();
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();
  const [enableBlogs, { isLoading: isEnabling }] = useEnableBlogsMutation();
  const [disableBlogs, { isLoading: isDisabling }] = useDisableBlogsMutation();
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const [saveBlogs, { isLoading: isSaving, isSuccess: isSaveBlogSuccess, isError: isSaveBlogError }] =
    useSaveBlogsMutation();
  const [unsaveBlogs, { isLoading: isUnsaving, isSuccess: isUnsaveBlogSuccess, isError: isUnsaveBlogError }] =
    useUnsaveBlogsMutation();

  // Delete multiple blogs
  const handleDeleteBlogs = useCallback(
    async (blogIds: number[]) => {
      if (!isSignedIn || !user) {
        toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
        return;
      }

      try {
        await deleteBlog({
          blogIds,
          mode: BlogActionType.DELETE,
        }).unwrap();

        toast.success('Xóa bài viết thành công!', {
          description: `Đã xóa ${blogIds.length} bài viết`,
        });
      } catch (error) {
        console.error('Failed to delete blogs:', error);
        toast.error('Không thể xóa bài viết. Vui lòng thử lại sau.');
        throw error;
      }
    },
    [deleteBlog, isSignedIn, user],
  );

  // Enable blogs
  const handleEnableBlogs = useCallback(
    async (blogIds: number[]) => {
      if (!isSignedIn || !user) {
        toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
        return;
      }
      try {
        await enableBlogs({
          blogIds,
          mode: BlogActionType.ACCEPT,
        }).unwrap();

        toast.success('Hiển thị bài viết thành công!');
      } catch (error) {
        console.error('Failed to enable blogs:', error);
        toast.error('Không thể hiển thị bài viết. Vui lòng thử lại sau.');
        throw error;
      }
    },
    [enableBlogs, isSignedIn, user],
  );

  // Disable blogs
  const handleDisableBlogs = useCallback(
    async (blogIds: number[], reason?: string) => {
      if (!isSignedIn || !user) {
        toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
        return;
      }
      try {
        await disableBlogs({
          blogIds,
          mode: BlogActionType.REJECT,
          reason: reason ?? '',
        }).unwrap();

        toast.success('Ẩn bài viết thành công!');
      } catch (error) {
        console.error('Failed to disable blogs:', error);
        toast.error('Không thể ẩn bài viết. Vui lòng thử lại sau.');
        throw error;
      }
    },
    [disableBlogs, isSignedIn, user],
  );

  // Toggle enable/disable for single blog
  const handleToggleBlogStatus = useCallback(
    async (blogId: number, isEnabled: boolean) => {
      if (!isSignedIn || !user) {
        toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
        return;
      }
      try {
        if (isEnabled) {
          await disableBlogs({
            blogIds: [blogId],
            mode: BlogActionType.REJECT,
          }).unwrap();
          toast.success('Đã ẩn bài viết');
        } else {
          await enableBlogs({
            blogIds: [blogId],
            mode: BlogActionType.ACCEPT,
          }).unwrap();
          toast.success('Đã hiển thị bài viết');
        }
      } catch (error) {
        console.error('Failed to toggle blog status:', error);
        toast.error('Không thể thay đổi trạng thái bài viết. Vui lòng thử lại sau.');
        throw error;
      }
    },
    [isSignedIn, user, disableBlogs, enableBlogs],
  );

  // Create blog
  const handleCreateBlog = useCallback(
    async (data: CreateBlogDto) => {
      if (!isSignedIn || !user) {
        toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
        return;
      }

      if (isEmptyBlogContent(data.content)) {
        toast.error('Nội dung bài viết không được để trống.');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('content', data.content);

        if (data.files) {
          for (const file of data.files) {
            formData.append('files', file);
          }
        }

        const response = await createBlog(formData).unwrap();

        if (response.data) {
          toast.success('Tạo bài viết thành công!');
          return response.data;
        }
      } catch (error) {
        console.error('Failed to create blog:', error);
        toast.error('Không thể tạo bài viết. Vui lòng thử lại sau.');
        throw error;
      }
    },
    [createBlog, isSignedIn, user],
  );

  // Update blog
  const handleUpdateBlog = useCallback(
    async (blogId: number, data: CreateBlogDto) => {
      if (!isSignedIn || !user) {
        toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
        return;
      }

      if (isEmptyBlogContent(data.content)) {
        toast.error('Nội dung bài viết không được để trống.');
        return;
      }

      try {
        const formData = new FormData();

        formData.append('content', data.content);

        if (data.files) {
          for (const file of data.files) {
            formData.append('files', file);
          }
        }

        const response = await updateBlog({
          blogId,
          formData,
        }).unwrap();

        if (response.data) {
          toast.success('Cập nhật bài viết thành công!');
          return response.data;
        }
      } catch (error) {
        console.error('Failed to update blog:', error);
        toast.error('Không thể cập nhật bài viết. Vui lòng thử lại sau.');
        throw error;
      }
    },
    [isSignedIn, updateBlog, user],
  );

  // Unsave blog
  const handleUnsaveBlog = useCallback(
    async (blogId: number) => {
      if (!isSignedIn || !user) {
        toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
        return;
      }

      await unsaveBlogs({
        blogIds: [blogId],
      });

      if (isUnsaveBlogSuccess) {
        toast.success('Đã bỏ lưu bài viết.');
      }

      if (isUnsaveBlogError) {
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    },
    [isSignedIn, user, unsaveBlogs, isUnsaveBlogSuccess, isUnsaveBlogError],
  );

  // Toggle save blog
  const handleToggleSaveBlog = useCallback(
    async (e: React.MouseEvent, blogId: number, isSaved: boolean) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isSignedIn || !user) {
        toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
        return;
      }

      if (isSaved) {
        await unsaveBlogs({
          blogIds: [blogId],
        });
      } else {
        await saveBlogs({
          blogIds: [blogId],
        });
      }

      if (isSaveBlogSuccess || isUnsaveBlogSuccess) {
        toast.success(isSaved ? 'Đã bỏ lưu bài viết.' : 'Đã lưu bài viết thành công.');
      }

      if (isSaveBlogError || isUnsaveBlogError) {
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    },
    [
      isSignedIn,
      user,
      saveBlogs,
      unsaveBlogs,
      isSaveBlogSuccess,
      isUnsaveBlogSuccess,
      isSaveBlogError,
      isUnsaveBlogError,
    ],
  );

  return {
    isDeleting,
    isEnabling,
    isDisabling,
    isCreating,
    isUpdating,
    isSaving,
    isUnsaving,
    isLoading: isDeleting || isEnabling || isDisabling || isCreating || isUpdating || isSaving || isUnsaving,

    handleDeleteBlogs,
    handleEnableBlogs,
    handleDisableBlogs,
    handleToggleBlogStatus,
    handleCreateBlog,
    handleUpdateBlog,
    handleUnsaveBlog,
    handleToggleSaveBlog,
  };
};

export default useBlogActions;
