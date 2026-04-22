"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOutUser } from "@/app/ride/actions";
import MyBookingsList, { type BookingRow } from "./MyBookingsList";

export default function UserPanel({
  userName,
  userEmail,
  upcoming,
  past,
}: {
  userName: string;
  userEmail: string;
  upcoming: BookingRow[];
  past: BookingRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="border border-nerv-cyan/30 bg-nerv-black/50 p-5 md:p-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-mid-gray uppercase">
            // SIGNED.IN
          </p>
          <p className="font-nerv-display text-lg tracking-[0.12em] text-nerv-white uppercase mt-0.5">
            {userName}
          </p>
          <p className="font-nerv-mono text-[11px] text-nerv-cyan tracking-wider">
            {userEmail}
          </p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await signOutUser();
              router.refresh();
            });
          }}
          className="font-nerv-mono text-[11px] tracking-[0.2em] text-nerv-mid-gray hover:text-nerv-orange transition-colors"
        >
          SIGN.OUT
        </button>
      </div>

      <div className="space-y-2">
        <p className="font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-cyan/70 uppercase">
          UPCOMING.RIDES
        </p>
        <MyBookingsList rows={upcoming} allowCancel />
      </div>

      {past.length > 0 && (
        <div className="space-y-2">
          <p className="font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-cyan/70 uppercase">
            PAST.RIDES
          </p>
          <MyBookingsList rows={past} allowCancel={false} />
        </div>
      )}
    </div>
  );
}
