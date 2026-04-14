import { IBackendRes, IModelPaginate } from '@/types/api';
import { Device } from '@/types/model';

export type FetchDevicesRequest = {
  page?: number;
  size?: number;
};

export type FetchDevicesResponse = IBackendRes<IModelPaginate<Device>>;
