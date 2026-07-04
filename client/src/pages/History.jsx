import { useState } from "react";
import { Link } from "react-router-dom";
import { DocumentTextIcon, TrashIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { useDocumentsList, useDeleteDocument } from "../features/documents/useDocuments";
import RiskBadge from "../components/common/RiskBadge";
import EmptyState from "../components/common/EmptyState";
import TableSkeleton from "../components/skeletons/TableSkeleton";

const History = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useDocumentsList(page, 10);
  const deleteMutation = useDeleteDocument();

  const handleDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Delete this document and its analysis? This can't be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Document History</h1>
          <p className="text-ink-muted text-sm mt-1">Every document you've analyzed with DocuMind AI.</p>
        </div>
        <Link to="/upload" className="btn-accent">
          <ArrowUpTrayIcon className="w-5 h-5" />
          New Analysis
        </Link>
      </div>

      <div className="card">
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : data?.documents?.length ? (
          <>
            <div className="divide-y divide-paper-border">
              {data.documents.map((doc) => (
                <Link
                  key={doc._id}
                  to={`/analysis/${doc._id}`}
                  className="flex items-center justify-between py-3.5 hover:bg-paper-soft -mx-2 px-2 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <DocumentTextIcon className="w-5 h-5 text-ink-muted shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{doc.originalFileName}</p>
                      <p className="text-xs text-ink-muted">
                        {doc.documentType} · {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {doc.status === "completed" ? (
                      <RiskBadge level={doc.riskLevel} />
                    ) : (
                      <span className="text-xs font-semibold text-ink-muted uppercase">{doc.status}</span>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, doc._id)}
                      className="text-ink-muted hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete document"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </Link>
              ))}
            </div>

            {data.pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {Array.from({ length: data.pagination.pages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold ${
                      page === i + 1 ? "bg-ink text-white" : "text-ink-muted hover:bg-paper-soft"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={DocumentTextIcon}
            title="No documents yet"
            description="Upload your first document to get started."
            action={
              <Link to="/upload" className="btn-accent">
                Upload a Document
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
};

export default History;
