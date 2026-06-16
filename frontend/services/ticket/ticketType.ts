import { IBackendRes } from '@/types/api';
import { ReportReason } from '@/types/enum';

export type CreateTicketRequest = {
  targetId: number;
  reason: ReportReason;
  description: string;
};

export type TicketResponse = {
  ticketId: number;
  type: string;
  reason: ReportReason;
  description: string;
  status: string;
  reporterId: number;
  reporterName: string;
  blogId?: number;
  commentId?: number;
};

export type TicketMutationResponse = IBackendRes<TicketResponse>;
