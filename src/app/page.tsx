import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { LandingAuth } from "@/components/landing-auth";
import { LandingHeroActions } from "@/components/landing-hero-actions";
import { ThemeControls } from "@/components/theme-controls";
import { WaitlistForm } from "@/components/waitlist-form";
import "@/styles/landing.css";

export default function Home() {
  return (
    <main className="landing">
      <div className="landing-main">
        <header className="landing-main__header">
          <p className="landing-main__brand">
            <BrandMark />
            4th<span className="landing-main__brand-mark">Party</span>
          </p>
          <nav className="landing-main__nav" aria-label="Landing">
            <a href="#how">How it works</a>
            <a href="#waitlist">Say hello</a>
            <LandingAuth />
          </nav>
        </header>

        <section className="landing-main__hero">
          <div className="landing-hero">
            <p className="landing-hero__eyebrow">For the person closing Sunday</p>
            <h1 className="landing-hero__title">Come in. The week is already laid out.</h1>
            <p className="landing-hero__lede">
              4th Party reads your POS, DoorDash or Uber, and the bank deposit —
              then shows, in one ledger, what still belongs to the restaurant.
              No extra dashboard to live in. Just a warm, quiet close after a
              loud week of tickets.
            </p>
            <LandingHeroActions />
          </div>

          <aside className="landing-ledger" aria-label="Sample week">
            <div className="landing-ledger__rule">
              <span>Good Burger · week 41</span>
              <span>Cape Coral</span>
            </div>
            <div className="landing-ledger__row">
              <div>
                <p className="landing-ledger__name">DoorDash DD-4418</p>
                <p className="landing-ledger__meta">Cooked on Toast, canceled unpaid</p>
              </div>
              <span className="status-badge status-badge--unpaid_cancellation">Cancel</span>
              <p className="landing-ledger__amount money">-$36.50</p>
            </div>
            <div className="landing-ledger__row">
              <div>
                <p className="landing-ledger__name">DoorDash DD-4420</p>
                <p className="landing-ledger__meta">Missing-item clawback, food still sold</p>
              </div>
              <span className="status-badge status-badge--short_pay">Short</span>
              <p className="landing-ledger__amount money">-$8.00</p>
            </div>
            <div className="landing-ledger__row">
              <div>
                <p className="landing-ledger__name">Uber UE-9188</p>
                <p className="landing-ledger__meta">Ticket, payout, and deposit agree</p>
              </div>
              <span className="status-badge status-badge--matched">Matched</span>
              <p className="landing-ledger__amount landing-ledger__amount--ok money">$0.00</p>
            </div>
            <div className="landing-ledger__foot">
              <span>Still owed this week</span>
              <p className="landing-ledger__variance money">-$72.30</p>
            </div>
          </aside>
        </section>

        <section id="how" className="landing-main__steps">
          <article className="landing-step">
            <p className="landing-step__index">01 · Bring the three files</p>
            <h2 className="landing-step__title">POS, delivery, bank.</h2>
            <p className="landing-step__text">
              Paste the CSVs you already download. Later, Toast, DoorDash, Uber,
              and the operating account fill the same columns. The matching logic
              does not get rewritten.
            </p>
          </article>
          <article className="landing-step">
            <p className="landing-step__index">02 · We match the week</p>
            <h2 className="landing-step__title">Ticket → payout → deposit.</h2>
            <p className="landing-step__text">
              Money is stored as integer cents. Commission comes from the rate
              you contracted, not from whatever the payout file decided to call a
              fee.
            </p>
          </article>
          <article className="landing-step">
            <p className="landing-step__index">03 · You send the letter</p>
            <h2 className="landing-step__title">From your inbox, not ours.</h2>
            <p className="landing-step__text">
              Unpaid cancellations and clawbacks get a note you paste into your
              own mail app or the platform portal. We never email DoorDash or
              Uber for you. Support only sees the restaurant.
            </p>
          </article>
        </section>

        <section className="landing-main__proof">
          <article className="landing-proof__card">
            <p className="landing-proof__kicker">Who it’s for</p>
            <h2 className="landing-proof__title">A handful of busy stores</h2>
            <p className="landing-proof__text">
              Pizza, burger, sushi. Owner-operators and controllers who would
              rather not spend Monday inside three spreadsheets.
            </p>
          </article>
          <article className="landing-proof__card">
            <p className="landing-proof__kicker">What you stop doing</p>
            <h2 className="landing-proof__title">Guessing at the lump deposit</h2>
            <p className="landing-proof__text">
              Gross, commission, cancellations, and the bank line sit in one
              cream ledger. If something is short, it has a name.
            </p>
          </article>
          <article className="landing-proof__card">
            <p className="landing-proof__kicker">What you keep</p>
            <h2 className="landing-proof__title">The money they quietly keep</h2>
            <p className="landing-proof__text">
              A few hundred dollars a week adds up. The product is the letter,
              not another chart.
            </p>
          </article>
        </section>

        <section id="waitlist" className="landing-main__cta">
          <h2 className="landing-cta__title">If this sounds like your Sunday, say hello.</h2>
          <p className="landing-cta__text">
            Leave a work email and the restaurant name. I’ll walk the Good
            Burger demo against a real week of yours. Auth, Postgres, and hosting
            plug into this same shape later — you won’t rebuild the close.
          </p>
          <WaitlistForm />
        </section>

        <footer className="landing-main__footer">
          <ThemeControls variant="dock" />
          <p>
            Good Burger is a made-up restaurant so the ledger has a week to
            show. Working name — unrelated to the mediation product at
            fourthparty.app.
          </p>
        </footer>
      </div>
    </main>
  );
}
