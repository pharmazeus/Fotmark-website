"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { flushSync, useFormStatus } from "react-dom";
import { WhatsAppIcon } from "@/features/card/icons";
import type { Locale } from "@/i18n/routing";
import { issueContactToken, sendContact } from "./actions";
import {
  initialContactState,
  serviceKeys,
  type ContactField,
  type ContactState,
} from "./model";
import { useKeepFieldInView } from "./useKeepFieldInView";
import {
  contactErrors,
  contactFields,
  formValues,
  type ContactErrors,
} from "./validate";

export type ContactFormCopy = {
  title: string;
  intro: string;
  name: string;
  contact: string;
  businessType: string;
  services: string;
  servicesHint: string;
  message: string;
  consent: string;
  privacy: string;
  submit: string;
  sending: string;
  whatsapp: string;
  statuses: Record<"blocked" | "unavailable" | "failed", string>;
  errors: Record<ContactField, string>;
  // Names come from the Sanity services; an option is listed only for a service that exists.
  serviceNames: Partial<Record<(typeof serviceKeys)[number], string>>;
};

type Props = {
  locale: Locale;
  privacyHref: string;
  whatsappHref: string;
  copy: ContactFormCopy;
};

// `field`: globals.css (D-046). `scroll-mt-28`: keyboard Tab / Shift+Tab stops with the
// label clear of the fixed header.
const fieldClass = "field scroll-mt-28";

