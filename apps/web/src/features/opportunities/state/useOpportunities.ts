import type {
  CreateOpportunity,
  Opportunity,
  UpdateOpportunity,
} from "@/shared/types/opportunity.types";
import {
  checkIsSavedRequest,
  checkIsSubscribedRequest,
  createOpportunityRequest,
  deleteOpportunityRequest,
  getAthleteSubscriptionsRequest,
  getOpportunityRequest,
  getOpportunitiesCompanyRequest,
  getOpportunitiesRequest,
  getOpportunitySubscribersRequest,
  OPPORTUNITIES_PAGE_SIZE,
  getSavedOpportunitiesRequest,
  toggleSavedOpportunityRequest,
  toggleSubscriberRequest,
  updateOpportunityRequest,
} from "@/features/opportunities/api/opportunityService";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const opportunityKeys = {
  all: ["opportunities"] as const,
  lists: () => [...opportunityKeys.all, "list"] as const,
  list: (filters: string) => [...opportunityKeys.lists(), { filters }] as const,
  details: () => [...opportunityKeys.all, "detail"] as const,
  detail: (id: string) => [...opportunityKeys.details(), id] as const,
  subscribers: (opportunityId: number) =>
    [...opportunityKeys.all, "subscribers", opportunityId] as const,
  saved: (athleteId: number) =>
    [...opportunityKeys.all, "saved", athleteId] as const,
  savedStatus: (athleteId: number, opportunityId: number) =>
    [...opportunityKeys.all, "saved-status", athleteId, opportunityId] as const,
  subscriptionStatus: (athleteId: number, opportunityId: number) =>
    [
      ...opportunityKeys.all,
      "subscription-status",
      athleteId,
      opportunityId,
    ] as const,
  athleteSubscriptions: (athleteId: number) =>
    [...opportunityKeys.all, "athlete-subscriptions", athleteId] as const,
};

export const opportunityDetailQueryOptions = (opportunityId: number) => ({
  queryKey: opportunityKeys.detail(String(opportunityId)),
  queryFn: () => getOpportunityRequest(opportunityId),
  enabled: opportunityId > 0,
  staleTime: 5 * 60 * 1000,
  retry: 2,
});

export const useCreateOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      companyId,
    }: {
      data: CreateOpportunity;
      companyId: number;
    }) => createOpportunityRequest(data, companyId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || "Oportunidade criada com sucesso!");

        queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
      } else {
        toast.error(result.message || "Erro ao criar oportunidade");
      }
    },
    onError: () => {
      toast.error("Erro inesperado ao criar oportunidade");
    },
  });
};

export const useUpdateOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      companyId,
    }: {
      data: UpdateOpportunity;
      companyId: number;
    }) => updateOpportunityRequest(companyId, data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || "Oportunidade atualizada com sucesso!");

        queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
      } else {
        toast.error(result.message || "Erro ao atualizar oportunidade");
      }
    },
    onError: () => {
      toast.error("Erro inesperado ao atualizar oportunidade");
    },
  });
};

export const useDeleteOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      opportunityId,
      companyId,
    }: {
      opportunityId: number;
      companyId: number;
    }) => deleteOpportunityRequest(companyId, opportunityId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || "Oportunidade deletada com sucesso!");

        queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
      } else {
        toast.error(result.message || "Erro ao deletar oportunidade");
      }
    },
    onError: () => {
      toast.error("Erro inesperado ao deletar oportunidade");
    },
  });
};

