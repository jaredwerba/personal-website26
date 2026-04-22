"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelBooking } from "@/app/ride/actions";
import { formatSlotRange } from "@/lib/tz";

export type BookingRow = {
  bookingId: string;
  slotId: string;
  startsAt: string; // ISO
  endsAt: string; // ISO
  title: string;
  startLocation: string;
  riderCount: number;
  notes: string | null;
  status: "pending" | "accepted";
};

export default function MyBookingsList({
  rows,
  allowCancel,
}: {
  rows: BookingRow[];
  allowCancel: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (rows.length === 0) {
    return (
      <p className="font-nerv-mono text-xs text-nerv-mid-gray tracking-wider">
        // NONE
      </p>
    );
  }

  return (
    <ul className="divide-y divide-nerv-mid-gray/20 border-y border-nerv-mid-gray/20">
      {rows.map((b) => (
        <li key={b.bookingId} className="py-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-nerv-display text-sm tracking-[0.12em] text-nerv-white uppercase">
              {b.title}
            </p>
            <p className="font-nerv-mono text-[11px] text-nerv-cyan tracking-wider mt-0.5">
              {formatSlotRange(new Date(b.startsAt), new Date(b.endsAt))}
            </p>
            <p className="font-nerv-mono text-[10px] text-nerv-mid-gray tracking-wider mt-0.5">
              {b.riderCount} RIDER{b.riderCount === 1 ? "" : "S"} · {b.startLocation}
            </p>
            {b.notes && (
              <p className="font-nerv-body text-xs text-nerv-white/70 mt-1 italic">
                &ldquo;{b.notes}&rdquo;
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span
              className={`font-nerv-mono text-[9px] tracking-[0.2em] px-1.5 py-0.5 border ${
                b.status === "accepted"
                  ? "text-nerv-green border-nerv-green/50"
                  : "text-nerv-amber border-nerv-amber/50"
              }`}
            >
              {b.status.toUpperCase()}
            </span>
            {allowCancel && (
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (!confirm("Cancel this booking?")) return;
                  startTransition(async () => {
                    const res = await cancelBooking(b.bookingId);
                    if (!res.ok) {
                      alert(res.error);
                    } else {
                      router.refresh();
                    }
                  });
                }}
                className="font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-mid-gray hover:text-nerv-red transition-colors"
              >
                CANCEL
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
