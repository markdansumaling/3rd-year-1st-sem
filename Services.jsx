import { useEffect, useState } from "react";

const API =
  "http://localhost/printing-management-system/api";

function Services({ onBack }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // =====================================================
  // LOAD SERVICES
  // =====================================================

  const loadServices = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API}/services.php`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const text = await response.text();

      console.log("Services response:", text);

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Server returned invalid JSON."
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to load services."
        );
      }

      setServices(data.services || []);

    } catch (err) {
      console.error(
        "Services error:",
        err
      );

      setError(
        err.message ||
          "Unable to connect to the server."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  const openAddForm = () => {
    setEditingService(null);
    setServiceName("");
    setPrice("");
    setMessage("");
    setShowForm(true);
  };

  // =====================================================
  // OPEN EDIT FORM
  // =====================================================

  const openEditForm = (service) => {
    setEditingService(service);

    setServiceName(
      service.service_name || ""
    );

    setPrice(
      service.price ?? ""
    );

    setMessage("");
    setShowForm(true);
  };

  // =====================================================
  // CLOSE FORM
  // =====================================================

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingService(null);
    setServiceName("");
    setPrice("");
    setMessage("");
  };

  // =====================================================
  // SAVE SERVICE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    const name = serviceName.trim();
    const servicePrice = Number(price);

    if (!name) {
      setMessage(
        "Please enter a service name."
      );
      return;
    }

    if (
      price === "" ||
      Number.isNaN(servicePrice) ||
      servicePrice <= 0
    ) {
      setMessage(
        "Please enter a valid price."
      );
      return;
    }

    setSaving(true);

    try {
      const endpoint = editingService
        ? `${API}/update_service.php`
        : `${API}/add_service.php`;

      const body = editingService
        ? {
            service_id:
              editingService.service_id,
            service_name: name,
            price: servicePrice,
          }
        : {
            service_name: name,
            price: servicePrice,
          };

      const response = await fetch(
        endpoint,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const text = await response.text();

      console.log(
        "Save service response:",
        text
      );

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Server returned invalid JSON."
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to save service."
        );
      }

      setShowForm(false);
      setEditingService(null);
      setServiceName("");
      setPrice("");

      setMessage(
        data.message ||
          "Service successfully saved!"
      );

      await loadServices();

    } catch (err) {
      console.error(
        "Save service error:",
        err
      );

      setMessage(
        err.message ||
          "Unable to save service."
      );

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // ACTIVATE / DEACTIVATE
  // =====================================================

  const toggleService = async (service) => {
    const newStatus =
      service.status === "Active"
        ? "Inactive"
        : "Active";

    const action =
      newStatus === "Active"
        ? "activate"
        : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${service.service_name}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API}/update_service.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            service_id:
              service.service_id,
            service_name:
              service.service_name,
            price: Number(service.price),
            status: newStatus,
          }),
        }
      );

      const text = await response.text();

      console.log(
        "Status update response:",
        text
      );

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Server returned invalid JSON."
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to update service."
        );
      }

      setMessage(
        data.message ||
          "Service status updated."
      );

      await loadServices();

    } catch (err) {
      console.error(
        "Toggle service error:",
        err
      );

      setMessage(
        err.message ||
          "Unable to update service."
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>
            🛠️
          </div>

          <h2>
            Loading Services...
          </h2>

          <p>
            Please wait.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div style={styles.page}>

      <div style={styles.container}>

        {/* HEADER */}

        <header style={styles.header}>

          <div>
            <h1 style={styles.headerTitle}>
              🖨️ Printing Management System
            </h1>

            <p style={styles.headerSubtitle}>
              Services Management
            </p>
          </div>

          <div style={styles.adminBadge}>
            Administrator
          </div>

        </header>

        {/* TITLE */}

        <section style={styles.topSection}>

          <div>
            <h2 style={styles.pageTitle}>
              🛠️ Printing Services
            </h2>

            <p style={styles.description}>
              Manage your printing services
              and prices.
            </p>
          </div>

          <div style={styles.topButtons}>

            <button
              style={styles.refreshButton}
              onClick={loadServices}
            >
              🔄 Refresh
            </button>

            <button
              style={styles.addButton}
              onClick={openAddForm}
            >
              ➕ Add Service
            </button>

          </div>

        </section>

        {/* MESSAGE */}

        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div style={styles.errorBox}>
            <strong>
              ⚠️ Unable to load services
            </strong>

            <p>
              {error}
            </p>

            <button
              style={styles.retryButton}
              onClick={loadServices}
            >
              🔄 Try Again
            </button>
          </div>
        )}

        {/* SERVICES */}

        {!error && (
          <section style={styles.card}>

            <div style={styles.cardHeader}>

              <h3 style={styles.cardTitle}>
                All Services
              </h3>

              <span style={styles.count}>
                {services.length} Services
              </span>

            </div>

            {services.length === 0 ? (

              <div style={styles.emptyState}>

                <div style={styles.emptyIcon}>
                  🛠️
                </div>

                <h3>
                  No Services Found
                </h3>

                <p>
                  Add your first printing
                  service.
                </p>

              </div>

            ) : (

              <div style={styles.tableWrapper}>

                <table style={styles.table}>

                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Service Name</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {services.map(
                      (service) => (

                        <tr
                          key={
                            service.service_id
                          }
                        >

                          <td>
                            {
                              service.service_id
                            }
                          </td>

                          <td>
                            <strong>
                              {
                                service.service_name
                              }
                            </strong>
                          </td>

                          <td>
                            <strong
                              style={
                                styles.price
                              }
                            >
                              ₱
                              {Number(
                                service.price
                              ).toFixed(2)}
                            </strong>
                          </td>

                          <td>

                            <span
                              style={{
                                ...styles.status,
                                ...(service.status ===
                                "Active"
                                  ? styles.active
                                  : styles.inactive),
                              }}
                            >
                              {
                                service.status ||
                                "Active"
                              }
                            </span>

                          </td>

                          <td>

                            <div
                              style={
                                styles.actions
                              }
                            >

                              <button
                                style={
                                  styles.editButton
                                }
                                onClick={() =>
                                  openEditForm(
                                    service
                                  )
                                }
                              >
                                ✏️ Edit
                              </button>

                              <button
                                style={{
                                  ...styles.toggleButton,
                                  ...(service.status ===
                                  "Active"
                                    ? styles.deactivateButton
                                    : styles.activateButton),
                                }}
                                onClick={() =>
                                  toggleService(
                                    service
                                  )
                                }
                              >
                                {service.status ===
                                "Active"
                                  ? "🔴 Deactivate"
                                  : "🟢 Activate"}
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>
        )}

        {/* BACK */}

        <div style={styles.navigation}>

          <button
            style={styles.backButton}
            onClick={onBack}
          >
            ← Dashboard
          </button>

        </div>

        {/* MODAL */}

        {showForm && (

          <div style={styles.overlay}>

            <div style={styles.modal}>

              <div style={styles.modalHeader}>

                <h2>
                  {editingService
                    ? "✏️ Edit Service"
                    : "➕ Add Service"}
                </h2>

                <button
                  style={styles.closeButton}
                  onClick={closeForm}
                  disabled={saving}
                >
                  ✕
                </button>

              </div>

              {message && (
                <div style={styles.formMessage}>
                  {message}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
              >

                <div style={styles.formGroup}>

                  <label>
                    Service Name
                  </label>

                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) =>
                      setServiceName(
                        e.target.value
                      )
                    }
                    placeholder="Example: Photocopy"
                    disabled={saving}
                  />

                </div>

                <div style={styles.formGroup}>

                  <label>
                    Price
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={price}
                    onChange={(e) =>
                      setPrice(
                        e.target.value
                      )
                    }
                    placeholder="Example: 2.00"
                    disabled={saving}
                  />

                </div>

                <div style={styles.modalActions}>

                  <button
                    type="button"
                    style={
                      styles.cancelButton
                    }
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={
                      styles.saveButton
                    }
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingService
                      ? "💾 Update Service"
                      : "💾 Save Service"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

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
    color: "#1e293b",
  },

  container: {
    width: "94%",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: {
    background:
      "linear-gradient(135deg,#1e3a8a,#2563eb)",
    color: "white",
    padding: "27px 30px",
    borderRadius: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    boxShadow:
      "0 12px 30px rgba(37,99,235,0.22)",
  },

  headerTitle: {
    margin: "0 0 6px",
    fontSize: "27px",
  },

  headerSubtitle: {
    margin: 0,
    color: "#dbeafe",
    fontSize: "14px",
  },

  adminBadge: {
    background:
      "rgba(255,255,255,0.18)",
    padding: "8px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "bold",
  },

  topSection: {
    background: "white",
    marginTop: "22px",
    padding: "25px",
    borderRadius: "16px",
    boxShadow:
      "0 5px 20px rgba(15,23,42,0.07)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  pageTitle: {
    margin: "0 0 7px",
    fontSize: "23px",
    color: "#0f172a",
  },

  description: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
  },

  topButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  refreshButton: {
    border: "none",
    background: "#64748b",
    color: "white",
    padding: "11px 17px",
    borderRadius: "9px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  addButton: {
    border: "none",
    background:
      "linear-gradient(135deg,#2563eb,#1d4ed8)",
    color: "white",
    padding: "11px 18px",
    borderRadius: "9px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  message: {
    marginTop: "18px",
    background: "#dcfce7",
    color: "#166534",
    padding: "14px 18px",
    borderRadius: "10px",
    fontWeight: "bold",
  },

  errorBox: {
    marginTop: "18px",
    background: "#fee2e2",
    color: "#991b1b",
    padding: "18px",
    borderRadius: "10px",
  },

  retryButton: {
    marginTop: "12px",
    border: "none",
    background: "#dc2626",
    color: "white",
    padding: "10px 16px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  card: {
    background: "white",
    marginTop: "22px",
    borderRadius: "16px",
    boxShadow:
      "0 8px 25px rgba(15,23,42,0.08)",
    overflow: "hidden",
    border:
      "1px solid #e2e8f0",
  },

  cardHeader: {
    padding: "20px 22px",
    borderBottom:
      "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "18px",
  },

  count: {
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "bold",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "800px",
    borderCollapse: "collapse",
  },

  price: {
    color: "#15803d",
  },

  status: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  active: {
    background: "#dcfce7",
    color: "#166534",
  },

  inactive: {
    background: "#fee2e2",
    color: "#991b1b",
  },

  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  editButton: {
    border: "none",
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "8px 11px",
    borderRadius: "7px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  toggleButton: {
    border: "none",
    padding: "8px 11px",
    borderRadius: "7px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  deactivateButton: {
    background: "#fee2e2",
    color: "#991b1b",
  },

  activateButton: {
    background: "#dcfce7",
    color: "#166534",
  },

  emptyState: {
    textAlign: "center",
    padding: "55px 20px",
    color: "#64748b",
  },

  emptyIcon: {
    fontSize: "45px",
    marginBottom: "12px",
  },

  navigation: {
    marginTop: "22px",
    background: "white",
    padding: "18px 22px",
    borderRadius: "14px",
    boxShadow:
      "0 5px 18px rgba(15,23,42,0.06)",
  },

  backButton: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(15,23,42,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: "480px",
    background: "white",
    borderRadius: "16px",
    padding: "25px",
    boxShadow:
      "0 20px 50px rgba(0,0,0,0.25)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  closeButton: {
    border: "none",
    background: "#f1f5f9",
    color: "#475569",
    width: "35px",
    height: "35px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  formMessage: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
    fontSize: "14px",
    fontWeight: "bold",
  },

  formGroup: {
    marginBottom: "18px",
  },

  formGroupLabel: {
    display: "block",
    marginBottom: "7px",
  },

  formGroupInput: {
    width: "100%",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },

  cancelButton: {
    border: "none",
    background: "#e2e8f0",
    color: "#334155",
    padding: "11px 17px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  saveButton: {
    border: "none",
    background: "#2563eb",
    color: "white",
    padding: "11px 17px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg,#eef4ff,#f8fafc)",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  loadingCard: {
    background: "white",
    padding: "40px",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow:
      "0 8px 25px rgba(15,23,42,0.1)",
  },

  loadingIcon: {
    fontSize: "45px",
    marginBottom: "15px",
  },
};

export default Services;