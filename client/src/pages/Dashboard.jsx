import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpTrayIcon,
  DocumentTextIcon,
  ShieldExclamationIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useDashboardStats } from "../features/analytics/useAnalytics";
import { useCurrentUser } from "../features/auth/useAuth";
import RiskBadge from "../components/common/RiskBadge";
import EmptyState from "../components/common/EmptyState";
import CardSkeleton from "../components/skeletons/CardSkeleton";

const StatCard = ({ label, value, icon: Icon }) => (
  <div className="card flex items-center gap-4">
    <div className="w-11 h-11 rounded-lg bg-accent flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-ink" />
    </div>
    <div>
      <p className="text-2xl font-extrabold leading-none">{value}</p>
      <p className="text-sm text-ink-muted mt-1">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const user = useCurrentUser();
  const { data, isLoading } = useDashboardStats();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold">Welcome back, {user?.name?.split(" ")[0]}</h1>
          <p className="text-ink-muted text-sm mt-1">Here's what's happening with your documents.</p>
        </div>
        <Link to="/upload" className="btn-accent">
          <ArrowUpTrayIcon className="w-5 h-5" />
          Analyze a Document
        </Link>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid sm:grid-cols-3 gap-4 mb-8"
        >
          <StatCard label="Documents Analyzed" value={data?.totalDocuments ?? 0} icon={DocumentTextIcon} />
          <StatCard label="Average Risk Score" value={`${data?.averageRiskScore ?? 0}/100`} icon={ShieldExclamationIcon} />
          <StatCard label="High Risk Documents" value={data?.riskLevels?.high ?? 0} icon={ClockIcon} />
        </motion.div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Recent Documents</h2>
          <Link to="/history" className="text-sm font-semibold text-ink-muted hover:text-ink">
            View all
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <CardSkeleton />
          </div>
        ) : data?.recentDocuments?.length ? (
          <div className="divide-y divide-paper-border">
            {data.recentDocuments.map((doc) => (
              <Link
                key={doc._id}
                to={`/analysis/${doc._id}`}
                className="flex items-center justify-between py-3 hover:bg-paper-soft -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <DocumentTextIcon className="w-5 h-5 text-ink-muted shrink-0" />
                  <span className="font-medium truncate">{doc.originalFileName}</span>
                </div>
                {doc.status === "completed" ? (
                  <RiskBadge level={doc.riskLevel} />
                ) : (
                  <span className="text-xs font-semibold text-ink-muted uppercase">{doc.status}</span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={DocumentTextIcon}
            title="No documents yet"
            description="Upload your first document to get an instant AI-powered analysis."
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

export default Dashboard;
