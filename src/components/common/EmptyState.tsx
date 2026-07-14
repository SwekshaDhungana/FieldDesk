interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="py-12 text-center">
      <h3 className="text-sm font-medium text-[#1F3446]">{title}</h3>
      {description && <p className="text-sm text-[#60798D] mt-1">{description}</p>}
    </div>
  );
}
