import { api } from '../api';
import type {
  UploadSingleFileRequest,
  UploadSingleFileResponse,
  UploadMultipleFilesRequest,
  UploadMultipleFilesResponse,
} from './uploadType';

export const uploadApi = api.injectEndpoints({
  endpoints: (builder) => ({
    uploadSingleFile: builder.mutation<UploadSingleFileResponse, UploadSingleFileRequest>({
      query: ({ file, folderType }) => {
        const formData = new FormData();
        
        // For React Native, file should be an object with uri, type, name
        formData.append('file', {
          uri: file.uri,
          type: file.type || 'image/jpeg',
          name: file.name || 'image.jpg',
        } as any);
        formData.append('folder', folderType);

        return {
          url: '/files',
          method: 'POST',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      },
    }),

    uploadMultipleFiles: builder.mutation<UploadMultipleFilesResponse, UploadMultipleFilesRequest>({
      query: ({ files, folderType }) => {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: file.name || 'image.jpg',
          } as any);
        });
        formData.append('folder', folderType);

        return {
          url: '/files/multiple',
          method: 'POST',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      },
    }),
  }),
});

export const {
  useUploadSingleFileMutation,
  useUploadMultipleFilesMutation,
} = uploadApi;

