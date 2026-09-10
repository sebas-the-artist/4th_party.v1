import "@/styles/landing.css";

export default function Home() {
  return (
    <main className="landing">
      <section className="landing__container">
        <header className="header">
          <div className="header__brand">
            <p className="header__text-primary">4thParty</p>
          </div>

          <a href="#waitlist" className="header__button">
            Get early access
          </a>
        </header>

        <div className="landing__hero">
          <div className="landing__content">
            <p className="landing__eyebrow">
              Find delivery payout leaks before they disappear into the close.
            </p>

            <h1 className="landing__headline">
              Reconcile DoorDash, Uber Eats, and bank payouts without the spreadsheet mess.
            </h1>

            <p className="landing__description">
              4thParty connects your POS, delivery platforms, and bank deposits so your 
              team can see what was sold, what was deducted, and what actually landed.
            </p>

            <div className="landing__actions">
              <a href="#waitlist" className="landing__button landing__button--primary">
                Join the waitlist
              </a>
              <a href="#how-it-works" className="landing__button landing__button--secondary">
                See how it works
              </a>
            </div>

            <div className="landing__cards">
              <div className="feature-card">
                <p className="feature-card__title">Payout matching</p>
                <p className="feature-card__text">Match sales, fees, and deposits automatically.</p>
              </div>
              <div className="feature-card">
                <p className="feature-card__title">Exception alerts</p>
                <p className="feature-card__text">Flag missing funds, short pays, and odd charges.</p>
              </div>
              <div className="feature-card">
                <p className="feature-card__title">Audit trail</p>
                <p className="feature-card__text">Keep a clean record for finance and disputes.</p>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card__topbar">
              <span className="dashboard-card__dot dashboard-card__dot--red" />
              <span className="dashboard-card__dot dashboard-card__dot--yellow" />
              <span className="dashboard-card__dot dashboard-card__dot--green" />
            </div>

            <div className="dashboard-card__body">
              <div className="dashboard-card__panel">
                <p className="dashboard-card__label">Today’s reconciliation</p>

                <div className="dashboard-card__rows">
                  <div className="dashboard-card__row">
                    <div>
                      <p className="dashboard-card__row-title">DoorDash sales</p>
                      <p className="dashboard-card__row-status">matched</p>
                    </div>
                    <p className="dashboard-card__row-value">$8,420.00</p>
                  </div>

                  <div className="dashboard-card__row">
                    <div>
                      <p className="dashboard-card__row-title">Uber Eats deposits</p>
                      <p className="dashboard-card__row-status">matched</p>
                    </div>
                    <p className="dashboard-card__row-value">$6,184.30</p>
                  </div>

                  <div className="dashboard-card__row">
                    <div>
                      <p className="dashboard-card__row-title">Unexplained deductions</p>
                      <p className="dashboard-card__row-status dashboard-card__row-status--warning">
                        needs review
                      </p>
                    </div>
                    <p className="dashboard-card__row-value">$312.40</p>
                  </div>
                </div>
              </div>

              <div className="dashboard-card__stats">
                <div className="dashboard-card__stat">
                  <p className="dashboard-card__stat-label">Recovered this month</p>
                  <p className="dashboard-card__stat-value">$12,480</p>
                </div>
                <div className="dashboard-card__stat">
                  <p className="dashboard-card__stat-label">Open exceptions</p>
                  <p className="dashboard-card__stat-value">14</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section id="how-it-works" className="steps">
          <div className="steps__item">
            <p className="steps__number">01</p>
            <h2 className="steps__title">Connect</h2>
            <p className="steps__text">Add delivery, POS, and bank sources in one place.</p>
          </div>
          <div className="steps__item">
            <p className="steps__number">02</p>
            <h2 className="steps__title">Match</h2>
            <p className="steps__text">Compare sales, fees, refunds, and deposits.</p>
          </div>
          <div className="steps__item">
            <p className="steps__number">03</p>
            <h2 className="steps__title">Resolve</h2>
            <p className="steps__text">Review exceptions and export disputes or entries.</p>
          </div>
        </section>

        <section id="waitlist" className="cta">
          <div className="cta__box">
            <p className="cta__eyebrow">Early access</p>

            <div className="cta__content">
              <div className="cta__copy">
                <h2 className="cta__headline">
                  Built for operators who are tired of chasing missing money.
                </h2>
                <p className="cta__text">
                  Start with a simple reconciliation layer. Add automation when the workflow is proven.
                </p>
              </div>

              <a href="mailto:hello@ledgerdock.io" className="cta__button">
                Contact us
              </a>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
