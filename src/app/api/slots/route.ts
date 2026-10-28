import type { NextRequest } from "next/server";
import { slotsForDate } from "@/lib/appointments";

// Availability for one day, read by the slot picker on both the client app and the dashboard.
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: "Invalid date" }, { status: 400 });
  return Response.json(await slotsForDate(date), { headers: { "Cache-Control": "no-store" } });
}
