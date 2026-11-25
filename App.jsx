
import { useState } from "react";

import Dashboard from "./Dashboard";
import CustomerDashboard from "./CustomerDashboard";
import CustomerProfile from "./CustomerProfile";
import AddOrder from "./AddOrder";
import Orders from "./Orders";
import Payment from "./Payment";
import CustomerPayment from "./CustomerPayment";
import CreateAccount from "./CreateAccount";
import AdminOrders from "./AdminOrders";
import Reports from "./Reports";
import Customers from "./Customers";

const API = "http://localhost/printing-management-system/api";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [accountType, setAccountType] = useState("admin");
  const [currentPage, setCurrentPage] = useState("login");

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/login.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error(`Server error: HTTP ${response.status}`);
      }

      if (!text.trim()) {
        throw new Error("Server returned an empty response.");
      }

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("The server did not return valid JSON.");
      }

      if (!data.success) {
        setError(data.message || "Incorrect username or password.");
        return;
      }

      if (!data.user) {
        setError("User information was not returned.");
        return;
      }

      const loggedUser = {
        ...data.user,
        user_id: data.user.user_id ?? data.user.id ?? null,
        full_name:
          data.user.full_name ??
          data.user.name ??
          data.user.username ??
          username.trim(),
        username: data.user.username ?? username.trim(),
        role: data.user.role ?? accountType,
      };

      const serverRole = String(loggedUser.role || "")
        .trim()
        .toLowerCase();

      if (serverRole !== accountType.toLowerCase()) {
        setError(
          `This account is registered as ${loggedUser.role}. Please select the correct account type.`
        );
        return;
      }

      if (serverRole !== "admin" && serverRole !== "customer") {
        setError("Unknown account role.");
        return;
      }

      setUser(loggedUser);
      setLoggedIn(true);
      setUsername("");
      setPassword("");
      setError("");

      setCurrentPage(
        serverRole === "admin" ? "dashboard" : "customer-dashboard"
      );
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(
        err.message ||
          "Unable to connect. Make sure XAMPP Apache and MySQL are running."
      );
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    try {
      await fetch(`${API}/logout.php`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
    } catch (err) {
      console.error("LOGOUT ERROR:", err);
    }

    setLoggedIn(false);
    setUser(null);
    setCurrentPage("login");
    setAccountType("admin");
    setUsername("");
    setPassword("");
    setError("");
  };

  // NAVIGATION
  const goToCustomerDashboard = () => {
    if (user) {
      setCurrentPage("customer-dashboard");
    }
  };

  const goToCreateOrder = () => {
    if (user) {
      setCurrentPage("add-order");
    }
  };

  const goToOrders = () => {
    if (user) {
      setCurrentPage("orders");
    }
  };

  const goToAdminOrders = () => {
    if (String(user?.role || "").trim().toLowerCase() === "admin") {
      setCurrentPage("admin-orders");
    }
  };

  const goToReports = () => {
    if (String(user?.role || "").trim().toLowerCase() === "admin") {
      setCurrentPage("reports");
    }
  };

  // CUSTOMERS PAGE
  const goToCustomers = () => {
    if (String(user?.role || "").trim().toLowerCase() === "admin") {
      setCurrentPage("customers");
    }
  };

  // SEPARATE CUSTOMER AND ADMIN PAYMENTS
  const goToPayment = () => {
    if (!user) return;

    const role = String(user.role || "").trim().toLowerCase();

    if (role === "customer") {
      setCurrentPage("customer-payment");
    } else if (role === "admin") {
      setCurrentPage("payment");
    }
  };

  const goToProfile = () => {
    if (user) {
      setCurrentPage("profile");
    }
  };

  const goToCreateAccount = () => {
    setError("");
    setUsername("");
    setPassword("");
    setCurrentPage("create-account");
  };

  const goToLogin = () => {
    setError("");
    setUsername("");
    setPassword("");
    setCurrentPage("login");
  };

  const handleAccountCreated = (createdUsername = "") => {
    setAccountType("customer");
    setUsername(createdUsername);
    setPassword("");
    setError("");
    setCurrentPage("login");
  };

  const handleBack = () => {
    if (!user) return;

    const role = String(user.role || "").trim().toLowerCase();

    setCurrentPage(
      role === "customer" ? "customer-dashboard" : "dashboard"
    );
  };

  // CREATE ACCOUNT PAGE
  if (!loggedIn && currentPage === "create-account") {
    return (
      <CreateAccount
        onBack={goToLogin}
        onAccountCreated={handleAccountCreated}
      />
    );
  }

  // LOGGED-IN PAGES
  if (loggedIn && user) {
    if (currentPage === "customer-dashboard") {
      return (
        <CustomerDashboard
          user={user}
          onLogout={handleLogout}
          onCreateOrder={goToCreateOrder}
          onOrders={goToOrders}
          onPayments={goToPayment}
          onProfile={goToProfile}
        />
      );
    }

    if (currentPage === "add-order") {
      return <AddOrder user={user} onBack={handleBack} />;
    }

    if (currentPage === "orders") {
      return (
        <Orders
          user={user}
          onBack={handleBack}
          onPayment={goToPayment}
          onCreateOrder={goToCreateOrder}
        />
      );
    }

    if (currentPage === "admin-orders") {
      return (
        <AdminOrders
          user={user}
          onBack={() => setCurrentPage("dashboard")}
        />
      );
    }

    if (currentPage === "reports") {
      return (
        <Reports
          user={user}
          onBack={() => setCurrentPage("dashboard")}
        />
      );
    }

    // CUSTOMERS PAGE
    if (currentPage === "customers") {
      if (String(user.role || "").trim().toLowerCase() !== "admin") {
        setCurrentPage("customer-dashboard");
        return null;
      }

      return (
        <Customers
          onBack={() => setCurrentPage("dashboard")}
        />
      );
    }

    // CUSTOMER PAYMENTS PAGE
    if (currentPage === "customer-payment") {
      return <CustomerPayment onBack={handleBack} />;
    }

    // EXISTING ADMIN PAYMENTS PAGE
    if (currentPage === "payment") {
      return (
        <Payment
          user={user}
          onBack={handleBack}
          onOrders={goToOrders}
        />
      );
    }

    if (currentPage === "profile") {
      return (
        <CustomerProfile
          user={user}
          onBack={goToCustomerDashboard}
        />
      );
    }

    // ADMIN DASHBOARD
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
        onAddOrder={goToCreateOrder}
        onOrders={goToAdminOrders}
        onCustomers={goToCustomers}
        onPayment={goToPayment}
        onReports={goToReports}
      />
    );
  }

  // LOGIN PAGE
  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html, body, #root {
          min-height: 100%;
          width: 100%;
        }

        body {
          font-family: Arial, Helvetica, sans-serif;
        }

        .login-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 35px 20px;
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(
              rgba(5, 18, 45, 0.68),
              rgba(8, 35, 75, 0.70)
            ),
            url("/print.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
        }

        .login-page::before {
          content: "";
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.30);
          filter: blur(90px);
          top: -200px;
          left: -150px;
          pointer-events: none;
        }

        .login-page::after {
          content: "";
          position: absolute;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          background: rgba(96, 165, 250, 0.25);
          filter: blur(90px);
          bottom: -180px;
          right: -150px;
          pointer-events: none;
        }

        .login-container {
          width: 100%;
          max-width: 470px;
          position: relative;
          z-index: 2;
        }

        .brand {
          text-align: center;
          color: white;
          margin-bottom: 22px;
          text-shadow: 0 3px 12px rgba(0, 0, 0, 0.45);
        }

        .brand-icon {
          width: 82px;
          height: 82px;
          margin: 0 auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.16);
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 22px;
          font-size: 42px;
          backdrop-filter: blur(8px);
          box-shadow: 0 10px 35px rgba(0,0,0,0.25);
        }

        .brand h1 {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 7px;
          color: white;
        }

        .brand p {
          color: #dbeafe;
          font-size: 14px;
        }

        .login-card {
          background: rgba(10, 25, 55, 0.30);
          padding: 32px;
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(12px);
        }

        .login-card h2 {
          color: white;
          text-align: center;
          font-size: 24px;
          margin-bottom: 7px;
        }

        .login-description {
          color: #dbeafe;
          text-align: center;
          font-size: 14px;
          margin-bottom: 25px;
        }

        .account-type-label {
          display: block;
          color: white;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .account-type-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 20px;
        }

        .account-type-button {
          border: 2px solid rgba(255, 255, 255, 0.30);
          background: rgba(255, 255, 255, 0.08);
          color: white;
          padding: 13px 10px;
          border-radius: 11px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          transition: all 0.2s ease;
        }

        .account-type-button:hover {
          border-color: #93c5fd;
          background: #eff6ff;
          color: #1e3a8a;
        }

        .account-type-button.active {
          border-color: #2563eb;
          background: rgba(37, 99, 235, 0.25);
          color: white;
        }

        .error-message {
          background: #fee2e2;
          color: #991b1b;
          border-left: 5px solid #dc2626;
          padding: 13px 14px;
          border-radius: 9px;
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: bold;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          display: block;
          color: white;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .form-group input {
          width: 100%;
          padding: 14px 15px;
          border: 1px solid rgba(255, 255, 255, 0.30);
          border-radius: 11px;
          font-size: 15px;
          outline: none;
          color: white;
          background: rgba(255, 255, 255, 0.10);
        }

        .form-group input::placeholder {
          color: #dbeafe;
        }

        .form-group input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .login-button {
          width: 100%;
          border: none;
          padding: 14px;
          border-radius: 11px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          margin-top: 5px;
          box-shadow: 0 7px 18px rgba(37, 99, 235, 0.25);
        }

        .login-button:hover {
          transform: translateY(-2px);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .login-links {
          margin-top: 18px;
          text-align: center;
        }

        .forgot-button {
          background: none;
          border: none;
          color: #bfdbfe;
          font-size: 13px;
          cursor: pointer;
          margin-bottom: 14px;
        }

        .forgot-button:hover,
        .create-account-button:hover {
          text-decoration: underline;
        }

        .create-account-text {
          color: #e2e8f0;
          font-size: 13px;
          margin-top: 8px;
        }

        .create-account-button {
          background: none;
          border: none;
          color: #bfdbfe;
          font-weight: bold;
          cursor: pointer;
          font-size: 13px;
          margin-left: 4px;
        }

        .login-footer {
          text-align: center;
          color: #dbeafe;
          font-size: 13px;
          margin-top: 18px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.5);
        }

        @media (max-width: 600px) {
          .login-page {
            padding: 25px 15px;
            background-attachment: scroll;
          }

          .login-card {
            padding: 24px 20px;
            border-radius: 18px;
          }

          .brand h1 {
            font-size: 23px;
          }

          .brand p {
            font-size: 13px;
          }

          .brand-icon {
            width: 70px;
            height: 70px;
            font-size: 35px;
          }

          .account-type-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="login-page">
        <div className="login-container">
          <div className="brand">
            <div className="brand-icon">🖨️</div>
            <h1>Printing Services</h1>
            <p>Manage your printing orders easily</p>
          </div>

          <div className="login-card">
            <h2>
              {accountType === "customer"
                ? "Customer Login"
                : "Admin Login"}
            </h2>

            <p className="login-description">
              Login to continue
            </p>

            <label className="account-type-label">
              Account Type
            </label>

            <div className="account-type-grid">
              <button
                type="button"
                className={`account-type-button ${
                  accountType === "admin" ? "active" : ""
                }`}
                onClick={() => {
                  setAccountType("admin");
                  setError("");
                  setUsername("");
                  setPassword("");
                }}
              >
                👨‍💼 Admin
              </button>

              <button
                type="button"
                className={`account-type-button ${
                  accountType === "customer" ? "active" : ""
                }`}
                onClick={() => {
                  setAccountType("customer");
                  setError("");
                  setUsername("");
                  setPassword("");
                }}
              >
                👤 Customer
              </button>
            </div>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? "Logging in..." : "🔐 Login"}
              </button>
            </form>

            {accountType === "customer" && (
              <div className="login-links">
                <button
                  type="button"
                  className="forgot-button"
                  onClick={() =>
                    alert(
                      "Forgot Password feature will be added next."
                    )
                  }
                >
                  Forgot Password?
                </button>

                <div className="create-account-text">
                  Don't have an account?
                  <button
                    type="button"
                    className="create-account-button"
                    onClick={goToCreateAccount}
                  >
                    Create New Account
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="login-footer">
            Printing Services © {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

