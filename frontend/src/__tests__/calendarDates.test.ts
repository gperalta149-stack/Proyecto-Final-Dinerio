import { describe, it, expect } from "vitest";
import { daysUntil } from "../features/calendar/utils/date";
import type { CalendarEvent } from "../features/calendar/types";

const daysFromToday = (days: number): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const event = (id: string, days: number): CalendarEvent => ({
  id,
  title: `Evento ${id}`,
  amount: 10,
  currency: "USD",
  date: daysFromToday(days),
  billingCycle: "monthly",
  status: "pending",
  categoryName: "Streaming",
  categoryColor: "#6366f1",
});

const events: CalendarEvent[] = [
  event("hoy", 0),
  event("2d", 2),
  event("3d", 3),
  event("4d", 4),
  event("7d", 7),
  event("10d", 10),
];

describe("daysUntil", () => {
  it("returns 0 for today", () => {
    expect(daysUntil(daysFromToday(0))).toBe(0);
  });

  it("returns 1 for tomorrow", () => {
    expect(daysUntil(daysFromToday(1))).toBe(1);
  });

  it("returns -1 for yesterday", () => {
    expect(daysUntil(daysFromToday(-1))).toBe(-1);
  });
});

describe("DuePayments buckets (misma lógica que useCalendar)", () => {
  const todayEvents = events.filter((e) => daysUntil(e.date) === 0);
  const eventsIn3Days = events.filter((e) => {
    const diff = daysUntil(e.date);
    return diff >= 1 && diff <= 3;
  });
  const eventsIn7Days = events.filter((e) => {
    const diff = daysUntil(e.date);
    return diff >= 4 && diff <= 7;
  });

  it("Vencen hoy: solo eventos del día 0", () => {
    expect(todayEvents.map((e) => e.id)).toEqual(["hoy"]);
  });

  it("Vencen en 3 días: días 1 a 3", () => {
    expect(eventsIn3Days.map((e) => e.id)).toEqual(["2d", "3d"]);
  });

  it("Vencen en 7 días: días 4 a 7", () => {
    expect(eventsIn7Days.map((e) => e.id)).toEqual(["4d", "7d"]);
  });

  it("ningún evento se cuenta dos veces entre cuadros", () => {
    const ids = [...todayEvents, ...eventsIn3Days, ...eventsIn7Days].map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(5);
  });

  it("los eventos quedan ordenados por fecha (más próximo primero)", () => {
    const sorted = [...eventsIn3Days, ...eventsIn7Days].sort(
      (a, b) => daysUntil(a.date) - daysUntil(b.date)
    );
    expect(sorted.map((e) => e.id)).toEqual(["2d", "3d", "4d", "7d"]);
  });
});
