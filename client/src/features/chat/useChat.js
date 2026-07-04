import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchChatHistory, postChatMessage } from "./chatApi";

export const useChatHistory = (documentId) =>
  useQuery({
    queryKey: ["chat", documentId],
    queryFn: () => fetchChatHistory(documentId),
    enabled: Boolean(documentId),
  });

export const useSendChatMessage = (documentId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message) => postChatMessage(documentId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", documentId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "AI failed to respond");
    },
  });
};
