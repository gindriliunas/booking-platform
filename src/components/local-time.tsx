"use client";

/**
 * Renders a UTC timestamp in the viewer's local timezone.
 * Use this in server components instead of formatDate() to avoid
 * the server always showing UTC regardless of the user's location.
 */
export function LocalTime({ date }: { date: Date | string }) {
  const d = new Date(date);
  return (
    <>{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(d)}</>
  );
}
