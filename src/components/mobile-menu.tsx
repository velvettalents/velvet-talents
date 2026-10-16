"use client";

import Image from "next/image";
import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { site } from "@/lib/site";
import { MailIcon, PhoneIcon } from "./icons";
import { NavLink } from "./nav-link";

type Item = { href: string; label: string };

export function MobileMenu({ items, labels }: { items: Item[]; labels: { menu: string; close: string } }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-lg" className="-mr-2 size-11 lg:hidden" aria-label={labels.menu}>
          <MenuIcon className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" closeLabel={labels.close} className="w-full gap-0 sm:max-w-sm">
        <SheetHeader className="border-b border-line px-5 py-4">
          <SheetTitle>
            <Image src="/brand/logo-trimmed.png" alt="Velvet Talents" width={1200} height={454} className="h-9 w-auto" />
          </SheetTitle>
          <SheetDescription className="sr-only">{labels.menu}</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col px-5 py-2">
          {items.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              onNavigate={() => setOpen(false)}
              className="border-b border-line py-4 font-display text-2xl"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto space-y-3 bg-cream px-5 py-6 text-sm">
          <a href={site.phones[0].href} className="flex items-center gap-3">
            <PhoneIcon className="size-4" /> {site.phones[0].display}
          </a>
          <a href={`mailto:${site.email}`} className="flex items-center gap-3">
            <MailIcon className="size-4" /> {site.email}
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
