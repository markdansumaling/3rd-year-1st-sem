
import { useEffect, useState } from "react";

const API = "http://localhost/printing-management-system/api";

function Customers({ onBack }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API}/users.php`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load customers."
          );
        }

        setCustomers(data.customers || []);
      } catch (err) {
        console.error("Customers error:", err);
        setError(err.message || "Unable to load customers.");
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Customer Management</h1>
          <p style={styles.subtitle}>
            View registered customer accounts
          </p>
        </div>

        <button style={styles.backButton} onClick={onBack}>
          ← Back to Dashboard
        </button>
      </header>

      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <h2>Customer List</h2>
          <span style={styles.count}>
            Total Customers: {customers.length}
          </span>
        </div>

        {loading ? (
          <p style={styles.message}>Loading customers...</p>
        ) : error ? (
          <div style={styles.error}>
            <p>{error}</p>
            <button
              style={styles.backButton}
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : customers.length === 0 ? (
          <p style={styles.message}>No customers found.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>User ID</th>
                  <th style={styles.th}>Username</th>
                  <th style={styles.th}>Full Name</th>
                  <th style={styles.th}>Role</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.user_id}>
                    <td style={styles.td}>{customer.user_id}</td>
                    <td style={styles.td}>{customer.username}</td>
                    <td style={styles.td}>{customer.full_name}</td>
                    <td style={styles.td}>
                      <span style={styles.role}>
                        {customer.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "30px",
    boxSizing: "border-box",
    background: "linear-gradient(135deg, #030f2d, #092352)",
    color: "#ffffff",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "25px",
    padding: "22px",
    borderRadius: "16px",
    background: "#102e60",
    border: "1px solid #31578a",
  },
  title: {
    margin: "0 0 8px",
    fontSize: "26px",
  },
  subtitle: {
    margin: 0,
    color: "#cfe0f7",
    fontSize: "14px",
  },
  backButton: {
    padding: "12px 16px",
    border: "none",
    borderRadius: "9px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  card: {
    padding: "24px",
    borderRadius: "16px",
    background: "#ffffff",
    color: "#172033",
    boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "20px",
  },
  count: {
    padding: "9px 12px",
    borderRadius: "8px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: "bold",
    fontSize: "14px",
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "14px",
    background: "#eaf1fb",
    borderBottom: "2px solid #d5dfed",
    color: "#183153",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px",
    borderBottom: "1px solid #e5e7eb",
    color: "#263449",
    fontSize: "14px",
  },
  role: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: "12px",
    fontWeight: "bold",
  },
  message: {
    padding: "25px 10px",
    textAlign: "center",
    color: "#475569",
  },
  error: {
    padding: "20px 0",
    color: "#b91c1c",
  },
};

export default Customers;
