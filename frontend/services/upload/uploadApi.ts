import { api } from "@/services/api";
import type {
  UploadMultipleFilesRequest,
  UploadMultipleFilesResponse,
  UploadSingleFileRequest,
  UploadSingleFileResponse
} from "./uploadType";

export const uploadApi = api.injectEndpoints({
  endpoints: (builder) => ({
    uploadSingleFile: builder.mutation<
      UploadSingleFileResponse,
      UploadSingleFileRequest
    >({
      query: ({ file, folderType }) => {
        const bodyFormData = new FormData();
        bodyFormData.append("file", file);
        bodyFormData.append("folder", folderType);
        return {
          url: "/files",
          method: "POST",
          data: bodyFormData
        };
      }
    }),
    uploadMultipleFiles: builder.mutation<UploadMultipleFilesResponse, UploadMultipleFilesRequest>({
      query: ({ files, folderType }) => {
        const bodyFormData = new FormData();
        files.forEach((file) => {
          bodyFormData.append("files", file);
        });
        bodyFormData.append("folder", folderType);
        return {
          url: "/files/multiple",
          method: "POST",
          data: bodyFormData
        };
      }
    })
  })
});

export const {
  useUploadSingleFileMutation,
  useUploadMultipleFilesMutation
} = uploadApi;
