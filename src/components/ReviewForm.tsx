"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

interface ReviewFormProps {
  onSubmitted?: () => void;
}

export function ReviewForm({ onSubmitted }: ReviewFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("saving");
    setMessage("");

    const payload = {
      reviewerName: String(data.get("reviewerName") ?? ""),
      preferredSite: String(data.get("preferredSite") ?? ""),
      visualScore: Number(data.get("visualScore")),
      uxScore: Number(data.get("uxScore")),
      a11yScore: Number(data.get("a11yScore")),
      comment: String(data.get("comment") ?? ""),
    };

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const errorMessage =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof body.error === "string"
            ? body.error
            : "Could not save your review.";
        setStatus("error");
        setMessage(errorMessage);
        return;
      }
      form.reset();
      setStatus("saved");
      setMessage("Logged. Thank you — the board will refresh.");
      onSubmitted?.();
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Network error. Try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <label className="grid gap-2">
        <span className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          Your name
        </span>
        <input
          required
          name="reviewerName"
          maxLength={80}
          className="rounded-[4px] border border-ink/15 bg-cream px-3 py-2.5 font-sans text-sm text-ink"
        />
      </label>

      <fieldset className="grid gap-2">
        <legend className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          Stronger overall
        </legend>
        <div className="flex flex-wrap gap-3">
          {[
            { value: "bsc", label: "Blessed Sacrament" },
            { value: "oll", label: "Our Lady of Lourdes" },
            { value: "tie", label: "A tie" },
          ].map((option) => (
            <label
              key={option.value}
              className="font-sans flex cursor-pointer items-center gap-2 rounded-[4px] border border-ink/15 bg-cream px-3 py-2 text-sm"
            >
              <input required type="radio" name="preferredSite" value={option.value} />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { name: "visualScore", label: "Visual" },
          { name: "uxScore", label: "UX" },
          { name: "a11yScore", label: "A11y" },
        ].map((field) => (
          <label key={field.name} className="grid gap-2">
            <span className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              {field.label} (1–10)
            </span>
            <input
              required
              name={field.name}
              type="number"
              min={1}
              max={10}
              defaultValue={8}
              className="rounded-[4px] border border-ink/15 bg-cream px-3 py-2.5 font-sans text-sm tabular-nums"
            />
          </label>
        ))}
      </div>

      <label className="grid gap-2">
        <span className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          Note
        </span>
        <textarea
          required
          name="comment"
          minLength={12}
          maxLength={800}
          rows={4}
          className="rounded-[4px] border border-ink/15 bg-cream px-3 py-2.5 font-sans text-sm leading-relaxed"
          placeholder="What felt inevitable for the building — and what felt like a recolour?"
        />
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "saving"}
          className="font-sans rounded-[4px] bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-bsc-deep disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : "Log this reading"}
        </button>
        {message ? (
          <p
            className={`font-sans text-sm ${status === "error" ? "text-rose" : "text-sage"}`}
            role="status"
          >
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
