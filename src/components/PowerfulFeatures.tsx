import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

const TRANSACTIONS = [
  { name: "SadaPay deposit", date: "13 Oct 2026", amount: "Rs. 1,600", status: "Completed" as const },
  { name: "Referral bonus", date: "12 Oct 2026", amount: "Rs. 160", status: "Completed" as const },
  { name: "EasyPaisa withdrawal", date: "11 Oct 2026", amount: "Rs. 1,200", status: "Pending" as const },
];

const RANGE_TABS = ["3 Month", "6 Month", "1 Year"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const BAR_HEIGHTS = [52, 38, 60, 72, 64, 76, 50, 100, 46, 58, 50, 64];

const ORBIT_RADII = [36, 78, 120, 162, 204];
const ORBIT_DOTS = [
  { x: 206, y: 94, r: 3.2 },
  { x: 142, y: 249, r: 2.8 },
  { x: 312, y: 274, r: 3.2 },
  { x: 238, y: 326, r: 2.8 },
  { x: 74, y: 296, r: 2.8 },
];

/* ------------------------------------------------------------------ */
/*  Icons & primitives                                                */
/* ------------------------------------------------------------------ */

function InboxIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3" />
      <path d="M14 2v4M8 10v4M16 18v4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8.2V12l2.7 1.7" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2.9 5.6 5.4v5.3c0 4.4 2.8 7.6 6.4 9.4 3.6-1.8 6.4-5 6.4-9.4V5.4L12 2.9Z" />
      <path d="m9.4 11.7 1.8 1.8 3.4-3.5" />
    </svg>
  );
}

