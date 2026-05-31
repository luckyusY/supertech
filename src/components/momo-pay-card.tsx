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
      className={`relative w-full max-w-sm overflow-hidden rounded-2xl bg-[#ffcb05] p-4 text-[#1a1a1a] shadow-md sm:p-6 ${className ?? ""}`}
    >
      <p className="text-lg font-semibold tracking-wide sm:text-xl">
        <span className="font-mono text-sm font-medium opacity-80">pay with </span>
        <span className="text-xl font-extrabold sm:text-2xl">MOMOPAY</span>
      </p>

      <div className="mt-4 inline-block bg-white px-3 py-1 font-mono text-base font-bold tracking-wider sm:text-lg">
        {MOMO_USSD_PREFIX}
      </div>

      <p className="mt-3 text-base font-bold tracking-[0.12em] sm:text-lg sm:tracking-[0.15em]">MERCHANT CODE</p>

      <div className="mt-1 flex flex-wrap gap-1">
        {merchantCode.split("").map((digit, index) => (
          <span
            key={`${digit}-${index}`}
            className="bg-white px-1.5 py-0.5 text-2xl font-extrabold tabular-nums sm:px-2 sm:text-3xl"
          >
            {digit}
          </span>
        ))}
      </div>

      <p className="mt-4 max-w-[calc(100%-3.5rem)] break-words text-2xl font-extrabold uppercase tracking-wide sm:text-3xl">
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
