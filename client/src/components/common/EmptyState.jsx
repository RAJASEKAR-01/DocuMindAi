const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4">
    {Icon && (
      <div className="w-16 h-16 rounded-full bg-paper-soft flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-ink-muted" />
      </div>
    )}
    <h3 className="text-lg font-bold text-ink mb-1">{title}</h3>
    {description && <p className="text-ink-muted max-w-sm mb-4">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
