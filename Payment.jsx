import { useEffect, useMemo, useState } from "react";

// =====================================================
// API
// =====================================================

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
  const [paymentMethod, setPaymentMethod] =
    useState("Cash");

  // =====================================================
  // SEARCH
  // =====================================================

  const [searchTerm, setSearchTerm] = useState("");

  // =====================================================
  // SORTING
  // =====================================================

  const [sortBy, setSortBy] =
    useState("payment_id");

  const [sortOrder, setSortOrder] =
    useState("desc");

  // =====================================================
  // FILTER + SORT PAYMENT RECORDS
  // =====================================================

  const filteredPayments = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    let result = payments.filter(
      (payment) => {
        if (!search) {
          return true;
        }

        const orderNumber =
          String(
            payment.order_number || ""
          ).toLowerCase();

        const customerName =
          String(
            payment.customer_name || ""
          ).toLowerCase();

        const paymentId =
          String(
            payment.payment_id || ""
          ).toLowerCase();

        return (
          orderNumber.includes(search) ||
          customerName.includes(search) ||
          paymentId.includes(search)
        );
      }
    );

    result.sort((a, b) => {
      let valueA;
      let valueB;

      switch (sortBy) {
        case "payment_id":
          valueA = Number(
            a.payment_id || 0
          );

          valueB = Number(
            b.payment_id || 0
          );
          break;

        case "order_number":
          valueA = String(
            a.order_number || ""
          ).toLowerCase();

          valueB = String(
            b.order_number || ""
          ).toLowerCase();
          break;

        case "customer_name":
          valueA = String(
            a.customer_name || ""
          ).toLowerCase();

          valueB = String(
            b.customer_name || ""
          ).toLowerCase();
          break;

        case "total_amount":
          valueA = Number(
            a.total_amount || 0
          );

          valueB = Number(
            b.total_amount || 0
          );
          break;

        case "amount_paid":
          valueA = Number(
            a.amount_paid || 0
          );

          valueB = Number(
            b.amount_paid || 0
          );
          break;

        case "change_amount":
          valueA = Number(
            a.change_amount || 0
          );

          valueB = Number(
            b.change_amount || 0
          );
          break;

        case "payment_date":
          valueA = new Date(
            a.payment_date || 0
          ).getTime();

          valueB = new Date(
            b.payment_date || 0
          ).getTime();
          break;

        default:
          valueA = 0;
          valueB = 0;
      }

      if (sortOrder === "asc") {
        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
        return 0;
      }

      if (valueA < valueB) return 1;
      if (valueA > valueB) return -1;

      return 0;
    });

    return result;
  }, [
    payments,
    searchTerm,
    sortBy,
    sortOrder,
  ]);

  // =====================================================
  // SELECTED ORDER
  // =====================================================

  const selectedOrder = useMemo(() => {
    return orders.find(
      (order) =>
        String(order.order_id) ===
        String(orderId)
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

      const text =
        await response.text();

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

      setPayments(
        Array.isArray(data.payments)
          ? data.payments
          : []
      );

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );

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

      setMessage(
        `Payment successfully recorded! Change: ₱${Number(
          data.change_amount || 0
        ).toFixed(2)}`
      );

      setOrderId("");
      setAmount("");
      setPaymentMethod("Cash");

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

        {/* =================================================
            HEADER
        ================================================= */}

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

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {message && (
          <div
            style={
              styles.successMessage
            }
          >
            ✅ {message}
          </div>
        )}

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (
          <div
            style={
              styles.errorMessage
            }
          >
            ⚠️ {error}
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section
          style={styles.statsGrid}
        >

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

        {/* =================================================
            RECORD PAYMENT
        ================================================= */}

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
                    "rgba(34,197,94,0.12)",
                  color:
                    "#86efac",
                  fontWeight:
                    "bold",
                  border:
                    "1px solid rgba(74,222,128,0.25)",
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


        {/* =================================================
            PAYMENT RECORDS
        ================================================= */}

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


          {/* =================================================
              SEARCH
          ================================================= */}

          <div
            style={
              styles.searchWrapper
            }
          >

            <span
              style={
                styles.searchIcon
              }
            >
              🔎
            </span>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              placeholder="Search by Order Number, Customer, or Payment ID..."
              style={
                styles.searchInput
              }
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() =>
                  setSearchTerm("")
                }
                style={
                  styles.clearSearchButton
                }
              >
                ✕
              </button>
            )}

          </div>


          {/* =================================================
              SORTING
          ================================================= */}

          <div
            style={
              styles.sortingWrapper
            }
          >

            <div
              style={
                styles.sortGroup
              }
            >

              <label
                style={
                  styles.sortLabel
                }
              >
                Sort By
              </label>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value
                  )
                }
                style={
                  styles.sortSelect
                }
              >

                <option value="payment_id">
                  Payment ID
                </option>

                <option value="order_number">
                  Order Number
                </option>

                <option value="customer_name">
                  Customer
                </option>

                <option value="total_amount">
                  Total Amount
                </option>

                <option value="amount_paid">
                  Amount Paid
                </option>

                <option value="change_amount">
                  Change
                </option>

                <option value="payment_date">
                  Date
                </option>

              </select>

            </div>


            <div
              style={
                styles.sortGroup
              }
            >

              <label
                style={
                  styles.sortLabel
                }
              >
                Order
              </label>

              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(
                    e.target.value
                  )
                }
                style={
                  styles.sortSelect
                }
              >

                <option value="asc">
                  ↑ Ascending
                </option>

                <option value="desc">
                  ↓ Descending
                </option>

              </select>

            </div>

          </div>


          {/* =================================================
              SEARCH RESULT COUNT
          ================================================= */}

          {!loading &&
            payments.length > 0 && (
              <div
                style={
                  styles.searchResultText
                }
              >

                Showing{" "}

                <strong>
                  {
                    filteredPayments.length
                  }
                </strong>

                {" "}of{" "}

                <strong>
                  {payments.length}
                </strong>

                {" "}payment records

              </div>
            )}


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div style={styles.empty}>
              ⏳ Loading payments...
            </div>
          )}


          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            payments.length === 0 && (
              <div style={styles.empty}>
                No payment records found.
              </div>
            )}


          {/* =================================================
              NO SEARCH RESULTS
          ================================================= */}

          {!loading &&
            payments.length > 0 &&
            filteredPayments.length === 0 && (
              <div style={styles.empty}>
                🔎 No payment records match your search.
              </div>
            )}


          {/* =================================================
              TABLE
          ================================================= */}

          {!loading &&
            filteredPayments.length > 0 && (
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

                      <th style={styles.th}>
                        Payment ID
                      </th>

                      <th style={styles.th}>
                        Order
                      </th>

                      <th style={styles.th}>
                        Customer
                      </th>

                      <th style={styles.th}>
                        Total
                      </th>

                      <th style={styles.th}>
                        Amount Paid
                      </th>

                      <th style={styles.th}>
                        Change
                      </th>

                      <th style={styles.th}>
                        Method
                      </th>

                      <th style={styles.th}>
                        Status
                      </th>

                      <th style={styles.th}>
                        Date
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredPayments.map(
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

                          <td style={styles.td}>
                            {
                              payment.payment_id ||
                              "-"
                            }
                          </td>


                          <td style={styles.td}>

                            <strong>
                              {
                                payment.order_number ||
                                `#${payment.order_id}`
                              }
                            </strong>

                          </td>


                          <td style={styles.td}>
                            {
                              payment.customer_name ||
                              "-"
                            }
                          </td>


                          <td style={styles.td}>
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
                                "#86efac",
                            }}
                          >
                            ₱
                            {Number(
                              payment.amount_paid ||
                                0
                            ).toFixed(2)}
                          </td>


                          <td style={styles.td}>
                            ₱
                            {Number(
                              payment.change_amount ||
                                0
                            ).toFixed(2)}
                          </td>


                          <td style={styles.td}>

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


                          <td style={styles.td}>

                            <span
                              style={{
                                ...styles.statusBadge,

                                background:
                                  payment.payment_status ===
                                  "Paid"
                                    ? "rgba(34,197,94,0.16)"
                                    : "rgba(250,204,21,0.16)",

                                color:
                                  payment.payment_status ===
                                  "Paid"
                                    ? "#86efac"
                                    : "#fde68a",

                                border:
                                  payment.payment_status ===
                                  "Paid"
                                    ? "1px solid rgba(74,222,128,0.25)"
                                    : "1px solid rgba(250,204,21,0.25)",
                              }}
                            >
                              {
                                payment.payment_status ||
                                "-"
                              }
                            </span>

                          </td>


                          <td style={styles.td}>
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


        {/* =================================================
            BOTTOM BUTTONS
        ================================================= */}

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


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer style={styles.footer}>
          Printing Services ©{" "}
          {new Date().getFullYear()}
        </footer>

      </div>
    </div>
  );
}


