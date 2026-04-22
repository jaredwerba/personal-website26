"use client";

import { useMemo, useState } from "react";
import { TZ, dayKey, formatDayHeader, formatTime } from "@/lib/tz";
import BookPanel from "./BookPanel";

// Plain-object serialization of ride_slot rows crossing the server/client boundary.
export type RideSlotRow = {
  id: string;
  startsAt: string; // ISO
  endsAt: string; // ISO
  title: string;
  startLocation: string;
  routeName: string | null;
  distanceKm: number | null;
  elevationGainM: number | null;
  pace: "casual" | "moderate" | "fast";
  capacity: number;
  seatsBooked: number;
  status: "open" | "canceled";
};

const DOW = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function keyFrom(year: number, month1: number, day: number): string {
  return `${year}-${pad(month1)}-${pad(day)}`;
}

type Cell = { key: string; day: number; inMonth: boolean };

function buildMonthCells(year: number, monthIdx: number): Cell[] {
  const firstDay = new Date(year, monthIdx, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const cells: Cell[] = [];

  const prevMonthDays = new Date(year, monthIdx, 0).getDate();
  const prevMonthIdx = monthIdx === 0 ? 11 : monthIdx - 1;
  const prevYear = monthIdx === 0 ? year - 1 : year;
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    cells.push({
      key: keyFrom(prevYear, prevMonthIdx + 1, d),
      day: d,
      inMonth: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ key: keyFrom(year, monthIdx + 1, d), day: d, inMonth: true });
  }

  const nextMonthIdx = monthIdx === 11 ? 0 : monthIdx + 1;
  const nextYear = monthIdx === 11 ? year + 1 : year;
  let nd = 1;
  while (cells.length < 42) {
    cells.push({
      key: keyFrom(nextYear, nextMonthIdx + 1, nd),
      day: nd,
      inMonth: false,
    });
    nd++;
  }

  return cells;
}

function monthTitle(year: number, monthIdx: number): string {
  return new Date(year, monthIdx, 1)
    .toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: TZ,
    })
    .toUpperCase();
}

function keyToDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

