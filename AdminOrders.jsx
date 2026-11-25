
import { useEffect, useState } from "react";

function AdminOrders({ onBack }) {
  const API = "http://localhost/printing-management-system/api";
  const PROJECT_URL = "http://localhost/printing-management-system";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // LOAD ALL ORDERS
  const loadOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/admin_orders.php`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error(`Server error: HTTP ${response.status}`);
      }

      if (!text.trim()) {
        throw new Error("Admin Orders API returned an empty response.");
      }

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("The server did not return valid JSON.");
      }

      if (!data.success) {
        throw new Error(data.message || "Unable to load orders.");
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      console.error("ADMIN ORDERS ERROR:", err);
      setError(err.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  // UPDATE ORDER STATUS
  const updateOrderStatus = async (orderId, newStatus) => {
    if (!orderId) {
      setError("Order ID is missing.");
      return;
    }

    setError("");
    setUpdatingOrderId(orderId);

    try {
      const response = await fetch(`${API}/update_order.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          order_id: Number(orderId),
          status: newStatus,
        }),
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error(`Server error: HTTP ${response.status}`);
      }

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Update Order API did not return valid JSON.");
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to update order status.");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) => {
          const currentId = order.order_id || order.id;

          return Number(currentId) === Number(orderId)
            ? { ...order, status: data.status || newStatus }
            : order;
        })
      );
    } catch (err) {
      console.error("UPDATE ORDER ERROR:", err);
      setError(err.message || "Unable to update order status.");
      await loadOrders();
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // UPDATE PAYMENT STATUS
  const updatePaymentStatus = async (orderId, paymentId, newStatus) => {
    if (!paymentId) {
      setError("Walang payment record para sa order na ito.");
      return;
    }

    setError("");
    setUpdatingOrderId(orderId);

    try {
      const response = await fetch(`${API}/payment.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          action: "update_status",
          payment_id: Number(paymentId),
          payment_status: newStatus,
        }),
      });

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Payment API did not return valid JSON.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update Payment Status.");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) => {
          const currentId = order.order_id || order.id;

          return Number(currentId) === Number(orderId)
            ? { ...order, payment_status: newStatus }
            : order;
        })
      );
    } catch (err) {
      console.error("UPDATE PAYMENT STATUS ERROR:", err);
      setError(err.message || "Unable to update Payment Status.");
      await loadOrders();
    } finally {
      setUpdatingOrderId(null);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // ORDER STATUS STYLE
  const getStatusStyle = (status) => {
    const value = String(status || "Pending").toLowerCase();

    if (value === "completed") {
      return {
        background: "rgba(34,197,94,0.18)",
        color: "#86efac",
        border: "1px solid rgba(74,222,128,0.28)",
      };
    }

    if (value === "processing") {
      return {
        background: "rgba(59,130,246,0.18)",
        color: "#93c5fd",
        border: "1px solid rgba(96,165,250,0.28)",
      };
    }

    if (value === "ready") {
      return {
        background: "rgba(245,158,11,0.18)",
        color: "#fcd34d",
        border: "1px solid rgba(251,191,36,0.28)",
      };
    }

    if (value === "cancelled" || value === "canceled") {
      return {
        background: "rgba(239,68,68,0.18)",
        color: "#fca5a5",
        border: "1px solid rgba(248,113,113,0.28)",
      };
    }

    return {
      background: "rgba(148,163,184,0.15)",
      color: "#cbd5e1",
      border: "1px solid rgba(148,163,184,0.22)",
    };
  };

  // PAYMENT STATUS STYLE
  const getPaymentStyle = (status) => {
    const value = String(status || "Pending").toLowerCase();

    if (value === "paid") {
      return {
        background: "rgba(34,197,94,0.18)",
        color: "#86efac",
        border: "1px solid rgba(74,222,128,0.28)",
      };
    }

    return {
      background: "rgba(245,158,11,0.18)",
      color: "#fcd34d",
      border: "1px solid rgba(251,191,36,0.28)",
    };
  };

  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // BUILD RECEIPT URL
  const getReceiptUrl = (path) => {
    if (!path) return "";

    const cleanPath = String(path).replace(/^\/+/, "");
    return `${PROJECT_URL}/${cleanPath}`;
  };

  const isImageReceipt = (path) =>
    /\.(jpg|jpeg|png|webp)$/i.test(String(path || ""));

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>🖨️ Printing Services</h1>
            <p style={styles.headerSubtitle}>
              Administrator • Manage Orders
            </p>
          </div>

          <div style={styles.adminBadge}>👨‍💼 Admin</div>
        </header>

        {/* MAIN CARD */}
        <section style={styles.card}>
          <div style={styles.titleRow}>
            <div>
              <h2 style={styles.title}>📋 Manage Orders</h2>
              <p style={styles.description}>
                View and manage all printing orders.
              </p>
            </div>

            <button
              type="button"
              style={{
                ...styles.refreshButton,
                ...(loading ? styles.disabledButton : {}),
              }}
              onClick={loadOrders}
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div style={styles.errorBox}>
              <span>⚠️ {error}</span>
              <button
                type="button"
                style={styles.retryButton}
                onClick={loadOrders}
              >
                Try Again
              </button>
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div style={styles.loadingBox}>
              <div style={styles.loadingIcon}>⏳</div>
              <h3 style={styles.loadingTitle}>Loading Orders...</h3>
              <p style={styles.loadingText}>Please wait.</p>
            </div>
          )}

          {/* EMPTY */}
          {!loading && !error && orders.length === 0 && (
            <div style={styles.emptyBox}>
              <div style={styles.emptyIcon}>📝</div>
              <h3 style={styles.emptyTitle}>No Orders Yet</h3>
              <p style={styles.emptyText}>
                There are no printing orders in the system.
              </p>
            </div>
          )}

          {/* ORDERS */}
          {!loading && orders.length > 0 && (
            <div style={styles.ordersList}>
              {orders.map((order, index) => {
                const total = Number(order.total_amount || 0);
                const statusStyle = getStatusStyle(order.status);
                const paymentStyle = getPaymentStyle(
                  order.payment_status
                );
                const orderId = order.order_id || order.id;
                const receiptPath = order.proof_of_payment;
                const receiptUrl = getReceiptUrl(receiptPath);
                const hasReceipt = Boolean(receiptPath);
                const paymentStatus =
                  order.payment_status === "Paid" ? "Paid" : "Pending";

                return (
                  <div key={orderId || index} style={styles.orderCard}>
                    {/* ORDER HEADER */}
                    <div style={styles.orderHeader}>
                      <div>
                        <span style={styles.orderLabel}>Order Number</span>
                        <strong style={styles.orderNumber}>
                          {order.order_number ||
                            `Order #${orderId || index + 1}`}
                        </strong>
                      </div>

                      <span
                        style={{
                          ...styles.statusBadge,
                          ...statusStyle,
                        }}
                      >
                        {order.status || "Pending"}
                      </span>
                    </div>

                    {/* CUSTOMER */}
                    <div style={styles.customerBox}>
                      <div style={styles.customerIcon}>👤</div>
                      <div>
                        <span style={styles.smallLabel}>Customer</span>
                        <strong style={styles.customerName}>
                          {order.customer_name ||
                            order.full_name ||
                            order.username ||
                            "—"}
                        </strong>
                      </div>
                    </div>

                    {/* ORDER INFORMATION */}
                    <div style={styles.orderGrid}>
                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>📄 Document</span>
                        <strong style={styles.infoValue}>
                          {order.document_name || "—"}
                        </strong>
                      </div>

                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>🖨️ Service</span>
                        <strong style={styles.infoValue}>
                          {order.service_name || "—"}
                        </strong>
                      </div>

                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>📄 Pages</span>
                        <strong style={styles.infoValue}>
                          {order.pages || 0}
                        </strong>
                      </div>

                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>📑 Copies</span>
                        <strong style={styles.infoValue}>
                          {order.copies || 0}
                        </strong>
                      </div>

                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>🖨️ Print Type</span>
                        <strong style={styles.infoValue}>
                          {order.print_type || "—"}
                        </strong>
                      </div>

                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>📃 Paper Size</span>
                        <strong style={styles.infoValue}>
                          {order.paper_size || "—"}
                        </strong>
                      </div>

                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>📑 Print Mode</span>
                        <strong style={styles.infoValue}>
                          {order.print_mode || "—"}
                        </strong>
                      </div>

                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>📅 Date</span>
                        <strong style={styles.infoValue}>
                          {formatDate(order.created_at)}
                        </strong>
                      </div>
                    </div>

                    {/* PROOF OF PAYMENT */}
                    <section style={styles.proofCard}>
                      <div style={styles.proofHeader}>
                        <span style={styles.proofIcon}>▣</span>
                        <h3 style={styles.proofTitle}>Proof of Payment</h3>
                      </div>

                      {hasReceipt ? (
                        <div style={styles.proofContent}>
                          <div style={styles.proofPreview}>
                            {isImageReceipt(receiptPath) ? (
                              <a
                                href={receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View full receipt"
                              >
                                <img
                                  src={receiptUrl}
                                  alt="Customer payment receipt"
                                  style={styles.receiptImage}
                                />
                              </a>
                            ) : (
                              <div style={styles.receiptFile}>
                                <span>📄</span>
                                <p>PDF Receipt</p>
                              </div>
                            )}

                            <a
                              href={receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={styles.viewReceiptButton}
                            >
                              👁 View Full Receipt
                            </a>
                          </div>

                          <div style={styles.proofDetails}>
                            <span style={styles.proofLabel}>
                              Payment Method
                            </span>
                            <strong style={styles.proofValue}>
                              {order.payment_method || "—"}
                            </strong>

                            <span style={styles.proofLabel}>Amount Paid</span>
                            <strong style={styles.proofValue}>
                              ₱{Number(order.amount_paid || 0).toFixed(2)}
                            </strong>

                            <span style={styles.proofLabel}>
                              Receipt Filename
                            </span>
                            <strong style={styles.proofValue}>
                              {String(receiptPath).split("/").pop()}
                            </strong>

                            <div style={styles.proofNotice}>
                              ℹ️ Verify the submitted payment proof before
                              marking the payment as Paid.
                            </div>

                            <div style={styles.proofStatusRow}>
                              <strong>Payment Status</strong>
                              <span
                                style={{
                                  ...styles.paymentBadge,
                                  ...paymentStyle,
                                }}
                              >
                                {paymentStatus}
                              </span>
                            </div>

                            {/* PAYMENT STATUS CONTROL */}
                            <div style={styles.paymentStatusControl}>
                              <label
                                htmlFor={`payment-status-${orderId}`}
                                style={styles.paymentStatusLabel}
                              >
                                Update Payment Status
                              </label>

                              <select
                                id={`payment-status-${orderId}`}
                                value={paymentStatus}
                                disabled={
                                  !order.payment_record_id ||
                                  updatingOrderId === orderId
                                }
                                onChange={(e) =>
                                  updatePaymentStatus(
                                    orderId,
                                    order.payment_record_id,
                                    e.target.value
                                  )
                                }
                                style={{
                                  ...styles.statusSelect,
                                  ...(updatingOrderId === orderId
                                    ? styles.selectDisabled
                                    : {}),
                                }}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                              </select>

                              {!order.payment_record_id && (
                                <span style={styles.proofLabel}>
                                  No payment record yet.
                                </span>
                              )}

                              {updatingOrderId === orderId && (
                                <span style={styles.updatingText}>
                                  Saving...
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={styles.noProof}>
                          <span style={{ fontSize: "30px" }}>📄</span>
                          <strong>No Proof of Payment Yet</strong>
                          <span>
                            The customer has not uploaded a receipt for
                            this order.
                          </span>
                        </div>
                      )}
                    </section>

                    {/* ORDER STATUS CONTROL - UNCHANGED */}
                    <div style={styles.statusControlBox}>
                      <div>
                        <span style={styles.infoLabel}>
                          ⚙️ Update Order Status
                        </span>
                        <strong style={styles.currentStatusText}>
                          Current: {order.status || "Pending"}
                        </strong>
                      </div>

                      <select
                        value={order.status || "Pending"}
                        disabled={updatingOrderId === orderId}
                        onChange={(e) =>
                          updateOrderStatus(orderId, e.target.value)
                        }
                        style={{
                          ...styles.statusSelect,
                          ...(updatingOrderId === orderId
                            ? styles.selectDisabled
                            : {}),
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Ready">Ready</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      {updatingOrderId === orderId && (
                        <span style={styles.updatingText}>Saving...</span>
                      )}
                    </div>

                    {/* ORDER FOOTER */}
                    <div style={styles.orderFooter}>
                      <div>
                        <span style={styles.infoLabel}>Payment</span>
                        <span
                          style={{
                            ...styles.paymentBadge,
                            ...paymentStyle,
                          }}
                        >
                          {paymentStatus}
                        </span>
                      </div>

                      <div style={styles.totalBox}>
                        <span>Total Amount</span>
                        <strong style={styles.totalAmount}>
                          ₱{total.toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* NAVIGATION */}
        <div style={styles.navigation}>
          <button
            type="button"
            style={styles.backButton}
            onClick={onBack}
          >
            ← Admin Dashboard
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

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, rgba(3,15,45,0.97), rgba(9,35,82,0.93)), url('/print.jpg') center/cover fixed",
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: "28px 24px",
    color: "white",
  },
  container: { width: "94%", maxWidth: "1200px", margin: "0 auto" },
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
    fontSize: "27px",
    margin: "0 0 6px",
    color: "white",
    fontWeight: "800",
  },
  headerSubtitle: { color: "#cfe4ff", margin: 0, fontSize: "14px" },
  adminBadge: {
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(150,210,255,0.30)",
    padding: "11px 18px",
    borderRadius: "22px",
    fontSize: "14px",
    fontWeight: "bold",
    color: "white",
  },
  card: {
    background:
      "linear-gradient(145deg, rgba(11,42,91,0.86), rgba(8,28,65,0.76))",
    border: "1px solid rgba(105,180,255,0.28)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    marginTop: "22px",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 18px 45px rgba(0,0,0,0.30)",
  },
  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "25px",
  },
  title: { color: "white", fontSize: "24px", margin: "0 0 7px", fontWeight: "800" },
  description: { color: "#bdd7f7", margin: 0, fontSize: "14px" },
  refreshButton: {
    border: "1px solid rgba(150,210,255,0.30)",
    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    color: "white",
    padding: "11px 17px",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  disabledButton: { opacity: 0.6, cursor: "not-allowed" },
  errorBox: {
    background: "rgba(239,68,68,0.14)",
    color: "#fecaca",
    borderLeft: "5px solid #ef4444",
    border: "1px solid rgba(248,113,113,0.30)",
    padding: "14px",
    borderRadius: "10px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    fontWeight: "bold",
  },
  retryButton: {
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(239,68,68,0.72)",
    color: "white",
    padding: "8px 13px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  loadingBox: {
    minHeight: "250px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#bdd7f7",
  },
  loadingIcon: {
    width: "65px",
    height: "65px",
    borderRadius: "18px",
    background: "rgba(80,150,255,0.13)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    marginBottom: "12px",
  },
  loadingTitle: { color: "white", margin: "5px 0" },
  loadingText: { color: "#9fc4e8", margin: 0, fontSize: "14px" },
  emptyBox: {
    minHeight: "280px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "#bdd7f7",
    border: "2px dashed rgba(120,180,255,0.30)",
    borderRadius: "14px",
    padding: "30px",
    background: "rgba(255,255,255,0.035)",
  },
  emptyIcon: {
    width: "70px",
    height: "70px",
    borderRadius: "18px",
    background: "rgba(80,150,255,0.13)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "40px",
    marginBottom: "12px",
  },
  emptyTitle: { color: "white", margin: "5px 0", fontSize: "20px" },
  emptyText: { color: "#9fc4e8", fontSize: "14px" },
  ordersList: { display: "flex", flexDirection: "column", gap: "18px" },
  orderCard: {
    border: "1px solid rgba(105,180,255,0.24)",
    borderRadius: "16px",
    padding: "20px",
    background:
      "linear-gradient(145deg, rgba(17,55,108,0.72), rgba(7,27,61,0.65))",
    boxShadow: "0 12px 30px rgba(0,0,0,0.20)",
  },
  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    paddingBottom: "16px",
    borderBottom: "1px solid rgba(150,205,255,0.18)",
  },
  orderLabel: {
    display: "block",
    color: "#8fb4d9",
    fontSize: "11px",
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  orderNumber: {
    display: "block",
    color: "#e6f2ff",
    fontSize: "18px",
    fontWeight: "800",
    overflowWrap: "anywhere",
  },
  statusBadge: {
    padding: "8px 13px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  customerBox: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background: "rgba(80,150,255,0.10)",
    border: "1px solid rgba(120,190,255,0.20)",
    padding: "14px",
    borderRadius: "12px",
    marginTop: "18px",
  },
  customerIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "rgba(110,170,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    flexShrink: 0,
  },
  smallLabel: { display: "block", color: "#8fb4d9", fontSize: "12px", marginBottom: "4px" },
  customerName: { color: "#e6f2ff", fontSize: "18px", overflowWrap: "anywhere" },
  orderGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    padding: "20px 0",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    minWidth: 0,
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(150,205,255,0.12)",
    padding: "14px",
    borderRadius: "11px",
  },
  infoLabel: { display: "block", color: "#8fb4d9", fontSize: "12px", marginBottom: "5px" },
  infoValue: { color: "#e6f2ff", fontSize: "14px", overflowWrap: "anywhere" },
  proofCard: {
    marginTop: "4px",
    marginBottom: "20px",
    border: "1px solid rgba(105,180,255,0.30)",
    borderRadius: "12px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.045)",
  },
  proofHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px 18px",
    background: "rgba(59,130,246,0.16)",
    borderBottom: "1px solid rgba(105,180,255,0.22)",
  },
  proofIcon: { fontSize: "23px", color: "#60a5fa" },
  proofTitle: { margin: 0, fontSize: "18px", color: "#e6f2ff" },
  proofContent: {
    display: "grid",
    gridTemplateColumns: "minmax(180px, 240px) minmax(0, 1fr)",
    gap: "22px",
    padding: "18px",
  },
  proofPreview: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(150,205,255,0.18)",
    borderRadius: "10px",
    minWidth: 0,
  },
  receiptImage: {
    display: "block",
    width: "100%",
    maxHeight: "280px",
    objectFit: "contain",
    borderRadius: "6px",
    background: "#ffffff",
  },
  receiptFile: {
    width: "100%",
    minHeight: "150px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#dbeafe",
    fontSize: "35px",
  },
  viewReceiptButton: {
    display: "inline-block",
    textAlign: "center",
    textDecoration: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "bold",
  },
  proofDetails: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "8px",
    minWidth: 0,
  },
  proofLabel: { color: "#9fc4e8", fontSize: "13px", marginTop: "5px" },
  proofValue: { color: "#f1f7ff", fontSize: "14px", overflowWrap: "anywhere" },
  proofNotice: {
    width: "100%",
    boxSizing: "border-box",
    marginTop: "10px",
    padding: "13px",
    borderRadius: "8px",
    background: "rgba(59,130,246,0.12)",
    border: "1px solid rgba(96,165,250,0.35)",
    color: "#bfdbfe",
    fontSize: "13px",
    lineHeight: 1.6,
  },
  proofStatusRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "14px",
    marginTop: "5px",
    color: "#e6f2ff",
    fontSize: "14px",
  },
  paymentStatusControl: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "8px",
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid rgba(150,205,255,0.18)",
  },
  paymentStatusLabel: {
    color: "#e6f2ff",
    fontSize: "13px",
    fontWeight: "bold",
  },
  noProof: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    padding: "28px 15px",
    textAlign: "center",
    color: "#bdd7f7",
    fontSize: "13px",
  },
  statusControlBox: {
    border: "1px solid rgba(105,180,255,0.22)",
    background: "rgba(37,99,235,0.10)",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    flexWrap: "wrap",
  },
  currentStatusText: { display: "block", color: "#dbeafe", fontSize: "13px", marginTop: "3px" },
  statusSelect: {
    minWidth: "190px",
    padding: "10px 12px",
    border: "1px solid rgba(120,190,255,0.30)",
    borderRadius: "9px",
    background: "#0b2a5b",
    color: "white",
    fontSize: "14px",
    fontWeight: "bold",
    outline: "none",
    cursor: "pointer",
  },
  selectDisabled: { opacity: 0.6, cursor: "not-allowed" },
  updatingText: { color: "#93c5fd", fontSize: "12px", fontWeight: "bold" },
  orderFooter: {
    borderTop: "1px solid rgba(150,205,255,0.18)",
    paddingTop: "16px",
    marginTop: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  paymentBadge: {
    display: "inline-block",
    padding: "6px 11px",
    borderRadius: "15px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  totalBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
    color: "#9fc4e8",
    fontSize: "12px",
  },
  totalAmount: { color: "#ffffff", fontSize: "21px", fontWeight: "800" },
  navigation: {
    marginTop: "22px",
    background: "rgba(11,42,91,0.78)",
    border: "1px solid rgba(105,180,255,0.24)",
    padding: "18px 22px",
    borderRadius: "16px",
  },
  backButton: {
    border: "1px solid rgba(150,205,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "#b9dcff",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
    padding: "9px 14px",
    borderRadius: "9px",
  },
  footer: { textAlign: "center", color: "#7fa6cc", fontSize: "13px", padding: "25px 0 10px" },
};

export default AdminOrders;
