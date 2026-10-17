import Reveal from "@/components/Reveal";

/* ------------------------------------------------------------------ */
/*  Feature icons — lucide-style inline SVG, 28px, ink colored.        */
/* ------------------------------------------------------------------ */

function BookCopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-7 w-7 text-[#111413]"
    >
      <path d="M5 7a2 2 0 0 0-2 2v11" />
      <path d="M5.803 18H5a2 2 0 0 0 0 4h9.5a.5.5 0 0 0 .5-.5V21" />
      <path d="M9 15V4a2 2 0 0 1 2-2h9.5a.5.5 0 0 1 .5.5v14a.5.5 0 0 1-.5.5H11a2 2 0 0 1 0-4h10" />
    </svg>
  );
}

function FocusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-7 w-7 text-[#111413]"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M3 8.5v-3A2.5 2.5 0 0 1 5.5 3h3" />
      <path d="M15.5 3h3A2.5 2.5 0 0 1 21 5.5v3" />
      <path d="M21 15.5v3a2.5 2.5 0 0 1-2.5 2.5h-3" />
      <path d="M8.5 21h-3A2.5 2.5 0 0 1 3 18.5v-3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 text-[#111413]">
      <circle cx="12" cy="13.4" r="8.3" fill="currentColor" stroke="none" />
      <path
        d="m12 13.4 2.7-2.7"
        fill="none"
        stroke="#FFFEFB"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path d="M10 3.6h4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Features                                                           */
/* ------------------------------------------------------------------ */

const FEATURES = [
  {
    title: "Four Fixed Plans",
    description:
      "From Rs. 1,200 to Rs. 4,000. Your plan activates once the admin approves your deposit.",
    icon: <BookCopyIcon />,
  },
  {
    title: "10% Instant, 1.5% Daily",
    description:
      "You earn 10% of a referral's first approved deposit, then 1.5% of their daily profit. Both are paid by the platform, and neither reduces their earnings.",
    icon: <FocusIcon />,
  },
  {
    title: "Withdraw Anytime",
    description:
      "Cash out to SadaPay, EasyPaisa, or JazzCash. Your balance is checked first, and every request is reviewed before payout.",
    icon: <ClockIcon />,
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Why choose us                                                      */
/* ------------------------------------------------------------------ */

export default function WhyChooseUs() {
  return (
    <section aria-labelledby="why-choose-us-heading" className="w-full bg-paper py-24">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <Reveal>
          <p className="mb-5 text-[12px] font-medium tracking-[0.12em] text-[#8A8781] uppercase">
            Member benefits
          </p>

          <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <h2
              id="why-choose-us-heading"
              className="font-display text-[clamp(36px,4.5vw,56px)] leading-[1.02] font-semibold tracking-[-0.03em]"
            >
              <span className="block text-ink">Why members</span>
              <span className="block text-[#C8C4B8]">choose Veltra</span>
            </h2>
            <p className="max-w-[340px] text-[14px] leading-relaxed text-[#8A8781] md:text-right">
              Four fixed plans, daily profit, and referral commissions of 10% instant and
              1.5% daily. Every rupee you earn is visible in your dashboard.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.08}>
              <article className="flex h-full min-h-[310px] flex-col justify-between rounded-[14px] border border-black/[0.04] bg-[#FFFEFB] p-8 transition-transform duration-300 hover:-translate-y-0.5">
                {feature.icon}
                <div>
                  <h3 className="mb-2 text-[20px] font-medium tracking-tight text-[#1A1E1C]">
                    {feature.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-[#6E6C66]">
                    {feature.description}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
