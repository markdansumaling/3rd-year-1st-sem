import { useState } from "react";

function CustomerDashboard({
  user,
  onLogout,
  onCreateOrder,
  onOrders,
  onPayments,
  onProfile,
}) {

  const [activeMenu, setActiveMenu] =
    useState("dashboard");

  const customerName =
    user?.full_name ||
    user?.username ||
    "Customer";


  // =====================================================
  // CREATE ORDER
  // =====================================================

  const handleCreateOrder = (e) => {

    e.preventDefault();
    e.stopPropagation();

    console.log(
      "CREATE ORDER BUTTON CLICKED"
    );

    console.log(
      "CURRENT USER:",
      user
    );

    console.log(
      "CREATE ORDER FUNCTION:",
      onCreateOrder
    );

    setActiveMenu(
      "create-order"
    );

    if (
      typeof onCreateOrder ===
      "function"
    ) {

      onCreateOrder();

    } else {

      console.error(
        "onCreateOrder function is missing!"
      );

    }
  };


  // =====================================================
  // MY ORDERS
  // =====================================================

  const handleOrders = (e) => {

    e.preventDefault();
    e.stopPropagation();

    console.log(
      "MY ORDERS BUTTON CLICKED"
    );

    setActiveMenu(
      "orders"
    );

    if (
      typeof onOrders ===
      "function"
    ) {

      onOrders();

    }

  };


  // =====================================================
  // PAYMENTS
  // =====================================================

  const handlePayments = (e) => {

    e.preventDefault();
    e.stopPropagation();

    setActiveMenu(
      "payments"
    );

    if (
      typeof onPayments ===
      "function"
    ) {

      onPayments();

    }

  };


  // =====================================================
  // PROFILE
  // =====================================================

  const handleProfile = (e) => {

    e.preventDefault();
    e.stopPropagation();

    setActiveMenu(
      "profile"
    );

    if (
      typeof onProfile ===
      "function"
    ) {

      onProfile();

    }

  };


  return (

    <div style={styles.page}>

      <div style={styles.container}>

        {/* =================================================
            HEADER
        ================================================= */}

        <header style={styles.header}>

          <div>

            <h1 style={styles.headerTitle}>
              🖨️ Printing Management System
            </h1>

            <p style={styles.headerSubtitle}>
              Customer Dashboard
            </p>

          </div>


          <div style={styles.userArea}>

            <div style={styles.userInfo}>

              <div style={styles.userName}>
                {customerName}
              </div>

              <div style={styles.userRole}>
                {user?.role || "customer"}
              </div>

            </div>


            <button
              type="button"
              style={styles.logoutButton}
              onClick={onLogout}
            >
              🚪 Logout
            </button>

          </div>

        </header>


        {/* =================================================
            WELCOME
        ================================================= */}

        <section style={styles.welcomeCard}>

          <div>

            <h2 style={styles.welcomeTitle}>
              Welcome, {customerName}! 👋
            </h2>

            <p style={styles.welcomeText}>
              Manage your printing orders,
              payments, and profile from here.
            </p>

          </div>


          <div style={styles.welcomeIcon}>
            🖨️
          </div>

        </section>


        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section style={styles.section}>

          <h2 style={styles.sectionTitle}>
            What would you like to do?
          </h2>

          <p style={styles.sectionDescription}>
            Choose an option below to manage
            your printing needs.
          </p>


          <div style={styles.actionGrid}>

            {/* =================================================
                CREATE ORDER
            ================================================= */}

            <button
              type="button"
              style={{
                ...styles.actionButton,
                background:
                  "linear-gradient(135deg, rgba(37,99,235,0.95), rgba(29,78,216,0.85))",
              }}
              onClick={handleCreateOrder}
            >

              <span style={styles.actionIcon}>
                ➕
              </span>

              <span style={styles.actionText}>

                <strong>
                  Create Order
                </strong>

                <small>
                  Place a new printing order
                </small>

              </span>

            </button>


            {/* =================================================
                MY ORDERS
            ================================================= */}

            <button
              type="button"
              style={{
                ...styles.actionButton,
                background:
                  "linear-gradient(135deg, rgba(15,118,110,0.95), rgba(20,184,166,0.80))",
              }}
              onClick={handleOrders}
            >

              <span style={styles.actionIcon}>
                📋
              </span>

              <span style={styles.actionText}>

                <strong>
                  My Orders
                </strong>

                <small>
                  View your printing orders
                </small>

              </span>

            </button>


            {/* =================================================
                PAYMENTS
            ================================================= */}

            <button
              type="button"
              style={{
                ...styles.actionButton,
                background:
                  "linear-gradient(135deg, rgba(22,163,74,0.95), rgba(21,128,61,0.85))",
              }}
              onClick={handlePayments}
            >

              <span style={styles.actionIcon}>
                💰
              </span>

              <span style={styles.actionText}>

                <strong>
                  My Payments
                </strong>

                <small>
                  View your payment history
                </small>

              </span>

            </button>


            {/* =================================================
                PROFILE
            ================================================= */}

            <button
              type="button"
              style={{
                ...styles.actionButton,
                background:
                  "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(109,40,217,0.85))",
              }}
              onClick={handleProfile}
            >

              <span style={styles.actionIcon}>
                👤
              </span>

              <span style={styles.actionText}>

                <strong>
                  My Profile
                </strong>

                <small>
                  Manage your account
                </small>

              </span>

            </button>

          </div>

        </section>


        {/* =================================================
            ORDER STATUS
        ================================================= */}

        <section style={styles.statusCard}>

          <h2 style={styles.sectionTitle}>
            Order Status
          </h2>

          <p style={styles.sectionDescription}>
            Your recent order status will
            appear here.
          </p>


          <div style={styles.statusEmpty}>

            <div style={styles.emptyIcon}>
              📦
            </div>

            <h3 style={styles.emptyTitle}>
              No recent orders
            </h3>

            <p style={styles.emptyText}>
              Create your first printing order
              to see its status here.
            </p>


            <button
              type="button"
              style={styles.createButton}
              onClick={handleCreateOrder}
            >
              ➕ Create New Order
            </button>

          </div>

        </section>


        {/* =================================================
            CUSTOMER INFORMATION
        ================================================= */}

        <section style={styles.infoCard}>

          <h2 style={styles.sectionTitle}>
            Account Information
          </h2>


          <div style={styles.infoGrid}>

            <div style={styles.infoItem}>

              <span>
                Full Name
              </span>

              <strong>
                {user?.full_name ||
                  "Customer"}
              </strong>

            </div>


            <div style={styles.infoItem}>

              <span>
                Username
              </span>

              <strong>
                {user?.username ||
                  "-"}
              </strong>

            </div>


            <div style={styles.infoItem}>

              <span>
                Account Type
              </span>

              <strong
                style={{
                  color: "#8ec5ff",
                }}
              >
                Customer
              </strong>

            </div>

          </div>

        </section>


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer style={styles.footer}>

          Printing Management System ©{" "}
          {new Date().getFullYear()}

        </footer>

      </div>

    </div>

  );
}


