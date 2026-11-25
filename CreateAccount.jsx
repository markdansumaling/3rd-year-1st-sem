
import { useState } from "react";

function CreateAccount({
  onBack,
  onAccountCreated,
}) {
  const API =
    "http://localhost/printing-management-system/api";

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // CREATE ACCOUNT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    // CHECK REQUIRED FIELDS
    if (
      !fullName.trim() ||
      !username.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    // FULL NAME: letters only, with spaces,
    // hyphens, and apostrophes allowed
    const fullNamePattern =
      /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u;

    if (!fullNamePattern.test(fullName.trim())) {
      setError(
        "Full Name must contain letters only. Numbers are not allowed."
      );
      return;
    }

    // BLOCKED WORDS IN FULL NAME
    const blockedWords = ["tae"];

    const nameWords = fullName
      .trim()
      .toLowerCase()
      .split(/\s+/);

    if (
      nameWords.some((word) =>
        blockedWords.includes(word)
      )
    ) {
      setError("Please enter a proper full name.");
      return;
    }

    // USERNAME: letters, numbers, and symbols allowed,
    // but at least one English letter is required
    const usernamePattern = /^(?=.*[a-zA-Z])[\s\S]+$/;

    if (!usernamePattern.test(username.trim())) {
      setError(
        "Username cannot contain numbers only. Please include at least one letter."
      );
      return;
    }

    // USERNAME MINIMUM LENGTH
    if (username.trim().length < 3) {
      setError(
        "Username must be at least 3 characters."
      );
      return;
    }

    // PASSWORD: minimum 6 characters
    // Letters, numbers, and symbols are allowed
    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    // CONFIRM PASSWORD
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API}/create_account.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            full_name: fullName.trim(),
            username: username.trim(),
            password: password,
            confirm_password: confirmPassword,
          }),
        }
      );

      const text = await response.text();

      console.log(
        "CREATE ACCOUNT HTTP STATUS:",
        response.status
      );

      console.log(
        "CREATE ACCOUNT RESPONSE:",
        text
      );

      if (!response.ok) {
        throw new Error(
          `Server error: HTTP ${response.status}`
        );
      }

      if (!text.trim()) {
        throw new Error(
          "Server returned an empty response."
        );
      }

      let data;

      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error(
          "CREATE ACCOUNT JSON ERROR:",
          jsonError
        );

        throw new Error(
          "Server did not return valid JSON."
        );
      }

      // FAILED
      if (!data.success) {
        setError(
          data.message ||
            "Unable to create account."
        );
        return;
      }

      // SUCCESS
      setMessage(
        data.message ||
          "Account created successfully!"
      );

      setFullName("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");

      // RETURN TO CUSTOMER LOGIN
      setTimeout(() => {
        if (
          typeof onAccountCreated === "function"
        ) {
          onAccountCreated(data.username || "");
        } else if (
          typeof onBack === "function"
        ) {
          onBack();
        }
      }, 1200);

    } catch (err) {
      console.error(
        "CREATE ACCOUNT ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to connect to the server. Make sure XAMPP Apache and MySQL are running."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PAGE DESIGN
  // =====================================================

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: Arial, Helvetica, sans-serif;
          min-height: 100vh;
        }

        #root {
          min-height: 100vh;
        }

        .register-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background:
            linear-gradient(
              135deg,
              rgba(3,15,45,0.97),
              rgba(9,35,82,0.93)
            ),
            url('/print.jpg') center/cover fixed;
          padding: 20px;
        }

        .register-container {
          width: 100%;
          max-width: 460px;
        }

        .register-brand {
          text-align: center;
          color: #ffffff !important;
          margin-bottom: 22px;
        }

        .register-icon {
          width: 70px;
          height: 70px;
          margin: 0 auto 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(120,190,255,0.30);
          border-radius: 18px;
          font-size: 34px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.25);
        }

        .register-brand h1 {
          font-size: 25px;
          margin-bottom: 6px;
          color: #ffffff !important;
          font-weight: 800;
          text-shadow: 0 2px 10px rgba(0,0,0,0.35);
        }

        .register-brand p {
          color: #dbeafe !important;
          font-size: 14px;
        }

        .register-card {
          background:
            linear-gradient(
              145deg,
              rgba(11,42,91,0.88),
              rgba(8,28,65,0.78)
            );
          border: 1px solid rgba(105,180,255,0.28);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          padding: 32px;
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.35);
        }

        .register-card h2 {
          text-align: center;
          color: #ffffff;
          font-size: 23px;
          margin-bottom: 7px;
        }

        .register-description {
          text-align: center;
          color: #bdd7f7;
          font-size: 14px;
          margin-bottom: 25px;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          display: block;
          color: #cfe4ff;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .form-group input {
          width: 100%;
          padding: 14px;
          border: 1px solid rgba(150,205,255,0.25);
          border-radius: 10px;
          font-size: 15px;
          outline: none;
          background: rgba(255,255,255,0.08);
          color: #ffffff;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.12);
        }

        .form-group input::placeholder {
          color: rgba(210,230,255,0.55);
        }

        .form-group input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.18);
        }

        .form-group input:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .error-message {
          background: rgba(239,68,68,0.14);
          color: #fecaca;
          border: 1px solid rgba(248,113,113,0.30);
          border-left: 5px solid #ef4444;
          padding: 13px 14px;
          border-radius: 9px;
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: bold;
          backdrop-filter: blur(10px);
        }

        .success-message {
          background: rgba(34,197,94,0.14);
          color: #bbf7d0;
          border: 1px solid rgba(74,222,128,0.30);
          border-left: 5px solid #22c55e;
          padding: 13px 14px;
          border-radius: 9px;
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: bold;
          backdrop-filter: blur(10px);
        }

        .register-button {
          width: 100%;
          border: 1px solid rgba(150,210,255,0.30);
          padding: 14px;
          border-radius: 10px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: 0.2s;
          box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        }

        .register-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(37,99,235,0.35);
        }

        .register-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .back-button {
          width: 100%;
          margin-top: 12px;
          padding: 13px;
          border: 1px solid rgba(150,210,255,0.25);
          background: rgba(255,255,255,0.08);
          color: #dbeafe;
          border-radius: 10px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: 0.2s;
        }

        .back-button:hover {
          background: rgba(255,255,255,0.13);
          border-color: rgba(150,210,255,0.40);
        }

        .back-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .register-footer {
          text-align: center;
          color: #9fc4e8;
          font-size: 13px;
          margin-top: 18px;
        }

        @media (max-width: 600px) {
          .register-card {
            padding: 24px;
          }

          .register-brand h1 {
            font-size: 22px;
            color: #ffffff !important;
          }
        }
      `}</style>

      <div className="register-page">
        <div className="register-container">

          {/* BRAND */}
          <div className="register-brand">
            <div className="register-icon">
              🖨️
            </div>

            <h1>Printing Services</h1>

            <p>Create your customer account</p>
          </div>

          {/* CARD */}
          <div className="register-card">
            <h2>Create New Account</h2>

            <p className="register-description">
              Register as a customer to start
              creating printing orders.
            </p>

            {/* ERROR */}
            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            {/* SUCCESS */}
            {message && (
              <div className="success-message">
                ✅ {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* FULL NAME */}
              <div className="form-group">
                <label>Full Name</label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  disabled={loading}
                />
              </div>

              {/* USERNAME */}
              <div className="form-group">
                <label>Username</label>

                <input
                  type="text"
                  placeholder="Create a username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  disabled={loading}
                />
              </div>

              {/* PASSWORD */}
              <div className="form-group">
                <label>Password</label>

                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  disabled={loading}
                />
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="form-group">
                <label>Confirm Password</label>

                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  disabled={loading}
                />
              </div>

              {/* CREATE */}
              <button
                type="submit"
                className="register-button"
                disabled={loading}
              >
                {loading
                  ? "Creating Account..."
                  : "Create Account"}
              </button>
            </form>

            {/* BACK */}
            <button
              type="button"
              className="back-button"
              onClick={onBack}
              disabled={loading}
            >
              ← Back to Customer Login
            </button>
          </div>

          {/* FOOTER */}
          <div className="register-footer">
            Printing Services ©{" "}
            {new Date().getFullYear()}
          </div>

        </div>
      </div>
    </>
  );
}

export default CreateAccount;
