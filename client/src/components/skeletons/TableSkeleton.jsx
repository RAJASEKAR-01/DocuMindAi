const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-14 bg-paper-soft rounded-lg" />
    ))}
  </div>
);

export default TableSkeleton;
