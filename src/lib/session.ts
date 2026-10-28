import { cookies } from "next/headers";

export const PHONE_COOKIE = "kayro_phone";

// Clients have no login: their phone number (kept in a cookie) is their identity.
export async function currentPhone() {
  return (await cookies()).get(PHONE_COOKIE)?.value ?? null;
}
