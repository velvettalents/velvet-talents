import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { paths } from "@/lib/paths";
import { site } from "@/lib/site";
import { InquiryForm } from "@/components/inquiry-form";
import { PageHeader } from "@/components/page-header";
import { MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.contact.title, description: dict.contact.intro };
}

export default async function ContactPage() {
  const locale = await getLocale();
  const dict = await getDictionary();
  const t = dict.contact;

  return (
    <>
      <PageHeader title={t.title} intro={t.intro} crumbs={[{ href: paths.home(locale), label: dict.nav.home }]} />
      <section className="container-page grid gap-14 py-16 lg:grid-cols-[1fr_1.3fr]">
        <address className="space-y-8 not-italic">
          <ContactItem icon={<PinIcon />} label={t.address}>
            {site.address.street}
            <br />
            {site.address.postalCode} {site.address.city}, {site.address.country}
          </ContactItem>
          <ContactItem icon={<PhoneIcon />} label={t.phone}>
            {site.phones.map((phone) => (
              <a key={phone.href} href={phone.href} className="block hover:underline">
                {phone.display}
              </a>
            ))}
            <span className="text-xs text-ink-muted">({t.phoneNote})</span>
          </ContactItem>
          <ContactItem icon={<MailIcon />} label={t.email}>
            <a href={`mailto:${site.email}`} className="hover:underline">
              {site.email}
            </a>
          </ContactItem>
          <ContactItem icon={<WhatsAppIcon className="h-5 w-5" />} label={t.whatsapp}>
            <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {site.phones[0].display}
            </a>
          </ContactItem>
        </address>
        <div>
          <h2 className="mb-6 font-display text-3xl font-medium">{t.formTitle}</h2>
          <InquiryForm kind="contact" labels={dict.forms} submitLabel={dict.forms.sendMessage} privacyHref={paths.privacy(locale)} />
        </div>
      </section>
      <iframe
        title={t.mapTitle}
        src={site.mapEmbed}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block h-[400px] w-full border-0 grayscale"
      />
    </>
  );
}

function ContactItem({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream">{icon}</span>
      <div>
        <p className="eyebrow mb-1">{label}</p>
        <div className="leading-7">{children}</div>
      </div>
    </div>
  );
}
