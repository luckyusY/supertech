import { Database, ImagePlus, Link2 } from "lucide-react";
import { getIntegrationStatus } from "@/lib/integrations";

export function StackStatus() {
  const status = getIntegrationStatus();

  const items = [
    {
      title: "MongoDB",
      description: status.mongodb.label,
      configured: status.mongodb.configured,
      icon: Database,
    },
    {
      title: "Cloudinary server",
      description: status.cloudinaryServer.label,
      configured: status.cloudinaryServer.configured,
      icon: ImagePlus,
    },
    {
      title: "Cloudinary client",
      description: status.cloudinaryClient.label,
      configured: status.cloudinaryClient.configured,
      icon: Link2,
    },
  ];

  return (
    <aside className="dark-card p-6 sm:p-8">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.6)]">
        Integration checklist
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">
        Stack status for local dev and Vercel.
      </h2>
      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-[1.3rem] border border-white/10 bg-white/6 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-[var(--gold)]" />
                <h3 className="text-base font-semibold">{item.title}</h3>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  item.configured
                    ? "bg-[rgba(122,208,191,0.14)] text-[#8ef0dc]"
                    : "bg-[rgba(228,90,54,0.14)] text-[#ffb09b]"
                }`}
              >
                {item.configured ? "Ready" : "Needs env"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[rgba(255,255,255,0.74)]">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}
