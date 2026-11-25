import { useEffect, useState } from "react";

function Orders({
  user,
  onBack,
  onPayment,
  onCreateOrder,
}) {
  const API =
    "http://localhost/printing-management-system/api";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // CHECK USER ROLE
  // =====================================================

  const role = String(
    user?.role || ""
  )
    .trim()
    .toLowerCase();

  const isAdmin = role === "admin";
  const isCustomer = role === "customer";

  // =====================================================
  // GET CUSTOMER ID
  // =====================================================

  const customerId =
    user?.user_id ??
    user?.id ??
    null;

  // =====================================================
  // LOAD ORDERS
  // =====================================================

  useEffect(() => {
    loadOrders();
  }, [customerId, role]);

  const loadOrders = async () => {
    setLoading(true);
    setError("");

    try {
      // =================================================
      // CUSTOMER CHECK
      // =================================================

      if (isCustomer && !customerId) {
        throw new Error(
          "Customer information is missing. Please login again."
        );
      }

      // =================================================
      // GET ORDERS
      // =================================================

      const response = await fetch(
        `${API}/orders.php`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const text = await response.text();

      console.log(
        "ORDERS HTTP STATUS:",
        response.status
      );

      console.log(
        "ORDERS RESPONSE:",
        text
      );

      if (!response.ok) {
        throw new Error(
          `Server error: HTTP ${response.status}`
        );
      }

      if (!text.trim()) {
        throw new Error(
          "Orders API returned an empty response."
        );
      }

      let data;

      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error(
          "ORDERS JSON ERROR:",
          jsonError
        );

        throw new Error(
          "The server did not return valid JSON."
        );
      }

      console.log(
        "PARSED ORDERS DATA:",
        data
      );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to load orders."
        );
      }

      // =================================================
      // SET ORDERS
      // =================================================

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );

    } catch (err) {
      console.error(
        "LOAD ORDERS ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load orders."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // STATUS COLOR
  // =====================================================

  const getStatusStyle = (status) => {
    const value = String(
      status || ""
    ).toLowerCase();

    if (value === "completed") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (value === "processing") {
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    if (value === "ready") {
      return {
        background: "#fef3c7",
        color: "#92400e",
      };
    }

    if (
      value === "cancelled" ||
      value === "canceled"
    ) {
      return {
        background: "#fee2e2",
        color: "#991b1b",
      };
    }

    return {
      background: "#f1f5f9",
      color: "#475569",
    };
  };

  // =====================================================
  // PAYMENT STATUS COLOR
  // =====================================================

  const getPaymentStatusStyle = (status) => {
    const value = String(
      status || ""
    ).toLowerCase();

    if (value === "paid") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    return {
      background: "#fef3c7",
      color: "#92400e",
    };
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // CREATE ORDER
  // =====================================================

  const handleCreateOrder = () => {
    if (
      typeof onCreateOrder ===
      "function"
    ) {
      onCreateOrder();
    }
  };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    if (
      typeof onBack ===
      "function"
    ) {
      onBack();
    }
  };

  // =====================================================
  // PAYMENT
  // =====================================================

  const handlePayment = () => {
    if (
      typeof onPayment ===
      "function"
    ) {
      onPayment();
    }
  };

  // =====================================================
  // PAGE TITLE
  // =====================================================

  const pageTitle = isAdmin
    ? "Manage Orders"
    : "My Orders";

  const pageDescription = isAdmin
    ? "View and manage all printing orders."
    : "View and manage your printing orders.";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div style={styles.page}>

      <div style={styles.container}>

        {/* =================================================
            HEADER
        ================================================= */}

        <header style={styles.header}>

          <div>

            <h1 style={styles.headerTitle}>
              🖨️ Printing Services
            </h1>

            <p style={styles.headerSubtitle}>
              {isAdmin
                ? "Administrator • Manage Orders"
                : "Customer • My Orders"}
            </p>

          </div>

          <div style={styles.userInfo}>

            <div style={styles.userIcon}>
              {isAdmin ? "👨‍💼" : "👤"}
            </div>

            <div>

              <strong
                style={styles.userName}
              >
                {user?.full_name ||
                  user?.username ||
                  "User"}
              </strong>

              <span
                style={styles.userRole}
              >
                {isAdmin
                  ? "Administrator"
                  : "Customer"}
              </span>

            </div>

          </div>

        </header>

        {/* =================================================
            MAIN CARD
        ================================================= */}

        <section style={styles.card}>

          {/* TITLE */}

          <div style={styles.titleRow}>

            <div>

              <h2 style={styles.title}>
                📋 {pageTitle}
              </h2>

              <p style={styles.description}>
                {pageDescription}
              </p>

            </div>

            {/* CUSTOMER CREATE ORDER */}

            {isCustomer && (
              <button
                type="button"
                style={
                  styles.createButton
                }
                onClick={
                  handleCreateOrder
                }
              >
                ➕ Create New Order
              </button>
            )}

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div style={styles.error}>

              <span>
                ⚠️ {error}
              </span>

              <button
                type="button"
                style={styles.retryButton}
                onClick={loadOrders}
              >
                Try Again
              </button>

            </div>
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div style={styles.loadingBox}>

              <div style={styles.spinner}>
                ⏳
              </div>

              <p>
                Loading orders...
              </p>

            </div>
          )}

          {/* =================================================
              NO ORDERS
          ================================================= */}

          {!loading &&
            !error &&
            orders.length === 0 && (
              <div style={styles.emptyBox}>

                <div
                  style={
                    styles.emptyIcon
                  }
                >
                  📝
                </div>

                <h3>
                  {isAdmin
                    ? "No Orders Yet"
                    : "No Orders Yet"}
                </h3>

                <p>
                  {isAdmin
                    ? "There are no printing orders in the system."
                    : "You don't have any printing orders yet."}
                </p>

                {isCustomer && (
                  <button
                    type="button"
                    style={
                      styles.emptyButton
                    }
                    onClick={
                      handleCreateOrder
                    }
                  >
                    ➕ Create Your First Order
                  </button>
                )}

              </div>
            )}

          {/* =================================================
              ORDERS
          ================================================= */}

          {!loading &&
            !error &&
            orders.length > 0 && (
              <div style={styles.ordersList}>

                {orders.map(
                  (order, index) => {

                    const statusStyle =
                      getStatusStyle(
                        order.status
                      );

                    const paymentStyle =
                      getPaymentStatusStyle(
                        order.payment_status
                      );

                    const total =
                      Number(
                        order.total_amount ||
                          0
                      );

                    return (
                      <div
                        key={
                          order.order_id ||
                          order.id ||
                          index
                        }
                        style={
                          styles.orderCard
                        }
                      >

                        {/* ORDER HEADER */}

                        <div
                          style={
                            styles.orderHeader
                          }
                        >

                          <div>

                            <span
                              style={
                                styles.orderLabel
                              }
                            >
                              Order Number
                            </span>

                            <strong
                              style={
                                styles.orderNumber
                              }
                            >
                              {order.order_number ||
                                `Order #${
                                  order.order_id ||
                                  index + 1
                                }`}
                            </strong>

                          </div>

                          <span
                            style={{
                              ...styles.status,
                              ...statusStyle,
                            }}
                          >
                            {order.status ||
                              "Pending"}
                          </span>

                        </div>

                        {/* =================================================
                            ADMIN CUSTOMER
                        ================================================= */}

                        {isAdmin && (
                          <div
                            style={
                              styles.customerBar
                            }
                          >

                            <span>
                              👤 Customer
                            </span>

                            <strong>
                              {order.customer_name ||
                                "Unknown Customer"}
                            </strong>

                          </div>
                        )}

                        {/* ORDER INFORMATION */}

                        <div
                          style={
                            styles.orderGrid
                          }
                        >

                          {/* DOCUMENT */}

                          <div
                            style={
                              styles.infoItem
                            }
                          >

                            <span
                              style={
                                styles.infoLabel
                              }
                            >
                              📄 Document
                            </span>

                            <strong>
                              {order.document_name ||
                                "—"}
                            </strong>

                          </div>

                          {/* SERVICE */}

                          <div
                            style={
                              styles.infoItem
                            }
                          >

                            <span
                              style={
                                styles.infoLabel
                              }
                            >
                              🖨️ Service
                            </span>

                            <strong>
                              {order.service_name ||
                                "—"}
                            </strong>

                          </div>

                          {/* PAGES */}

                          <div
                            style={
                              styles.infoItem
                            }
                          >

                            <span
                              style={
                                styles.infoLabel
                              }
                            >
                              📄 Pages
                            </span>

                            <strong>
                              {order.pages ||
                                0}
                            </strong>

                          </div>

                          {/* COPIES */}

                          <div
                            style={
                              styles.infoItem
                            }
                          >

                            <span
                              style={
                                styles.infoLabel
                              }
                            >
                              📑 Copies
                            </span>

                            <strong>
                              {order.copies ||
                                0}
                            </strong>

                          </div>

                          {/* PRINT TYPE */}

                          <div
                            style={
                              styles.infoItem
                            }
                          >

                            <span
                              style={
                                styles.infoLabel
                              }
                            >
                              🖨️ Print Type
                            </span>

                            <strong>
                              {order.print_type ||
                                "—"}
                            </strong>

                          </div>

                          {/* PAPER */}

                          <div
                            style={
                              styles.infoItem
                            }
                          >

                            <span
                              style={
                                styles.infoLabel
                              }
                            >
                              📃 Paper Size
                            </span>

                            <strong>
                              {order.paper_size ||
                                "—"}
                            </strong>

                          </div>

                          {/* MODE */}

                          <div
                            style={
                              styles.infoItem
                            }
                          >

                            <span
                              style={
                                styles.infoLabel
                              }
                            >
                              📑 Print Mode
                            </span>

                            <strong>
                              {order.print_mode ||
                                "—"}
                            </strong>

                          </div>

                          {/* DATE */}

                          <div
                            style={
                              styles.infoItem
                            }
                          >

                            <span
                              style={
                                styles.infoLabel
                              }
                            >
                              📅 Date
                            </span>

                            <strong>
                              {formatDate(
                                order.created_at
                              )}
                            </strong>

                          </div>

                        </div>

                        {/* ORDER FOOTER */}

                        <div
                          style={
                            styles.orderFooter
                          }
                        >

                          <div>

                            <span
                              style={
                                styles.paymentLabel
                              }
                            >
                              Payment
                            </span>

                            <span
                              style={{
                                ...styles.paymentStatus,
                                ...paymentStyle,
                              }}
                            >
                              {order.payment_status ||
                                "Unpaid"}
                            </span>

                          </div>

                          <div
                            style={
                              styles.totalBox
                            }
                          >

                            <span>
                              Total Amount
                            </span>

                            <strong
                              style={
                                styles.totalAmount
                              }
                            >
                              ₱
                              {total.toFixed(
                                2
                              )}
                            </strong>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

        </section>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div style={styles.navigation}>

          <button
            type="button"
            style={
              styles.backButton
            }
            onClick={
              handleBack
            }
          >
            ←{" "}
            {isAdmin
              ? "Admin Dashboard"
              : "Customer Dashboard"}
          </button>

          <div
            style={
              styles.navigationRight
            }
          >

            <button
              type="button"
              style={
                styles.refreshButton
              }
              onClick={
                loadOrders
              }
              disabled={loading}
            >
              🔄 Refresh
            </button>

            {isCustomer && (
              <button
                type="button"
                style={
                  styles.paymentButton
                }
                onClick={
                  handlePayment
                }
              >
                💳 Payments
              </button>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = {

  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg,#eef4ff,#f8fafc)",
    fontFamily:
      "Arial, Helvetica, sans-serif",
    padding: "30px 20px",
  },

  container: {
    width: "94%",
    maxWidth: "1150px",
    margin: "0 auto",
  },

  header: {
    background:
      "linear-gradient(135deg,#1e3a8a,#2563eb)",
    color: "white",
    padding: "24px 30px",
    borderRadius: "18px",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    boxShadow:
      "0 12px 30px rgba(37,99,235,0.22)",
  },

  headerTitle: {
    fontSize: "27px",
    margin: "0 0 6px",
  },

  headerSubtitle: {
    color: "#dbeafe",
    margin: 0,
    fontSize: "14px",
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  userIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background:
      "rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  userName: {
    display: "block",
    fontSize: "15px",
  },

  userRole: {
    display: "block",
    color: "#dbeafe",
    fontSize: "12px",
    marginTop: "3px",
  },

  card: {
    background: "white",
    marginTop: "22px",
    padding: "30px",
    borderRadius: "16px",
    boxShadow:
      "0 6px 22px rgba(15,23,42,0.08)",
  },

  titleRow: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "25px",
  },

  title: {
    color: "#0f172a",
    fontSize: "24px",
    margin: "0 0 7px",
  },

  description: {
    color: "#64748b",
    margin: 0,
    fontSize: "14px",
  },

  createButton: {
    border: "none",
    background:
      "linear-gradient(135deg,#2563eb,#1d4ed8)",
    color: "white",
    padding: "13px 18px",
    borderRadius: "9px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow:
      "0 6px 15px rgba(37,99,235,0.20)",
  },

  error: {
    background: "#fee2e2",
    color: "#991b1b",
    borderLeft:
      "5px solid #dc2626",
    padding: "14px",
    borderRadius: "9px",
    marginBottom: "20px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: "10px",
    flexWrap: "wrap",
  },

  retryButton: {
    border: "none",
    background: "#dc2626",
    color: "white",
    padding: "7px 12px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  loadingBox: {
    minHeight: "220px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#64748b",
    gap: "10px",
  },

  spinner: {
    fontSize: "32px",
  },

  emptyBox: {
    minHeight: "300px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "#64748b",
    border:
      "2px dashed #cbd5e1",
    borderRadius: "12px",
    padding: "30px",
  },

  emptyIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },

  emptyButton: {
    marginTop: "18px",
    border: "none",
    background: "#2563eb",
    color: "white",
    padding: "12px 18px",
    borderRadius: "9px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  ordersList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  orderCard: {
    border:
      "1px solid #e2e8f0",
    borderRadius: "13px",
    padding: "20px",
    background: "#ffffff",
    boxShadow:
      "0 4px 15px rgba(15,23,42,0.05)",
  },

  orderHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    paddingBottom: "16px",
    borderBottom:
      "1px solid #e2e8f0",
  },

  orderLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "11px",
    marginBottom: "4px",
    textTransform:
      "uppercase",
    letterSpacing: "0.5px",
  },

  orderNumber: {
    display: "block",
    color: "#1e3a8a",
    fontSize: "17px",
  },

  status: {
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    textTransform: "capitalize",
  },

  customerBar: {
    marginTop: "15px",
    padding: "12px 14px",
    background: "#eff6ff",
    borderRadius: "9px",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    color: "#334155",
    fontSize: "14px",
  },

  orderGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, 1fr)",
    gap: "16px",
    padding: "20px 0",
  },

  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    minWidth: 0,
  },

  infoLabel: {
    color: "#64748b",
    fontSize: "12px",
  },

  orderFooter: {
    borderTop:
      "1px solid #e2e8f0",
    paddingTop: "16px",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  paymentLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "12px",
    marginBottom: "5px",
  },

  paymentStatus: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "15px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  totalBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
    color: "#64748b",
    fontSize: "12px",
  },

  totalAmount: {
    color: "#0f172a",
    fontSize: "20px",
  },

  navigation: {
    marginTop: "22px",
    background: "white",
    padding: "17px 22px",
    borderRadius: "14px",
    boxShadow:
      "0 5px 18px rgba(15,23,42,0.06)",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  backButton: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
    padding: "8px 0",
  },

  navigationRight: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  refreshButton: {
    border:
      "1px solid #cbd5e1",
    background: "white",
    color: "#334155",
    padding: "9px 14px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  paymentButton: {
    border: "none",
    background: "#0f766e",
    color: "white",
    padding: "9px 14px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default Orders;