function Avatar({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex items-end justify-center overflow-hidden rounded-full bg-[#E7E2D6] text-[#ABA69A] ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-[78%] w-[70%]" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="7" r="4.1" />
        <path d="M3.9 24c.9-4.9 4.2-7.7 8.1-7.7s7.2 2.8 8.1 7.7Z" />
      </svg>
    </span>
  );
}

function StatusPill({ status }: { status: "Completed" | "Pending" }) {
  const tone =
    status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-600";
  return (
    <span className={`inline-block rounded-md px-2 py-1 text-[14px] leading-none ${tone}`}>
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Card shell                                                        */
/* ------------------------------------------------------------------ */

function FeatureCard({
  visual,
  title,
  description,
}: {
  visual: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[14px] border border-black/[0.04] bg-[#FFFEFB] p-7 transition-transform duration-300 hover:-translate-y-0.5">
      {visual}
      <div className="mt-auto pt-8">
        <h3 className="text-[22px] font-medium tracking-tight text-[#1A1E1C]">{title}</h3>
        <p className="mt-3 max-w-[440px] text-[15px] leading-[1.5] text-[#6E6C66]">{description}</p>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Visual 1 — Recent Transaction                                     */
/* ------------------------------------------------------------------ */

function TransactionVisual() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between text-[#1A1E1C]">
        <div className="flex items-center gap-2.5">
          <InboxIcon />
          <span className="text-[15px] font-medium">Recent Transaction</span>
        </div>
        <SlidersIcon />
      </div>

      <table className="mt-6 w-full border-collapse text-left text-[14px] text-[#1A1E1C]">
        <thead>
          <tr className="border-b border-black/5">
            <th scope="col" className="pb-3 pr-2 font-normal text-[#8A8781]">Name</th>
            <th scope="col" className="pb-3 pr-2 font-normal text-[#8A8781]">Date</th>
            <th scope="col" className="pb-3 pr-2 font-normal text-[#8A8781]">Amount</th>
            <th scope="col" className="pb-3 font-normal text-[#8A8781]">Status</th>
          </tr>
        </thead>
        <tbody>
          {TRANSACTIONS.map((tx, index) => (
            <tr
              key={tx.name}
              className={`border-b border-black/5 last:border-b-0 ${index === TRANSACTIONS.length - 1 ? "opacity-50" : ""}`}
            >
              <td className="py-3 pr-2">{tx.name}</td>
              <td className="py-3 pr-2">{tx.date}</td>
              <td className="py-3 pr-2">{tx.amount}</td>
              <td className="py-3">
                <StatusPill status={tx.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Visual 2 — Automatic Daily Earnings                               */
/* ------------------------------------------------------------------ */

function AccountingVisual() {
  return (
    <div className="flex h-[240px] flex-col">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium text-[#1A1E1C]">Overview</span>
        <div className="flex items-center gap-1.5">
          {RANGE_TABS.map((tab) => (
            <span
              key={tab}
              className={
                tab === "1 Year"
                  ? "rounded-full bg-[#1A1E1C] px-3 py-1 text-[10px] leading-none font-medium text-[#F5F2E9]"
                  : "rounded-full border border-black/[0.06] px-3 py-1 text-[10px] leading-none font-medium text-[#A8A49A]"
              }
            >
              {tab}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-5 text-[12px] leading-none text-[#8A8781]">Avg Per month</p>
      <div className="mt-2 flex items-center gap-2">
        <p className="flex items-baseline text-[20px] leading-none font-semibold tracking-tight text-[#1A1E1C]">
          Rs. 250,345
        </p>
        <span className="inline-flex items-center gap-1 rounded-md bg-[#F1EFE9] px-1.5 py-1 text-[9px] leading-none font-medium text-[#6E6B64]">
          50.2%
          <svg viewBox="0 0 8 6" className="h-[5px] w-[7px]" aria-hidden="true">
            <path d="M4 0l4 6H0Z" fill="currentColor" />
          </svg>
        </span>
      </div>

      <div className="mt-auto flex items-end gap-2 pt-6">
        {MONTHS.map((month, index) => (
          <div key={month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-24 w-full items-end">
              <span
                className={
                  index === 7
                    ? "h-full w-full rounded-md bg-gradient-to-b from-black to-black/40"
                    : "w-full rounded-md bg-[#F1EFE9]"
                }
                style={index === 7 ? undefined : { height: `${BAR_HEIGHTS[index]}%` }}
              />
            </div>
            <span className="text-[10px] leading-none text-[#B4B0A6]">{month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Visual 3 — Referral Tracking                                      */
/* ------------------------------------------------------------------ */

function CollaborationVisual() {
  return (
    <div aria-hidden="true" className="relative -mx-7 -mt-7 h-[240px] overflow-hidden">
      <div className="absolute top-[58%] left-[46%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2">
        <svg viewBox="0 0 420 420" className="absolute inset-0 h-full w-full" fill="none">
          <g stroke="#E5E3DC" strokeWidth="1">
            {ORBIT_RADII.map((radius) => (
              <circle key={radius} cx="210" cy="210" r={radius} />
            ))}
          </g>
          <g fill="#D8D6E2">
            {ORBIT_DOTS.map((dot, index) => (
              <circle key={index} cx={dot.x} cy={dot.y} r={dot.r} />
            ))}
          </g>
        </svg>

        <Avatar className="absolute top-[39.3%] left-[35.7%] h-7 w-7 -translate-x-1/2 -translate-y-1/2 ring-[3px] ring-[#FFFEFB]" />
        <Avatar className="absolute top-[52.3%] left-[78.4%] h-7 w-7 -translate-x-1/2 -translate-y-1/2 ring-[3px] ring-[#FFFEFB]" />

        <span className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#1A1E1C] ring-1 ring-black/[0.05]">
          <ClockIcon />
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Visual 4 — Secure Accounts                                        */
/* ------------------------------------------------------------------ */

function ProtectionVisual() {
  return (
    <div aria-hidden="true" className="relative -mx-7 -mt-7 h-[240px] overflow-hidden">
      <svg
        viewBox="0 0 373 240"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        fill="none"
      >
        <g stroke="#D8D6E2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0 40h70a12 12 0 0 1 12 12v56a12 12 0 0 0 12 12h40" />
          <path d="M0 96h58a12 12 0 0 1 12-12V62a12 12 0 0 1 12-12h40" />
          <path d="M0 176h64a12 12 0 0 1 12 12v12a12 12 0 0 0 12 12h38" />
          <path d="M373 44h-71a12 12 0 0 0-12 12v36a12 12 0 0 1-12 12h-38" />
          <path d="M373 126h-81a12 12 0 0 1-12-12V96" />
          <path d="M373 192h-67a12 12 0 0 0-12-12v-28a12 12 0 0 1-12-12h-30" />
        </g>
        <g fill="#D8D6E2">
          <circle cx="134" cy="120" r="3.2" />
          <circle cx="122" cy="50" r="3.2" />
          <circle cx="126" cy="212" r="3.2" />
          <circle cx="240" cy="104" r="3.2" />
          <circle cx="280" cy="96" r="3.2" />
          <circle cx="252" cy="140" r="3.2" />
          <circle cx="82" cy="78" r="2.6" />
          <circle cx="70" cy="74" r="2.6" />
          <circle cx="290" cy="70" r="2.6" />
          <circle cx="294" cy="164" r="2.6" />
        </g>
      </svg>

      <span className="absolute top-1/2 left-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,#FFFEFB,rgba(255,254,251,0))]" />
      <span className="absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#1A1E1C]">
        <ShieldIcon />
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Visual 5 — Withdrawal Requests                                    */
/* ------------------------------------------------------------------ */

function DecisionsVisual() {
  return (
    <div aria-hidden="true" className="relative -mx-7 -mt-7 h-[240px] overflow-hidden">
      <svg
        viewBox="0 0 373 240"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        fill="none"
      >
        <g stroke="#E5E3DC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0 34h118" />
          <path d="M0 92h44a12 12 0 0 0 12 12v44" />
          <path d="M0 202h108" />
          <path d="M373 38h-73a12 12 0 0 0-12 12v2" />
          <path d="M373 110h-43a12 12 0 0 1-12-12" />
          <path d="M373 168h-39a12 12 0 0 0-12 12v16" />
          <path d="M0 140h36" />
        </g>
        <g fill="#D8D6E2">
          <circle cx="118" cy="34" r="3.2" />
          <circle cx="56" cy="148" r="3.2" />
          <circle cx="108" cy="202" r="3.2" />
          <circle cx="288" cy="52" r="3.2" />
          <circle cx="318" cy="98" r="3.2" />
          <circle cx="322" cy="196" r="3.2" />
          <circle cx="36" cy="140" r="3.2" />
        </g>
      </svg>

      <div className="relative z-10 flex h-full flex-col items-center justify-center">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-9 w-9 ring-2 ring-[#FFFEFB]" />
          <span className="text-left">
            <span className="block text-[13px] font-semibold tracking-tight text-[#1A1E1C]">
              Sana Iqbal
            </span>
            <span className="block text-[11px] leading-tight text-[#8A8781]">Member</span>
          </span>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <span className="rounded-full border border-black/10 px-3 py-1.5 text-[10px] leading-none font-medium text-[#6E6C66]">
            EasyPaisa
          </span>
          <span className="rounded-full bg-[#1A1E1C] px-3 py-1.5 text-[10px] leading-none font-medium text-[#F5F2E9]">
            Dispatched
          </span>
        </div>

        <div className="mt-6 flex items-center gap-1.5">
          {Array.from({ length: 7 }, (_, index) => (
            <span
              key={index}
              className={`h-[5px] w-6 rounded-full ${index < 3 ? "bg-[#1A1E1C]" : "bg-[#E5E3DC]"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                           */
/* ------------------------------------------------------------------ */

export default function PowerfulFeatures() {
  return (
    <section className="bg-[#F5F2E9] pt-8 pb-24">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <Reveal>
          <p className="mb-4 text-center text-[12px] font-medium tracking-[0.12em] text-[#8A8781] uppercase">
            Platform features
          </p>
          <h2 className="font-display text-center text-[clamp(36px,4.5vw,56px)] leading-[1.02] font-semibold tracking-[-0.03em]">
            <span className="block text-[#1A1E1C]">Plans, earnings, and withdrawals</span>
            <span className="block text-[#C8C4B8]">in one dashboard</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-6">
          <Reveal className="md:col-span-3">
            <FeatureCard
              visual={<TransactionVisual />}
              title="Live Balance and History"
              description="Your balance updates when a deposit is approved, daily profit is credited, or a withdrawal is dispatched."
            />
          </Reveal>
          <Reveal className="md:col-span-3" delay={0.1}>
            <FeatureCard
              visual={<AccountingVisual />}
              title="Automatic Daily Earnings"
              description="Every active plan earns profit each day, and referrers get 1.5% of it. The system credits both in one run and logs each entry."
            />
          </Reveal>
          <Reveal className="md:col-span-2">
            <FeatureCard
              visual={<CollaborationVisual />}
              title="Referral Tracking"
              description="Your dashboard lists every member you referred, their first deposit, and the commissions each one has generated."
            />
          </Reveal>
          <Reveal className="md:col-span-2" delay={0.08}>
            <FeatureCard
              visual={<ProtectionVisual />}
              title="Secure Accounts"
              description="Passwords are stored hashed and sessions are protected. Every credit, debit, bonus, and refund is written to a ledger, so balances are always traceable."
            />
          </Reveal>
          <Reveal className="md:col-span-2" delay={0.16}>
            <FeatureCard
              visual={<DecisionsVisual />}
              title="Withdrawal Requests"
              description="Requests above your balance are blocked. The amount is held while the admin reviews, and a rejection refunds it automatically."
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
