import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpTrayIcon, DocumentTextIcon, XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useUploadDocument } from "../features/documents/useDocuments";

const MAX_SIZE_MB = 10;

const Upload = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const uploadMutation = useUploadDocument();

  const validateAndSetFile = useCallback((selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      return;
    }
    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_SIZE_MB}MB`);
      return;
    }
    setFile(selectedFile);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndSetFile(e.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    const result = await uploadMutation.mutateAsync(file);
    if (result?.document?._id) {
      navigate(`/analysis/${result.document._id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold mb-1">Analyze a Document</h1>
      <p className="text-ink-muted text-sm mb-8">
        Upload a PDF — rental agreement, offer letter, loan contract, NDA, or any document you need to understand.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`card border-dashed text-center py-16 cursor-pointer transition-colors ${
          isDragging ? "border-accent-dark bg-accent-light/20" : ""
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => validateAndSetFile(e.target.files?.[0])}
        />

        {file ? (
          <div className="flex flex-col items-center gap-3">
            <DocumentTextIcon className="w-10 h-10 text-ink" />
            <div>
              <p className="font-semibold">{file.name}</p>
              <p className="text-xs text-ink-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
            >
              <XMarkIcon className="w-4 h-4" />
              Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center">
              <ArrowUpTrayIcon className="w-6 h-6 text-ink" />
            </div>
            <p className="font-semibold">Drag & drop your PDF here</p>
            <p className="text-sm text-ink-muted">or click to browse — up to {MAX_SIZE_MB}MB</p>
          </div>
        )}
      </motion.div>

      <button
        onClick={handleUpload}
        disabled={!file || uploadMutation.isPending}
        className="btn-accent w-full mt-6"
      >
        {uploadMutation.isPending ? "Analyzing with AI... this can take up to a minute" : "Analyze Document"}
      </button>
    </div>
  );
};

export default Upload;
