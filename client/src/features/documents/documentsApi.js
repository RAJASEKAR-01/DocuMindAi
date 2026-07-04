import api from "../../lib/axios";

export const uploadDocument = (file) => {
  const formData = new FormData();
  formData.append("document", file);
  return api
    .post("/documents/upload", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((res) => res.data);
};

export const fetchDocuments = (page = 1, limit = 10) =>
  api.get(`/documents?page=${page}&limit=${limit}`).then((res) => res.data);

export const fetchDocumentById = (id) => api.get(`/documents/${id}`).then((res) => res.data.document);

export const deleteDocumentById = (id) => api.delete(`/documents/${id}`).then((res) => res.data);

export const downloadDocumentReport = async (id, filename) => {
  const response = await api.get(`/documents/${id}/report`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename || "documind"}-report.txt`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
