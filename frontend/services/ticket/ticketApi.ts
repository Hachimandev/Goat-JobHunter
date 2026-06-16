import { api } from '../api';
import { CreateTicketRequest, TicketMutationResponse } from './ticketType';

export const ticketApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createBlogTicket: builder.mutation<TicketMutationResponse, CreateTicketRequest>({
      query: (data) => ({
        url: '/tickets/blog',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'Ticket', id: 'LIST' }]
    }),
    createCommentTicket: builder.mutation<TicketMutationResponse, CreateTicketRequest>({
      query: (data) => ({
        url: '/tickets/comment',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'Ticket', id: 'LIST' }]
    }),
  }),
});

export const { useCreateBlogTicketMutation, useCreateCommentTicketMutation } = ticketApi;
