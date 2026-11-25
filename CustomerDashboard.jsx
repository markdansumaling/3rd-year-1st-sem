import { useState } from "react";

function CustomerDashboard({
  user,
  onLogout,
  onCreateOrder,
  onOrders,
  onPayments,
  onProfile,
}) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [ordersExpanded, setOrdersExpanded] = useState(true);

  const customerName =
    user?.full_name || user?.username || "Customer";

  const handleDashboard = () => {
    setActiveMenu("dashboard");
  };

  const handleCreateOrder = () => {
    setActiveMenu("create-order");
    if (typeof onCreateOrder === "function") onCreateOrder();
  };

  const handleOrders = () => {
    setActiveMenu("orders");
    if (typeof onOrders === "function") onOrders();
  };

  const handlePayments = () => {
    setActiveMenu("payments");
    if (typeof onPayments === "function") onPayments();
  };

  const handleProfile = () => {
    setActiveMenu("profile");
    if (typeof onProfile === "function") onProfile();
  };

  const menuStyle = (menu) => ({
    ...styles.menuButton,
    ...(activeMenu === menu ? styles.activeMenu : {}),
  });

  const sampleOrders = [
    {
      id: "#0018",
      service: "Printing",
      status: "Processing",
      date: "Oct 12, 2026",
    },
    {
      id: "#0017",
      service: "Xerox",
      status: "Completed",
      date: "Oct 10, 2026",
    },
    {
      id: "#0016",
      service: "Lamination",
      status: "Pending",
      date: "Oct 8, 2026",
    },
    {
      id: "#0015",
      service: "Printing",
      status: "Completed",
      date: "Oct 5, 2026",
    },
    {
      id: "#0014",
      service: "Xerox",
      status: "Cancelled",
      date: "Oct 3, 2026",
    },
  ];

  return (
    <div style={styles.page}>
      {/* LEFT SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarBrand}>
          <span style={styles.brandIcon}>🖨️</span>
          <h2 style={styles.sidebarLogo}>
            Printing Services
          </h2>
        </div>

        <div style={styles.sidebarDivider} />

        <nav style={styles.navigation}>
          <button
            type="button"
            style={menuStyle("dashboard")}
            onClick={handleDashboard}
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            style={styles.menuButton}
            onClick={() =>
              setOrdersExpanded(!ordersExpanded)
            }
          >
            <span>📦</span>
            <span style={styles.menuLabel}>My Orders</span>
            <span style={styles.arrow}>
              {ordersExpanded ? "⌄" : "›"}
            </span>
          </button>

          {ordersExpanded && (
            <div style={styles.subMenu}>
              <button
                type="button"
                style={{
                  ...styles.subMenuButton,
                  ...(activeMenu === "create-order"
                    ? styles.activeSubMenu
                    : {}),
                }}
                onClick={handleCreateOrder}
              >
                <span>＋</span>
                <span>Add Order</span>
              </button>

              <button
                type="button"
                style={{
                  ...styles.subMenuButton,
                  ...(activeMenu === "orders"
                    ? styles.activeSubMenu
                    : {}),
                }}
                onClick={handleOrders}
              >
                <span>☷</span>
                <span>View Orders</span>
              </button>
            </div>
          )}

          <button
            type="button"
            style={menuStyle("payments")}
            onClick={handlePayments}
          >
            <span>💳</span>
            <span>Payments</span>
          </button>
        </nav>

        <div style={styles.sidebarBottom}>
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

      {/* MAIN CONTENT */}
      <main style={styles.mainContent}>
        {/* HEADER */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>
              🖨️ Printing Services
            </h1>
            <p style={styles.headerSubtitle}>
              Customer Dashboard
            </p>
          </div>

          <div style={styles.userBadge}>
            <div style={styles.avatar}>👤</div>
            <div>
              <strong style={styles.userName}>
                {customerName}
              </strong>
              <div style={styles.userRole}>
                {user?.role || "Customer"}
              </div>
            </div>
          </div>
        </header>

        {/* WELCOME CARD */}
        <section style={styles.welcomeCard}>
          <div>
            <h2 style={styles.welcomeTitle}>
              Welcome, {customerName}! 👋
            </h2>

            <p style={styles.welcomeText}>
              Manage your printing orders, payments, and profile
              from here.
            </p>
          </div>

          <div style={styles.welcomeIcon}>🖨️</div>
        </section>

        {/* RECENT ACTIVITY */}
        <section style={styles.contentCard}>
          <div style={styles.sectionHeading}>
            <h2 style={styles.sectionTitle}>
              🕒 Recent Activity
            </h2>

            <p style={styles.sectionDescription}>
              View the latest updates on your printing orders.
            </p>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Order ID</th>
                  <th style={styles.tableHeader}>Service</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Date</th>
                </tr>
              </thead>

              <tbody>
                {sampleOrders.map((order) => (
                  <tr key={order.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      {order.id}
                    </td>

                    <td style={styles.tableCell}>
                      {order.service}
                    </td>

                    <td style={styles.tableCell}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(order.status === "Completed"
                            ? styles.completedBadge
                            : order.status === "Processing"
                            ? styles.processingBadge
                            : order.status === "Pending"
                            ? styles.pendingBadge
                            : styles.cancelledBadge),
                        }}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td style={styles.tableCell}>
                      {order.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ORDER STATUS */}
        <section style={styles.contentCard}>
          <h2 style={styles.sectionTitle}>
            📦 Order Status
          </h2>

          <p style={styles.sectionDescription}>
            Check your printing order progress.
          </p>

          <div style={styles.statusEmpty}>
            <div style={styles.emptyIcon}>📋</div>

            <h3 style={styles.emptyTitle}>
              Track Your Orders
            </h3>

            <p style={styles.emptyText}>
              Visit My Orders to view your order details and
              check their latest status.
            </p>

            <button
              type="button"
              style={styles.createButton}
              onClick={handleOrders}
            >
              View My Orders
            </button>
          </div>
        </section>

        {/* ACCOUNT INFORMATION */}
        <section style={styles.contentCard}>
          <h2 style={styles.sectionTitle}>
            👤 Account Information
          </h2>

          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span>Full Name</span>
              <strong>
                {user?.full_name || user?.username || "Customer"}
              </strong>
            </div>

            <div style={styles.infoItem}>
              <span>Username</span>
              <strong>{user?.username || "-"}</strong>
            </div>

            <div style={styles.infoItem}>
              <span>Account Type</span>
              <strong style={{ color: "#93c5fd" }}>
                Customer
              </strong>
            </div>
          </div>

          {typeof onProfile === "function" && (
            <button
              type="button"
              style={styles.profileButton}
              onClick={handleProfile}
            >
              Manage My Profile
            </button>
          )}
        </section>

        {/* FOOTER */}
        <footer style={styles.footer}>
          Printing Services © {new Date().getFullYear()}
        </footer>
      </main>
    </div>
  );
}

const styles = {
  /* SIDEBAR */
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "stretch",
    gap: "24px",
    padding: "24px",
    boxSizing: "border-box",
    background: "linear-gradient(135deg, #030f2d, #092352)",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "white",
  },

  sidebar: {
    width: "250px",
    minWidth: "250px",
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
    margin: "4px 0 22px",
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
    fontSize: "15px",
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

  menuLabel: {
    flex: 1,
  },

  arrow: {
    marginLeft: "auto",
    fontSize: "18px",
  },

  subMenu: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginLeft: "19px",
    paddingLeft: "12px",
    borderLeft: "1px solid rgba(100,160,255,0.35)",
  },

  subMenuButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 10px",
    border: "1px solid transparent",
    borderRadius: "8px",
    background: "transparent",
    color: "#a9c6e8",
    textAlign: "left",
    fontSize: "14px",
    cursor: "pointer",
  },

  activeSubMenu: {
    background: "rgba(37,99,235,0.22)",
    color: "#ffffff",
    borderColor: "rgba(100,170,255,0.2)",
  },

  sidebarBottom: {
    marginTop: "auto",
    paddingTop: "30px",
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

  /* MAIN CONTENT */
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
    background: "linear-gradient(135deg, rgba(12,39,91,0.92), rgba(25,73,145,0.75))",
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

  userBadge: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 14px",
    borderRadius: "14px",
    border: "1px solid rgba(150,205,255,0.22)",
    background: "rgba(255,255,255,0.07)",
  },

  avatar: {
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "rgba(80,150,255,0.25)",
    fontSize: "22px",
  },

  userName: {
    color: "#ffffff",
    fontSize: "14px",
  },

  userRole: {
    marginTop: "4px",
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
    background: "linear-gradient(120deg, rgba(10,54,135,0.95), rgba(8,37,100,0.88))",
    boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
  },

  welcomeTitle: {
    margin: "0 0 10px",
    color: "#ffffff",
    fontSize: "27px",
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
    width: "85px",
    height: "85px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "22px",
    background: "rgba(80,150,255,0.15)",
    fontSize: "48px",
    flexShrink: 0,
  },

  /* RECENT ACTIVITY TABLE */
  contentCard: {
    marginTop: "22px",
    padding: "25px",
    border: "1px solid rgba(105,180,255,0.28)",
    borderRadius: "18px",
    background: "linear-gradient(145deg, rgba(11,42,91,0.86), rgba(8,28,65,0.76))",
    boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
  },

  sectionHeading: {
    marginBottom: "20px",
  },

  sectionTitle: {
    margin: "0 0 8px",
    color: "#ffffff",
    fontSize: "22px",
    fontWeight: 800,
  },

  sectionDescription: {
    margin: "0 0 18px",
    color: "#a9c9ef",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    borderRadius: "12px",
    border: "1px solid rgba(120,180,255,0.15)",
  },

  table: {
    width: "100%",
    minWidth: "550px",
    borderCollapse: "collapse",
    color: "#d5e6ff",
    fontSize: "14px",
  },

  tableHeader: {
    padding: "13px 14px",
    textAlign: "left",
    background: "rgba(37,99,235,0.15)",
    color: "#b9d8ff",
    fontWeight: 700,
    borderBottom: "1px solid rgba(120,180,255,0.2)",
  },

  tableRow: {
    borderBottom: "1px solid rgba(120,180,255,0.12)",
  },

  tableCell: {
    padding: "13px 14px",
    textAlign: "left",
    color: "#d5e6ff",
  },

  statusBadge: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "7px",
    fontSize: "12px",
    fontWeight: 700,
  },

  completedBadge: {
    background: "rgba(13,148,136,0.25)",
    color: "#5eead4",
  },

  processingBadge: {
    background: "rgba(37,99,235,0.3)",
    color: "#93c5fd",
  },

  pendingBadge: {
    background: "rgba(217,119,6,0.25)",
    color: "#fbbf24",
  },

  cancelledBadge: {
    background: "rgba(225,29,72,0.25)",
    color: "#fda4af",
  },

  /* ORDER STATUS */
  statusEmpty: {
    marginTop: "18px",
    padding: "30px 20px",
    border: "1px dashed rgba(120,180,255,0.3)",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.025)",
    textAlign: "center",
    color: "#bdd7f7",
  },

  emptyIcon: {
    fontSize: "40px",
    marginBottom: "10px",
  },

  emptyTitle: {
    margin: "8px 0",
    color: "#ffffff",
    fontSize: "19px",
  },

  emptyText: {
    margin: "0 auto",
    maxWidth: "400px",
    color: "#9fc4e8",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  createButton: {
    marginTop: "18px",
    padding: "12px 18px",
    border: "1px solid rgba(150,210,255,0.3)",
    borderRadius: "10px",
    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  /* ACCOUNT INFORMATION */
  infoGrid: {
    marginTop: "18px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: "14px",
  },

  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "17px",
    border: "1px solid rgba(150,205,255,0.14)",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.04)",
    color: "#9fc4e8",
    fontSize: "13px",
  },

  profileButton: {
    marginTop: "18px",
    padding: "11px 16px",
    border: "1px solid rgba(150,210,255,0.25)",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.07)",
    color: "#ffffff",
    cursor: "pointer",
  },

  footer: {
    padding: "24px 0 8px",
    color: "#7fa6cc",
    fontSize: "13px",
    textAlign: "center",
  },
};

export default CustomerDashboard;