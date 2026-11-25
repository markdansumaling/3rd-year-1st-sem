import { useEffect, useState } from "react";

function Dashboard({
  onLogout,
  onAddOrder,
  onOrders,
  onCustomers,
  onPayment,
  onReports,
}) {
  const [user, setUser] = useState(null);

  const [statistics, setStatistics] = useState({
    total_orders: 0,
    pending_orders: 0,
    completed_orders: 0,
    total_sales: 0,
    active_services: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeMenu, setActiveMenu] = useState("dashboard");

  // Panatilihin ang kasalukuyang PHP API path.
  const API = "http://localhost/printing-management-system/api";

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/dashboard.php`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
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
        throw new Error(
          "Server returned invalid JSON. Please check the browser console."
        );
      }

      if (!data.success) {
        throw new Error(data.message || "Unable to load dashboard.");
      }

      setUser(data.user || null);

      setStatistics({
        total_orders: Number(data.statistics?.total_orders || 0),
        pending_orders: Number(data.statistics?.pending_orders || 0),
        completed_orders: Number(data.statistics?.completed_orders || 0),
        total_sales: Number(data.statistics?.total_sales || 0),
        active_services: Number(data.statistics?.active_services || 0),
      });
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const openMenu = (menu, callback) => {
    setActiveMenu(menu);

    if (typeof callback === "function") {
      callback();
    }
  };

  const menuStyle = (menu) => ({
    ...styles.menuButton,
    ...(activeMenu === menu ? styles.activeMenu : {}),
  });

  const formatMoney = (amount) =>
    `₱${Number(amount || 0).toFixed(2)}`;

  if (loading) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.messageCard}>
          <div style={styles.messageIcon}>⏳</div>
          <h2>Loading Dashboard...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.messageCard}>
          <div style={styles.messageIcon}>⚠️</div>
          <h2>Unable to load dashboard</h2>
          <p>{error}</p>

          <button
            type="button"
            style={styles.retryButton}
            onClick={loadDashboard}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* ADMIN SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarBrand}>
          <span style={styles.brandIcon}>🖨️</span>

          <h2 style={styles.sidebarLogo}>
            Printing Services
          </h2>
        </div>

        <div style={styles.sidebarDivider} />

        <p style={styles.sidebarLabel}>ADMIN MENU</p>

        <nav style={styles.navigation}>
          <button
            type="button"
            style={menuStyle("dashboard")}
            onClick={() => openMenu("dashboard")}
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            style={menuStyle("add-order")}
            onClick={() => openMenu("add-order", onAddOrder)}
          >
            <span>➕</span>
            <span>Add New Order</span>
          </button>

          <button
            type="button"
            style={menuStyle("orders")}
            onClick={() => openMenu("orders", onOrders)}
          >
            <span>📦</span>
            <span>Orders Management</span>
          </button>

          <button
            type="button"
            style={menuStyle("customers")}
            onClick={() => openMenu("customers", onCustomers)}
          >
            <span>👥</span>
            <span>Customers</span>
          </button>

          <button
            type="button"
            style={menuStyle("payments")}
            onClick={() => openMenu("payments", onPayment)}
          >
            <span>💰</span>
            <span>My Payments</span>
          </button>

          <button
            type="button"
            style={menuStyle("reports")}
            onClick={() => openMenu("reports", onReports)}
          >
            <span>📊</span>
            <span>Reports</span>
          </button>
        </nav>

        <div style={styles.sidebarBottom}>
          <div style={styles.adminInfo}>
            <div style={styles.adminAvatar}>👤</div>

            <div style={styles.adminText}>
              <strong>
                {user?.full_name || "Administrator"}
              </strong>

              <span>{user?.role || "admin"}</span>
            </div>
          </div>

          <div style={styles.sidebarDivider} />

          <button
            type="button"
            style={styles.logoutButton}
            onClick={onLogout}
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN DASHBOARD */}
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>
              🖨️ Printing Services
            </h1>

            <p style={styles.headerSubtitle}>
              Administrator Dashboard
            </p>
          </div>

          <div style={styles.headerAdmin}>
            <div style={styles.headerAvatar}>👤</div>

            <div>
              <strong>
                {user?.full_name || "Administrator"}
              </strong>

              <p style={styles.headerRole}>
                {user?.role || "admin"}
              </p>
            </div>
          </div>
        </header>

        {/* WELCOME */}
        <section style={styles.welcomeCard}>
          <div>
            <h2 style={styles.welcomeTitle}>
              Welcome back, {user?.full_name || "Administrator"}!
            </h2>

            <p style={styles.welcomeText}>
              Here's what's happening with your printing business today.
            </p>
          </div>

          <div style={styles.welcomeIcon}>🖨️</div>
        </section>

        {/* STATISTICS */}
        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                background: "#dbeafe",
              }}
            >
              📦
            </div>

            <div>
              <p style={styles.statLabel}>Total Orders</p>

              <h2 style={styles.statNumber}>
                {statistics.total_orders}
              </h2>
            </div>
          </div>

          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                background: "#fef3c7",
              }}
            >
              ⏳
            </div>

            <div>
              <p style={styles.statLabel}>Pending Orders</p>

              <h2 style={styles.statNumber}>
                {statistics.pending_orders}
              </h2>
            </div>
          </div>

          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                background: "#dcfce7",
              }}
            >
              ✅
            </div>

            <div>
              <p style={styles.statLabel}>Completed Orders</p>

              <h2 style={styles.statNumber}>
                {statistics.completed_orders}
              </h2>
            </div>
          </div>

          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                background: "#ede9fe",
              }}
            >
              💰
            </div>

            <div>
              <p style={styles.statLabel}>Total Sales</p>

              <h2 style={styles.statNumber}>
                {formatMoney(statistics.total_sales)}
              </h2>
            </div>
          </div>

          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                background: "#cffafe",
              }}
            >
              🛠️
            </div>

            <div>
              <p style={styles.statLabel}>Active Services</p>

              <h2 style={styles.statNumber}>
                {statistics.active_services}
              </h2>
            </div>
          </div>
        </section>

        {/* BUSINESS SUMMARY */}
        <section style={styles.contentCard}>
          <h2 style={styles.sectionTitle}>
            Business Summary
          </h2>

          <div style={styles.summaryGrid}>
            <div style={styles.summaryItem}>
              <span>Total Orders</span>

              <strong>
                {statistics.total_orders}
              </strong>
            </div>

            <div style={styles.summaryItem}>
              <span>Pending</span>

              <strong style={{ color: "#fbbf24" }}>
                {statistics.pending_orders}
              </strong>
            </div>

            <div style={styles.summaryItem}>
              <span>Completed</span>

              <strong style={{ color: "#4ade80" }}>
                {statistics.completed_orders}
              </strong>
            </div>

            <div style={styles.summaryItem}>
              <span>Sales</span>

              <strong style={{ color: "#c4b5fd" }}>
                {formatMoney(statistics.total_sales)}
              </strong>
            </div>
          </div>
        </section>

        <footer style={styles.footer}>
          Printing Services © {new Date().getFullYear()}
        </footer>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "stretch",
    gap: "24px",
    padding: "24px",
    boxSizing: "border-box",
    background: "linear-gradient(135deg, #030f2d, #092352)",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#ffffff",
  },

  sidebar: {
    width: "255px",
    minWidth: "255px",
    minHeight: "calc(100vh - 48px)",
    boxSizing: "border-box",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(180deg, #03183c, #021230)",
    border: "1px solid rgba(120,180,255,0.25)",
    borderRadius: "18px",
    boxShadow: "0 18px 45px rgba(0,0,0,0.3)",
  },

  sidebarBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "4px 4px 20px",
  },

  brandIcon: {
    fontSize: "30px",
    flexShrink: 0,
  },

  sidebarLogo: {
    margin: 0,
    fontSize: "17px",
    lineHeight: 1.4,
    color: "#ffffff",
    fontWeight: 800,
  },

  sidebarDivider: {
    height: "1px",
    background: "rgba(120,180,255,0.22)",
    margin: "12px 0",
  },

  sidebarLabel: {
    margin: "8px 10px 12px",
    color: "#7fa6cc",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1.5px",
  },

  navigation: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
  },

  menuButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 12px",
    border: "1px solid transparent",
    borderRadius: "10px",
    background: "transparent",
    color: "#d5e6ff",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    boxSizing: "border-box",
  },

  activeMenu: {
    background: "linear-gradient(135deg,#2563eb,#0645c4)",
    border: "1px solid rgba(100,170,255,0.35)",
    color: "#ffffff",
    boxShadow: "0 8px 20px rgba(0,70,220,0.25)",
  },

  sidebarBottom: {
    marginTop: "auto",
    paddingTop: "25px",
  },

  adminInfo: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "10px 4px",
  },

  adminAvatar: {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "rgba(80,150,255,0.25)",
    fontSize: "21px",
  },

  adminText: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    minWidth: 0,
    fontSize: "13px",
    overflowWrap: "anywhere",
  },

  logoutButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 12px",
    border: "1px solid rgba(100,160,255,0.25)",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.04)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 600,
    textAlign: "left",
    cursor: "pointer",
  },

  mainContent: {
    flex: 1,
    minWidth: 0,
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    flexWrap: "wrap",
    padding: "20px 24px",
    border: "1px solid rgba(120,180,255,0.28)",
    borderRadius: "18px",
    background:
      "linear-gradient(135deg, rgba(12,39,91,0.92), rgba(25,73,145,0.75))",
    boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
  },

  headerTitle: {
    margin: "0 0 7px",
    color: "#ffffff",
    fontSize: "26px",
    fontWeight: 800,
  },

  headerSubtitle: {
    margin: 0,
    color: "#cfe4ff",
    fontSize: "14px",
  },

  headerAdmin: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 14px",
    borderRadius: "14px",
    border: "1px solid rgba(150,205,255,0.22)",
    background: "rgba(255,255,255,0.07)",
    fontSize: "14px",
  },

  headerAvatar: {
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "rgba(80,150,255,0.25)",
    fontSize: "22px",
  },

  headerRole: {
    margin: "4px 0 0",
    color: "#b9d8ff",
    fontSize: "12px",
  },

  welcomeCard: {
    marginTop: "22px",
    padding: "28px 30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    border: "1px solid rgba(105,180,255,0.35)",
    borderRadius: "18px",
    background:
      "linear-gradient(120deg, rgba(10,54,135,0.95), rgba(8,37,100,0.88))",
    boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
  },

  welcomeTitle: {
    margin: "0 0 10px",
    color: "#ffffff",
    fontSize: "25px",
    fontWeight: 800,
  },

  welcomeText: {
    margin: 0,
    maxWidth: "520px",
    color: "#c5ddff",
    fontSize: "15px",
    lineHeight: 1.6,
  },

  welcomeIcon: {
    fontSize: "52px",
    flexShrink: 0,
  },

  statsGrid: {
    marginTop: "22px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
    gap: "16px",
  },

  statCard: {
    background:
      "linear-gradient(145deg, rgba(17,55,119,0.88), rgba(10,32,75,0.8))",
    border: "1px solid rgba(105,180,255,0.28)",
    padding: "20px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
  },

  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    flexShrink: 0,
  },

  statLabel: {
    margin: "0 0 6px",
    color: "#cfe4ff",
    fontSize: "13px",
  },

  statNumber: {
    margin: 0,
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: 800,
    overflowWrap: "anywhere",
  },

  contentCard: {
    marginTop: "22px",
    padding: "25px",
    border: "1px solid rgba(105,180,255,0.28)",
    borderRadius: "18px",
    background:
      "linear-gradient(145deg, rgba(11,42,91,0.86), rgba(8,28,65,0.76))",
    boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
  },

  sectionTitle: {
    margin: "0 0 8px",
    color: "#ffffff",
    fontSize: "22px",
    fontWeight: 800,
  },

  summaryGrid: {
    marginTop: "18px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
    gap: "14px",
  },

  summaryItem: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(150,205,255,0.14)",
    padding: "17px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    color: "#d5e6ff",
    fontSize: "14px",
  },

  footer: {
    padding: "24px 0 8px",
    color: "#7fa6cc",
    fontSize: "13px",
    textAlign: "center",
  },

  centerPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    boxSizing: "border-box",
    background: "linear-gradient(135deg, #030f2d, #092352)",
    color: "#ffffff",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  messageCard: {
    width: "100%",
    maxWidth: "480px",
    padding: "35px",
    textAlign: "center",
    border: "1px solid rgba(105,180,255,0.28)",
    borderRadius: "18px",
    background: "rgba(10,35,78,0.9)",
    boxShadow: "0 18px 45px rgba(0,0,0,0.28)",
    overflowWrap: "anywhere",
  },

  messageIcon: {
    fontSize: "42px",
    marginBottom: "12px",
  },

  retryButton: {
    marginTop: "15px",
    border: "1px solid rgba(120,190,255,0.35)",
    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    color: "#ffffff",
    padding: "12px 20px",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default Dashboard;