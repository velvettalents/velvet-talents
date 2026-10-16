"use server";

import { site } from "@/lib/site";

export type InquiryState = {
  status: "idle" | "success" | "error" | "invalid" | "not-configured";
  errors?: Partial<Record<"name" | "email", "required" | "invalidEmail">>;
  values?: Record<string, string>;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(form: FormData, name: string, max = 2000) {
  return String(form.get(name) ?? "").trim().slice(0, max);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export async function sendInquiry(_prev: InquiryState, form: FormData): Promise<InquiryState> {
  // Honeypot: real users never see or fill this field.
  if (field(form, "website")) return { status: "success" };

  const data = {
    kind: field(form, "kind", 20),
    product: field(form, "product", 200),
    name: field(form, "name", 200),
    email: field(form, "email", 200),
    phone: field(form, "phone", 50),
    company: field(form, "company", 200),
    meters: field(form, "meters", 50),
    subject: field(form, "subject", 200),
    message: field(form, "message", 5000),
  };

  const errors: InquiryState["errors"] = {};
  if (!data.name) errors.name = "required";
  if (!data.email) errors.email = "required";
  else if (!EMAIL_PATTERN.test(data.email)) errors.email = "invalidEmail";
  if (Object.keys(errors).length > 0) return { status: "invalid", errors, values: data };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { status: "not-configured", values: data };

  const subject =
    data.kind === "quote"
      ? `Pedido de orçamento: ${data.product}`
      : `Contacto do site: ${data.subject || data.name}`;

  const rows = [
    ["Produto", data.product],
    ["Nome", data.name],
    ["E-mail", data.email],
    ["Telemóvel", data.phone],
    ["Empresa", data.company],
    ["Metros", data.meters],
    ["Assunto", data.subject],
    ["Mensagem", data.message],
  ].filter(([, value]) => value);

  const html = `<table>${rows
    .map(([label, value]) => `<tr><th align="left" valign="top">${label}</th><td>${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`)
    .join("")}</table>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL ?? "Velvet Talents <onboarding@resend.dev>",
        to: [process.env.CONTACT_TO_EMAIL ?? site.email],
        reply_to: data.email,
        subject,
        html,
      }),
    });
    return res.ok ? { status: "success" } : { status: "error", values: data };
  } catch {
    return { status: "error", values: data };
  }
}
