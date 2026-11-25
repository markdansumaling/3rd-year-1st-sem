
import { useEffect, useState } from "react";

function AddOrder({ onBack, user }) {
  const API = "http://localhost/printing-management-system/api";

  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [pages, setPages] = useState("");
  const [copies, setCopies] = useState("");
  const [printType, setPrintType] = useState("");
  const [paperSize, setPaperSize] = useState("");
  const [printMode, setPrintMode] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);

  const customerName =
    user?.full_name || user?.username || "Customer";

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setServicesLoading(true);
      setError("");

      const response = await fetch(`${API}/services.php`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error(`Server error: HTTP ${response.status}`);
      }

      if (!text.trim()) {
        throw new Error("Services API returned an empty response.");
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Services API did not return valid JSON.");
      }

      if (!data.success) {
        throw new Error(data.message || "Unable to load services.");
      }

      setServices(Array.isArray(data.services) ? data.services : []);
    } catch (err) {
      console.error("Services error:", err);
      setError(err.message || "Unable to load services.");
    } finally {
      setServicesLoading(false);
    }
  };

  // Only allow whole-number digits in Pages and Copies.
  const handlePositiveNumberChange = (value, setValue) => {
    if (value === "" || /^\d+$/.test(value)) {
      setValue(value);
      setError("");
      setMessage("");
    }
  };

  const selectedService = services.find(
    (service) => Number(service.service_id) === Number(serviceId)
  );

  const servicePrice = selectedService
    ? Number(selectedService.price || 0)
    : 0;

  const totalAmount =
    servicePrice * Number(pages || 0) * Number(copies || 0);

  const clearForm = () => {
    setServiceId("");
    setDocumentName("");
    setAttachment(null);
    setPages("");
    setCopies("");
    setPrintType("");
    setPaperSize("");
    setPrintMode("");

    const fileInput = document.getElementById("order-attachment");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!user) {
      setError("Your login session is missing. Please login again.");
      return;
    }

    if (!user.user_id) {
      setError("Customer ID is missing from your login session.");
      console.error("USER OBJECT:", user);
      return;
    }

    // Validate Pages and Copies before submitting the order.
    const validPages = /^\d+$/.test(pages) && Number(pages) >= 1;
    const validCopies = /^\d+$/.test(copies) && Number(copies) >= 1;

    if (!validPages || !validCopies) {
      setError(
        "Number of Pages and Number of Copies must be whole numbers starting from 1. Negative numbers, zero, and decimals are not allowed."
      );
      return;
    }

    if (
      !serviceId ||
      !documentName.trim() ||
      !attachment ||
      !printType ||
      !paperSize ||
      !printMode
    ) {
      setError("Please complete all fields and attach your document.");
      return;
    }

    const allowedExtensions = [
      "pdf", "doc", "docx", "jpg", "jpeg", "png",
    ];

    const extension = attachment.name
      .split(".")
      .pop()
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setError("Please upload a PDF, DOC, DOCX, JPG, or PNG file.");
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (attachment.size > maxSize) {
      setError("The attachment must be 10 MB or smaller.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("customer_id", String(user.user_id));
      formData.append("service_id", String(serviceId));
      formData.append("document_name", documentName.trim());
      formData.append("pages", String(pages));
      formData.append("copies", String(copies));
      formData.append("print_type", printType);
      formData.append("paper_size", paperSize);
      formData.append("print_mode", printMode);

      // Keep the existing document attachment.
      formData.append("attachment", attachment);

      const response = await fetch(`${API}/add_order.php`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const text = await response.text();

      console.log("ADD ORDER HTTP STATUS:", response.status);
      console.log("ADD ORDER RESPONSE:", text);

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
        throw new Error("Server did not return valid JSON.");
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to create order.");
      }

      setMessage(
        `Order created! Order Number: ${data.order_number || "-"} | ` +
        `Customer: ${data.customer_name || customerName} | ` +
        `Total: ₱${Number(data.total_amount ?? totalAmount).toFixed(2)}`
      );

      clearForm();
    } catch (err) {
      console.error("Create order error:", err);
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>
              🖨️ Printing Servies
            </h1>
            <p style={styles.headerSubtitle}>
              Create New Printing Order
            </p>
          </div>

          <div style={styles.userInfo}>
            <strong>{customerName}</strong>
            <span style={styles.role}>{user?.role || "customer"}</span>
          </div>
        </header>

        <section style={styles.card}>
          <h2 style={styles.title}>📝 Create New Order</h2>
          <p style={styles.description}>
            Fill in your printing order details and upload the document.
          </p>

          <div style={styles.customerBox}>
            <div style={styles.customerIcon}>👤</div>
            <div>
              <span style={styles.customerLabel}>Customer Name</span>
              <strong style={styles.customerName}>{customerName}</strong>
              {user?.username && (
                <span style={styles.username}>@{user.username}</span>
              )}
            </div>
          </div>

          {error && <div style={styles.error}>⚠️ {error}</div>}
          {message && <div style={styles.success}>✅ {message}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Printing Service *</label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  style={styles.input}
                  disabled={loading || servicesLoading}
                  required
                >
                  <option value="">
                    {servicesLoading ? "Loading services..." : "-- Select Service --"}
                  </option>
                  {services.map((service) => (
                    <option
                      key={service.service_id}
                      value={service.service_id}
                    >
                      {service.service_name} - ₱
                      {Number(service.price || 0).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Document Name *</label>
                <input
                  type="text"
                  placeholder="Example: Thesis.pdf"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  style={styles.input}
                  disabled={loading}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Attachment / Upload Document *
                </label>
                <input
                  id="order-attachment"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    setAttachment(e.target.files?.[0] || null);
                    setError("");
                  }}
                  style={styles.input}
                  disabled={loading}
                  required
                />
                <small style={styles.helpText}>
                  PDF, DOC, DOCX, JPG, PNG — maximum 10 MB.
                </small>

                {attachment && (
                  <div style={styles.fileBox}>
                    <span>📎 {attachment.name}</span>
                    <button
                      type="button"
                      style={styles.removeFileButton}
                      onClick={() => {
                        setAttachment(null);
                        const input = document.getElementById("order-attachment");
                        if (input) input.value = "";
                      }}
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Number of Pages *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter pages"
                  value={pages}
                  onChange={(e) =>
                    handlePositiveNumberChange(e.target.value, setPages)
                  }
                  style={styles.input}
                  disabled={loading}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Number of Copies *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter copies"
                  value={copies}
                  onChange={(e) =>
                    handlePositiveNumberChange(e.target.value, setCopies)
                  }
                  style={styles.input}
                  disabled={loading}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Print Type *</label>
                <select
                  value={printType}
                  onChange={(e) => setPrintType(e.target.value)}
                  style={styles.input}
                  disabled={loading}
                  required
                >
                  <option value="">-- Select Print Type --</option>
                  <option value="Black & White">Black & White</option>
                  <option value="Colored">Colored</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Paper Size *</label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value)}
                  style={styles.input}
                  disabled={loading}
                  required
                >
                  <option value="">-- Select Paper Size --</option>
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                  <option value="Long">Long</option>
                  <option value="Short">Short</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Print Mode *</label>
                <select
                  value={printMode}
                  onChange={(e) => setPrintMode(e.target.value)}
                  style={styles.input}
                  disabled={loading}
                  required
                >
                  <option value="">-- Select Print Mode --</option>
                  <option value="Simplex">Simplex (Single-sided)</option>
                  <option value="Duplex">Duplex (Double-sided)</option>
                </select>
              </div>
            </div>

            <div style={styles.infoBox}>
              <div style={styles.infoTitle}>💡 Order Calculation</div>
              <div style={styles.calculationRow}>
                <span>Service Price</span>
                <strong>₱{servicePrice.toFixed(2)}</strong>
              </div>
              <div style={styles.calculationRow}>
                <span>Pages</span>
                <strong>{pages || 0}</strong>
              </div>
              <div style={styles.calculationRow}>
                <span>Copies</span>
                <strong>{copies || 0}</strong>
              </div>
              <div style={styles.totalRow}>
                <span>Total Amount</span>
                <strong>₱{totalAmount.toFixed(2)}</strong>
              </div>
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitButton,
                ...(loading ? styles.loading : {}),
              }}
              disabled={loading || servicesLoading}
            >
              {loading ? "Creating Order..." : "➕ Submit Order"}
            </button>
          </form>
        </section>

        <div style={styles.navigation}>
          <button
            type="button"
            style={styles.navButton}
            onClick={onBack}
            disabled={loading}
          >
            ← Customer Dashboard
          </button>
        </div>
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
  container: {
    width: "94%",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  header: {
    background: "linear-gradient(135deg, rgba(12,39,91,0.90), rgba(25,73,145,0.72))",
    border: "1px solid rgba(120,180,255,0.28)",
    backdropFilter: "blur(18px)",
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
  headerSubtitle: {
    color: "#cfe4ff",
    margin: 0,
    fontSize: "14px",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "6px",
    padding: "8px 12px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(150,205,255,0.22)",
  },
  role: {
    background: "rgba(80,150,255,0.25)",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    color: "#dbeafe",
  },
  card: {
    background: "linear-gradient(145deg, rgba(11,42,91,0.86), rgba(8,28,65,0.76))",
    border: "1px solid rgba(105,180,255,0.28)",
    backdropFilter: "blur(18px)",
    marginTop: "22px",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 18px 45px rgba(0,0,0,0.30)",
  },
  title: {
    color: "white",
    fontSize: "24px",
    margin: "0 0 8px",
    fontWeight: "800",
  },
  description: {
    color: "#bdd7f7",
    marginBottom: "20px",
    fontSize: "14px",
  },
  customerBox: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background: "rgba(80,150,255,0.12)",
    border: "1px solid rgba(120,190,255,0.22)",
    padding: "15px 18px",
    borderRadius: "13px",
    marginBottom: "25px",
  },
  customerIcon: {
    fontSize: "27px",
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    background: "rgba(80,150,255,0.22)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  customerLabel: {
    display: "block",
    color: "#9fc4e8",
    fontSize: "12px",
    marginBottom: "3px",
  },
  customerName: {
    display: "block",
    color: "white",
    fontSize: "16px",
  },
  username: {
    display: "block",
    color: "#9fc4e8",
    fontSize: "12px",
    marginTop: "3px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  label: {
    fontWeight: "bold",
    color: "#dbeafe",
    marginBottom: "8px",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "13px 14px",
    border: "1px solid rgba(150,205,255,0.28)",
    borderRadius: "10px",
    fontSize: "15px",
    background: "rgba(255,255,255,0.95)",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
  },
  helpText: {
    color: "#cfe4ff",
    marginTop: "7px",
    lineHeight: 1.5,
  },
  fileBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "10px",
    padding: "10px",
    borderRadius: "8px",
    background: "rgba(22,163,74,0.15)",
    color: "#bbf7d0",
    overflowWrap: "anywhere",
  },
  removeFileButton: {
    border: "1px solid rgba(248,113,113,0.5)",
    background: "rgba(220,38,38,0.2)",
    color: "#fecaca",
    padding: "6px 9px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  error: {
    background: "rgba(220,38,38,0.18)",
    color: "#fecaca",
    borderLeft: "5px solid #ef4444",
    border: "1px solid rgba(248,113,113,0.25)",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontWeight: "bold",
    overflowWrap: "anywhere",
  },
  success: {
    background: "rgba(22,163,74,0.18)",
    color: "#bbf7d0",
    borderLeft: "5px solid #22c55e",
    border: "1px solid rgba(74,222,128,0.25)",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontWeight: "bold",
    overflowWrap: "anywhere",
  },
  infoBox: {
    marginTop: "25px",
    background: "rgba(37,99,235,0.13)",
    border: "1px solid rgba(105,180,255,0.25)",
    padding: "18px",
    borderRadius: "13px",
    color: "#dbeafe",
    fontSize: "14px",
  },
  infoTitle: {
    fontWeight: "bold",
    marginBottom: "10px",
    color: "white",
  },
  calculationRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "10px",
    color: "#c5dcf5",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "15px",
    paddingTop: "12px",
    borderTop: "1px solid rgba(150,205,255,0.22)",
    fontSize: "17px",
    color: "white",
  },
  submitButton: {
    width: "100%",
    marginTop: "25px",
    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    color: "white",
    border: "1px solid rgba(150,210,255,0.30)",
    padding: "15px",
    borderRadius: "11px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
  },
  loading: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  navigation: {
    marginTop: "22px",
    background: "rgba(11,42,91,0.78)",
    border: "1px solid rgba(105,180,255,0.24)",
    backdropFilter: "blur(16px)",
    padding: "18px 22px",
    borderRadius: "16px",
    boxShadow: "0 14px 35px rgba(0,0,0,0.22)",
  },
  navButton: {
    border: "none",
    background: "transparent",
    color: "#8fc7ff",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
  },
};

export default AddOrder;
