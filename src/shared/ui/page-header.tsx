interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-4">
      <div>
        <h1 className="font-semibold text-2xl text-neutral-900">{title}</h1>
        {description && <p className="mt-1 text-neutral-500 text-sm">{description}</p>}
      </div>
      {action}
    </header>
  );
}