export const useGetOpportunitiesCompany = (
  companyId: number,
  options?: { enabled?: boolean },
) => {
  return useInfiniteQuery({
    queryKey: opportunityKeys.list(`companyId=${companyId}`),
    queryFn: ({ pageParam }) =>
      getOpportunitiesCompanyRequest(companyId, { page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.success || !lastPage.data) {
        return undefined;
      }

      return lastPage.data.length < OPPORTUNITIES_PAGE_SIZE
        ? undefined
        : allPages.length;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    enabled: options?.enabled ?? true,
  });
};

export const useGetOpportunities = () => {
  return useInfiniteQuery({
    queryKey: opportunityKeys.lists(),
    queryFn: ({ pageParam }) => getOpportunitiesRequest({ page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.success || !lastPage.data) {
        return undefined;
      }

      return lastPage.data.length < OPPORTUNITIES_PAGE_SIZE
        ? undefined
        : allPages.length;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useGetOpportunity = (
  opportunityId: number,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    ...opportunityDetailQueryOptions(opportunityId),
    enabled: options?.enabled ?? opportunityId > 0,
  });
};

export const useGetOpportunitySubscribers = (
  opportunityId: number,
  enabled = true,
) => {
  return useInfiniteQuery({
    queryKey: opportunityKeys.subscribers(opportunityId),
    queryFn: ({ pageParam }) =>
      getOpportunitySubscribersRequest(opportunityId, { page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.success || !lastPage.data) {
        return undefined;
      }

      return lastPage.data.length < OPPORTUNITIES_PAGE_SIZE
        ? undefined
        : allPages.length;
    },
    enabled,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};

export const useToggleSubscriber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      athleteId,
      opportunityId,
    }: {
      athleteId: number;
      opportunityId: number;
    }) => toggleSubscriberRequest(athleteId, opportunityId),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast.success(result.message || "Candidatura atualizada com sucesso!");
        queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: opportunityKeys.subscriptionStatus(
            variables.athleteId,
            variables.opportunityId,
          ),
        });
        queryClient.invalidateQueries({
          queryKey: opportunityKeys.athleteSubscriptions(variables.athleteId),
        });
        queryClient.invalidateQueries({
          queryKey: opportunityKeys.subscribers(variables.opportunityId),
        });
      } else {
        toast.error(result.error || "Erro ao atualizar candidatura");
      }
    },
    onError: () => {
      toast.error("Erro inesperado ao atualizar candidatura");
    },
  });
};

export const useCheckIsSubscribed = (
  athleteId: number,
  opportunityId: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: opportunityKeys.subscriptionStatus(athleteId, opportunityId),
    queryFn: () => checkIsSubscribedRequest(athleteId, opportunityId),
    enabled,
    staleTime: 60 * 1000,
    retry: 2,
  });
};

export const useGetAthleteSubscriptions = (
  athleteId: number,
  options?: { enabled?: boolean },
) => {
  return useInfiniteQuery({
    queryKey: opportunityKeys.athleteSubscriptions(athleteId),
    queryFn: ({ pageParam }) =>
      getAthleteSubscriptionsRequest(athleteId, { page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.success || !lastPage.data) {
        return undefined;
      }

      return lastPage.data.length < OPPORTUNITIES_PAGE_SIZE
        ? undefined
        : allPages.length;
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
    enabled: options?.enabled ?? true,
    select: (result) => ({
      ...result,
      pages: result.pages.map((page) =>
        page.success && page.data
          ? {
              ...page,
              data: page.data
                .map((subscription) => subscription.opportunity)
                .filter((opportunity): opportunity is Opportunity =>
                  Boolean(opportunity),
                ),
            }
          : page,
      ),
    }),
  });
};

export const useToggleSavedOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      athleteId,
      opportunityId,
    }: {
      athleteId: number;
      opportunityId: number;
    }) => toggleSavedOpportunityRequest(athleteId, opportunityId),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast.success(result.message || "Oportunidade atualizada nos salvos!");
        queryClient.invalidateQueries({
          queryKey: opportunityKeys.saved(variables.athleteId),
        });
        queryClient.invalidateQueries({
          queryKey: opportunityKeys.savedStatus(
            variables.athleteId,
            variables.opportunityId,
          ),
        });
      } else {
        toast.error(result.error || "Erro ao atualizar oportunidade salva");
      }
    },
    onError: () => {
      toast.error("Erro inesperado ao atualizar oportunidade salva");
    },
  });
};

export const useGetSavedOpportunities = (
  athleteId: number,
  options?: { enabled?: boolean },
) => {
  return useInfiniteQuery({
    queryKey: opportunityKeys.saved(athleteId),
    queryFn: ({ pageParam }) =>
      getSavedOpportunitiesRequest(athleteId, { page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.success || !lastPage.data) {
        return undefined;
      }

      return lastPage.data.length < OPPORTUNITIES_PAGE_SIZE
        ? undefined
        : allPages.length;
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
    enabled: options?.enabled ?? true,
    select: (result) => ({
      ...result,
      pages: result.pages.map((page) =>
        page.success && page.data
          ? {
              ...page,
              data: page.data
                .map((savedOpportunity) => savedOpportunity.opportunity)
                .filter((opportunity): opportunity is Opportunity =>
                  Boolean(opportunity),
                ),
            }
          : page,
      ),
    }),
  });
};

export const useCheckIsSaved = (
  athleteId: number,
  opportunityId: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: opportunityKeys.savedStatus(athleteId, opportunityId),
    queryFn: () => checkIsSavedRequest(athleteId, opportunityId),
    enabled,
    staleTime: 60 * 1000,
    retry: 2,
  });
};
