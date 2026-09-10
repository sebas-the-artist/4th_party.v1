export default function DashboardTopbar() {
  return (
    <header className="topbar">
      <div className="topbar__search">
        <span className="topbar__search-icon">⌕</span>
        <input
          className="topbar__search-input"
          type="text"
          placeholder="Search store, payout, or exception"
        />
      </div>

      <div className="topbar__actions">
        <button className="topbar__button">Export</button>
        <button className="topbar__button topbar__button--primary">New review</button>
      </div>
    </header>
  );
}