export function ContactForm({
  locale,
  privacyHref,
  whatsappHref,
  copy,
}: Props) {
  const [state, action] = useActionState(sendContact, initialContactState);
  const [token, setToken] = useState("");
  const [tokenUnavailable, setTokenUnavailable] = useState(false);
  const [botReady, setBotReady] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const utmSource = useRef<HTMLInputElement>(null);
  const utmMedium = useRef<HTMLInputElement>(null);
  const utmCampaign = useRef<HTMLInputElement>(null);
  const id = useId();
  useKeepFieldInView(formRef);
  // Errors on screen: the browser's own check on submit, or the server's answer.
  const [errors, setErrors] = useState<ContactErrors>({});
  const [answered, setAnswered] = useState(state);
  if (state !== answered) {
    setAnswered(state);
    setErrors(serverErrors(state));
  }

  useEffect(() => {
    let active = true;
    void issueContactToken().then(({ token: value }) => {
      if (!active) return;
      setToken(value);
      setTokenUnavailable(!value);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        void import("botid/client/core")
          .then(({ initBotId }) => {
            initBotId({
              protect: [
                { path: "/", method: "POST" },
                { path: "/en", method: "POST" },
                { path: "/ua", method: "POST" },
              ],
            });
            setBotReady(true);
          })
          .catch(() => setTokenUnavailable(true));
      },
      { rootMargin: "300px" },
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const storageKey = "fotmark-first-touch";
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const firstTouch = JSON.parse(stored) as Record<string, string>;
        if (utmSource.current)
          utmSource.current.value = firstTouch.source ?? "";
        if (utmMedium.current)
          utmMedium.current.value = firstTouch.medium ?? "";
        if (utmCampaign.current)
          utmCampaign.current.value = firstTouch.campaign ?? "";
      } else {
        const params = new URLSearchParams(window.location.search);
        const firstTouch = {
          source: params.get("utm_source") ?? "",
          medium: params.get("utm_medium") ?? "",
          campaign: params.get("utm_campaign") ?? "",
        };
        sessionStorage.setItem(storageKey, JSON.stringify(firstTouch));
        if (utmSource.current) utmSource.current.value = firstTouch.source;
        if (utmMedium.current) utmMedium.current.value = firstTouch.medium;
        if (utmCampaign.current)
          utmCampaign.current.value = firstTouch.campaign;
      }
    } catch {
      // Storage can be disabled; submitting without attribution is valid.
    }
  }, []);

  useEffect(() => {
    const form = formRef.current;
    if (state.status !== "invalid" || !form) return;
    const found = serverErrors(state);
    const first = contactFields.find((field) => found[field]);
    if (first) focusField(form, first);
  }, [state]);

  const values = state.values;
  const error = (field: ContactField) =>
    errors[field] ? copy.errors[field] : undefined;

  // A form with a mistake is not sent: nothing is reset, the person sees every problem at
  // once and lands on the first one.
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const found = contactErrors(formValues(event.currentTarget));
    const first = contactFields.find((field) => found[field]);
    if (!first) return setErrors({});
    event.preventDefault();
    // Commit the marks first, so the field is announced as invalid with its error; the focus
    // stays inside the tap, which iOS needs to open the keyboard.
    flushSync(() => setErrors(found));
    focusField(event.currentTarget, first);
  };
  // A marked field loses its mark as soon as it is fixed. Only the field being edited is
  // re-checked: unmarked fields are never flagged while the person types, and a mark from the
  // server stays until that field changes.
  const onChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target;
    if (!(
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement
    ))
      return;
    const field = contactFields.find((name) => name === target.name);
    if (!field || !errors[field]) return;
    if (contactErrors(formValues(event.currentTarget))[field]) return;
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  return (
    <div
      id="formulario"
      className="relative z-1 wrap scroll-mt-28 pt-10 pb-section text-left"
    >
      <div className="mx-auto max-w-sh border-t border-line pt-[70px]">
        <h3 className="text-[length:clamp(27px,3.7vw,46px)] font-light">
          {copy.title}
        </h3>
        <p className="mt-4 max-w-[650px] text-lead text-ink2">{copy.intro}</p>

        <form
          ref={formRef}
          action={action}
          className="mt-12 grid gap-8"
          noValidate
          onSubmit={onSubmit}
          onChange={onChange}
          onKeyDown={nextFieldOnEnter}
        >
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="startedAt" value={token} />
          <input
            ref={utmSource}
            type="hidden"
            name="utmSource"
            defaultValue=""
          />
          <input
            ref={utmMedium}
            type="hidden"
            name="utmMedium"
            defaultValue=""
          />
          <input
            ref={utmCampaign}
            type="hidden"
            name="utmCampaign"
            defaultValue=""
          />
          <div
            className="absolute -left-[10000px] h-px w-px overflow-hidden"
            aria-hidden="true"
          >
            <label htmlFor={`${id}-website`}>Website</label>
            <input
              id={`${id}-website`}
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="grid gap-8 nav:grid-cols-2">
            <Field id={`${id}-name`} label={copy.name} error={error("name")}>
              <input
                id={`${id}-name`}
                name="name"
                defaultValue={values?.name}
                autoComplete="name"
                autoCapitalize="words"
                enterKeyHint="next"
                required
                maxLength={100}
                aria-invalid={Boolean(error("name"))}
                aria-describedby={
                  error("name") ? `${id}-name-error` : undefined
                }
                className={fieldClass}
              />
            </Field>
            <Field
              id={`${id}-contact`}
              label={copy.contact}
              error={error("contact")}
            >
              <input
                id={`${id}-contact`}
                name="contact"
                defaultValue={values?.contact}
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="next"
                required
                maxLength={254}
                aria-invalid={Boolean(error("contact"))}
                aria-describedby={
                  error("contact") ? `${id}-contact-error` : undefined
                }
                className={fieldClass}
              />
            </Field>
          </div>

          <Field
            id={`${id}-business`}
            label={copy.businessType}
            error={error("businessType")}
          >
            <input
              id={`${id}-business`}
              name="businessType"
              defaultValue={values?.businessType}
              autoComplete="organization"
              autoCapitalize="sentences"
              enterKeyHint="next"
              required
              maxLength={100}
              aria-invalid={Boolean(error("businessType"))}
              aria-describedby={
                error("businessType") ? `${id}-business-error` : undefined
              }
              className={fieldClass}
            />
          </Field>

          {/* Several services can be picked: checkboxes styled as the gallery filter buttons. */}
          <fieldset
            className="min-w-0 scroll-mt-28"
            aria-describedby={
              error("services") ? `${id}-services-error` : undefined
            }
          >
            <legend className="text-[12px] tracking-[.18em] text-mut uppercase">
              {copy.services} · {copy.servicesHint}
            </legend>
            <div className="mt-4 flex flex-wrap gap-2">
              {serviceKeys.flatMap((service) => {
                const name = copy.serviceNames[service];
                return name
                  ? [
                      <label
                        key={service}
                        // `relative` anchors the visually hidden checkbox to its chip, so its
                        // focus never points the browser anywhere else. 44px tap height.
                        className="relative inline-flex min-h-11 cursor-pointer items-center border border-line2 px-[17px] py-[9px] text-micro leading-[normal] tracking-label text-mut uppercase transition-all duration-[400ms] ease-fotmark hover:border-acc hover:text-ink has-checked:border-acc has-checked:bg-acc has-checked:text-on-acc has-checked:hover:text-on-acc has-focus-visible:outline has-focus-visible:outline-offset-3 has-focus-visible:outline-acc has-aria-invalid:border-acc2"
                      >
                        <input
                          type="checkbox"
                          name="services"
                          value={service}
                          defaultChecked={values?.services.includes(service)}
                          aria-invalid={Boolean(error("services"))}
                          className="sr-only scroll-mt-28"
                        />
                        {name}
                      </label>,
                    ]
                  : [];
              })}
            </div>
            {error("services") && (
              <ErrorText id={`${id}-services-error`} className="mt-3">
                {error("services")}
              </ErrorText>
            )}
          </fieldset>

          <Field
            id={`${id}-message`}
            label={copy.message}
            error={error("message")}
          >
            <textarea
              id={`${id}-message`}
              name="message"
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              defaultValue={values?.message}
              aria-invalid={Boolean(error("message"))}
              aria-describedby={
                error("message") ? `${id}-message-error` : undefined
              }
              className={`${fieldClass} min-h-[140px] resize-y`}
            />
          </Field>

          <div>
            <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-[14px] leading-[1.6] text-ink2">
              {/* A drawn box on the real checkbox: it stays focusable in place, never hidden. */}
              <span className="grid size-[22px] shrink-0 place-items-center">
                <input
                  type="checkbox"
                  name="consent"
                  defaultChecked={values?.consent}
                  required
                  aria-invalid={Boolean(error("consent"))}
                  aria-describedby={
                    error("consent") ? `${id}-consent-error` : undefined
                  }
                  className="peer col-start-1 row-start-1 size-[22px] cursor-pointer scroll-mt-28 appearance-none border border-mut bg-bg2 transition-colors duration-[250ms] checked:border-acc checked:bg-acc aria-invalid:border-acc2"
                />
                <CheckIcon className="pointer-events-none col-start-1 row-start-1 size-[14px] fill-none stroke-on-acc stroke-[2] opacity-0 peer-checked:opacity-100" />
              </span>
              <span>
                {copy.consent}{" "}
                <a href={privacyHref} className="link-underline text-acc2">
                  {copy.privacy}
                </a>
              </span>
            </label>
            {error("consent") && (
              <ErrorText id={`${id}-consent-error`} className="mt-1">
                {error("consent")}
              </ErrorText>
            )}
          </div>

          {/* Full-width buttons on a phone, side by side from 701px. */}
          <div className="flex flex-col gap-3 lb:flex-row lb:items-center lb:gap-4">
            <SubmitButton disabled={!token || !botReady} copy={copy} />
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn touch-manipulation justify-center [--btn-px:32px] [--btn-py:15px] [--btn-size:var(--text-label)] [--btn-track:.18em]"
            >
              <WhatsAppIcon className="size-[18px] shrink-0 fill-none stroke-current stroke-[1.4]" />
              {copy.whatsapp}
            </a>
          </div>

          <p
            className="min-h-6 text-[14px] text-acc"
            role="status"
            aria-live="polite"
          >
            {tokenUnavailable
              ? copy.statuses.unavailable
              : state.status === "blocked" ||
                  state.status === "unavailable" ||
                  state.status === "failed"
                ? copy.statuses[state.status]
                : ""}
          </p>
        </form>
      </div>
    </div>
  );
}

