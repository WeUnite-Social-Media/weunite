import type {
  CreateOpportunity,
  Opportunity,
  SavedOpportunity,
  Subscriber,
  UpdateOpportunity,
} from "@/shared/types/opportunity.types";
import { instance as axios } from "@/shared/api/http";
import { AxiosError } from "axios";

export const createOpportunityRequest = async (
  data: CreateOpportunity,
  companyId: number,
) => {
  try {
    const formData = new FormData();

    const opportunityBlob = new Blob(
      [
        JSON.stringify({
          title: data.title,
          description: data.description,
          location: data.location,
          dateEnd: data.dateEnd.toISOString(),
          skills: data.skills,
        }),
      ],
      {
        type: "application/json",
      },
    );

    formData.append("opportunity", opportunityBlob);

    const response = await axios.post(
      `/opportunities/create/${companyId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return {
      success: true,
      data: response.data,
      message: response.data.message || "Oportunidade criada com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao criar a oportunidade",
    };
  }
};

export const updateOpportunityRequest = async (
  companyId: number,
  data: UpdateOpportunity,
) => {
  try {
    const response = await axios.put(
      `/opportunities/update/${companyId}/${data.opportunityId}`,
      data,
    );
    return {
      success: true,
      data: response.data,
      message: response.data.message || "Oportunidade atualizada com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error:
        error.response?.data?.message || "Erro ao atualizar a oportunidade",
    };
  }
};

export const deleteOpportunityRequest = async (
  companyId: number,
  opportunityId: number,
) => {
  try {
    const response = await axios.delete(
      `/opportunities/delete/${companyId}/${opportunityId}`,
    );
    return {
      success: true,
      data: response.data,
      message: response.data.message || "Oportunidade deletada com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao deletar a oportunidade",
    };
  }
};

export const getOpportunitiesCompanyRequest = async (companyId: number) => {
  try {
    const response = await axios.get(`/opportunities/get/company/${companyId}`);
    return {
      success: true,
      data: response.data,
      message: response.data.message || "Oportunidade carregada com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao carregar a oportunidade",
    };
  }
};

export const getOpportunitiesRequest = async () => {
  try {
    const response = await axios.get("/opportunities/get");
    return {
      success: true,
      data: response.data,
      message: response.data.message || "Oportunidades carregadas com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error:
        error.response?.data?.message || "Erro ao carregar as oportunidades",
    };
  }
};

export const getOpportunityRequest = async (opportunityId: number) => {
  try {
    const response = await axios.get(`/opportunities/get/${opportunityId}`);
    return {
      success: true,
      data: response.data.data as Opportunity,
      message: response.data.message || "Oportunidade carregada com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao carregar a oportunidade",
    };
  }
};

export const getOpportunitySubscribersRequest = async (
  opportunityId: number,
) => {
  try {
    const response = await axios.get(`/subscriber/subscribers/${opportunityId}`);
    return {
      success: true,
      data: response.data as Subscriber[],
      message: "Inscritos carregados com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao carregar os inscritos",
    };
  }
};

export const toggleSubscriberRequest = async (
  athleteId: number,
  opportunityId: number,
) => {
  try {
    const response = await axios.post(
      `/subscriber/toggleSubscriber/${athleteId}/${opportunityId}`,
    );
    return {
      success: true,
      data: response.data.data as Subscriber | null,
      message: response.data.message || "Candidatura atualizada com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao atualizar candidatura",
    };
  }
};

export const checkIsSubscribedRequest = async (
  athleteId: number,
  opportunityId: number,
) => {
  try {
    const response = await axios.get(
      `/subscriber/isSubscribed/${athleteId}/${opportunityId}`,
    );
    return {
      success: true,
      data: response.data as boolean,
      message: null,
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: false,
      message: null,
      error:
        error.response?.data?.message ||
        "Erro ao verificar status da candidatura",
    };
  }
};

export const getAthleteSubscriptionsRequest = async (athleteId: number) => {
  try {
    const response = await axios.get(`/subscriber/athlete/${athleteId}`);
    return {
      success: true,
      data: response.data as Subscriber[],
      message: "Candidaturas carregadas com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error:
        error.response?.data?.message || "Erro ao carregar as candidaturas",
    };
  }
};

export const toggleSavedOpportunityRequest = async (
  athleteId: number,
  opportunityId: number,
) => {
  try {
    const response = await axios.post(
      `/saved-opportunities/toggle/${athleteId}/${opportunityId}`,
    );
    return {
      success: true,
      data: response.data.data as SavedOpportunity | null,
      isSaved: response.data.data !== null,
      message: response.data.message || "Operacao realizada com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      isSaved: false,
      message: null,
      error:
        error.response?.data?.message ||
        "Erro ao salvar ou remover oportunidade",
    };
  }
};

export const getSavedOpportunitiesRequest = async (athleteId: number) => {
  try {
    const response = await axios.get(`/saved-opportunities/athlete/${athleteId}`);
    return {
      success: true,
      data: response.data as SavedOpportunity[],
      message: "Oportunidades salvas carregadas com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error:
        error.response?.data?.message ||
        "Erro ao carregar oportunidades salvas",
    };
  }
};

export const checkIsSavedRequest = async (
  athleteId: number,
  opportunityId: number,
) => {
  try {
    const response = await axios.get(
      `/saved-opportunities/isSaved/${athleteId}/${opportunityId}`,
    );
    return {
      success: true,
      data: response.data as boolean,
      message: null,
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: false,
      message: null,
      error:
        error.response?.data?.message ||
        "Erro ao verificar se a oportunidade esta salva",
    };
  }
};
