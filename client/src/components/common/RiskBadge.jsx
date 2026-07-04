const styles = {
  low: "bg-green-100 text-green-800 border-green-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  high: "bg-red-100 text-red-800 border-red-300",
};

const RiskBadge = ({ level = "low" }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase border ${styles[level] || styles.low}`}>
    {level} risk
  </span>
);

export default RiskBadge;
