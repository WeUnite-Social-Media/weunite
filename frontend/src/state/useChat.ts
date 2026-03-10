import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateConversation } from "@/@types/chat.types";
import {
  createConversationRequest,
  getConversationByIdRequest,
  getConversationMessagesRequest,
  getUserConversationsRequest,
  markMessagesAsReadRequest,
  uploadMessageFileRequest,
} from "@/api/services/chatService";
import { toast } from "sonner";

export const chatKeys = {
  all: ["chat"] as const,
  conversations: () => [...chatKeys.all, "conversations"] as const,
  conversationsByUser: (userId: number) =>
    [...chatKeys.conversations(), "user", userId] as const,
  conversationDetail: (conversationId: number, userId: number) =>
    [...chatKeys.conversations(), "detail", conversationId, userId] as const,
  messages: () => [...chatKeys.all, "messages"] as const,
  messagesByConversation: (conversationId: number, userId: number) =>
    [...chatKeys.messages(), "conversation", conversationId, userId] as const,
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversation) => createConversationRequest(data),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast.success(result.message || "Conversa criada com sucesso!");

        variables.participantIds.forEach((userId) => {
          queryClient.invalidateQueries({
            queryKey: chatKeys.conversationsByUser(userId),
          });
        });
      } else {
        toast.error(result.error || "Erro ao criar conversa");
      }
    },
    onError: () => {
      toast.error("Erro inesperado ao criar conversa");
    },
  });
};

export const useGetUserConversations = (userId: number) => {
  return useQuery({
    queryKey: chatKeys.conversationsByUser(userId),
    queryFn: () => getUserConversationsRequest(userId),
    staleTime: 30 * 1000, // 30 segundos - confiar em invalidações manuais
    gcTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false, // ✅ Não refetch ao focar janela
    refetchOnMount: false, // ✅ Usa cache
    notifyOnChangeProps: ["data", "error"], // ✅ Só notifica mudanças em data/error
    placeholderData: (previousData) => previousData, // ✅ Mantém dados anteriores enquanto carrega
    retry: 2,
    enabled: !!userId,
  });
};

export const useGetConversationById = (
  conversationId: number,
  userId: number,
) => {
  return useQuery({
    queryKey: chatKeys.conversationDetail(conversationId, userId),
    queryFn: () => getConversationByIdRequest(conversationId, userId),
    staleTime: 30 * 1000,
    retry: 2,
    enabled: !!conversationId && !!userId,
  });
};

export const useGetConversationMessages = (
  conversationId: number,
  userId: number,
) => {
  return useQuery({
    queryKey: chatKeys.messagesByConversation(conversationId, userId),
    queryFn: () => getConversationMessagesRequest(conversationId, userId),
    staleTime: 5 * 60 * 1000, // 5 minutos - confiar no WebSocket
    gcTime: 30 * 60 * 1000, // Mantém cache por 30 minutos
    refetchOnWindowFocus: false, // ✅ Nunca refetch ao focar janela
    refetchOnMount: false, // ✅ Nunca refetch ao montar (usa cache)
    refetchOnReconnect: true, // Apenas ao reconectar internet
    notifyOnChangeProps: ["data", "error"], // ✅ Só notifica mudanças em data/error, não em status
    placeholderData: (previousData) => previousData, // ✅ Mantém dados anteriores enquanto carrega novos (sem tela vazia)
    retry: 2,
    enabled: !!conversationId && !!userId,
  });
};

export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      userId,
    }: {
      conversationId: number;
      userId: number;
    }) => markMessagesAsReadRequest(conversationId, userId),
    onSuccess: (result, { conversationId, userId }) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: chatKeys.conversationsByUser(userId),
        });

        queryClient.invalidateQueries({
          queryKey: chatKeys.conversationDetail(conversationId, userId),
        });
      }
    },
  });
};

export const useUploadMessageFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      senderId,
      file,
    }: {
      conversationId: number;
      senderId: number;
      file: File;
      fileType?: "audio" | "file";
    }) => uploadMessageFileRequest(conversationId, senderId, file),
    onSuccess: (result, { conversationId, senderId, fileType }) => {
      if (result.success) {
        const successMessage =
          fileType === "audio"
            ? "Áudio enviado com sucesso!"
            : result.message || "Arquivo enviado com sucesso!";

        toast.success(successMessage);

        queryClient.invalidateQueries({
          queryKey: chatKeys.messagesByConversation(conversationId, senderId),
        });
      } else {
        toast.error(result.error || "Erro ao enviar arquivo");
      }
    },
    onError: () => {
      toast.error("Erro ao fazer upload do arquivo");
    },
  });
};
