"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

/* ------------------------------------------------------------------ */
/*  Logo cloud — wordmarks are plain text + inline SVG, single color.  */
/* ------------------------------------------------------------------ */

function SadaPayMark() {
  return (
    <span className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
        <path
          d="M13.6 3.4a9 9 0 1 1-4.4 2.1"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
      SadaPay
    </span>
  );
}

function EasyPaisaMark() {
  return (
    <span className="flex items-center gap-2 text-[15px] font-medium tracking-tight">
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
        <circle cx="9.5" cy="14.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="2.6" />
        <circle cx="14.5" cy="9.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="2.6" />
      </svg>
      EasyPaisa
    </span>
  );
}

function JazzCashMark() {
  return (
    <span className="flex items-center gap-2 text-[16px] font-normal tracking-tight">
      <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" aria-hidden="true">
        <path
          d="M12 3.5c4.7 0 8.5 3.4 8.5 7.6 0 4.2-3.8 7.6-8.5 7.6-1 0-2-.15-2.9-.44M12 3.5C7.3 3.5 3.5 6.9 3.5 11.1c0 2.5 1.35 4.7 3.45 6.1M8.2 20.5l2.4-3.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      JazzCash
    </span>
  );
}

const BRANDS = [
  <SadaPayMark key="sadapay" />,
  <EasyPaisaMark key="easypaisa" />,
  <JazzCashMark key="jazzcash" />,
];

/* ------------------------------------------------------------------ */
/*  Dashboard mock — pure HTML/SVG, sits between the rocks.            */
/* ------------------------------------------------------------------ */

const CARD_SHADOW = "shadow-[0_10px_30px_rgba(26,30,28,0.05)]";

function MemberRow() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-8 w-8 shrink-0 rounded-full bg-[#EDE9DC]" />
      <span className="min-w-0">
        <span className="block truncate text-[12px] font-semibold text-ink">
          Ahmed Raza
        </span>
        <span className="block text-[10px] text-[#A8A49A]">Member</span>
      </span>
    </div>
  );
}