// =====================================================
// STYLES
// DESIGN ONLY
// =====================================================

const styles = {

  page: {
    minHeight: "100vh",

    background:
      "linear-gradient(135deg, rgba(3,15,45,0.97), rgba(9,35,82,0.93)), url('/print.jpg') center/cover fixed",

    fontFamily:
      "Arial, Helvetica, sans-serif",

    padding: "30px 20px",

    color: "white",
  },


  container: {
    width: "94%",
    maxWidth: "1250px",
    margin: "0 auto",
  },


  // =====================================================
  // HEADER
  // =====================================================

  header: {
    background:
      "linear-gradient(135deg, rgba(12,39,91,0.92), rgba(25,73,145,0.78))",

    border:
      "1px solid rgba(120,180,255,0.30)",

    backdropFilter:
      "blur(18px)",

    WebkitBackdropFilter:
      "blur(18px)",

    color: "white",

    padding: "25px 30px",

    borderRadius: "20px",

    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap: "20px",

    flexWrap: "wrap",

    boxShadow:
      "0 18px 45px rgba(0,0,0,0.30)",
  },


  title: {
    margin:
      "0 0 6px",

    fontSize: "27px",

    color: "white",

    fontWeight: "800",
  },


  subtitle: {
    margin: 0,

    color: "#cfe4ff",

    fontSize: "14px",
  },


  backButton: {
    border:
      "1px solid rgba(150,210,255,0.30)",

    background:
      "rgba(255,255,255,0.10)",

    color: "white",

    padding:
      "10px 15px",

    borderRadius:
      "10px",

    cursor: "pointer",

    fontWeight: "bold",

    boxShadow:
      "0 8px 20px rgba(0,0,0,0.18)",
  },


  // =====================================================
  // MESSAGES
  // =====================================================

  successMessage: {
    marginTop: "20px",

    background:
      "rgba(34,197,94,0.14)",

    border:
      "1px solid rgba(74,222,128,0.30)",

    color: "#bbf7d0",

    padding:
      "14px 16px",

    borderRadius:
      "12px",

    fontWeight: "bold",

    backdropFilter:
      "blur(12px)",
  },


  errorMessage: {
    marginTop: "20px",

    background:
      "rgba(239,68,68,0.14)",

    border:
      "1px solid rgba(248,113,113,0.30)",

    color: "#fecaca",

    padding:
      "14px 16px",

    borderRadius:
      "12px",

    fontWeight: "bold",

    backdropFilter:
      "blur(12px)",
  },


  // =====================================================
  // STATISTICS
  // =====================================================

  statsGrid: {
    marginTop: "22px",

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",

    gap: "16px",
  },


  statCard: {
    background:
      "linear-gradient(145deg, rgba(11,42,91,0.88), rgba(8,28,65,0.78))",

    border:
      "1px solid rgba(105,180,255,0.28)",

    backdropFilter:
      "blur(18px)",

    WebkitBackdropFilter:
      "blur(18px)",

    padding: "22px",

    borderRadius: "18px",

    display: "flex",

    alignItems:
      "center",

    gap: "16px",

    boxShadow:
      "0 16px 38px rgba(0,0,0,0.25)",
  },


  statIcon: {
    width: "52px",

    height: "52px",

    borderRadius: "14px",

    background:
      "rgba(80,150,255,0.16)",

    border:
      "1px solid rgba(120,190,255,0.20)",

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    fontSize: "24px",
  },


  statLabel: {
    color: "#9fc4e8",

    fontSize: "13px",

    marginBottom: "5px",
  },


  statValue: {
    color: "white",

    fontWeight: "800",

    fontSize: "23px",
  },


  // =====================================================
  // MAIN CARDS
  // =====================================================

  card: {
    marginTop: "22px",

    background:
      "linear-gradient(145deg, rgba(11,42,91,0.88), rgba(8,28,65,0.78))",

    border:
      "1px solid rgba(105,180,255,0.28)",

    backdropFilter:
      "blur(18px)",

    WebkitBackdropFilter:
      "blur(18px)",

    padding: "28px",

    borderRadius: "20px",

    boxShadow:
      "0 18px 45px rgba(0,0,0,0.30)",
  },


  sectionTitle: {
    margin:
      "0 0 6px",

    color: "white",

    fontSize: "21px",

    fontWeight: "800",
  },


  description: {
    margin:
      "0 0 20px",

    color: "#9fc4e8",

    fontSize: "14px",
  },


  // =====================================================
  // FORM
  // =====================================================

  form: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(200px,1fr))",

    gap: "18px",

    alignItems: "end",
  },


  formGroup: {
    display: "flex",

    flexDirection:
      "column",
  },


  label: {
    color: "#cfe4ff",

    fontSize: "14px",

    fontWeight: "bold",

    marginBottom: "8px",
  },


  input: {
    width: "100%",

    padding: "13px",

    border:
      "1px solid rgba(150,205,255,0.25)",

    borderRadius: "10px",

    fontSize: "14px",

    outline: "none",

    background:
      "rgba(255,255,255,0.93)",

    color: "#0f172a",

    boxSizing: "border-box",
  },


  formButtonWrapper: {
    display: "flex",

    alignItems: "end",
  },


  saveButton: {
    width: "100%",

    border:
      "1px solid rgba(120,190,255,0.25)",

    background:
      "linear-gradient(135deg,#2563eb,#1d4ed8)",

    color: "white",

    padding:
      "13px 18px",

    borderRadius:
      "10px",

    fontWeight: "bold",

    cursor: "pointer",

    fontSize: "14px",

    boxShadow:
      "0 10px 25px rgba(0,0,0,0.25)",
  },


  noOrders: {
    marginTop: "20px",

    background:
      "rgba(34,197,94,0.10)",

    border:
      "1px solid rgba(74,222,128,0.22)",

    color: "#bbf7d0",

    padding: "14px",

    borderRadius: "10px",

    textAlign: "center",

    fontWeight: "bold",
  },


  // =====================================================
  // PAYMENT RECORD HEADER
  // =====================================================

  listHeader: {
    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap: "15px",

    flexWrap: "wrap",
  },


  refreshButton: {
    border:
      "1px solid rgba(120,190,255,0.25)",

    background:
      "rgba(80,150,255,0.14)",

    color: "#cfe4ff",

    padding:
      "10px 15px",

    borderRadius:
      "9px",

    cursor: "pointer",

    fontWeight: "bold",
  },


  // =====================================================
  // SEARCH
  // =====================================================

  searchWrapper: {
    position: "relative",

    display: "flex",

    alignItems:
      "center",

    marginTop: "15px",

    marginBottom: "8px",
  },


  searchIcon: {
    position: "absolute",

    left: "14px",

    fontSize: "17px",

    pointerEvents:
      "none",

    zIndex: 2,
  },


  searchInput: {
    width: "100%",

    padding:
      "13px 42px 13px 42px",

    border:
      "1px solid rgba(150,205,255,0.25)",

    borderRadius: "10px",

    fontSize: "14px",

    outline: "none",

    background:
      "rgba(255,255,255,0.93)",

    color: "#0f172a",

    boxSizing: "border-box",
  },


  clearSearchButton: {
    position: "absolute",

    right: "10px",

    border: "none",

    background: "#e2e8f0",

    color: "#475569",

    width: "28px",

    height: "28px",

    borderRadius: "50%",

    cursor: "pointer",

    fontWeight: "bold",
  },


  searchResultText: {
    color: "#9fc4e8",

    fontSize: "13px",

    marginTop: "8px",

    marginBottom: "10px",
  },


  // =====================================================
  // SORTING
  // =====================================================

  sortingWrapper: {
    display: "flex",

    gap: "12px",

    alignItems: "end",

    flexWrap: "wrap",

    marginTop: "12px",

    marginBottom: "10px",
  },


  sortGroup: {
    display: "flex",

    flexDirection:
      "column",

    gap: "6px",

    minWidth: "180px",
  },


  sortLabel: {
    color: "#cfe4ff",

    fontSize: "13px",

    fontWeight: "bold",
  },


  sortSelect: {
    padding:
      "10px 12px",

    border:
      "1px solid rgba(150,205,255,0.25)",

    borderRadius: "9px",

    fontSize: "14px",

    background:
      "rgba(255,255,255,0.93)",

    color: "#334155",

    outline: "none",

    cursor: "pointer",
  },


  // =====================================================
  // EMPTY / LOADING
  // =====================================================

  empty: {
    background:
      "rgba(255,255,255,0.045)",

    border:
      "1px dashed rgba(120,180,255,0.30)",

    padding: "30px",

    borderRadius: "12px",

    textAlign: "center",

    color: "#9fc4e8",

    marginTop: "15px",
  },


  // =====================================================
  // TABLE
  // =====================================================

  tableWrapper: {
    overflowX: "auto",

    marginTop: "10px",

    borderRadius: "14px",

    border:
      "1px solid rgba(120,180,255,0.18)",
  },


  table: {
    width: "100%",

    borderCollapse:
      "collapse",

    minWidth: "1050px",

    background:
      "rgba(5,22,52,0.45)",
  },


  th: {
    background:
      "rgba(37,99,235,0.28)",

    color: "#dbeafe",

    padding: "14px",

    textAlign: "left",

    fontSize: "13px",

    borderBottom:
      "1px solid rgba(120,180,255,0.22)",

    whiteSpace:
      "nowrap",
  },


  td: {
    padding: "14px",

    borderBottom:
      "1px solid rgba(120,180,255,0.12)",

    color: "#dbeafe",

    fontSize: "14px",

    whiteSpace:
      "nowrap",
  },


  methodBadge: {
    display:
      "inline-block",

    padding:
      "5px 10px",

    borderRadius:
      "20px",

    background:
      "rgba(80,150,255,0.16)",

    color:
      "#bfdbfe",

    border:
      "1px solid rgba(120,190,255,0.20)",

    fontSize:
      "12px",

    fontWeight:
      "bold",
  },


  statusBadge: {
    display:
      "inline-block",

    padding:
      "5px 10px",

    borderRadius:
      "20px",

    fontSize:
      "12px",

    fontWeight:
      "bold",
  },


  // =====================================================
  // BOTTOM BUTTONS
  // =====================================================

  bottomActions: {
    marginTop: "22px",

    display: "flex",

    justifyContent:
      "center",

    gap: "12px",

    flexWrap: "wrap",
  },


  ordersButton: {
    border:
      "1px solid rgba(120,190,255,0.25)",

    background:
      "linear-gradient(135deg,#0f766e,#14b8a6)",

    color: "white",

    padding:
      "12px 20px",

    borderRadius:
      "10px",

    cursor: "pointer",

    fontWeight: "bold",

    boxShadow:
      "0 10px 25px rgba(0,0,0,0.22)",
  },


  dashboardButton: {
    border:
      "1px solid rgba(120,190,255,0.25)",

    background:
      "linear-gradient(135deg,#2563eb,#1d4ed8)",

    color: "white",

    padding:
      "12px 20px",

    borderRadius:
      "10px",

    cursor: "pointer",

    fontWeight: "bold",

    boxShadow:
      "0 10px 25px rgba(0,0,0,0.22)",
  },


  // =====================================================
  // FOOTER
  // =====================================================

  footer: {
    textAlign: "center",

    color: "#7fa6cc",

    fontSize: "13px",

    padding:
      "25px 0 10px",
  },

};


export default Payment;