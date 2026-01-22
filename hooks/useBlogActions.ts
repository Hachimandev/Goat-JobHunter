import { useUser } from "@/hooks/useUser";
import {
  useCreateBlogMutation,
  useDeleteBlogMutation,
  useUpdateBlogMutation,
} from "@/services/blog/blogApi";
import { CreateBlogDto } from "@/types/dto";
import { useCallback } from "react";
import { Alert, Platform, ToastAndroid } from "react-native";

const notify = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert(message);
  }
};

const useBlogActionsMobile = () => {
  const { isSignedIn, user } = useUser();

  const [createBlog, createState] = useCreateBlogMutation();
  const [updateBlog, updateState] = useUpdateBlogMutation();
  const [deleteBlog, deleteState] = useDeleteBlogMutation();

  /* ================= COMMON ================= */
  const checkAuth = () => {
    if (!isSignedIn || !user) {
      notify("Bạn cần đăng nhập để thực hiện thao tác này.");
      return false;
    }
    return true;
  };

  const buildFormData = (data: CreateBlogDto) => {
    const formData = new FormData();
    formData.append("content", data.content);

    data.files?.forEach((file: any, index) => {
      formData.append("files", {
        uri: file.uri,
        name: file.name ?? `image-${index}.jpg`,
        type: file.type ?? "image/jpeg",
      } as any);
    });

    return formData;
  };

  /* ================= CREATE BLOG ================= */
  const handleCreateBlog = useCallback(
    async (data: CreateBlogDto) => {
      if (!checkAuth()) return;

      try {
        const formData = buildFormData(data);
        const res = await createBlog(formData).unwrap();

        notify("Đăng bài thành công!");
        return res?.data;
      } catch (error) {
        console.error("Create blog error:", error);
        notify("Không thể đăng bài. Vui lòng thử lại.");
        throw error;
      }
    },
    [createBlog],
  );

  /* ================= UPDATE BLOG ================= */
  const handleUpdateBlog = useCallback(
    async (blogId: number, data: CreateBlogDto) => {
      if (!checkAuth()) return;

      try {
        const formData = buildFormData(data);
        const res = await updateBlog({ blogId, formData }).unwrap();

        notify("Cập nhật bài viết thành công!");
        return res?.data;
      } catch (error) {
        console.error("Update blog error:", error);
        notify("Không thể cập nhật bài viết.");
        throw error;
      }
    },
    [updateBlog],
  );

  /* ================= DELETE BLOG ================= */
  const handleDeleteBlog = useCallback(
    async (blogId: number) => {
      if (!checkAuth()) return;

      try {
        await deleteBlog({
          blogIds: [blogId],
          mode: "DELETE",
        }).unwrap();

        notify("Đã xoá bài viết.");
      } catch (error) {
        console.error("Delete blog error:", error);
        notify("Không thể xoá bài viết.");
        throw error;
      }
    },
    [deleteBlog],
  );

  return {
    /* loading states */
    isCreating: createState.isLoading,
    isUpdating: updateState.isLoading,
    isDeleting: deleteState.isLoading,

    /* actions */
    handleCreateBlog,
    handleUpdateBlog,
    handleDeleteBlog,
  };
};

export default useBlogActionsMobile;
