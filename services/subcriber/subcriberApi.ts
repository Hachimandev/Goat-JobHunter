import { api } from '@/services/api';
import type {
  CreateSubscriberRequest,
  FetchSubscriberByIdResponse,
  FetchSubscribersRequest,
  FetchSubscribersResponse,
  GetSubscriberSkillsResponse,
  SubscriberMutationResponse,
  UpdateSubscriberRequest,
} from './subcriberType';

export const subscriberApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createSubscriber: builder.mutation<SubscriberMutationResponse, CreateSubscriberRequest>({
      query: (data) => ({
        url: '/subscribers',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Subscriber'],
    }),

    updateSubscriber: builder.mutation<SubscriberMutationResponse, UpdateSubscriberRequest>({
      query: (data) => ({
        url: '/subscribers',
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Subscriber'],
    }),

    deleteSubscriber: builder.mutation<SubscriberMutationResponse, number>({
      query: (id) => ({
        url: `/subscribers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subscriber'],
    }),

    fetchSubscriberById: builder.query<FetchSubscriberByIdResponse, number>({
      query: (id) => ({
        url: `/subscribers/${id}`,
        method: 'GET',
      }),
      providesTags: ['Subscriber'],
    }),

    fetchSubscribers: builder.query<FetchSubscribersResponse, FetchSubscribersRequest>({
      query: (params) => ({
        url: '/subscribers',
        method: 'GET',
        params,
      }),
      providesTags: ['Subscriber'],
    }),

    getCurrentUserSubscriberSkills: builder.query<GetSubscriberSkillsResponse, void>({
      query: () => ({
        url: '/subscribers/skills',
        method: 'GET',
      }),
      providesTags: ['Subscriber'],
    }),
  }),
});

export const {
  useCreateSubscriberMutation,
  useUpdateSubscriberMutation,
  useDeleteSubscriberMutation,
  useFetchSubscriberByIdQuery,
  useFetchSubscribersQuery,
  useGetCurrentUserSubscriberSkillsQuery,
} = subscriberApi;
