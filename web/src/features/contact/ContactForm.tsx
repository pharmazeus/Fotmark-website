"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { Locale } from "@/i18n/routing";
import { issueContactToken, sendContact } from "./actions";
import { initialContactState, serviceKeys, type ContactField } from "./model";

export type ContactFormCopy = {
  title: string;
  intro: string;
  name: string;
  contact: string;
  businessType: string;
  service: string;
  servicePlaceholder: string;
  message: string;
  consent: string;
  privacy: string;
  submit: string;
  sending: string;
  whatsapp: string;
  statuses: Record<"blocked" | "unavailable" | "failed", string>;
  errors: Record<ContactField, string>;
  // Names come from the Sanity services; an option is listed only for a service that exists.
  services: Partial<Record<(typeof serviceKeys)[number], string>>;
};

type Props = {
  locale: Locale;
  privacyHref: string;
  whatsappHref: string;
  copy: ContactFormCopy;
};

const fieldClass =
  "w-full rounded-none border-0 border-b border-line bg-transparent px-0 py-3 text-[16px] text-ink outline-none [transition:border-color_.25s] placeholder:text-dim focus:border-acc";

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
    if (state.status === "invalid") {
      formRef.current
        ?.querySelector<HTMLElement>("[aria-invalid='true']")
        ?.focus();
    }
  }, [state]);

  const error = (field: ContactField) =>
    state.fieldErrors?.[field] ? copy.errors[field] : undefined;

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
                autoComplete="name"
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
                autoComplete="email"
                inputMode="email"
                required
                maxLength={254}
                aria-invalid={Boolean(error("contact"))}
                aria-describedby={
                  error("contact") ? `${id}-contact-error` : undefined
                }
                className={fieldClass}
              />
            </Field>
            <Field
              id={`${id}-business`}
              label={copy.businessType}
              error={error("businessType")}
            >
              <input
                id={`${id}-business`}
                name="businessType"
                autoComplete="organization"
                required
                maxLength={100}
                aria-invalid={Boolean(error("businessType"))}
                aria-describedby={
                  error("businessType") ? `${id}-business-error` : undefined
                }
                className={fieldClass}
              />
            </Field>
            <Field
              id={`${id}-service`}
              label={copy.service}
              error={error("service")}
            >
              <select
                id={`${id}-service`}
                name="service"
                required
                defaultValue=""
                aria-invalid={Boolean(error("service"))}
                aria-describedby={
                  error("service") ? `${id}-service-error` : undefined
                }
                className={`${fieldClass} bg-bg text-ink`}
              >
                <option value="" disabled>
                  {copy.servicePlaceholder}
                </option>
                {serviceKeys.flatMap((service) => {
                  const name = copy.services[service];
                  return name
                    ? [
                        <option key={service} value={service}>
                          {name}
                        </option>,
                      ]
                    : [];
                })}
              </select>
            </Field>
          </div>

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
              aria-invalid={Boolean(error("message"))}
              aria-describedby={
                error("message") ? `${id}-message-error` : undefined
              }
              className={`${fieldClass} resize-y`}
            />
          </Field>

          <div>
            <label className="flex cursor-pointer items-start gap-3 text-[14px] leading-[1.6] text-ink2">
              <input
                type="checkbox"
                name="consent"
                required
                aria-invalid={Boolean(error("consent"))}
                aria-describedby={
                  error("consent") ? `${id}-consent-error` : undefined
                }
                className="mt-1 size-4 shrink-0 accent-acc"
              />
              <span>
                {copy.consent}{" "}
                <a href={privacyHref} className="link-underline text-acc2">
                  {copy.privacy}
                </a>
              </span>
            </label>
            {error("consent") && (
              <p
                id={`${id}-consent-error`}
                className="mt-2 text-[13px] text-acc2"
              >
                {error("consent")}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <SubmitButton disabled={!token || !botReady} copy={copy} />
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline touch-manipulation py-3 text-[12px] tracking-[.16em] text-ink2 uppercase"
            >
              {copy.whatsapp}
            </a>
          </div>

          <p
            className="min-h-6 text-[14px] text-acc2"
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
    <div>
      <label
        htmlFor={id}
        className="text-[11px] tracking-[.18em] text-mut uppercase"
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-[13px] text-acc2">
          {error}
        </p>
      )}
    </div>
  );
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
      className="btn touch-manipulation border border-acc bg-acc px-[32px] py-[15px] text-[11.5px] tracking-[.18em] text-on-acc uppercase disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? copy.sending : copy.submit}
    </button>
  );
}
