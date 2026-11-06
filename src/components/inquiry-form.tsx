"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { sendInquiry, type InquiryState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Labels = {
  name: string;
  email: string;
  phone: string;
  company: string;
  meters: string;
  subject: string;
  message: string;
  optional: string;
  send: string;
  sending: string;
  success: string;
  error: string;
  notConfigured: string;
  invalid: string;
  required: string;
  invalidEmail: string;
  consent: string;
};

const initialState: InquiryState = { status: "idle" };

export function InquiryForm({
  kind,
  locale,
  product,
  productId,
  labels,
  submitLabel,
  privacyHref,
}: {
  kind: "quote" | "contact";
  locale: string;
  product?: string;
  productId?: string;
  labels: Labels;
  submitLabel: string;
  privacyHref: string;
}) {
  const [state, action, pending] = useActionState(sendInquiry, initialState);
  const formId = useId();

  if (state.status === "success") {
    return (
      <p role="status" className="border border-line bg-cream p-6 text-sm leading-6">
        {labels.success}
      </p>
    );
  }

  const v = state.values ?? {};

  const errorText = (key: "name" | "email") => {
    const code = state.errors?.[key];
    return code ? labels[code] : undefined;
  };

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2" noValidate>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="locale" value={locale} />
      {product && <input type="hidden" name="product" value={product} />}
      {productId && <input type="hidden" name="productId" value={productId} />}
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field formId={formId} label={labels.name} name="name" defaultValue={v.name} autoComplete="name" required error={errorText("name")} />
      <Field formId={formId} label={labels.email} name="email" defaultValue={v.email} type="email" autoComplete="email" required error={errorText("email")} spellCheck={false} />
      <Field formId={formId} label={labels.phone} name="phone" defaultValue={v.phone} type="tel" autoComplete="tel" optional={labels.optional} />
      <Field formId={formId} label={labels.company} name="company" defaultValue={v.company} autoComplete="organization" optional={labels.optional} />
      {kind === "quote" ? (
        <Field formId={formId} label={labels.meters} name="meters" defaultValue={v.meters} inputMode="decimal" optional={labels.optional} className="sm:col-span-2" />
      ) : (
        <Field formId={formId} label={labels.subject} name="subject" defaultValue={v.subject} optional={labels.optional} className="sm:col-span-2" />
      )}
      <div className="grid gap-2 sm:col-span-2">
        <Label htmlFor={`${formId}-message`}>
          {labels.message} <span className="font-normal text-muted-foreground">({labels.optional})</span>
        </Label>
        <Textarea id={`${formId}-message`} name="message" defaultValue={v.message} rows={5} className="min-h-32 rounded-sm bg-white px-3 py-2.5" />
      </div>

      <p className="text-xs leading-5 text-ink-muted sm:col-span-2">
        <Link href={privacyHref} className="underline underline-offset-2 hover:text-ink">
          {labels.consent}
        </Link>
      </p>

      {state.status !== "idle" && (
        <p role="alert" className="text-sm text-destructive sm:col-span-2">
          {state.status === "invalid" ? labels.invalid : state.status === "not-configured" ? labels.notConfigured : labels.error}
        </p>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" size="xl" disabled={pending} className="w-full sm:w-auto">
          {pending ? labels.sending : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  formId,
  label,
  name,
  error,
  optional,
  className = "",
  ...props
}: {
  formId: string;
  label: string;
  name: string;
  error?: string;
  optional?: string;
  className?: string;
} & React.ComponentProps<typeof Input>) {
  const id = `${formId}-${name}`;
  const errorId = `${id}-error`;
  return (
    <div className={`grid gap-2 ${className}`}>
      <Label htmlFor={id}>
        {label} {optional && <span className="font-normal text-muted-foreground">({optional})</span>}
      </Label>
      <Input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="h-11 rounded-sm bg-white px-3"
        {...props}
      />
      {error && (
        <span id={errorId} className="text-xs text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}
