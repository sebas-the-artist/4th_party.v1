import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { SupportLink } from "@/components/support-link";
import { ThemeControls } from "@/components/theme-controls";
import { SUPPORT_EMAIL } from "@/lib/config";
import { getScopedWorkspace } from "@/lib/workspace";

export default async function SettingsPage() {
  const { workspace, location } = await getScopedWorkspace();

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="page-header__kicker">Settings</p>
          <h1 className="page-header__title">Workspace</h1>
          <p className="page-header__text">
            Palettes live in the browser. Light, dark, color-vision, and animal
            themes are here and on the landing page. Sign-out is the account
            menu in the top right.
          </p>
        </div>
      </header>

      <section className="section">
        <h2 className="section__title">Letter signature</h2>
        <article className="note-card">
          <p className="metric-card__label">Name, title, phone, merchant email</p>
          <p className="page-header__text">
            Open drafts always use this block. Edit it, save, then open a
            letter — the old name is replaced, not left sitting under a “saved”
            toast.
          </p>
          <ContactForm
            contact={workspace.contact}
            businessName={location?.name ?? workspace.locations[0]?.name ?? "Good Burger"}
          />
        </article>
      </section>

      <section className="section">
        <h2 className="section__title">Look</h2>
        <article className="note-card">
          <p className="metric-card__label">Light, dark, and a named mix</p>
          <p className="page-header__text">
            Light uses the pale shade as the page. Dark puts the deep shade
            underneath. Names on the dots follow the page, so they stay readable
            in both. Hover a dot for the name; the blurb under the row says why
            it is called Bee or Tritanope.
          </p>
          <ThemeControls variant="panel" />
        </article>
      </section>

      <section className="section">
        <h2 className="section__title">Billing</h2>
        <article className="note-card">
          <p className="page-header__text">
            First store is $39 / month, each extra store $29, plus 10% of
            payout-confirmed recoveries. Stripe is not on yet.
          </p>
          <Link className="button button--ghost" href="/dashboard/billing">
            Open billing
          </Link>
        </article>
      </section>

      <section className="section">
        <h2 className="section__title">Support</h2>
        <article className="note-card">
          <SupportLink />
          <p className="page-header__text">
            Replace <code>NEXT_PUBLIC_SUPPORT_EMAIL</code> ({SUPPORT_EMAIL}) when the
            real domain is ready.
          </p>
          <Link className="button button--ghost" href="/dashboard/reports">
            Copy a week note
          </Link>
        </article>
      </section>
    </section>
  );
}
