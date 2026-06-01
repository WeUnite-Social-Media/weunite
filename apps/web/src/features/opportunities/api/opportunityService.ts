import type {
  CreateOpportunity,
  Opportunity,
  SavedOpportunity,
  Skill,
  Subscriber,
  UpdateOpportunity,
} from "@/shared/types/opportunity.types";
import { formatOpportunityDateForApi } from "@/features/opportunities/utils/opportunityDates";
import { instance as axios } from "@/shared/api/http";
import { AxiosError } from "axios";

type ResponseWithData<T> = {
  data?: T;
  message?: string;
};

interface GetOpportunitiesRequestParams {
  page?: number;
  size?: number;
}

export const OPPORTUNITIES_PAGE_SIZE = 10;

const unwrapArrayResponse = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as ResponseWithData<unknown>).data)
  ) {
    return (payload as ResponseWithData<T[]>).data ?? [];
  }

  return [];
};

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
          dateEnd: formatOpportunityDateForApi(data.dateEnd),
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
    const payload = {
      ...data,
      dateEnd: data.dateEnd
        ? formatOpportunityDateForApi(data.dateEnd)
        : undefined,
    };

    const response = await axios.put(
      `/opportunities/update/${companyId}/${data.opportunityId}`,
      payload,
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

export const getOpportunitiesCompanyRequest = async (
  companyId: number,
  {
    page = 0,
    size = OPPORTUNITIES_PAGE_SIZE,
  }: GetOpportunitiesRequestParams = {},
) => {
  try {
    const response = await axios.get(
      `/opportunities/get/company/${companyId}`,
      {
        params: { page, size },
      },
    );
    const opportunities = unwrapArrayResponse<Opportunity>(response.data);

    return {
      success: true,
      data: opportunities,
      message:
        (response.data as ResponseWithData<Opportunity[]>)?.message ||
        "Oportunidade carregada com sucesso!",
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

export const getOpportunitiesRequest = async ({
  page = 0,
  size = OPPORTUNITIES_PAGE_SIZE,
}: GetOpportunitiesRequestParams = {}) => {
  try {
    const response = await axios.get("/opportunities/get", {
      params: { page, size },
    });
    const opportunities = unwrapArrayResponse<Opportunity>(response.data);

    return {
      success: true,
      data: opportunities,
      message:
        (response.data as ResponseWithData<Opportunity[]>)?.message ||
        "Oportunidades carregadas com sucesso!",
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

export const getAvailableSkillsRequest = async () => {
  try {
    const response = await axios.get("/opportunities/skills");
    return {
      success: true,
      data: unwrapArrayResponse<Skill>(response.data),
      message: "Habilidades carregadas com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao carregar habilidades",
    };
  }
};

export const getOpportunitySubscribersRequest = async (
  opportunityId: number,
) => {
  try {
    const response = await axios.get(
      `/subscriber/subscribers/${opportunityId}`,
    );
    const subscribers = unwrapArrayResponse<Subscriber>(response.data);

    return {
      success: true,
      data: subscribers,
      message:
        (response.data as ResponseWithData<Subscriber[]>)?.message ||
        "Inscritos carregados com sucesso!",
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

export const getAthleteSubscriptionsRequest = async (
  athleteId: number,
  {
    page = 0,
    size = OPPORTUNITIES_PAGE_SIZE,
  }: GetOpportunitiesRequestParams = {},
) => {
  try {
    const response = await axios.get(`/subscriber/athlete/${athleteId}`, {
      params: { page, size },
    });
    const subscriptions = unwrapArrayResponse<Subscriber>(response.data);

    return {
      success: true,
      data: subscriptions,
      message:
        (response.data as ResponseWithData<Subscriber[]>)?.message ||
        "Candidaturas carregadas com sucesso!",
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

export const getSavedOpportunitiesRequest = async (
  athleteId: number,
  {
    page = 0,
    size = OPPORTUNITIES_PAGE_SIZE,
  }: GetOpportunitiesRequestParams = {},
) => {
  try {
    const response = await axios.get(
      `/saved-opportunities/athlete/${athleteId}`,
      {
        params: { page, size },
      },
    );
    const savedOpportunities = unwrapArrayResponse<SavedOpportunity>(
      response.data,
    );

    return {
      success: true,
      data: savedOpportunities,
      message:
        (response.data as ResponseWithData<SavedOpportunity[]>)?.message ||
        "Oportunidades salvas carregadas com sucesso!",
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
