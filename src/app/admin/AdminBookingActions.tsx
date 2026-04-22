"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptBooking, rejectBooking } from "./actions";

export default function AdminBookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: "pending" | "accepted";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  if (status === "accepted") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Cancel this accepted ride? The rider will NOT be emailed.")) return;
          setErr(null);
          startTransition(async () => {
            const r = await rejectBooking(bookingId);
            if (r.ok) router.refresh();
            else setErr(r.error);
          });
        }}
        className="font-nerv-mono text-[10px] tracking-[0.15em] text-nerv-red/70 hover:text-nerv-red border border-nerv-red/40 hover:border-nerv-red px-2 py-1 disabled:opacity-40"
      >
        {pending ? "..." : "CANCEL"}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setErr(null);
            startTransition(async () => {
              const r = await acceptBooking(bookingId);
              if (r.ok) router.refresh();
              else setErr(r.error);
            });
          }}
          className="font-nerv-mono text-[10px] tracking-[0.15em] text-nerv-green border border-nerv-green/50 hover:bg-nerv-green/10 hover:border-nerv-green px-2.5 py-1 disabled:opacity-40"
        >
          {pending ? "..." : "ACCEPT"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm("Reject this request? The rider will NOT be emailed.")) return;
            setErr(null);
            startTransition(async () => {
              const r = await rejectBooking(bookingId);
              if (r.ok) router.refresh();
              else setErr(r.error);
            });
          }}
          className="font-nerv-mono text-[10px] tracking-[0.15em] text-nerv-red/80 border border-nerv-red/40 hover:bg-nerv-red/10 hover:border-nerv-red px-2.5 py-1 disabled:opacity-40"
        >
          REJECT
        </button>
      </div>
      {err && (
        <p className="font-nerv-mono text-[10px] text-nerv-red tracking-wider">! {err}</p>
      )}
    </div>
  );
}
