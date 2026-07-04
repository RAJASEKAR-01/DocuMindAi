import { useParams, useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  ChatBubbleLeftRightIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { useDocument, useDeleteDocument, useDownloadReport } from "../features/documents/useDocuments";
import RiskBadge from "../components/common/RiskBadge";
import RiskGauge from "../components/common/RiskGauge";
import CardSkeleton from "../components/skeletons/CardSkeleton";

const Analysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: document, isLoading } = useDocument(id);
  const deleteMutation = useDeleteDocument();
  const downloadMutation = useDownloadReport();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!document) {
    return <p className="text-center text-ink-muted py-16">Document not found.</p>;
  }

  const handleDelete = async () => {
    if (!window.confirm("Delete this document and its analysis? This can't be undone.")) return;
    await deleteMutation.mutateAsync(id);
    navigate("/history");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold truncate">{document.originalFileName}</h1>
          <p className="text-sm text-ink-muted mt-0.5">{document.documentType}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to={`/chat/${id}`} className="btn-outline text-sm">
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            Chat
          </Link>
          <button
            onClick={() => downloadMutation.mutate({ id, filename: document.originalFileName })}
            className="btn-outline text-sm"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Report
          </button>
          <button onClick={handleDelete} className="btn-outline text-sm border-red-300 text-red-600 hover:bg-red-600 hover:border-red-600">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {document.status === "processing" && (
        <div className="card text-center py-12">
          <div className="w-10 h-10 border-4 border-ink border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-semibold">AI is analyzing your document...</p>
          <p className="text-sm text-ink-muted mt-1">This usually takes 15-45 seconds.</p>
        </div>
      )}

      {document.status === "failed" && (
        <div className="card text-center py-12 border-red-300">
          <ExclamationTriangleIcon className="w-10 h-10 text-red-600 mx-auto mb-4" />
          <p className="font-semibold">Analysis failed</p>
          <p className="text-sm text-ink-muted mt-1">{document.failureReason || "Something went wrong. Please try uploading again."}</p>
        </div>
      )}

      {document.status === "completed" && (
        <div className="space-y-6">
          <div className="card flex flex-col sm:flex-row items-center gap-6">
            <RiskGauge score={document.riskScore} />
            <div className="flex-1">
              <RiskBadge level={document.riskLevel} />
              <h2 className="font-bold text-lg mt-3 mb-1">Summary</h2>
              <div className="prose prose-sm max-w-none text-ink-muted">
                <ReactMarkdown>{document.summary}</ReactMarkdown>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <LightBulbIcon className="w-5 h-5 text-accent-dark" />
              <h2 className="font-bold text-lg">Explain Like I'm 15</h2>
            </div>
            <div className="prose prose-sm max-w-none text-ink-muted">
              <ReactMarkdown>{document.simpleExplanation}</ReactMarkdown>
            </div>
          </div>

          <div className="card">
            <h2 className="font-bold text-lg mb-4">Flagged Clauses</h2>
            <div className="space-y-3">
              {document.flaggedClauses?.map((clause, i) => (
                <div key={i} className="border-2 border-paper-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-semibold">{clause.clauseTitle}</p>
                    <RiskBadge level={clause.riskLevel} />
                  </div>
                  <p className="text-sm text-ink-muted">{clause.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <QuestionMarkCircleIcon className="w-5 h-5 text-accent-dark" />
                <h2 className="font-bold">Questions to Ask</h2>
              </div>
              <ul className="space-y-2 text-sm text-ink-muted list-disc list-inside">
                {document.suggestedQuestions?.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h2 className="font-bold mb-3">Recommendations</h2>
              <ul className="space-y-2 text-sm text-ink-muted list-disc list-inside">
                {document.recommendations?.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
