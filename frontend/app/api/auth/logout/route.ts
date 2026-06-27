import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("token_customer");
  cookieStore.delete("user_customer");
  cookieStore.delete("token_admin");
  cookieStore.delete("user_admin");
  cookieStore.delete("token_driver");
  cookieStore.delete("user_driver");
  return NextResponse.json({ success: true });
}
