import Reveal from "@/components/Reveal";

type FooterLink = {
  label: string;
  external?: boolean;
};

const PLATFORM: FooterLink[] = [
  { label: "How It Works" },
  { label: "Plans & Pricing" },
  { label: "Referral Program" },
];

const ACCOUNT: FooterLink[] = [
  { label: "Register" },
  { label: "Login" },
  { label: "Dashboard" },
  { label: "Deposit Instructions" },
  { label: "Withdraw Request" },
];

const SUPPORT: FooterLink[] = [
  { label: "FAQ" },
  { label: "Contact & Support" },
  { label: "Terms & Conditions" },
];

const PAYMENTS: FooterLink[] = [
  { label: "SadaPay Deposits" },
  { label: "EasyPaisa Payouts" },
  { label: "JazzCash Payouts" },
];

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

function LinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav aria-label={title}>
      <h3 className="mb-5 text-[17px] font-semibold text-white">{title}</h3>
      <ul className="space-y-1">
        {links.map(({ label, external }) => (
          <li key={label}>
            <a
              href="#"
              className="block text-[15px] leading-loose font-medium tracking-[0.04em] text-white/70 uppercase transition-colors hover:text-white"
            >
              {label}
              {external ? (
                <span aria-hidden="true" className="ml-1.5 text-[13px]">
                  ↗
                </span>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function AddressColumn({ title, address }: { title: string; address: string }) {
  return (
    <div>
      <h3 className="mb-3 text-[17px] font-semibold text-white">{title}</h3>
      <p className="text-[16px] leading-snug text-white/70">{address}</p>
    </div>
  );
}

export default function Footer() {
  return (
    <>
      <section className="relative overflow-hidden bg-white pt-24 pb-16 text-center">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[380px]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(206,204,240,0.55)_26%,rgba(163,180,214,0.5)_42%,rgba(94,178,178,0.55)_56%,rgba(14,74,64,0.92)_76%,#07342A_100%)]" />
          <div className="absolute left-1/2 bottom-[-100px] h-[320px] w-[140%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(106,207,207,0.45),rgba(106,207,207,0)_78%)] blur-3xl" />
          <svg
            viewBox="0 0 1440 380"
            preserveAspectRatio="none"
            fill="none"
            className="absolute inset-0 h-full w-full"
          >
            <ellipse
              cx="720"
              cy="-3144"
              rx="2400"
              ry="3474"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span className="absolute top-[79%] left-[72%] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        </div>

        <div className="relative mx-auto w-full max-w-[1200px] px-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#EEF3F5] px-4 py-1.5 text-[13px] font-semibold tracking-[0.08em] text-[#4A5A60]">
            GET
            <BoltIcon />
            STARTED
          </p>

          <Reveal y={32}>
            <h2 className="font-display mx-auto mt-6 max-w-[1000px] text-[clamp(44px,7vw,88px)] leading-[0.95] font-extrabold tracking-[-0.04em] text-[#111414]">
              Start earning daily profit from Rs. 1,200
            </h2>
          </Reveal>

          <p className="mx-auto mt-6 max-w-[640px] text-[19px] leading-snug text-[#4A5A60]">
            Create a free account and pick one of four plans. Registration is instant, with
            no OTP and no email verification.
          </p>

          <Reveal y={32} delay={0.1}>
            <a
              href="#"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#171717] px-8 py-4 text-[15px] font-bold tracking-[0.04em] text-white transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#6ACFCF]" />
              CREATE FREE ACCOUNT
            </a>
          </Reveal>
        </div>
      </section>

      <footer className="bg-[#07342A] text-white">
        <Reveal delay={0.1} className="mx-auto w-full max-w-[1280px] px-8 pt-20 pb-8">
          <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
            <div>
              <a
                href="#"
                className="font-display inline-block text-[42px] font-semibold tracking-tight text-white"
              >
                Veltra<span className="text-[#6ACFCF]">.</span>
              </a>
            </div>
            <LinkColumn title="Platform" links={PLATFORM} />
            <LinkColumn title="Account" links={ACCOUNT} />
            <LinkColumn title="Support" links={SUPPORT} />
            <LinkColumn title="Payments" links={PAYMENTS} />
          </div>

          <div className="mt-16 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
            <div aria-hidden="true" className="hidden lg:block" />
            <AddressColumn title="Deposits" address="SadaPay transfers, reviewed by admin" />
            <AddressColumn title="Payouts" address="SadaPay, EasyPaisa, JazzCash" />
            <AddressColumn title="Currency" address="Pakistani Rupee (Rs.)" />
            <div>
              <h3 className="mb-3 text-[17px] font-semibold text-white">Contacts</h3>
              <a
                href="mailto:support@veltra.com"
                className="block text-[16px] tracking-[0.02em] text-white/70 uppercase transition-colors hover:text-white"
              >
                support@veltra.com
              </a>
              <a
                href="#"
                className="mt-3 inline-flex items-center gap-2 text-[16px] tracking-[0.02em] text-white/70 uppercase transition-colors hover:text-white"
              >
                <LinkedInIcon />
                LinkedIn
              </a>
            </div>
          </div>

          <div className="mt-16 h-[2px] w-full bg-gradient-to-r from-[#7B7BF0] via-[#6ACFCF] to-[#0A9B7A] opacity-70" />
        </Reveal>
      </footer>
    </>
  );
}