// =====================================================
// DARK BLUE GLASSMORPHISM DESIGN
// FUNCTIONALITY UNCHANGED
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
    maxWidth: "1200px",
    margin: "0 auto",
  },


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


  headerTitle: {
    fontSize: "27px",

    margin:
      "0 0 6px",

    color: "white",

    fontWeight: "800",
  },


  headerSubtitle: {
    color: "#cfe4ff",

    margin: 0,

    fontSize: "14px",
  },


  userArea: {
    display: "flex",

    alignItems:
      "center",

    gap: "15px",

    flexWrap: "wrap",
  },


  userInfo: {
    textAlign: "right",

    padding: "8px 12px",

    borderRadius: "14px",

    background:
      "rgba(255,255,255,0.08)",

    border:
      "1px solid rgba(150,205,255,0.22)",
  },


  userName: {
    display: "block",

    fontWeight: "bold",

    marginBottom: "5px",

    color: "white",
  },


  userRole: {
    display: "inline-block",

    background:
      "rgba(80,150,255,0.25)",

    padding:
      "5px 10px",

    borderRadius:
      "20px",

    fontSize: "12px",

    color: "#dbeafe",
  },


  logoutButton: {
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


  welcomeCard: {
    marginTop: "22px",

    background:
      "linear-gradient(145deg, rgba(11,42,91,0.88), rgba(8,28,65,0.78))",

    border:
      "1px solid rgba(105,180,255,0.28)",

    backdropFilter:
      "blur(18px)",

    WebkitBackdropFilter:
      "blur(18px)",

    padding: "28px 30px",

    borderRadius: "20px",

    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    boxShadow:
      "0 18px 45px rgba(0,0,0,0.30)",
  },


  welcomeTitle: {
    margin:
      "0 0 8px",

    color: "white",

    fontSize: "25px",

    fontWeight: "800",
  },


  welcomeText: {
    margin: 0,

    color: "#bdd7f7",

    fontSize: "14px",
  },


  welcomeIcon: {
    fontSize: "55px",

    width: "75px",

    height: "75px",

    borderRadius: "20px",

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    background:
      "rgba(80,150,255,0.15)",

    border:
      "1px solid rgba(120,190,255,0.22)",

    boxShadow:
      "0 10px 30px rgba(0,0,0,0.20)",
  },


  section: {
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


  sectionDescription: {
    margin:
      "0 0 20px",

    color: "#9fc4e8",

    fontSize: "14px",
  },


  actionGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(250px,1fr))",

    gap: "16px",
  },


  actionButton: {
    border:
      "1px solid rgba(150,210,255,0.25)",

    color: "white",

    padding: "20px",

    borderRadius: "15px",

    display: "flex",

    alignItems:
      "center",

    gap: "15px",

    textAlign: "left",

    cursor: "pointer",

    boxShadow:
      "0 12px 28px rgba(0,0,0,0.22)",
  },


  actionIcon: {
    fontSize: "28px",

    flexShrink: 0,

    width: "50px",

    height: "50px",

    borderRadius: "13px",

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    background:
      "rgba(255,255,255,0.12)",

    border:
      "1px solid rgba(255,255,255,0.12)",
  },


  actionText: {
    display: "flex",

    flexDirection:
      "column",

    gap: "5px",
  },


  statusCard: {
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


  statusEmpty: {
    marginTop: "20px",

    background:
      "rgba(255,255,255,0.035)",

    border:
      "1px dashed rgba(120,180,255,0.30)",

    borderRadius: "14px",

    padding: "35px 20px",

    textAlign: "center",
  },


  emptyIcon: {
    fontSize: "45px",

    marginBottom: "10px",
  },


  emptyTitle: {
    color: "white",

    margin:
      "8px 0",
  },


  emptyText: {
    color: "#9fc4e8",

    margin:
      "0 0 10px",

    fontSize: "14px",
  },


  createButton: {
    marginTop: "18px",

    border:
      "1px solid rgba(150,210,255,0.30)",

    background:
      "linear-gradient(135deg,#2563eb,#1d4ed8)",

    color: "white",

    padding:
      "12px 18px",

    borderRadius:
      "10px",

    fontWeight: "bold",

    cursor: "pointer",

    boxShadow:
      "0 10px 25px rgba(0,0,0,0.25)",
  },


  infoCard: {
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


  infoGrid: {
    marginTop: "20px",

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",

    gap: "15px",
  },


  infoItem: {
    background:
      "rgba(255,255,255,0.045)",

    border:
      "1px solid rgba(150,205,255,0.14)",

    padding: "18px",

    borderRadius: "12px",

    display: "flex",

    flexDirection:
      "column",

    gap: "7px",

    color: "#9fc4e8",
  },


  footer: {
    textAlign: "center",

    color: "#7fa6cc",

    fontSize: "13px",

    padding:
      "25px 0 10px",
  },

};


export default CustomerDashboard;