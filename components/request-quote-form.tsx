"use client";

import { FormEvent, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics/gtag";
import { defaultLocale, getLocaleFromPathname, type SiteLocale } from "@/lib/i18n";

type RequestQuoteFormProps = {
  productOptions: string[];
  preselectedProduct?: string;
};

type FormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  preferredContact: "email" | "phone";
  country: string;
  product: string;
  quantity: string;
  message: string;
  consent: boolean;
  website: string; // honeypot — never shown to users
};

type FieldErrors = Partial<Record<keyof Omit<FormState, "website" | "consent">, string>>;

const initialState: FormState = {
  name: "",
  company: "",
  email: "",
  phone: "",
  preferredContact: "email",
  country: "",
  product: "",
  quantity: "",
  message: "",
  consent: false,
  website: "",
};

// ---------------------------------------------------------------------------
// Client-side validation
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d\s\-().]{0,30}$/;

function validateForm(f: FormState, locale: SiteLocale): FieldErrors {
  const errors: FieldErrors = {};

  if (!f.name.trim()) errors.name = locale === "pl" ? "Imie i nazwisko jest wymagane." : "Full name is required.";
  else if (f.name.trim().length < 2) errors.name = locale === "pl" ? "Wpisz pelne imie i nazwisko." : "Please enter your full name.";



  if (!f.email.trim()) errors.email = locale === "pl" ? "Adres e-mail jest wymagany." : "Email address is required.";
  else if (!EMAIL_RE.test(f.email.trim())) errors.email = locale === "pl" ? "Podaj poprawny adres e-mail." : "Please enter a valid email address.";

  if (f.preferredContact !== "email" && f.preferredContact !== "phone") {
    errors.preferredContact = locale === "pl" ? "Wybierz preferowany kontakt." : "Choose your preferred contact method.";
  }

  if (f.phone && !PHONE_RE.test(f.phone.trim()))
    errors.phone = locale === "pl" ? "Numer telefonu zawiera niepoprawne znaki." : "Phone number contains invalid characters.";

  if (f.preferredContact === "phone" && !f.phone.trim()) {
    errors.phone = locale === "pl" ? "Podaj numer telefonu, jesli preferujesz kontakt telefoniczny." : "Please provide a phone number if you prefer phone contact.";
  }

  if (!f.country.trim()) errors.country = locale === "pl" ? "Kraj dostawy jest wymagany." : "Destination country is required.";



  if (f.message.trim().length > 0 && f.message.trim().length < 10)
    errors.message = locale === "pl" ? "Dodaj prosze troche wiecej szczegolow." : "Please provide a bit more detail.";

  return errors;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RequestQuoteForm({
  productOptions,
  preselectedProduct,
}: RequestQuoteFormProps) {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname) || defaultLocale;

  const t = {
    consentRequired:
      locale === "pl"
        ? "Zaakceptuj zgode na przetwarzanie danych przed wyslaniem formularza."
        : "Please accept the data processing consent before submitting.",
    submitError: locale === "pl" ? "Nie udalo sie wyslac zapytania ofertowego." : "Could not submit quote request.",
    success:
      locale === "pl"
        ? "Dziekujemy. Otrzymalismy zapytanie i wrocilmy z odpowiedzia najszybciej jak to mozliwe."
        : "Thanks. Your request is in. We will contact you shortly.",
    genericError: locale === "pl" ? "Wystapil blad. Sprobuj ponownie." : "Something went wrong. Please try again.",
  };

  const defaultProduct = useMemo(
    () =>
      preselectedProduct && productOptions.includes(preselectedProduct)
        ? preselectedProduct
        : "",
    [preselectedProduct, productOptions],
  );

  const [formState, setFormState] = useState<FormState>({
    ...initialState,
    product: defaultProduct,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setFormState((prev) => ({ ...prev, [key]: value }));
    // Clear field error on change
    if (key in fieldErrors) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key as keyof FieldErrors];
        return next;
      });
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors = validateForm(formState, locale);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Scroll to first error
      const firstKey = Object.keys(errors)[0];
      document.getElementById(firstKey)?.focus();
      return;
    }

    if (!formState.consent) {
      setServerMessage(t.consentRequired);
      setStatus("error");
      return;
    }

    setStatus("loading");
    setServerMessage("");

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-site-locale": locale,
        },
        body: JSON.stringify(formState),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? t.submitError);
      }

      setStatus("success");
      setServerMessage(
        data.message ?? t.success,
      );
      trackEvent("generate_lead", {
        event_category: "quote",
        event_label: formState.product || "quote_form",
      });
      setFormState({ ...initialState, product: defaultProduct });
      setFieldErrors({});
    } catch (error) {
      setStatus("error");
      setServerMessage(
        error instanceof Error ? error.message : t.genericError,
      );
      trackEvent("quote_submit_error", {
        event_category: "quote",
      });
    }
  }

  const inputBase =
    "h-11 w-full rounded-xl border bg-bg-soft px-4 text-sm text-ink placeholder:text-ink/30 outline-none transition focus:bg-bg";

  function inputClass(field: keyof FieldErrors) {
    return fieldErrors[field]
      ? `${inputBase} border-red-500/60 focus:border-red-500/80`
      : `${inputBase} border-line focus:border-gold/40`;
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-5 rounded-2xl border border-line bg-card p-6 md:p-8"
    >
      {/* Row 1: Name + Company */}
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label={locale === "pl" ? "Imie i nazwisko" : "Full Name"}
          name="name"
          value={formState.name}
          onChange={(v) => setField("name", v)}
          placeholder={locale === "pl" ? "Pelne imie i nazwisko" : "Your full name"}
          className={inputClass("name")}
          autoComplete="name"
          maxLength={120}
          required
          error={fieldErrors.name}
        />
        <Field
          label={locale === "pl" ? "Firma (opcjonalnie)" : "Company (optional)"}
          name="company"
          value={formState.company}
          onChange={(v) => setField("company", v)}
          placeholder={locale === "pl" ? "Nazwa firmy" : "Company name"}
          className={`${inputBase} border-line focus:border-gold/40`}
          autoComplete="organization"
          maxLength={140}
          error={fieldErrors.company}
        />
      </div>

      {/* Row 2: Email + Phone */}
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label={locale === "pl" ? "E-mail" : "Email"}
          name="email"
          type="email"
          value={formState.email}
          onChange={(v) => setField("email", v)}
          placeholder="name@company.com"
          className={inputClass("email")}
          autoComplete="email"
          maxLength={160}
          required
          error={fieldErrors.email}
        />
        <Field
          label={locale === "pl" ? "Telefon" : "Phone"}
          name="phone"
          type="tel"
          value={formState.phone}
          onChange={(v) => setField("phone", v)}
          placeholder="+48 ..."
          className={inputClass("phone")}
          autoComplete="tel"
          inputMode="tel"
          maxLength={30}
          error={fieldErrors.phone}
        />
      </div>

      {/* Row 3: Country + Preferred Contact */}
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label={locale === "pl" ? "Kraj dostawy" : "Destination Country"}
          name="country"
          value={formState.country}
          onChange={(v) => setField("country", v)}
          placeholder={locale === "pl" ? "np. Niemcy" : "e.g. Germany"}
          className={inputClass("country")}
          autoComplete="country-name"
          maxLength={80}
          required
          error={fieldErrors.country}
        />

        <div className="space-y-2">
          <label
            htmlFor="preferredContact"
            className="block text-[0.65rem] font-bold tracking-[0.2em] text-gold/55 uppercase"
          >
            {locale === "pl" ? "Preferowany kontakt" : "Preferred Contact"}
          </label>
          <select
            id="preferredContact"
            name="preferredContact"
            value={formState.preferredContact}
            onChange={(e) => setField("preferredContact", e.target.value as FormState["preferredContact"])}
            className={`${inputBase} border-line focus:border-gold/40`}
            required
          >
            <option value="email">{locale === "pl" ? "E-mail" : "Email"}</option>
            <option value="phone">{locale === "pl" ? "Telefon" : "Phone"}</option>
          </select>
          {fieldErrors.preferredContact && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={11} />
              {fieldErrors.preferredContact}
            </p>
          )}
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <label
          htmlFor="message"
          className="block text-[0.65rem] font-bold tracking-[0.2em] text-gold/55 uppercase"
        >
          {locale === "pl" ? "Szczegoly (opcjonalnie)" : "Details (optional)"}
        </label>
        <textarea
          id="message"
          name="message"
          value={formState.message}
          onChange={(e) => setField("message", e.target.value)}
          rows={5}
          className={`w-full rounded-xl border px-4 py-3 text-sm text-ink placeholder:text-ink/30 outline-none transition focus:bg-bg resize-none bg-bg-soft ${
            fieldErrors.message
              ? "border-red-500/60 focus:border-red-500/80"
              : "border-line focus:border-gold/40"
          }`}
          placeholder={
            locale === "pl"
              ? "Interesujace produkty, wolumeny, opis zastosowania itp."
              : "Interested products, expected volumes, use case, etc."
          }
          maxLength={2000}
        />
        {fieldErrors.message ? (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <AlertCircle size={11} />
            {fieldErrors.message}
          </p>
        ) : (
          <p className="text-xs text-ink/30">
            {formState.message.length}/2000
          </p>
        )}
      </div>

      {/* Honeypot — hidden from real users */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          value={formState.website}
          onChange={(e) => setField("website", e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Consent */}
      <label className="flex items-start gap-3 text-xs text-ink/45 leading-relaxed cursor-pointer">
        <input
          type="checkbox"
          checked={formState.consent}
          onChange={(e) => setField("consent", e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-line bg-bg-soft accent-gold"
          required
        />
        <span>
          {locale === "pl"
            ? "Wyrazam zgode na przetwarzanie moich danych przez Natural Mystic Aroma w celu odpowiedzi na zapytanie, zgodnie z Polityka prywatnosci."
            : "I agree that Natural Mystic Aroma may process my details to respond to this inquiry in accordance with the Privacy Policy."}
        </span>
      </label>

      {/* Submit row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-2">
        <p className="text-xs text-ink/35">
          {locale === "pl" ? "Odpowiadamy w ciagu 24 godzin w dni robocze." : "We respond within 24 hours on business days."}
        </p>
        <button
          type="submit"
          disabled={status === "loading"}
          className="group inline-flex items-center gap-2.5 rounded-full bg-gold px-6 py-3 text-sm font-bold text-bg shadow-[0_0_20px_rgba(201,169,110,0.25)] hover:bg-gold-light hover:shadow-[0_0_30px_rgba(201,169,110,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {status === "loading"
            ? locale === "pl"
              ? "Wysylanie..."
              : "Sending..."
            : locale === "pl"
              ? "Wyslij zapytanie ofertowe"
              : "Send Quote Request"}
          {status !== "loading" && (
            <ArrowRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          )}
        </button>
      </div>

      {/* Status message */}
      {serverMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            status === "success"
              ? "border-moss/30 bg-moss/10 text-moss-light"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {status === "success" ? (
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
          )}
          {serverMessage}
        </div>
      )}
    </form>
  );
}

// ---------------------------------------------------------------------------
// Field sub-component
// ---------------------------------------------------------------------------

type FieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric" | "decimal" | "search" | "url";
  required?: boolean;
  className: string;
  maxLength?: number;
  error?: string;
};

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  inputMode,
  required,
  className,
  maxLength,
  error,
}: FieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-[0.65rem] font-bold tracking-[0.2em] text-gold/55 uppercase"
      >
        {label}
        {required && <span className="text-red-400/70"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        spellCheck={type !== "email"}
        required={required}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={className}
      />
      {error && (
        <p id={`${name}-error`} className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}
