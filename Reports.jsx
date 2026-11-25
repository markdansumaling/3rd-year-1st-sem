import { useEffect, useState } from "react";

function Reports({ user, onBack }) {
  const API =
    "http://localhost/printing-management-system/api";

  const defaultReports = {
    total_revenue: 0,
    total_orders: 0,
    completed_orders: 0,
    pending_orders: 0,
  };

  const [reports, setReports] = useState(defaultReports);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // LOAD REPORTS
  const loadReports = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/reports.php`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      console.log("REPORTS HTTP STATUS:", response.status);
      console.log(
        "REPORTS CONTENT TYPE:",
        response.headers.get("content-type")
      );

      const text = await response.text();

      console.log("RAW REPORTS RESPONSE:", text);

      if (!response.ok) {
        throw new Error(`Server error: HTTP ${response.status}`);
      }

      if (!text.trim()) {
        throw new Error("The server returned an empty response.");
      }

      let data;

      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error("REPORTS JSON PARSE ERROR:", jsonError);

        throw new Error(
          "The server returned invalid JSON. Please check reports.php."
        );
      }

      console.log("PARSED REPORTS DATA:", data);

      if (!data || data.success !== true) {
        throw new Error(data?.message || "Unable to load reports.");
      }

      if (!data.reports) {
        throw new Error(
          "Reports data was not returned by the server."
        );
      }

      setReports({
        total_revenue: Number(data.reports.total_revenue) || 0,
        total_orders: Number(data.reports.total_orders) || 0,
        completed_orders:
          Number(data.reports.completed_orders) || 0,
        pending_orders: Number(data.reports.pending_orders) || 0,
      });
    } catch (err) {
      console.error("REPORTS ERROR:", err);

      setError(
        err?.message ||
          "Unable to connect to the reports server."
      );
    } finally {
      setLoading(false);
    }
  };

  // LOAD WHEN PAGE OPENS
  useEffect(() => {
    loadReports();
  }, []);

  // LOADING SCREEN
  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.bigIcon}>📊</div>

          <h2 style={styles.cardTitle}>Loading Reports...</h2>

          <p style={styles.cardText}>
            Please wait while the reports are loading.
          </p>
        </div>
      </div>
    );
  }

  // ERROR SCREEN
  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.bigIcon}>⚠️</div>

          <h2 style={styles.cardTitle}>Unable to Load Reports</h2>

          <p style={styles.errorText}>{error}</p>

          <div style={styles.buttonRow}>
            <button
              type="button"
              style={styles.backButton}
              onClick={onBack}
            >
              ← Back to Dashboard
            </button>

            <button
              type="button"
              style={styles.retryButton}
              onClick={loadReports}
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // REPORTS PAGE
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>📊 Reports</h1>

            <p style={styles.headerSubtitle}>
              Printing Services
            </p>
          </div>

          <div style={styles.headerRight}>
            <div style={styles.userInfo}>
              <strong>
                {user?.full_name || "Administrator"}
              </strong>

              <span>{user?.role || "admin"}</span>
            </div>

            <button
              type="button"
              style={styles.backButton}
              onClick={onBack}
            >
              ← Back
            </button>
          </div>
        </header>

        {/* TITLE */}
        <section style={styles.titleCard}>
          <div>
            <h2 style={styles.pageTitle}>Business Reports</h2>

            <p style={styles.pageDescription}>
              View the current performance of your printing business.
            </p>
          </div>

          <div style={styles.titleIcon}>📈</div>
        </section>

        {/* STATISTICS */}
        <div style={styles.statsGrid}>
          {/* TOTAL REVENUE */}
          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                background: "rgba(168,85,247,0.16)",
                color: "#d8b4fe",
                border: "1px solid rgba(192,132,252,0.25)",
              }}
            >
              💰
            </div>

            <div>
              <p style={styles.statLabel}>Total Revenue</p>

              <h2 style={styles.statNumber}>
                ₱{Number(reports.total_revenue).toFixed(2)}
              </h2>
            </div>
          </div>

          {/* TOTAL ORDERS */}
          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                background: "rgba(37,99,235,0.16)",
                color: "#93c5fd",
                border: "1px solid rgba(96,165,250,0.25)",
              }}
            >
              📦
            </div>

            <div>
              <p style={styles.statLabel}>Total Orders</p>

              <h2 style={styles.statNumber}>
                {reports.total_orders}
              </h2>
            </div>
          </div>

          {/* COMPLETED ORDERS */}
          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                background: "rgba(34,197,94,0.15)",
                color: "#86efac",
                border: "1px solid rgba(74,222,128,0.25)",
              }}
            >
              ✅
            </div>

            <div>
              <p style={styles.statLabel}>Completed Orders</p>

              <h2 style={styles.statNumber}>
                {reports.completed_orders}
              </h2>
            </div>
          </div>

          {/* PENDING ORDERS */}
          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                background: "rgba(245,158,11,0.15)",
                color: "#fde68a",
                border: "1px solid rgba(251,191,36,0.25)",
              }}
            >
              ⏳
            </div>

            <div>
              <p style={styles.statLabel}>Pending Orders</p>

              <h2 style={styles.statNumber}>
                {reports.pending_orders}
              </h2>
            </div>
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <section style={styles.summaryCard}>
          <h2 style={styles.sectionTitle}>Order Summary</h2>

          <p style={styles.sectionDescription}>
            Current order status breakdown.
          </p>

          <div style={styles.summaryGrid}>
            <div style={styles.summaryItem}>
              <span>Total Orders</span>
              <strong>{reports.total_orders}</strong>
            </div>

            <div style={styles.summaryItem}>
              <span>Completed</span>

              <strong style={{ color: "#86efac" }}>
                {reports.completed_orders}
              </strong>
            </div>

            <div style={styles.summaryItem}>
              <span>Pending</span>

              <strong style={{ color: "#fde68a" }}>
                {reports.pending_orders}
              </strong>
            </div>
          </div>
        </section>

        {/* REVENUE SUMMARY */}
        <section style={styles.revenueCard}>
          <div style={styles.revenueIcon}>💰</div>

          <div>
            <p style={styles.revenueLabel}>Total Revenue</p>

            <h2 style={styles.revenueNumber}>
              ₱{Number(reports.total_revenue).toFixed(2)}
            </h2>

            <p style={styles.revenueText}>
              Based on completed orders.
            </p>
          </div>
        </section>

        {/* REPORT DETAILS */}
        <section style={styles.detailsCard}>
          <h2 style={styles.sectionTitle}>Report Details</h2>

          <div style={styles.detailsGrid}>
            <div style={styles.detailBox}>
              <span style={styles.detailLabel}>Total Orders</span>

              <strong style={styles.detailValue}>
                {reports.total_orders}
              </strong>
            </div>

            <div style={styles.detailBox}>
              <span style={styles.detailLabel}>
                Completed Orders
              </span>

              <strong
                style={{
                  ...styles.detailValue,
                  color: "#86efac",
                }}
              >
                {reports.completed_orders}
              </strong>
            </div>

            <div style={styles.detailBox}>
              <span style={styles.detailLabel}>
                Pending Orders
              </span>

              <strong
                style={{
                  ...styles.detailValue,
                  color: "#fde68a",
                }}
              >
                {reports.pending_orders}
              </strong>
            </div>

            <div style={styles.detailBox}>
              <span style={styles.detailLabel}>Total Revenue</span>

              <strong
                style={{
                  ...styles.detailValue,
                  color: "#d8b4fe",
                }}
              >
                ₱{Number(reports.total_revenue).toFixed(2)}
              </strong>
            </div>
          </div>
        </section>

        {/* REFRESH */}
        <div style={styles.refreshArea}>
          <button
            type="button"
            style={styles.refreshButton}
            onClick={loadReports}
          >
            🔄 Refresh Reports
          </button>
        </div>

        {/* FOOTER */}
        <footer style={styles.footer}>
          Printing Services © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}

// STYLES
const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, rgba(3,15,45,0.97), rgba(9,35,82,0.93)), url('/print.jpg') center/cover fixed",
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: "28px 24px",
    color: "white",
  },

  container: {
    width: "94%",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: {
    background:
      "linear-gradient(135deg, rgba(12,39,91,0.90), rgba(25,73,145,0.72))",
    border: "1px solid rgba(120,180,255,0.28)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    color: "white",
    padding: "25px 30px",
    borderRadius: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    boxShadow: "0 18px 45px rgba(0,0,0,0.30)",
  },

  headerTitle: {
    margin: "0 0 6px",
    fontSize: "28px",
    fontWeight: "800",
    color: "white",
  },

  headerSubtitle: {
    margin: 0,
    color: "#cfe4ff",
    fontSize: "14px",
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  userInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
    padding: "8px 12px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(150,205,255,0.20)",
  },

  backButton: {
    border: "1px solid rgba(150,210,255,0.30)",
    background: "rgba(255,255,255,0.10)",
    color: "white",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
  },

  titleCard: {
    marginTop: "22px",
    background:
      "linear-gradient(145deg, rgba(11,42,91,0.86), rgba(8,28,65,0.76))",
    border: "1px solid rgba(105,180,255,0.28)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    padding: "28px 30px",
    borderRadius: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    boxShadow: "0 18px 45px rgba(0,0,0,0.30)",
  },

  pageTitle: {
    margin: "0 0 8px",
    color: "white",
    fontSize: "24px",
    fontWeight: "800",
  },

  pageDescription: {
    margin: 0,
    color: "#9fc4e8",
    fontSize: "14px",
  },

  titleIcon: {
    width: "70px",
    height: "70px",
    borderRadius: "18px",
    background: "rgba(80,150,255,0.14)",
    border: "1px solid rgba(120,190,255,0.22)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "42px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
  },

  statsGrid: {
    marginTop: "22px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "16px",
  },

  statCard: {
    background:
      "linear-gradient(145deg, rgba(11,42,91,0.86), rgba(8,28,65,0.76))",
    border: "1px solid rgba(105,180,255,0.28)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    padding: "20px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 18px 45px rgba(0,0,0,0.26)",
  },

  statIcon: {
    width: "55px",
    height: "55px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    flexShrink: 0,
  },

  statLabel: {
    margin: "0 0 5px",
    color: "#9fc4e8",
    fontSize: "13px",
  },

  statNumber: {
    margin: 0,
    color: "white",
    fontSize: "25px",
    fontWeight: "800",
  },

  summaryCard: {
    marginTop: "22px",
    background:
      "linear-gradient(145deg, rgba(11,42,91,0.86), rgba(8,28,65,0.76))",
    border: "1px solid rgba(105,180,255,0.28)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    padding: "28px",
    borderRadius: "20px",
    boxShadow: "0 18px 45px rgba(0,0,0,0.30)",
  },

  sectionTitle: {
    margin: "0 0 6px",
    color: "white",
    fontSize: "21px",
    fontWeight: "800",
  },

  sectionDescription: {
    margin: "0 0 20px",
    color: "#9fc4e8",
    fontSize: "14px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: "15px",
  },

  summaryItem: {
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(150,205,255,0.14)",
    padding: "20px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#cfe4ff",
  },

  revenueCard: {
    marginTop: "22px",
    background:
      "linear-gradient(135deg, rgba(88,28,135,0.88), rgba(49,24,100,0.86))",
    border: "1px solid rgba(192,132,252,0.28)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    color: "white",
    padding: "30px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxShadow: "0 18px 45px rgba(0,0,0,0.30)",
  },

  revenueIcon: {
    width: "65px",
    height: "65px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.16)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    flexShrink: 0,
  },

  revenueLabel: {
    margin: "0 0 5px",
    color: "#ddd6fe",
    fontSize: "14px",
  },

  revenueNumber: {
    margin: "0 0 5px",
    fontSize: "30px",
    fontWeight: "800",
  },

  revenueText: {
    margin: 0,
    color: "#ede9fe",
    fontSize: "13px",
  },

  detailsCard: {
    marginTop: "22px",
    background:
      "linear-gradient(145deg, rgba(11,42,91,0.86), rgba(8,28,65,0.76))",
    border: "1px solid rgba(105,180,255,0.28)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    padding: "28px",
    borderRadius: "20px",
    boxShadow: "0 18px 45px rgba(0,0,0,0.30)",
  },

  detailsGrid: {
    marginTop: "20px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: "15px",
  },

  detailBox: {
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(150,205,255,0.14)",
    padding: "20px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  detailLabel: {
    color: "#9fc4e8",
    fontSize: "13px",
  },

  detailValue: {
    color: "white",
    fontSize: "24px",
    fontWeight: "800",
  },

  refreshArea: {
    display: "flex",
    justifyContent: "center",
    marginTop: "22px",
  },

  refreshButton: {
    border: "1px solid rgba(150,210,255,0.25)",
    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    color: "white",
    padding: "12px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
  },

  card: {
    background:
      "linear-gradient(145deg, rgba(11,42,91,0.90), rgba(8,28,65,0.82))",
    border: "1px solid rgba(105,180,255,0.28)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    maxWidth: "500px",
    margin: "100px auto",
    padding: "40px",
    textAlign: "center",
    borderRadius: "20px",
    boxShadow: "0 18px 45px rgba(0,0,0,0.30)",
    color: "white",
  },

  bigIcon: {
    fontSize: "48px",
    marginBottom: "15px",
    width: "75px",
    height: "75px",
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(80,150,255,0.14)",
    border: "1px solid rgba(120,190,255,0.22)",
  },

  cardTitle: {
    color: "white",
    marginBottom: "10px",
    fontSize: "22px",
  },

  cardText: {
    color: "#9fc4e8",
    margin: 0,
    lineHeight: "1.5",
  },

  errorText: {
    color: "#fecaca",
    background: "rgba(239,68,68,0.14)",
    border: "1px solid rgba(248,113,113,0.25)",
    padding: "12px",
    borderRadius: "9px",
    marginTop: "15px",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  buttonRow: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  retryButton: {
    border: "1px solid rgba(150,210,255,0.30)",
    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    color: "white",
    padding: "11px 18px",
    borderRadius: "9px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.22)",
  },

  footer: {
    textAlign: "center",
    color: "#7fa6cc",
    fontSize: "13px",
    padding: "25px 0 10px",
  },
};

export default Reports;