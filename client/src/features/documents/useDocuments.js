import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  uploadDocument,
  fetchDocuments,
  fetchDocumentById,
  deleteDocumentById,
  downloadDocumentReport,
} from "./documentsApi";

export const useDocumentsList = (page = 1, limit = 10) =>
  useQuery({
    queryKey: ["documents", page, limit],
    queryFn: () => fetchDocuments(page, limit),
    keepPreviousData: true,
  });

export const useDocument = (id) =>
  useQuery({
    queryKey: ["document", id],
    queryFn: () => fetchDocumentById(id),
    enabled: Boolean(id),
    // Poll while the AI analysis is still processing
    refetchInterval: (query) => (query.state.data?.status === "processing" ? 2500 : false),
  });

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      toast.success("Document analyzed successfully");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Upload failed. Please try again.");
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDocumentById,
    onSuccess: () => {
      toast.success("Document deleted");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: () => toast.error("Could not delete document"),
  });
};

export const useDownloadReport = () =>
  useMutation({
    mutationFn: ({ id, filename }) => downloadDocumentReport(id, filename),
    onError: () => toast.error("Could not download report"),
  });
