"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@mdrbx/nerv-ui";
import { bookSlot } from "@/app/ride/actions";
import { formatSlotRange } from "@/lib/tz";
import type { RideSlotRow } from "./SlotCalendar";

// Inline confirmation panel (not a modal) — matches the no-box design and lets
// the flow feel integrated with the calendar above.
export default function BookPanel({
  slot,
  onClose,
  seatsLeft,
}: {
  slot: RideSlotRow;
  onClose: () => void;
  seatsLeft: number;
}) {
  const router = useRouter();
  const [riderCount, setRiderCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [foodBeverage, setFoodBeverage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function doBook() {
    setBusy(true);
    setError(null);
    try {
      const res = await bookSlot(slot.id, riderCount, {
        notes: notes.trim() || undefined,
        foodBeverage,
      });
      if (res.ok) {
        router.push(`/ride/booking/${res.bookingId}`);
      } else {
        setError(res.error);
      }
    } finally {
      setBusy(false);
    }
  }

  const maxRiders = Math.min(seatsLeft, 8);

  return (
    <div className="border border-nerv-orange/50 bg-nerv-orange/[0.03] p-5 md:p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-orange uppercase">
            // CONFIRM.BOOKING
          </p>
          <h3 className="font-nerv-display text-lg md:text-xl tracking-[0.12em] text-nerv-white uppercase mt-1">
            {slot.title}
          </h3>
          <p className="font-nerv-mono text-xs text-nerv-cyan tracking-wider mt-1.5">
            {formatSlotRange(new Date(slot.startsAt), new Date(slot.endsAt))}
          </p>
          <p className="font-nerv-mono text-[11px] text-nerv-mid-gray tracking-wider mt-0.5">
            MEET @ {slot.startLocation}
          </p>
          {slot.routeName && (
            <p className="font-nerv-body text-sm text-nerv-white/80 mt-2">
              Route: {slot.routeName}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="font-nerv-mono text-xs text-nerv-mid-gray hover:text-nerv-orange transition-colors shrink-0"
        >
          [X]
        </button>
      </div>

      <div className="space-y-2">
        <label className="block font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-cyan/70 uppercase">
          RIDERS ({riderCount} OF {maxRiders} AVAILABLE)
        </label>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: maxRiders }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRiderCount(n)}
              className={`w-10 h-10 font-nerv-mono text-sm border transition-colors ${
                riderCount === n
                  ? "bg-nerv-orange text-nerv-black border-nerv-orange"
                  : "border-nerv-mid-gray/40 text-nerv-white hover:border-nerv-orange"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={foodBeverage}
          onChange={(e) => setFoodBeverage(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-nerv-orange cursor-pointer"
        />
        <div className="min-w-0">
          <p className="font-nerv-mono text-[11px] tracking-[0.16em] text-nerv-white uppercase group-hover:text-nerv-orange transition-colors">
            INCLUDE.FOOD + BEVERAGE
          </p>
          <p className="font-nerv-mono text-[10px] text-nerv-mid-gray tracking-wider mt-0.5">
            Coffee, snacks, and lunch at the meet point.
          </p>
        </div>
      </label>

      <div className="space-y-2">
        <label
          htmlFor="book-notes"
          className="block font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-cyan/70 uppercase"
        >
          NOTES (OPTIONAL)
        </label>
        <textarea
          id="book-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Pace preference, dietary needs, anything I should know..."
          rows={2}
          className="w-full bg-nerv-black border border-nerv-mid-gray/40 font-nerv-mono text-sm text-nerv-cyan placeholder:text-nerv-mid-gray/50 tracking-wider px-3 py-2 outline-none focus:border-nerv-cyan transition-colors resize-none"
        />
      </div>

      {error && (
        <p className="font-nerv-mono text-[11px] text-nerv-red tracking-wider">! {error}</p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <Button onClick={doBook} variant="terminal" disabled={busy}>
          {busy ? "SUBMITTING..." : "CONFIRM.REQUEST"}
        </Button>
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="font-nerv-mono text-xs tracking-[0.2em] text-nerv-mid-gray hover:text-nerv-white transition-colors"
        >
          CANCEL
        </button>
      </div>

      <p className="font-nerv-mono text-[10px] text-nerv-mid-gray tracking-wider">
        // REQUEST.PENDING.REVIEW &mdash; YOU&apos;LL.GET.EMAIL.CONFIRMATION
      </p>
    </div>
  );
}
