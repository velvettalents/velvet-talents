"use server";

import { notion, notionToken } from "@/lib/notion/client";
import { P } from "@/lib/notion/schema";
import { site } from "@/lib/site";

export type InquiryState = {
  status: "idle" | "success" | "error" | "invalid" | "not-configured";
  errors?: Partial<Record<"name" | "email", "required" | "invalidEmail">>;
  values?: Record<string, string>;
};

type Inquiry = {
  kind: string;
  locale: string;
  productId: string;
  product: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  meters: string;
  subject: string;
  message: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOTION_ID_PATTERN = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

function field(form: FormData, name: string, max = 2000) {
  return String(form.get(name) ?? "").trim().slice(0, max);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

const richText = (content: string) => ({ rich_text: content ? [{ text: { content } }] : [] });

// Each request becomes a row in the Notion "Pedidos" database (the CRM).
async function saveToNotion(data: Inquiry) {
  const dataSourceId = process.env.NOTION_REQUESTS_DS;
  if (!notionToken() || !dataSourceId) return false;

  const r = P.request;
  await notion("/pages", {
    method: "POST",
    body: {
      parent: { type: "data_source_id", data_source_id: dataSourceId },
      properties: {
        [r.name]: { title: [{ text: { content: data.name } }] },
        [r.type]: { select: { name: data.kind === "quote" ? "Orçamento" : "Contacto" } },
        [r.status]: { select: { name: "Novo" } },
        [r.email]: { email: data.email },
        [r.phone]: { phone_number: data.phone || null },
        [r.company]: richText(data.company),
        [r.meters]: richText(data.meters),
        [r.subject]: richText(data.kind === "quote" ? data.product : data.subject),
        [r.message]: richText(data.message),
        [r.language]: { select: { name: data.locale === "en" ? "EN" : "PT" } },
        ...(NOTION_ID_PATTERN.test(data.productId) ? { [r.product]: { relation: [{ id: data.productId }] } } : {}),
      },
    },
  });
  return true;
}

// Optional email alert so new requests are noticed without opening Notion.
async function sendEmail(data: Inquiry) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const subject =
    data.kind === "quote" ? `Pedido de orçamento: ${data.product}` : `Contacto do site: ${data.subject || data.name}`;

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
  if (!res.ok) throw new Error(`Resend ${res.status}`);
  return true;
}

export async function sendInquiry(_prev: InquiryState, form: FormData): Promise<InquiryState> {
  // Honeypot: real users never see or fill this field.
  if (field(form, "website")) return { status: "success" };

  const data: Inquiry = {
    kind: field(form, "kind", 20),
    locale: field(form, "locale", 5),
    productId: field(form, "productId", 40),
    product: field(form, "product", 200),
    name: field(form, "name", 200),
    email: field(form, "email", 200),
    phone: field(form, "phone", 50),
    company: field(form, "company", 200),
    meters: field(form, "meters", 50),
    subject: field(form, "subject", 200),
    message: field(form, "message", 2000),
  };

  const errors: InquiryState["errors"] = {};
  if (!data.name) errors.name = "required";
  if (!data.email) errors.email = "required";
  else if (!EMAIL_PATTERN.test(data.email)) errors.email = "invalidEmail";
  if (Object.keys(errors).length > 0) return { status: "invalid", errors, values: data };

  const results = await Promise.allSettled([saveToNotion(data), sendEmail(data)]);
  for (const result of results) {
    if (result.status === "rejected") console.error("Inquiry delivery failed:", result.reason);
  }

  const delivered = results.some((r) => r.status === "fulfilled" && r.value);
  const configured = results.some((r) => r.status === "rejected" || r.value);
  if (delivered) return { status: "success" };
  return { status: configured ? "error" : "not-configured", values: data };
}
