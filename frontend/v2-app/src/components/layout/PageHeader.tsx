import { classNames } from "@/lib/utils";

export interface PageHeaderProps {
  page: string;
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ page, title, description, className }: PageHeaderProps) {
  return (
    <header className={classNames("px-1 pt-1", className)}>
      <div className="text-accent text-[12px] font-extrabold tracking-wide">{page}</div>
      <h2 className="mt-1 text-[28px] font-bold text-ink font-display leading-tight">{title}</h2>
      {description ? (
        <p className="mt-1 text-[13.5px] text-ink-muted leading-[1.45]">{description}</p>
      ) : null}
    </header>
  );
}
