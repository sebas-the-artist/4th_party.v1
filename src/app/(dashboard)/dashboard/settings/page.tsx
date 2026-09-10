import "@/styles/dashboard.css";

const integrations = [
  {
    name: "Uber Eats",
    status: "Connected",
    detail: "Merchant account synced and reporting enabled.",
  },
  {
    name: "DoorDash",
    status: "Connected",
    detail: "Payouts and order error reports available.",
  },
  {
    name: "Grubhub",
    status: "Not connected",
    detail: "Add account access to start importing payouts.",
  },
];

export default function SettingsPage() {
  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-header__eyebrow">Settings</p>
          <h1 className="page-header__title">Integrations</h1>
          <p className="page-header__text">
            Manage the platforms and connections that feed reconciliation data into the app.
          </p>
        </div>

        <div className="page-header__meta">
          <p className="page-header__meta-label">Connected</p>
          <p className="page-header__meta-value">2</p>
        </div>
      </div>

      <div className="settings-grid">
        <article className="section-card">
          <h2 className="section-card__title">Platform connections</h2>
          <p className="section-card__text">
            Keep the delivery sources aligned so payout and exception data stays current.
          </p>

          <div className="settings-list">
            {integrations.map((item) => (
              <div key={item.name} className="settings-item">
                <div>
                  <p className="settings-item__title">{item.name}</p>
                  <p className="settings-item__text">{item.detail}</p>
                </div>

                <span
                  className={`status-badge ${
                    item.status === "Connected" ? "status-badge--good" : "status-badge--warn"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="section-card">
          <h2 className="section-card__title">Sync rules</h2>
          <p className="section-card__text">
            Later this can control date ranges, refresh cadence, and import permissions.
          </p>
        </article>
      </div>
    </section>
  );
}
