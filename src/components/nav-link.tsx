"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  children,
  className = "",
  onNavigate,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isHome = href.split("/").length === 2;
  const active = isHome ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onNavigate={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`${className} ${active ? "text-ink" : "text-ink-muted hover:text-ink"}`}
    >
      {children}
    </Link>
  );
}
