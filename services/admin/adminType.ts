import { IBackendRes, IModelPaginate } from '@/types/api';
import { Account } from '@/types/model';

export type GetAccountsRequest = {
  page?: number;
  size?: number;
  email?: string;
  role?: string;
  enabled?: boolean;
  locked?: boolean;
};
export type GetAccountsResponse = IBackendRes<IModelPaginate<Account & { fullName: string; phone: string }>>;

export type AccountIdsRequest = {
  accountIds: number[];
};
export type AccountStatusResponse = IBackendRes<
  {
    accountId: number;
    locked?: boolean;
    enabled?: boolean;
  }[]
>;
