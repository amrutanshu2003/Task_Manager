import { useState } from "react";

const initialForm = {
  name: "",
  email: "",
  password: "",
};

function AuthForm({ mode, onSubmit, loading, error, onSwitchMode }) {
  const [formData, setFormData] = useState(initialForm);

  const isSignup = mode === "signup";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(formData);
    setFormData((current) => ({ ...current, password: "" }));
  };

  return (
    <div className="auth-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Your daily work, beautifully organized</span>
          <h1>Stay clear. Work calm. Finish on time.</h1>
          <p>
            Keep your day structured with a simple workspace for planning tasks,
            tracking progress, and staying focused on what needs attention now.
          </p>
        </div>
        <div className="hero-stats">
          <article>
            <strong>Simple daily planning</strong>
            <span>Add, update, and manage your tasks without clutter.</span>
          </article>
          <article>
            <strong>Everything in one place</strong>
            <span>Keep pending work, deadlines, and progress together.</span>
          </article>
          <article>
            <strong>Clean and modern experience</strong>
            <span>Designed to feel smooth, focused, and easy to use.</span>
          </article>
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-header">
          <span className="pill">{isSignup ? "Create account" : "Welcome back"}</span>
          <h2>{isSignup ? "Start organizing your work" : "Sign in to your workspace"}</h2>
          <p>{isSignup ? "Create your account in a few seconds." : "Pick up where you left off."}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignup && (
            <label>
              <span>Full name</span>
              <input
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>
          )}

          <label>
            <span>Email</span>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              name="password"
              type="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </label>

          {error && <p className="form-message error">{error}</p>}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="switch-copy">
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <button type="button" onClick={onSwitchMode}>
            {isSignup ? "Sign in" : "Create account"}
          </button>
        </p>
      </section>
    </div>
  );
}

export default AuthForm;
