import { useEffect, useState } from "react";

const formatCountdown = (targetDate, now) => {
  if (!targetDate) {
    return "";
  }

  const remainingMs = Math.max(new Date(targetDate).getTime() - now, 0);
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
};

function AccountPage({
  user,
  theme,
  now,
  onToggleTheme,
  onNavigateDashboard,
  onUpdateProfile,
  onCancelDeleteAccount,
  onDeleteAccount,
  loading,
  message,
  error,
}) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    password: "",
  });

  useEffect(() => {
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
    });
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const success = await onUpdateProfile(formData);
    if (success) {
      setFormData((current) => ({ ...current, password: "" }));
    }
  };

  return (
    <div className="dashboard-shell">
      <header className="navbar">
        <div className="nav-brand">
          <span className="brand-mark">TM</span>
          <div>
            <span className="eyebrow">Account settings</span>
            <strong>Manage your profile</strong>
          </div>
        </div>
        <nav className="nav-actions">
          <button
            className={`icon-btn theme-toggle-btn ${theme === "dark" ? "dark-active" : "light-active"}`}
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="theme-orb" aria-hidden="true" />
            <svg className="theme-icon sun-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5.25a.75.75 0 0 1 .75.75v.35a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Zm0 12.4a.75.75 0 0 1 .75.75v.35a.75.75 0 0 1-1.5 0v-.35a.75.75 0 0 1 .75-.75Zm6.4-6.4a.75.75 0 0 1 .75.75v.35a.75.75 0 0 1-1.5 0V12a.75.75 0 0 1 .75-.75Zm-12.8 0a.75.75 0 0 1 .75.75v.35a.75.75 0 0 1-1.5 0V12a.75.75 0 0 1 .75-.75Zm10.03-4.38a.75.75 0 0 1 1.06 0l.24.25a.75.75 0 1 1-1.06 1.06l-.24-.25a.75.75 0 0 1 0-1.06Zm-8.32 8.32a.75.75 0 0 1 1.06 0l.24.24a.75.75 0 1 1-1.06 1.06l-.24-.24a.75.75 0 0 1 0-1.06Zm9.38 1.3a.75.75 0 0 1-1.06 0l-.24-.24a.75.75 0 1 1 1.06-1.06l.24.24a.75.75 0 0 1 0 1.06Zm-8.32-8.32a.75.75 0 0 1-1.06 0l-.24-.25a.75.75 0 1 1 1.06-1.06l.24.25a.75.75 0 0 1 0 1.06Z" />
              <path d="M12 8.1A3.9 3.9 0 1 0 15.9 12 3.9 3.9 0 0 0 12 8.1Zm0 1.5A2.4 2.4 0 1 1 9.6 12 2.4 2.4 0 0 1 12 9.6Z" />
            </svg>
            <svg className="theme-icon moon-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 4.2c.42 1.56 1.64 2.78 3.2 3.2-1.56.42-2.78 1.64-3.2 3.2-.42-1.56-1.64-2.78-3.2-3.2 1.56-.42 2.78-1.64 3.2-3.2Zm5.1 7.3c.27.99 1.05 1.77 2.04 2.04-.99.27-1.77 1.05-2.04 2.04-.27-.99-1.05-1.77-2.04-2.04.99-.27 1.77-1.05 2.04-2.04Zm-7.4 3.45c.33 1.22 1.28 2.17 2.5 2.5-1.22.33-2.17 1.28-2.5 2.5-.33-1.22-1.28-2.17-2.5-2.5 1.22-.33 2.17-1.28 2.5-2.5Z" />
            </svg>
          </button>
          <button className="ghost-btn" type="button" onClick={onNavigateDashboard}>
            Back to dashboard
          </button>
        </nav>
      </header>

      <section className="account-layout">
        <form className="account-card" onSubmit={handleSubmit}>
          <div className="section-heading">
            <div>
              <span className="pill">Profile</span>
              <h3>Update your account details</h3>
            </div>
          </div>

          <label>
            <span>Full name</span>
            <input name="name" type="text" value={formData.name} onChange={handleChange} required />
          </label>

          <label>
            <span>Email</span>
            <input name="email" type="email" value={formData.email} onChange={handleChange} required />
          </label>

          <label>
            <span>New password</span>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
              minLength={6}
            />
          </label>

          {message && <p className="form-message success-message">{message}</p>}
          {error && <p className="form-message error">{error}</p>}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </button>
        </form>

        <section className="account-card danger-zone">
          <div className="section-heading">
            <div>
              <span className="pill">Danger zone</span>
              <h3>Delete your account</h3>
            </div>
          </div>

          <p className="account-copy">
            This will permanently remove your profile, active tasks, and recycle bin items.
          </p>

          {user.pendingDeletion ? (
            <div className="deletion-banner">
              <strong>Account deletion scheduled</strong>
              <p>Your account will be removed in {formatCountdown(user.accountPurgeAt, now)}.</p>
              <button className="ghost-btn" type="button" onClick={onCancelDeleteAccount}>
                Cancel deletion request
              </button>
            </div>
          ) : (
            <button className="danger-btn" type="button" onClick={onDeleteAccount}>
              Delete account in 7 days
            </button>
          )}
        </section>
      </section>
    </div>
  );
}

export default AccountPage;