const BARS = [34, 46, 40, 55, 44, 62, 50, 84, 56, 68, 48, 64];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function Dashboard({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <motion.div
      aria-hidden="true"
      data-reveal=""
      className="absolute inset-x-0 bottom-[13%] z-[1] hidden md:block"
      {...entrance(reduceMotion, 0.5, 24, 0.9)}
    >
      <div className="mx-auto flex w-[640px] items-end justify-between gap-3 opacity-70 [mask-image:linear-gradient(to_right,transparent,black_9%,black_91%,transparent)] lg:w-[880px] lg:gap-4 xl:w-[1060px]">
        <div className={`w-[136px] shrink-0 rounded-2xl bg-white p-3 lg:w-[190px] lg:p-4 ${CARD_SHADOW}`}>
          <MemberRow />
          <span className="mt-3 inline-block rounded-full bg-[#F1EEE4] px-2.5 py-1 text-[10px] font-medium text-[#6E6B64]">
            Active
          </span>
        </div>

        <div className={`w-[336px] shrink-0 rounded-2xl bg-white p-4 lg:w-[440px] lg:p-5 ${CARD_SHADOW}`}>
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-ink">Overview</span>
            <span className="flex items-center gap-1.5">
              {["3 Month", "6 Month", "1 Year"].map((label) => (
                <span
                  key={label}
                  className={
                    label === "1 Year"
                      ? "rounded-full bg-ink px-2.5 py-1 text-[9px] font-medium text-paper"
                      : "rounded-full border border-ink/10 bg-white px-2.5 py-1 text-[9px] font-medium text-[#A8A49A]"
                  }
                >
                  {label}
                </span>
              ))}
            </span>
          </div>

          <p className="mt-3 text-[10px] text-[#A8A49A]">Avg Per month</p>
          <div className="flex items-center gap-2">
            <p className="text-[22px] font-semibold tracking-tight text-ink">
              Rs. 250,345
            </p>
            <span className="rounded-full bg-[#F1EEE4] px-1.5 py-0.5 text-[9px] font-medium text-[#6E6B64]">
              +50.2%
            </span>
          </div>

          <div className="mt-4 flex h-[84px] items-end justify-between px-0.5">
            {BARS.map((height, i) => (
              <span
                key={i}
                style={{ height: `${height}%` }}
                className={`w-[7px] rounded-full ${i === 7 ? "bg-ink" : "bg-[#EDE9DF]"}`}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between px-0.5 text-[9px] leading-none text-[#B4B0A6]">
            {MONTHS.map((month) => (
              <span key={month}>{month}</span>
            ))}
          </div>
        </div>

        <div className="w-[136px] shrink-0 space-y-3 lg:w-[190px]">
          <div className={`rounded-2xl bg-white p-3 lg:p-4 ${CARD_SHADOW}`}>
            <div className="flex items-start justify-between">
              <span className="text-[12px] font-medium text-ink">Active Plans</span>
              <svg viewBox="0 0 72 24" className="hidden h-6 w-[72px] shrink-0 text-ink/70 lg:block" fill="none" aria-hidden="true">
                <path
                  d="M1 19 10 13 18 15 27 8 36 12 45 5 54 9 63 3 71 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="mt-1 text-[24px] font-semibold leading-none tracking-tight text-ink">1,260</p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-[#A8A49A]">
              <span className="hidden lg:inline">Since last month</span>
              <span className="flex items-center gap-0.5 font-medium text-[#6E6B64]">
                <svg viewBox="0 0 10 10" className="h-2 w-2" aria-hidden="true">
                  <path
                    d="M2 8 8 2M4 2h4v4"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                12.4%
              </span>
            </div>
          </div>
          <div className={`rounded-2xl bg-white p-3 lg:p-4 ${CARD_SHADOW}`}>
            <MemberRow />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                              */
/* ------------------------------------------------------------------ */

const BAND_MASK =
  "linear-gradient(to right, transparent 43.5%, black 46.5%, black 54.5%, transparent 57.5%)";

const HERO_SIZES = "(min-width: 768px) min(130vw, 1900px), (min-width: 640px) 150vw, 170vw";

const EASE = [0.22, 1, 0.36, 1] as const;

function entrance(reduceMotion: boolean | null, delay: number, y: number, duration: number) {
  return {
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: reduceMotion ? { duration: 0 } : { duration, delay, ease: EASE },
  };
}

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative w-full overflow-hidden bg-paper">
      {/* Nav */}
      <motion.header
        data-reveal=""
        className="absolute inset-x-0 top-6 z-30"
        {...entrance(reduceMotion, 0.2, 0, 0.6)}
      >
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 sm:px-10">
          <div className="flex items-center gap-5 rounded-full border border-ink/10 bg-white/40 py-1.5 pr-1.5 pl-5 backdrop-blur-md">
            <a href="#" className="flex items-center gap-2">
              <svg viewBox="0 0 12 12" className="h-3 w-3 text-ink" aria-hidden="true">
                <path d="M0.5 11.5 11.5 11.5 0.5 0.5Z" fill="currentColor" />
              </svg>
              <span className="font-display text-[15px] font-medium tracking-tight text-ink">
                Veltra
              </span>
            </a>
            <button
              type="button"
              aria-label="Open menu"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-ink transition-[opacity,transform] duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
            >
              <span className="flex flex-col items-center gap-[3px]">
                <span className="h-[1.5px] w-3.5 rounded-full bg-paper" />
                <span className="h-[1.5px] w-3.5 rounded-full bg-paper" />
                <span className="h-[1.5px] w-3.5 rounded-full bg-paper" />
              </span>
            </button>
          </div>

          <nav className="flex items-center gap-6 sm:gap-9">
            <a href="#" className="hidden text-[15px] font-medium text-ink sm:block">
              Register
            </a>
            <a
              href="#"
              className="rounded-full bg-ink px-6 py-2.5 text-[15px] font-medium text-paper transition-[opacity,transform] duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
            >
              Login
            </a>
          </nav>
        </div>
      </motion.header>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[92px] z-30 h-px bg-ink/[0.05]" />

      {/* Copy */}
      <div className="relative z-30 mx-auto w-full max-w-[1200px] px-6 pt-28 text-center sm:px-10">
        <motion.p
          data-reveal=""
          className="text-[11px] font-medium tracking-[0.12em] text-[#8A8781] uppercase"
          {...entrance(reduceMotion, 0.2, 24, 0.8)}
        >
          Built for investors in Pakistan
        </motion.p>
        <h1 className="font-display mx-auto mt-5 max-w-[900px] text-[clamp(40px,7vw,76px)] leading-[1.02] font-semibold tracking-[-0.04em]">
          <motion.span
            data-reveal=""
            className="block text-ink"
            {...entrance(reduceMotion, 0.28, 24, 0.8)}
          >
            Earn Daily Profit
          </motion.span>
          <motion.span
            data-reveal=""
            className="block text-[#C8C4B8]"
            {...entrance(reduceMotion, 0.36, 24, 0.8)}
          >
            Starting at Rs. 1,200
          </motion.span>
        </h1>
        <motion.p
          data-reveal=""
          className="mx-auto mt-7 max-w-[430px] text-[16px] leading-[1.6] text-[#8A8781]"
          {...entrance(reduceMotion, 0.4, 0, 0.8)}
        >
          Four fixed plans between Rs. 1,200 and Rs. 4,000. Deposit via SadaPay, and
          after admin approval your plan pays profit daily. Withdraw anytime to SadaPay,
          EasyPaisa, or JazzCash.
        </motion.p>
        <motion.div
          data-reveal=""
          className="mt-9 flex items-center justify-center gap-6"
          {...entrance(reduceMotion, 0.4, 0, 0.8)}
        >
          <a
            href="#"
            className="rounded-full bg-ink px-7 py-3.5 text-[15px] font-medium text-paper transition-[opacity,transform] duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
          >
            Create Free Account
          </a>
          <a href="#" className="text-[15px] font-medium text-ink">
            See How It Works
          </a>
        </motion.div>
      </div>

      {/* Logo cloud */}
      <div className="relative z-30 mx-auto mt-24 w-full max-w-[1080px] px-6 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] sm:px-10">
        <motion.div data-reveal="" {...entrance(reduceMotion, 0.85, 0, 0.8)}>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-[#9A978F] opacity-60 grayscale">
            {BRANDS}
          </div>
        </motion.div>
      </div>

      {/* Collage */}
      <div className="relative h-[300px] sm:h-[min(460px,64vw)] md:h-[min(520px,55.4vw)]">
        {/* Rings */}
        <div
          aria-hidden="true"
          className="absolute top-[-700px] left-1/2 z-0 h-[1150px] w-[2200px] -translate-x-1/2 [background:repeating-radial-gradient(circle_at_50%_65%,transparent_0_68px,rgba(0,0,0,0.05)_69px)] [mask-image:radial-gradient(circle_at_50%_65%,black_0%,black_30%,transparent_72%)]"
        />

        {/* Image stack: base scene -> dashboard -> masked hand/arm copy */}
        <div className="absolute bottom-0 left-1/2 z-20 w-[170%] max-w-[1900px] -translate-x-1/2 [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_75%,transparent)] sm:w-[150%] md:w-[130%]">
          <motion.div
            data-reveal=""
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 1.4, ease: EASE }}
          >
            <Image
              src="/Hero_bg.png"
              alt="Hand holding business credit card between rocks"
              width={7684}
              height={3276}
              priority
              sizes={HERO_SIZES}
              draggable={false}
              className="h-auto w-full select-none"
            />
            <Dashboard reduceMotion={reduceMotion} />
            <Image
              src="/Hero_bg.png"
              alt=""
              aria-hidden="true"
              width={7684}
              height={3276}
              priority
              sizes={HERO_SIZES}
              draggable={false}
              style={{ maskImage: BAND_MASK, WebkitMaskImage: BAND_MASK }}
              className="absolute inset-0 z-[2] h-full w-full select-none"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[16%] bg-gradient-to-b from-paper to-transparent"
            />
          </motion.div>
        </div>

        {/* Bottom feather to paper */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[25] h-44 bg-gradient-to-b from-transparent to-paper"
        />
      </div>
    </section>
  );
}
