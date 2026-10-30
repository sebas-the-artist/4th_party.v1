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
            Palettes live in the browser. Change light, dark, and color here or
            on the landing page. Account sign-out is in the sidebar.
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
            Light uses the pale shade as the page. Dark inverts and puts the deep
            shade underneath.
          </p>
          <ThemeControls variant="panel" />
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