// Enter in a one-line field moves to the next field instead of submitting a half-filled
// form (which would throw the person back to the first error).
function nextFieldOnEnter(event: React.KeyboardEvent<HTMLFormElement>) {
  const field = event.target;
  if (event.key !== "Enter" || event.repeat) return;
  // 229: Safari ends an IME composition before the Enter that confirms it.
  if (event.nativeEvent.isComposing || event.keyCode === 229) return;
  if (!(field instanceof HTMLInputElement) || field.type === "checkbox") return;
  const fields = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(
      "[data-field] input, [data-field] textarea",
    ),
  );
  const index = fields.indexOf(field);
  const next = index < 0 ? undefined : fields[index + 1];
  if (!next) return;
  event.preventDefault();
  next.focus();
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    // The label turns gold while its field has focus, so it's clear where the typing goes.
    <div data-field className="group grid gap-2">
      <label
        htmlFor={id}
        className="text-[12px] tracking-[.18em] text-mut uppercase transition-colors duration-[250ms] group-focus-within:text-acc group-has-aria-invalid:text-acc"
      >
        {label}
      </label>
      {children}
      {error && <ErrorText id={`${id}-error`}>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({
  id,
  className = "",
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      id={id}
      className={`flex items-start gap-2 text-[13px] leading-[1.5] text-acc ${className}`}
    >
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        focusable="false"
        className="mt-[2px] size-[15px] shrink-0 fill-none stroke-current stroke-[1.3]"
      >
        <circle cx="8" cy="8" r="6.6" />
        <path d="M8 4.6v4.2M8 10.9v.5" />
      </svg>
      {children}
    </p>
  );
}

function CheckIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M3.5 8.4l3 3 6-6.6" />
    </svg>
  );
}

function serverErrors(state: ContactState): ContactErrors {
  const errors: ContactErrors = {};
  for (const field of contactFields)
    if (state.fieldErrors?.[field]) errors[field] = true;
  return errors;
}

// Text fields: the browser scrolls them in as the keyboard opens (useKeepFieldInView fixes
// the landing). Services: the whole group with its title, not one chip, comes into view.
function focusField(form: HTMLFormElement, field: ContactField) {
  const control = form.querySelector<HTMLElement>(`[name="${field}"]`);
  if (!control) return;
  if (field !== "services") return control.focus();
  control.focus({ preventScroll: true });
  control.closest("fieldset")?.scrollIntoView({ block: "nearest" });
}

function SubmitButton({
  disabled,
  copy,
}: {
  disabled: boolean;
  copy: ContactFormCopy;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="btn touch-manipulation justify-center border border-acc bg-acc px-[32px] py-[15px] text-label tracking-[.18em] text-on-acc uppercase disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? copy.sending : copy.submit}
    </button>
  );
}
