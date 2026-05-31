import { MOMO_USSD_PREFIX } from "@/lib/payment-methods";

type MomoPayCardProps = {
  merchantCode: string;
  businessName: string;
  className?: string;
};

export function MomoPayCard({
  merchantCode,
  businessName,
  className,
}: MomoPayCardProps) {
  return (
    <div
      className={`relative w-full max-w-sm overflow-hidden rounded-2xl bg-[#ffcb05] p-6 text-[#1a1a1a] shadow-md ${className ?? ""}`}
    >
      <p className="text-xl font-semibold tracking-wide">
        <span className="font-mono text-sm font-medium opacity-80">pay with </span>
        <span className="text-2xl font-extrabold">MOMOPAY</span>
      </p>

      <div className="mt-4 inline-block bg-white px-3 py-1 font-mono text-lg font-bold tracking-wider">
        {MOMO_USSD_PREFIX}
      </div>

      <p className="mt-3 text-lg font-bold tracking-[0.15em]">MERCHANT CODE</p>

      <div className="mt-1 flex flex-wrap gap-1">
        {merchantCode.split("").map((digit, index) => (
          <span
            key={`${digit}-${index}`}
            className="bg-white px-2 py-0.5 text-3xl font-extrabold tabular-nums"
          >
            {digit}
          </span>
        ))}
      </div>

      <p className="mt-4 text-3xl font-extrabold uppercase tracking-wide">
        {businessName}
      </p>

      <div className="absolute bottom-4 right-4 rounded border-2 border-white bg-[#ffcb05] px-2 py-0.5">
        <span className="text-sm font-extrabold italic text-[#004f9f]">
          M<span className="text-[#e30613]">T</span>N
        </span>
      </div>
    </div>
  );
}
