import type { IBackendRes } from "@/types/api";

// Upload Single File
export type UploadSingleFileRequest = {
  file: File;
  folderType: string;
};

export type UploadSingleFileResponse = IBackendRes<{
  publicId: string;
  url: string;
}>;

// Upload Multiple Files
export type UploadMultipleFilesRequest = {
  files: File[];
  folderType: string;
};

export type UploadMultipleFilesResponse = IBackendRes<
  {
    publicId: string;
    url: string;
  }[]
  |
  string
>;
