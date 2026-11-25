import { useEffect, useMemo, useState } from "react";

// =====================================================
// API
// =====================================================

// IMPORTANT:
// PHP is running through XAMPP/Apache on localhost.
// React/Vite is running on localhost:5185.
const PAYMENT_API =
  "http://localhost/printing-management-system/api/payment.php";

// =====================================================
// COMPONENT
// =====================================================

function Payment({ onBack, onOrders }) {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);

  const [statistics, setStatistics] = useState({
    total_transactions: 0,
    total_paid: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  // =====================================================
  // SELECTED ORDER
  // =====================================================

  const selectedOrder = useMemo(() => {
    return orders.find(
      (order) =>
        String(order.order_id) === String(orderId)
    );
  }, [orders, orderId]);

  // =====================================================
  // CHANGE
  // =====================================================

  const changeAmount = useMemo(() => {
    if (!selectedOrder || !amount) {
      return 0;
    }

    const paid = Number(amount);
    const total = Number(
      selectedOrder.total_amount
    );

    if (paid <= total) {
      return 0;
    }

    return paid - total;
  }, [selectedOrder, amount]);

  // =====================================================
  // LOAD PAYMENT DATA
  // =====================================================

  const loadPayments = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        PAYMENT_API,
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
        "PAYMENT API RESPONSE:",
        text
      );

      if (!response.ok) {
        throw new Error(
          `HTTP Error ${response.status}`
        );
      }

      let data;

      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error(
          "Invalid JSON:",
          text
        );

        throw new Error(
          "PHP did not return valid JSON. Check payment.php."
        );
      }

      console.log(
        "PAYMENT DATA:",
        data
      );

      if (data.success !== true) {
        throw new Error(
          data.message ||
            "Unable to load payment records."
        );
      }

      // PAYMENT RECORDS
      setPayments(
        Array.isArray(data.payments)
          ? data.payments
          : []
      );

      // UNPAID ORDERS
      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );

      // STATISTICS
      setStatistics({
        total_transactions:
          Number(
            data.statistics
              ?.total_transactions || 0
          ),

        total_paid:
          Number(
            data.statistics
              ?.total_paid || 0
          ),
      });

    } catch (err) {
      console.error(
        "LOAD PAYMENTS ERROR:",
        err
      );

      setPayments([]);
      setOrders([]);

      setStatistics({
        total_transactions: 0,
        total_paid: 0,
      });

      setError(
        err.message ||
          "Failed to load payment records."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadPayments();
  }, []);

  // =====================================================
  // SAVE PAYMENT
  // =====================================================

  const handleSavePayment = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    // -------------------------------------------------
    // VALIDATE ORDER
    // -------------------------------------------------

    if (!orderId) {
      setError(
        "Please select an order."
      );
      return;
    }

    if (!selectedOrder) {
      setError(
        "Selected order was not found."
      );
      return;
    }

    // -------------------------------------------------
    // VALIDATE AMOUNT
    // -------------------------------------------------

    const paidAmount =
      Number(amount);

    const totalAmount =
      Number(
        selectedOrder.total_amount
      );

    if (
      !amount ||
      paidAmount <= 0
    ) {
      setError(
        "Please enter a valid payment amount."
      );
      return;
    }

    if (
      paidAmount < totalAmount
    ) {
      setError(
        `Payment is not enough. Total amount is ₱${totalAmount.toFixed(
          2
        )}.`
      );
      return;
    }

    // -------------------------------------------------
    // VALIDATE PAYMENT METHOD
    // -------------------------------------------------

    if (!paymentMethod) {
      setError(
        "Please select a payment method."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        PAYMENT_API,
        {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body: JSON.stringify({
            order_id:
              Number(orderId),

            amount:
              paidAmount,

            payment_method:
              paymentMethod,
          }),
        }
      );

      const text =
        await response.text();

      console.log(
        "SAVE PAYMENT RESPONSE:",
        text
      );

      if (!response.ok) {
        throw new Error(
          `HTTP Error ${response.status}`
        );
      }

      let data;

      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error(
          "Invalid JSON:",
          text
        );

        throw new Error(
          "PHP did not return valid JSON."
        );
      }

      console.log(
        "SAVE PAYMENT DATA:",
        data
      );

      if (data.success !== true) {
        throw new Error(
          data.message ||
            "Unable to save payment."
        );
      }

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      setMessage(
        `Payment successfully recorded! Change: ₱${Number(
          data.change_amount || 0
        ).toFixed(2)}`
      );

      // -------------------------------------------------
      // CLEAR FORM
      // -------------------------------------------------

      setOrderId("");
      setAmount("");
      setPaymentMethod("Cash");

      // -------------------------------------------------
      // RELOAD DATA
      // -------------------------------------------------

      await loadPayments();

    } catch (err) {
      console.error(
        "SAVE PAYMENT ERROR:",
        err
      );

      setError(
        err.message ||
          "Failed to save payment."
      );

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}

        <header style={styles.header}>

          <div>
            <h1 style={styles.title}>
              💰 Payments
            </h1>

            <p style={styles.subtitle}>
              Record and manage customer payments
            </p>
          </div>

          <button
            style={styles.backButton}
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>

        </header>

        {/* SUCCESS */}

        {message && (
          <div
            style={
              styles.successMessage
            }
          >
            ✅ {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div
            style={
              styles.errorMessage
            }
          >
            ⚠️ {error}
          </div>
        )}

        {/* STATISTICS */}

        <section style={styles.statsGrid}>

          <div style={styles.statCard}>

            <div style={styles.statIcon}>
              🧾
            </div>

            <div>

              <div
                style={
                  styles.statLabel
                }
              >
                Total Transactions
              </div>

              <div
                style={
                  styles.statValue
                }
              >
                {
                  statistics.total_transactions
                }
              </div>

            </div>

          </div>

          <div style={styles.statCard}>

            <div style={styles.statIcon}>
              💰
            </div>

            <div>

              <div
                style={
                  styles.statLabel
                }
              >
                Total Paid
              </div>

              <div
                style={
                  styles.statValue
                }
              >
                ₱
                {Number(
                  statistics.total_paid ||
                    0
                ).toFixed(2)}
              </div>

            </div>

          </div>

          <div style={styles.statCard}>

            <div style={styles.statIcon}>
              📋
            </div>

            <div>

              <div
                style={
                  styles.statLabel
                }
              >
                Unpaid Orders
              </div>

              <div
                style={
                  styles.statValue
                }
              >
                {orders.length}
              </div>

            </div>

          </div>

        </section>

        {/* RECORD PAYMENT */}

        <section style={styles.card}>

          <h2 style={styles.sectionTitle}>
            Record Payment
          </h2>

          <p style={styles.description}>
            Select an unpaid order and enter the payment.
          </p>

          <form
            onSubmit={
              handleSavePayment
            }
            style={styles.form}
          >

            {/* ORDER */}

            <div
              style={
                styles.formGroup
              }
            >

              <label style={styles.label}>
                Select Order
              </label>

              <select
                value={orderId}
                onChange={(e) =>
                  setOrderId(
                    e.target.value
                  )
                }
                style={styles.input}
                disabled={
                  saving ||
                  loading
                }
              >

                <option value="">
                  -- Select Unpaid Order --
                </option>

                {orders.map(
                  (order) => (
                    <option
                      key={
                        order.order_id
                      }
                      value={
                        order.order_id
                      }
                    >
                      {
                        order.order_number
                      }
                      {" - "}
                      {
                        order.customer_name
                      }
                      {" - ₱"}
                      {Number(
                        order.total_amount ||
                          0
                      ).toFixed(2)}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* CUSTOMER */}

            <div
              style={
                styles.formGroup
              }
            >

              <label style={styles.label}>
                Customer
              </label>

              <input
                type="text"
                value={
                  selectedOrder
                    ? selectedOrder.customer_name
                    : ""
                }
                placeholder="Customer name"
                style={styles.input}
                readOnly
              />

            </div>

            {/* TOTAL */}

            <div
              style={
                styles.formGroup
              }
            >

              <label style={styles.label}>
                Total Amount
              </label>

              <input
                type="text"
                value={
                  selectedOrder
                    ? `₱${Number(
                        selectedOrder.total_amount
                      ).toFixed(2)}`
                    : ""
                }
                placeholder="₱0.00"
                style={styles.input}
                readOnly
              />

            </div>

            {/* AMOUNT */}

            <div
              style={
                styles.formGroup
              }
            >

              <label style={styles.label}>
                Amount Paid
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) =>
                  setAmount(
                    e.target.value
                  )
                }
                placeholder="Enter amount paid"
                style={styles.input}
                disabled={saving}
              />

            </div>

            {/* CHANGE */}

            <div
              style={
                styles.formGroup
              }
            >

              <label style={styles.label}>
                Change
              </label>

              <input
                type="text"
                value={`₱${changeAmount.toFixed(
                  2
                )}`}
                style={{
                  ...styles.input,
                  background:
                    "#f0fdf4",
                  color:
                    "#15803d",
                  fontWeight:
                    "bold",
                }}
                readOnly
              />

            </div>

            {/* PAYMENT METHOD */}

            <div
              style={
                styles.formGroup
              }
            >

              <label style={styles.label}>
                Payment Method
              </label>

              <select
                value={
                  paymentMethod
                }
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value
                  )
                }
                style={styles.input}
                disabled={saving}
              >

                <option value="Cash">
                  Cash
                </option>

                <option value="GCash">
                  GCash
                </option>

                <option value="Bank Transfer">
                  Bank Transfer
                </option>

                <option value="Card">
                  Card
                </option>

              </select>

            </div>

            {/* SAVE */}

            <div
              style={
                styles.formButtonWrapper
              }
            >

              <button
                type="submit"
                disabled={
                  saving ||
                  loading ||
                  orders.length === 0
                }
                style={{
                  ...styles.saveButton,
                  opacity:
                    saving ||
                    loading ||
                    orders.length === 0
                      ? 0.6
                      : 1,
                }}
              >
                {saving
                  ? "Saving..."
                  : "💾 Save Payment"}
              </button>

            </div>

          </form>

          {/* NO ORDERS */}

          {!loading &&
            orders.length === 0 && (
              <div
                style={
                  styles.noOrders
                }
              >
                ✅ No unpaid orders available.
              </div>
            )}

        </section>

        {/* PAYMENT RECORDS */}

        <section style={styles.card}>

          <div style={styles.listHeader}>

            <div>

              <h2
                style={
                  styles.sectionTitle
                }
              >
                Payment Records
              </h2>

              <p
                style={
                  styles.description
                }
              >
                Recent payment transactions
              </p>

            </div>

            <button
              onClick={
                loadPayments
              }
              disabled={loading}
              style={{
                ...styles.refreshButton,
                opacity:
                  loading ? 0.6 : 1,
              }}
            >
              🔄 Refresh
            </button>

          </div>

          {/* LOADING */}

          {loading && (
            <div style={styles.empty}>
              ⏳ Loading payments...
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            payments.length === 0 && (
              <div style={styles.empty}>
                No payment records found.
              </div>
            )}

          {/* TABLE */}

          {!loading &&
            payments.length > 0 && (
              <div
                style={
                  styles.tableWrapper
                }
              >

                <table
                  style={styles.table}
                >

                  <thead>

                    <tr>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Payment ID
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Order
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Customer
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Total
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Amount Paid
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Change
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Method
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Status
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Date
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {payments.map(
                      (
                        payment,
                        index
                      ) => (

                        <tr
                          key={
                            payment.payment_id ||
                            index
                          }
                        >

                          <td
                            style={
                              styles.td
                            }
                          >
                            {
                              payment.payment_id ||
                              "-"
                            }
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <strong>
                              {
                                payment.order_number ||
                                `#${payment.order_id}`
                              }
                            </strong>
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {
                              payment.customer_name ||
                              "-"
                            }
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            ₱
                            {Number(
                              payment.total_amount ||
                                0
                            ).toFixed(2)}
                          </td>

                          <td
                            style={{
                              ...styles.td,
                              fontWeight:
                                "bold",
                              color:
                                "#16a34a",
                            }}
                          >
                            ₱
                            {Number(
                              payment.amount_paid ||
                                0
                            ).toFixed(2)}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            ₱
                            {Number(
                              payment.change_amount ||
                                0
                            ).toFixed(2)}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >

                            <span
                              style={
                                styles.methodBadge
                              }
                            >
                              {
                                payment.payment_method ||
                                "Cash"
                              }
                            </span>

                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >

                            <span
                              style={{
                                ...styles.statusBadge,

                                background:
                                  payment.payment_status ===
                                  "Paid"
                                    ? "#dcfce7"
                                    : "#fef3c7",

                                color:
                                  payment.payment_status ===
                                  "Paid"
                                    ? "#166534"
                                    : "#92400e",
                              }}
                            >
                              {
                                payment.payment_status ||
                                "-"
                              }
                            </span>

                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {
                              payment.payment_date ||
                              "-"
                            }
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

        </section>

        {/* BOTTOM BUTTONS */}

        <div
          style={
            styles.bottomActions
          }
        >

          <button
            style={
              styles.ordersButton
            }
            onClick={onOrders}
          >
            📋 View Orders
          </button>

          <button
            style={
              styles.dashboardButton
            }
            onClick={onBack}
          >
            🏠 Dashboard
          </button>

        </div>

        {/* FOOTER */}

        <footer style={styles.footer}>
          Printing Management System ©{" "}
          {new Date().getFullYear()}
        </footer>

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
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: {
    background:
      "linear-gradient(135deg,#166534,#16a34a)",
    color: "white",
    padding: "25px 30px",
    borderRadius: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    boxShadow:
      "0 12px 30px rgba(22,163,74,0.22)",
  },

  title: {
    margin: "0 0 6px",
    fontSize: "27px",
  },

  subtitle: {
    margin: 0,
    color: "#dcfce7",
    fontSize: "14px",
  },

  backButton: {
    border:
      "1px solid rgba(255,255,255,0.35)",
    background:
      "rgba(255,255,255,0.15)",
    color: "white",
    padding: "10px 15px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  statsGrid: {
    marginTop: "22px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "16px",
  },

  statCard: {
    background: "white",
    padding: "20px",
    borderRadius: "14px",
    boxShadow:
      "0 6px 20px rgba(15,23,42,0.07)",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "#dcfce7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
  },

  statLabel: {
    color: "#64748b",
    fontSize: "13px",
    marginBottom: "5px",
  },

  statValue: {
    color: "#0f172a",
    fontWeight: "bold",
    fontSize: "22px",
  },

  card: {
    marginTop: "22px",
    background: "white",
    padding: "28px",
    borderRadius: "16px",
    boxShadow:
      "0 6px 22px rgba(15,23,42,0.08)",
  },

  sectionTitle: {
    margin: "0 0 6px",
    color: "#0f172a",
    fontSize: "21px",
  },

  description: {
    margin: "0 0 20px",
    color: "#64748b",
    fontSize: "14px",
  },

  form: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(200px,1fr))",
    gap: "18px",
    alignItems: "end",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    color: "#334155",
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    padding: "13px",
    border:
      "1px solid #cbd5e1",
    borderRadius: "9px",
    fontSize: "14px",
    outline: "none",
    background: "white",
    boxSizing: "border-box",
  },

  formButtonWrapper: {
    display: "flex",
    alignItems: "end",
  },

  saveButton: {
    width: "100%",
    border: "none",
    background:
      "linear-gradient(135deg,#16a34a,#15803d)",
    color: "white",
    padding: "13px 18px",
    borderRadius: "9px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
  },

  successMessage: {
    marginTop: "20px",
    background: "#dcfce7",
    color: "#166534",
    borderLeft:
      "5px solid #16a34a",
    padding: "13px 15px",
    borderRadius: "9px",
    fontWeight: "bold",
  },

  errorMessage: {
    marginTop: "20px",
    background: "#fee2e2",
    color: "#991b1b",
    borderLeft:
      "5px solid #dc2626",
    padding: "13px 15px",
    borderRadius: "9px",
    fontWeight: "bold",
  },

  noOrders: {
    marginTop: "20px",
    background: "#f0fdf4",
    color: "#166534",
    padding: "14px",
    borderRadius: "9px",
    textAlign: "center",
    fontWeight: "bold",
  },

  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  refreshButton: {
    border: "none",
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "10px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  empty: {
    background: "#f8fafc",
    padding: "30px",
    borderRadius: "10px",
    textAlign: "center",
    color: "#64748b",
    marginTop: "15px",
  },

  tableWrapper: {
    overflowX: "auto",
    marginTop: "10px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1050px",
  },

  th: {
    background: "#f1f5f9",
    color: "#334155",
    padding: "13px",
    textAlign: "left",
    fontSize: "13px",
    borderBottom:
      "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "13px",
    borderBottom:
      "1px solid #e2e8f0",
    color: "#475569",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },

  methodBadge: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "12px",
    fontWeight: "bold",
  },

  statusBadge: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  bottomActions: {
    marginTop: "22px",
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  ordersButton: {
    border: "none",
    background:
      "linear-gradient(135deg,#0f766e,#14b8a6)",
    color: "white",
    padding: "12px 20px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  dashboardButton: {
    border: "none",
    background: "#2563eb",
    color: "white",
    padding: "12px 20px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  footer: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "13px",
    padding: "25px 0 10px",
  },
};

export default Payment;