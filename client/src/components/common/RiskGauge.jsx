const RiskGauge = ({ score = 0 }) => {
  const clamped = Math.min(100, Math.max(0, score));
  const color = clamped < 34 ? "#16a34a" : clamped < 67 ? "#ca8a04" : "#dc2626";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E5E5" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={2 * Math.PI * 52}
            strokeDashoffset={2 * Math.PI * 52 * (1 - clamped / 100)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-ink">{clamped}</span>
          <span className="text-xs text-ink-muted">/ 100</span>
        </div>
      </div>
      <p className="text-sm text-ink-muted mt-2 font-medium">Risk Score</p>
    </div>
  );
};

export default RiskGauge;
