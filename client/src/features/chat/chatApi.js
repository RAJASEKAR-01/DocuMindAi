import api from "../../lib/axios";

export const fetchChatHistory = (documentId) => api.get(`/chat/${documentId}`).then((res) => res.data.messages);

export const postChatMessage = (documentId, message) =>
  api.post(`/chat/${documentId}`, { message }).then((res) => res.data);
