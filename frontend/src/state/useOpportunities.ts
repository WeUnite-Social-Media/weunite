import type {
  CreateOpportunity,
  UpdateOpportunity,
} from "@/@types/opportunity.types";
import {
  createOpportunityRequest,
  deleteOpportunityRequest,
  getOpportunitiesCompanyRequest,
  getOpportunitiesRequest,
  updateOpportunityRequest,
} from "@/api/services/opportunityService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const opportunityKeys = {
  all: ["opportunities"] as const,
  lists: () => [...opportunityKeys.all, "list"] as const,
  list: (filters: string) => [...opportunityKeys.lists(), { filters }] as const,
  details: () => [...opportunityKeys.all, "detail"] as const,
  detail: (id: string) => [...opportunityKeys.details(), id] as const,
};

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

export const useGetOpportunitiesCompany = (companyId: number) => {
  return useQuery({
    queryKey: opportunityKeys.list(`companyId=${companyId}`),
    queryFn: () => getOpportunitiesCompanyRequest(companyId),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useGetOpportunities = () => {
  return useQuery({
    queryKey: opportunityKeys.lists(),
    queryFn: getOpportunitiesRequest,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
