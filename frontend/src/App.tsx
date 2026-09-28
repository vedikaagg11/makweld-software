import { useState } from "react";
import "./App.css";

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
};

type Page = "dashboard" | "sales" | "products" | "employees" | "reports" | "settings";

function App() {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  const [user, setUser] = useState<User | null>(
    storedUser ? JSON.parse(storedUser) : null,
  );

  const [page, setPage] = useState<Page>("dashboard");

  const handleLogin = async (email: string, password: string) => {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("dashboard");
  };

  if (!token || !user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>MAKWELD</h1>
          <span>CRM</span>
        </div>

        <nav className="navigation">
          <button
            className={page === "dashboard" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={page === "sales" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("sales")}
          >
            Sales
          </button>

          <button
            className={page === "products" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("products")}
          >
            Products
          </button>

          {user.role === "admin" && (
            <button
              className={
                page === "employees" ? "nav-item active" : "nav-item"
              }
              onClick={() => setPage("employees")}
            >
              Employees
            </button>
          )}

          <button
            className={page === "reports" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("reports")}
          >
            Reports
          </button>

          <button
            className={page === "settings" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("settings")}
          >
            Settings
          </button>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>{getPageTitle(page)}</h2>
          </div>

          <div className="user-info">
            <strong>{user.name}</strong>
            <span>{user.role}</span>
          </div>
        </header>

        <section className="content">
          {page === "dashboard" && <Dashboard user={user} />}
          {page === "sales" && <Placeholder title="Sales" />}
          {page === "products" && <Placeholder title="Products" />}
          {page === "employees" && user.role === "admin" && (
            <Placeholder title="Employees" />
          )}
          {page === "reports" && <Placeholder title="Reports" />}
          {page === "settings" && <Placeholder title="Settings" />}
        </section>
      </main>
    </div>
  );
}

function LoginScreen({
  onLogin,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      await onLogin(email, password);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="brand">
          <h1>MAKWELD</h1>
          <p>Sales & Management</p>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <button
          type="button"
          className="forgot-password"
          onClick={() => setMessage("Password reset will be added soon.")}
        >
          Forgot password?
        </button>

        {message && <p className="login-message">{message}</p>}
      </div>
    </main>
  );
}

function Dashboard({ user }: { user: User }) {
  return (
    <div>
      <div className="welcome-card">
        <h3>Welcome, {user.name}</h3>
        <p>Your Makweld CRM dashboard is ready.</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <span>Total Sales</span>
          <strong>—</strong>
        </div>

        <div className="dashboard-card">
          <span>Products</span>
          <strong>—</strong>
        </div>

        <div className="dashboard-card">
          <span>Employees</span>
          <strong>—</strong>
        </div>

        <div className="dashboard-card">
          <span>This Month</span>
          <strong>—</strong>
        </div>
      </div>
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="placeholder">
      <h3>{title}</h3>
      <p>This module will be built next.</p>
    </div>
  );
}

function getPageTitle(page: Page) {
  return page.charAt(0).toUpperCase() + page.slice(1);
}

export default App;