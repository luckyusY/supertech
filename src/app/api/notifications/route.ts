import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth";
import { hasMongoConfig } from "@/lib/integrations";
import { getNotifications, markAllRead, markRead } from "@/lib/notifications";

export async function GET(request: Request) {
  const auth = authorizeRequest(request, ["admin", "vendor"]);
  if (!auth.ok) return auth.response;

  if (!hasMongoConfig()) {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }

  try {
    const notifications = await getNotifications(
      auth.session.role as "admin" | "vendor",
      auth.session.vendorSlug,
    );
    const unreadCount = notifications.filter((n) => !n.read).length;
    return NextResponse.json({ notifications, unreadCount });
  } catch {
    return NextResponse.json({ error: "Unable to load notifications." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = authorizeRequest(request, ["admin", "vendor"]);
  if (!auth.ok) return auth.response;

  if (!hasMongoConfig()) {
    return NextResponse.json({ ok: true });
  }

  try {
    const body = (await request.json()) as { notificationId?: string; markAll?: boolean };

    if (body.markAll) {
      await markAllRead(
        auth.session.role as "admin" | "vendor",
        auth.session.vendorSlug,
      );
    } else if (body.notificationId) {
      await markRead(body.notificationId);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to update notifications." }, { status: 500 });
  }
}
