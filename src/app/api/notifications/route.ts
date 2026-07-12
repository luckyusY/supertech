import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth";
import { hasMongoConfig } from "@/lib/integrations";
import { getNotifications, markAllRead, markRead } from "@/lib/notifications";

export async function GET(request: Request) {
  // Admin, vendor, and signed-in customers each get their own feed
  const auth = authorizeRequest(request, ["admin", "vendor", "customer"]);
  if (!auth.ok) return auth.response;

  if (!hasMongoConfig()) {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }

  try {
    const role = auth.session.role as "admin" | "vendor" | "customer";
    const notifications = await getNotifications(role, {
      vendorSlug: auth.session.vendorSlug,
      customerEmail: auth.session.email,
    });
    const unreadCount = notifications.filter((n) => !n.read).length;
    return NextResponse.json({ notifications, unreadCount, role });
  } catch {
    return NextResponse.json({ error: "Unable to load notifications." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = authorizeRequest(request, ["admin", "vendor", "customer"]);
  if (!auth.ok) return auth.response;

  if (!hasMongoConfig()) {
    return NextResponse.json({ ok: true });
  }

  try {
    const body = (await request.json()) as { notificationId?: string; markAll?: boolean };
    const role = auth.session.role as "admin" | "vendor" | "customer";

    if (body.markAll) {
      await markAllRead(role, {
        vendorSlug: auth.session.vendorSlug,
        customerEmail: auth.session.email,
      });
    } else if (body.notificationId) {
      await markRead(body.notificationId);
    } else {
      return NextResponse.json({ error: "Provide markAll or notificationId." }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to update notifications." }, { status: 500 });
  }
}
