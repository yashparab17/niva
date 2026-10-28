export type Status = "booked" | "done" | "no_show";

export type Appointment = {
  id: string;
  client_name: string;
  phone: string | null;
  date: string;
  time: string;
  status: Status;
  confirmed: boolean;
  running_late: boolean;
};

export type WaitlistEntry = { id: string; client_name: string; phone: string; date: string };

export type Cancellation = {
  id: string;
  client_name: string;
  date: string;
  time: string;
  reason: string | null;
  cancelled_at: string;
};

export const CANCEL_REASONS = ["Not feeling well", "Schedule clash", "Travelling", "Other"];

// Groups a client's history: by phone when there is one, otherwise by name.
export const clientKey = (a: Pick<Appointment, "phone" | "client_name">) => a.phone ?? a.client_name.toLowerCase();

export const STATUSES: Status[] = ["booked", "done", "no_show"];

// One colour per status, shared by the dashboard and the client app.
export const STATUS_META: Record<Status, { label: string; className: string }> = {
  booked: { label: "Booked", className: "bg-booked text-booked-foreground" },
  done: { label: "Done", className: "bg-done text-done-foreground" },
  no_show: { label: "No-show", className: "bg-noshow text-noshow-foreground" },
};

// Keeps only the last 10 digits so "98200 11111", "09820011111" and "+91 98200 11111" match.
export const normalizePhone = (raw: string) => raw.replace(/\D/g, "").slice(-10);
export const isValidPhone = (phone: string) => /^\d{10}$/.test(phone);

export const formatPhone = (phone: string) => `${phone.slice(0, 5)} ${phone.slice(5)}`;
