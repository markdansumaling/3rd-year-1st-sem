
import { useState } from "react";

const API = "http://localhost/printing-management-system/api";

function CustomerPayment({ onBack, user }) {
  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("GCash");
  const [attachment, setAttachment] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setMessage("");

    if (!file) {
      setAttachment(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Choose a JPG, PNG, WEBP, or PDF file.");
      setAttachment(null);
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("File size must not exceed 5 MB.");
      setAttachment(null);
      e.target.value = "";
      return;
    }

    setAttachment(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!orderId.trim() || Number(amount) <= 0) {
      setMessage("Enter a valid Order Number and amount.");
      return;
    }

    if (!attachment) {
      setMessage("Please attach your proof of payment.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("action", "submit_proof");
      formData.append("order_number", orderId.trim());
      formData.append("amount", amount);
      formData.append("payment_method", paymentMethod);
      formData.append("proof_of_payment", attachment);

      const response = await fetch(`${API}/payment.php`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to submit payment proof.");
      }

      setMessage(
        result.message ||
          "Proof submitted successfully. Please wait for admin verification."
      );

      setOrderId("");
      setAmount("");
      setPaymentMethod("GCash");
      setAttachment(null);

      const fileInput = document.getElementById("payment-proof-file");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      setMessage(
        error.message ||
          "Could not connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Customer Payments</h1>

        <p style={styles.subtitle}>
          Submit your payment details and proof of payment.
        </p>

        {user?.full_name && (
          <p style={styles.customerName}>
            Customer: {user.full_name}
          </p>
        )}

        <button type="button" onClick={onBack} style={styles.backButton}>
          ← Back to Dashboard
        </button>

        <hr style={styles.divider} />

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Order Number</label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Example: ORD-20261015064713-224"
            style={styles.input}
            required
          />

          <label style={styles.label}>Amount Paid (₱)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount paid"
            style={styles.input}
            required
          />

          <label style={styles.label}>Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={styles.input}
            required
          >
            <option value="GCash">GCash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
          </select>

          <label style={styles.label}>Proof of Payment</label>
          <p style={styles.helper}>
            Accepted formats: JPG, PNG, WEBP, or PDF. Maximum size: 5 MB.
          </p>

          <input
            id="payment-proof-file"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileChange}
            style={styles.fileInput}
            required
          />

          {attachment && (
            <p style={styles.fileName}>
              Selected file: {attachment.name}
            </p>
          )}

          {message && (
            <div style={styles.message} role="status">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Submitting..." : "Submit Proof of Payment"}
          </button>
        </form>

        <p style={styles.note}>
          After submission, your payment proof must be reviewed by the admin.
          Submitting proof does not automatically confirm payment.
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    boxSizing: "border-box",
    background: "#071a36",
    color: "white",
    padding: "30px 16px",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    maxWidth: "650px",
    width: "100%",
    boxSizing: "border-box",
    margin: "20px auto",
    padding: "28px",
    borderRadius: "14px",
    background: "#102b50",
    border: "1px solid #315783",
    boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
  },
  heading: {
    fontSize: "28px",
    marginBottom: "8px",
    color: "#ffffff",
  },
  subtitle: {
    color: "#cbd5e1",
    lineHeight: 1.5,
  },
  customerName: {
    color: "#93c5fd",
    fontSize: "14px",
  },
  backButton: {
    padding: "10px 14px",
    border: "1px solid #52749b",
    borderRadius: "8px",
    background: "#183b65",
    color: "white",
    cursor: "pointer",
    margin: "12px 0 18px",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #315783",
    margin: "5px 0 24px",
  },
  label: {
    display: "block",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#f8fafc",
  },
  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    marginBottom: "20px",
    borderRadius: "8px",
    border: "1px solid #7893b3",
    background: "#f8fafc",
    color: "#0f172a",
    fontSize: "15px",
  },
  helper: {
    fontSize: "13px",
    color: "#cbd5e1",
    lineHeight: 1.5,
  },
  fileInput: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    marginBottom: "16px",
    borderRadius: "8px",
    background: "#f8fafc",
    color: "#0f172a",
  },
  fileName: {
    color: "#bfdbfe",
    overflowWrap: "anywhere",
    fontSize: "13px",
  },
  message: {
    padding: "12px",
    marginBottom: "16px",
    borderRadius: "8px",
    background: "#183b65",
    border: "1px solid #52749b",
    color: "#f8fafc",
    lineHeight: 1.5,
    overflowWrap: "anywhere",
  },
  submitButton: {
    width: "100%",
    padding: "13px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "white",
    fontWeight: "bold",
    fontSize: "15px",
    cursor: "pointer",
  },
  note: {
    marginTop: "18px",
    fontSize: "12px",
    color: "#cbd5e1",
    lineHeight: 1.6,
  },
};

export default CustomerPayment;
