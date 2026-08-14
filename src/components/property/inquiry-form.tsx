"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { submitInquiry, type InquiryState } from "@/app/actions/inquiries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const INITIAL: InquiryState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-brand text-brand-foreground hover:bg-brand-strong"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" /> Sending…
        </>
      ) : (
        <>
          <Send className="size-4" /> Request a call back
        </>
      )}
    </Button>
  );
}

export function InquiryForm({
  propertyId,
  propertySlug,
  propertyTitle,
  className,
}: {
  propertyId?: string;
  propertySlug?: string | null;
  propertyTitle?: string;
  className?: string;
}) {
  const [state, formAction] = useActionState(submitInquiry, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    } else if (state.status === "error" && !state.fieldErrors) {
      toast.error(state.message ?? "We couldn't send that enquiry. Please call the office.");
    }
  }, [state]);

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-6 sm:p-7", className)}>
      <AnimatePresence mode="wait">
        {state.status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="py-6 text-center"
          >
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-brand-tint">
              <CheckCircle2 className="size-6 text-brand" />
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold text-ink">
              Enquiry received
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{state.message}</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className="font-display text-lg font-semibold text-ink">
              Interested in this property?
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              Leave your number and the agent handling this listing will call you
              back — usually the same day.
            </p>

            <form ref={formRef} action={formAction} className="mt-6 space-y-4">
              {propertyId && <input type="hidden" name="propertyId" value={propertyId} />}
              {propertySlug && <input type="hidden" name="propertySlug" value={propertySlug} />}
              {propertyTitle && (
                <input type="hidden" name="propertyTitle" value={propertyTitle} />
              )}

              <Field
                id="name"
                label="Your name"
                required
                error={state.fieldErrors?.name}
                autoComplete="name"
              />
              <Field
                id="phone"
                label="Phone number"
                type="tel"
                required
                placeholder="98XXXXXXXX"
                error={state.fieldErrors?.phone}
                autoComplete="tel"
              />
              <Field
                id="email"
                label="Email"
                type="email"
                optional
                error={state.fieldErrors?.email}
                autoComplete="email"
              />

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-sm">
                  Message <span className="font-normal text-ink-muted">(optional)</span>
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="When would you like to visit? Anything specific you want to know?"
                />
              </div>

              <SubmitButton />

              <p className="text-center text-xs leading-relaxed text-ink-muted">
                We use your number only to discuss this property. No marketing
                lists, no sharing with third parties.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
  optional,
  placeholder,
  error,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm">
        {label}
        {optional && <span className="font-normal text-ink-muted"> (optional)</span>}
      </Label>
      <Input
        id={id}
        name={id}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
