"use client";

import { useEffect, useRef, useState } from "react";
import type { ZoneId } from "@/lib/zones";
import { ANYWHERE, zones } from "@/lib/zones";
import type { SeatingId } from "@/site.config";
import { site } from "@/site.config";
import { PlaceCard, type Saved } from "./PlaceCard";

const KEY = "vp-entry";

type Props = {
  zone: ZoneId | typeof ANYWHERE;
  setZone: (z: ZoneId | typeof ANYWHERE) => void;
  seating: SeatingId;
  setSeating: (s: SeatingId) => void;
};

/** An inline blank that grows with what's written in it. */
function Blank({
  value,
  ghost,
  className = "",
  children,
}: {
  value: string;
  ghost: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={`blank ${className}`} data-size={value || ghost}>
      {children}
    </span>
  );
}

export function ListForm({ zone, setZone, seating, setSeating }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [company, setCompany] = useState("");
  const [party, setParty] = useState(2);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const [saved, setSaved] = useState<Saved | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Someone who already signed up on this device sees their card, not an empty form.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
  }, []);

  const seatingLabel = (id: string) => {
    const s = site.seatings.find((x) => x.id === id)!;
    return `${s.label.toLowerCase().replace(/^the /, "")}, ${s.time} ${s.meridiem}`;
  };
  const zoneLabel = (id: string) =>
    id === ANYWHERE ? "wherever you put us" : zones.find((z) => z.id === id)!.name;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, phone, note, party, seating, zone, company }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError({ message: data.error ?? "Something went wrong. Please try again.", field: data.field });
        const bad = data.field && formRef.current?.querySelector<HTMLElement>(`[name="${data.field}"]`);
        if (bad) bad.focus();
        return;
      }
      const entry: Saved = {
        number: data.number,
        name: data.name ?? name,
        party: data.party ?? party,
        seating: data.seating ?? seating,
        zone: data.zone ?? zone,
        existing: Boolean(data.existing),
      };
      setSaved(entry);
      try {
        localStorage.setItem(KEY, JSON.stringify(entry));
      } catch {}
    } catch {
      setError({ message: "We couldn't reach the list. Check your connection and try again." });
    } finally {
      setSending(false);
    }
  }

  if (saved) {
    return (
      <PlaceCard
        entry={saved}
        onReset={() => {
          try {
            localStorage.removeItem(KEY);
          } catch {}
          setSaved(null);
          setName("");
          setEmail("");
          setPhone("");
          setNote("");
        }}
      />
    );
  }

  return (
    <form ref={formRef} className="ledger" onSubmit={submit} noValidate>
      <p className="ledger__sentence display">
        Put me down as{" "}
        <Blank value={name} ghost="your name" className="blank--name">
          <input
            name="name"
            aria-label="Your name"
            size={1}
            placeholder="your name"
            autoComplete="name"
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={error?.field === "name"}
          />
        </Blank>
        . There&rsquo;ll be{" "}
        <span className="stepper">
          <button type="button" aria-label="One fewer guest" disabled={party <= 1} onClick={() => setParty(party - 1)}>
            &minus;
          </button>
          <output aria-live="polite" aria-label={`Party of ${party}`}>
            {party}
          </output>
          <button
            type="button"
            aria-label="One more guest"
            disabled={party >= site.maxParty}
            onClick={() => setParty(party + 1)}
          >
            +
          </button>
        </span>{" "}
        of us, for the{" "}
        <Blank value={seatingLabel(seating)} ghost="">
          <select
            name="seating"
            aria-label="Seating"
            value={seating}
            onChange={(e) => setSeating(e.target.value as SeatingId)}
          >
            {site.seatings.map((s) => (
              <option key={s.id} value={s.id}>
                {seatingLabel(s.id)}
              </option>
            ))}
          </select>
        </Blank>
        , and if it can be done we&rsquo;d like{" "}
        <Blank value={zoneLabel(zone)} ghost="">
          <select
            name="zone"
            aria-label="Where in the room"
            value={zone}
            onChange={(e) => setZone(e.target.value as ZoneId | typeof ANYWHERE)}
          >
            <option value={ANYWHERE}>{zoneLabel(ANYWHERE)}</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </Blank>
        . Write to me at{" "}
        <Blank value={email} ghost="email address">
          <input
            name="email"
            type="email"
            aria-label="Email address"
            size={1}
            placeholder="email address"
            autoComplete="email"
            inputMode="email"
            required
            maxLength={160}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error?.field === "email"}
          />
        </Blank>
        , or try me on{" "}
        <Blank value={phone} ghost="phone, if you like">
          <input
            name="phone"
            type="tel"
            aria-label="Phone number, optional"
            size={1}
            placeholder="phone, if you like"
            autoComplete="tel"
            maxLength={30}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Blank>
        .
      </p>

      <label className="ledger__note">
        <span className="mono">Anything the kitchen or the door should know?</span>
        <textarea
          name="note"
          rows={2}
          maxLength={400}
          placeholder="Allergies, a birthday, a wheelchair, a grudge against coriander."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      {/* Hidden from people; bots fill it in and give themselves away. */}
      <label className="ledger__trap" aria-hidden="true">
        Company
        <input name="company" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
      </label>

      <div className="ledger__foot">
        <button type="submit" className="btn btn--gold btn--big" disabled={sending}>
          {sending ? "Writing it down…" : "Add my name"}
        </button>
        <p className="ledger__small">
          A place on the list is a request, not yet a table. We confirm by email in the order names arrive
          {site.address ? "." : ", and the address travels with the confirmation."}
        </p>
      </div>

      <p className="ledger__error" role="alert">
        {error?.message}
      </p>
    </form>
  );
}
