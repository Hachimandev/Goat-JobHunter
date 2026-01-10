import { IBackendRes } from '../../types/api';

export type FileUpload = {
  uri: string;
  type?: string;
  name?: string;
};

export type UploadSingleFileRequest = {
  file: FileUpload;
  folderType: string;
};

export type UploadSingleFileResponse = IBackendRes<{
  url: string;
}>;

export type UploadMultipleFilesRequest = {
  files: FileUpload[];
  folderType: string;
};

export type UploadMultipleFilesResponse = IBackendRes<{
  urls: string[];
}>;

