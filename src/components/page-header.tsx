import Link from "next/link";

type Crumb = { href: string; label: string };

export function PageHeader({
  title,
  intro,
  eyebrow,
  crumbs = [],
}: {
  title: string;
  intro?: string;
  eyebrow?: string;
  crumbs?: Crumb[];
}) {
  return (
    <section className="border-b border-line bg-cream">
      <div className="container-page py-14 sm:py-20">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink-muted">
            <ol className="flex flex-wrap items-center gap-2">
              {crumbs.map((crumb) => (
                <li key={crumb.href} className="flex items-center gap-2">
                  <Link href={crumb.href} className="hover:text-ink">
                    {crumb.label}
                  </Link>
                  <span aria-hidden>/</span>
                </li>
              ))}
              <li aria-current="page" className="text-ink">
                {title}
              </li>
            </ol>
          </nav>
        )}
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="max-w-3xl font-display text-4xl leading-tight font-medium text-balance sm:text-5xl">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-base leading-7 text-ink-soft text-pretty">{intro}</p>}
      </div>
    </section>
  );
}