export default function SlotCalendar({ openSlots }: { openSlots: RideSlotRow[] }) {
  const slotsByDay = useMemo(() => {
    const m = new Map<string, RideSlotRow[]>();
    for (const s of openSlots) {
      const k = dayKey(new Date(s.startsAt));
      const arr = m.get(k) ?? [];
      arr.push(s);
      m.set(k, arr);
    }
    for (const arr of m.values()) {
      arr.sort(
        (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      );
    }
    return m;
  }, [openSlots]);

  const todayKey = useMemo(() => dayKey(new Date()), []);

  const initial = useMemo(() => {
    const first = openSlots[0];
    const d = first ? new Date(first.startsAt) : new Date();
    return { year: d.getFullYear(), monthIdx: d.getMonth() };
  }, [openSlots]);

  const [cursor, setCursor] = useState(initial);
  const [selectedKey, setSelectedKey] = useState<string | null>(() => {
    const firstSlot = openSlots[0];
    return firstSlot ? dayKey(new Date(firstSlot.startsAt)) : null;
  });
  const [selectedSlot, setSelectedSlot] = useState<RideSlotRow | null>(null);

  const cells = useMemo(
    () => buildMonthCells(cursor.year, cursor.monthIdx),
    [cursor],
  );

  const daysSlots = selectedKey ? (slotsByDay.get(selectedKey) ?? []) : [];

  function shiftMonth(delta: number) {
    setCursor((c) => {
      const m = c.monthIdx + delta;
      const y = c.year + Math.floor(m / 12);
      const mi = ((m % 12) + 12) % 12;
      return { year: y, monthIdx: mi };
    });
  }

  if (openSlots.length === 0) {
    return (
      <div className="border border-dashed border-nerv-mid-gray/40 p-8 text-center">
        <p className="font-nerv-mono text-sm text-nerv-mid-gray tracking-wider">
          // NO.OPEN.RIDES — CHECK.BACK.SOON
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        {/* Calendar grid (7-col inherent to calendar layout) */}
        <div className="md:flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="font-nerv-mono text-sm text-nerv-cyan hover:text-nerv-orange transition-colors px-2 py-1"
            >
              &larr;
            </button>
            <p className="font-nerv-display text-sm tracking-[0.2em] text-nerv-white uppercase">
              {monthTitle(cursor.year, cursor.monthIdx)}
            </p>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="font-nerv-mono text-sm text-nerv-cyan hover:text-nerv-orange transition-colors px-2 py-1"
            >
              &rarr;
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-nerv-mono text-[10px] tracking-[0.18em] text-nerv-mid-gray pb-1.5">
            {DOW.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((c) => {
              const has = slotsByDay.has(c.key);
              const isSelected = c.key === selectedKey;
              const isToday = c.key === todayKey;
              const classes = [
                "relative aspect-square flex items-center justify-center font-nerv-mono text-sm transition-colors border",
              ];
              if (!c.inMonth) classes.push("text-nerv-mid-gray/30 border-transparent");
              else classes.push("border-nerv-mid-gray/15");
              if (has && !isSelected) {
                classes.push(
                  "cursor-pointer hover:border-nerv-cyan hover:text-nerv-cyan font-bold text-nerv-white",
                );
              } else if (!has) {
                classes.push("cursor-default text-nerv-mid-gray/50");
              }
              if (isSelected) {
                classes.push("bg-nerv-orange text-nerv-black border-nerv-orange font-bold");
              }
              if (isToday && !isSelected) classes.push("border-nerv-green");
              return (
                <button
                  key={c.key}
                  type="button"
                  disabled={!has}
                  onClick={() => setSelectedKey(c.key)}
                  className={classes.join(" ")}
                >
                  <span>{c.day}</span>
                  {has && !isSelected && (
                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-nerv-cyan" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-4 font-nerv-mono text-[10px] tracking-wider text-nerv-mid-gray">
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-nerv-cyan" /> AVAILABLE
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 border border-nerv-green" /> TODAY
            </span>
          </div>
        </div>

        {/* Day detail + time list */}
        <div className="md:flex-1 min-w-0">
          {selectedKey && (
            <h3 className="font-nerv-mono text-[11px] tracking-[0.2em] text-nerv-cyan uppercase mb-3">
              {formatDayHeader(keyToDate(selectedKey))}
            </h3>
          )}
          {daysSlots.length === 0 ? (
            <p className="font-nerv-mono text-xs text-nerv-mid-gray tracking-wider">
              {selectedKey ? "// NO.RIDES.THIS.DAY" : "// PICK.A.DAY"}
            </p>
          ) : (
            <ul className="space-y-2">
              {daysSlots.map((s) => {
                const seatsLeft = s.capacity - s.seatsBooked;
                const isFull = seatsLeft <= 0;
                const isActive = selectedSlot?.id === s.id;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      disabled={isFull}
                      onClick={() => setSelectedSlot(s)}
                      className={`w-full block border p-3 text-left transition-colors ${
                        isActive
                          ? "border-nerv-orange bg-nerv-orange/5"
                          : isFull
                            ? "border-nerv-mid-gray/20 opacity-60 cursor-not-allowed"
                            : "border-nerv-mid-gray/30 hover:border-nerv-cyan"
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-3 flex-wrap">
                        <p className="font-nerv-display text-sm tracking-[0.12em] text-nerv-white uppercase">
                          {formatTime(new Date(s.startsAt))} &ndash;{" "}
                          {formatTime(new Date(s.endsAt))}
                        </p>
                        <p
                          className={`font-nerv-mono text-[10px] tracking-wider ${
                            isFull ? "text-nerv-red" : "text-nerv-green"
                          }`}
                        >
                          {isFull ? "FULL" : `${seatsLeft}/${s.capacity} LEFT`}
                        </p>
                      </div>
                      <p className="font-nerv-body text-sm text-nerv-white/80 mt-1">
                        {s.title}
                      </p>
                      <p className="font-nerv-mono text-[10px] text-nerv-mid-gray tracking-wider mt-1">
                        {s.startLocation}
                        {s.distanceKm ? ` · ${s.distanceKm}KM` : ""}
                        {s.elevationGainM ? ` · ${s.elevationGainM}M↑` : ""}
                        {` · PACE.${s.pace.toUpperCase()}`}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {selectedSlot && (
        <BookPanel
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          seatsLeft={selectedSlot.capacity - selectedSlot.seatsBooked}
        />
      )}
    </div>
  );
}
