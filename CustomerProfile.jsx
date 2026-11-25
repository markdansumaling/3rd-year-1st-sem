import { useState } from "react";

function CustomerProfile({ user, onBack }) {
  const API =
    "http://localhost/printing-management-system/api";

  const [fullName, setFullName] = useState(
    user?.full_name || ""
  );

  const [username, setUsername] = useState(
    user?.username || ""
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!fullName.trim() || !username.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (fullName.trim().length < 2) {
      setError("Please enter a valid full name.");
      return;
    }

    if (username.trim().length < 3) {
      setError(
        "Username must be at least 3 characters."
      );
      return;
    }

    if (!user?.user_id) {
      setError("User information is missing.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API}/update_profile.php`,
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            user_id: user.user_id,
            full_name: fullName.trim(),
            username: username.trim(),
          }),
        }
      );

      const text = await response.text();

      console.log(
        "UPDATE PROFILE STATUS:",
        response.status
      );

      console.log(
        "UPDATE PROFILE RESPONSE:",
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
          "PROFILE JSON ERROR:",
          jsonError
        );

        throw new Error(
          "Server did not return valid JSON."
        );
      }

      if (!data.success) {
        setError(
          data.message ||
            "Unable to update profile."
        );

        return;
      }

      setFullName(
        data.user?.full_name ||
          fullName.trim()
      );

      setUsername(
        data.user?.username ||
          username.trim()
      );

      setMessage(
        data.message ||
          "Profile updated successfully!"
      );

    } catch (err) {
      console.error(
        "UPDATE PROFILE ERROR:",
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

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        /* =================================================
           PAGE
        ================================================= */

        .profile-page {
          min-height: 100vh;

          background:
            linear-gradient(
              135deg,
              rgba(3,15,45,0.97),
              rgba(9,35,82,0.93)
            ),
            url('/print.jpg')
            center/cover fixed;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          padding: 28px 24px;

          color: white;
        }


        .profile-container {
          width: 94%;

          max-width: 850px;

          margin: 0 auto;
        }


        /* =================================================
           HEADER
        ================================================= */

        .profile-header {
          background:
            linear-gradient(
              135deg,
              rgba(12,39,91,0.90),
              rgba(25,73,145,0.72)
            );

          border:
            1px solid
            rgba(120,180,255,0.28);

          backdrop-filter:
            blur(18px);

          -webkit-backdrop-filter:
            blur(18px);

          color: white;

          padding: 25px 30px;

          border-radius: 20px;

          display: flex;

          justify-content:
            space-between;

          align-items: center;

          gap: 20px;

          flex-wrap: wrap;

          box-shadow:
            0 18px 45px
            rgba(0,0,0,0.30);
        }


        .profile-header h1 {
          margin: 0 0 6px;

          font-size: 27px;

          font-weight: 800;

          color: white;
        }


        .profile-header p {
          margin: 0;

          color: #cfe4ff;

          font-size: 14px;
        }


        .profile-icon {
          width: 75px;

          height: 75px;

          border-radius: 20px;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 50px;

          background:
            rgba(80,150,255,0.15);

          border:
            1px solid
            rgba(120,190,255,0.22);

          box-shadow:
            0 10px 25px
            rgba(0,0,0,0.18);
        }


        /* =================================================
           PROFILE CARD
        ================================================= */

        .profile-card {
          margin-top: 22px;

          background:
            linear-gradient(
              145deg,
              rgba(11,42,91,0.86),
              rgba(8,28,65,0.76)
            );

          border:
            1px solid
            rgba(105,180,255,0.28);

          backdrop-filter:
            blur(18px);

          -webkit-backdrop-filter:
            blur(18px);

          padding: 32px;

          border-radius: 20px;

          box-shadow:
            0 18px 45px
            rgba(0,0,0,0.30);
        }


        .profile-card h2 {
          margin: 0 0 7px;

          color: white;

          font-size: 23px;

          font-weight: 800;
        }


        .profile-description {
          color: #9fc4e8;

          font-size: 14px;

          margin-bottom: 25px;
        }


        /* =================================================
           PROFILE INFORMATION NOTICE
        ================================================= */

        .profile-info {
          background:
            rgba(80,150,255,0.10);

          border:
            1px solid
            rgba(120,190,255,0.25);

          padding: 15px;

          border-radius: 10px;

          margin-bottom: 22px;

          color: #bfdbfe;

          font-size: 14px;
        }


        /* =================================================
           FORM
        ================================================= */

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

          border:
            1px solid
            rgba(150,205,255,0.25);

          border-radius: 10px;

          font-size: 15px;

          outline: none;

          background:
            rgba(255,255,255,0.08);

          color: white;

          transition:
            border-color 0.2s,
            box-shadow 0.2s,
            background 0.2s;
        }


        .form-group input::placeholder {
          color: #8fb2d6;
        }


        .form-group input:focus {
          border-color:
            rgba(96,165,250,0.75);

          background:
            rgba(255,255,255,0.11);

          box-shadow:
            0 0 0 3px
            rgba(37,99,235,0.18);
        }


        .form-group input:disabled {
          opacity: 0.65;

          cursor: not-allowed;
        }


        /* =================================================
           ACCOUNT TYPE
        ================================================= */

        .account-type {
          width: 100%;

          padding: 14px;

          background:
            rgba(80,150,255,0.10);

          border:
            1px solid
            rgba(120,190,255,0.25);

          border-radius: 10px;

          color: #93c5fd;

          font-weight: bold;
        }


        /* =================================================
           ERROR
        ================================================= */

        .error-message {
          background:
            rgba(239,68,68,0.14);

          color: #fecaca;

          border:
            1px solid
            rgba(248,113,113,0.30);

          border-left:
            5px solid
            #ef4444;

          padding: 13px 14px;

          border-radius: 9px;

          margin-bottom: 20px;

          font-size: 14px;

          font-weight: bold;

          backdrop-filter:
            blur(12px);

          -webkit-backdrop-filter:
            blur(12px);
        }


        /* =================================================
           SUCCESS
        ================================================= */

        .success-message {
          background:
            rgba(34,197,94,0.14);

          color: #bbf7d0;

          border:
            1px solid
            rgba(74,222,128,0.30);

          border-left:
            5px solid
            #22c55e;

          padding: 13px 14px;

          border-radius: 9px;

          margin-bottom: 20px;

          font-size: 14px;

          font-weight: bold;

          backdrop-filter:
            blur(12px);

          -webkit-backdrop-filter:
            blur(12px);
        }


        /* =================================================
           BUTTONS
        ================================================= */

        .button-row {
          display: flex;

          gap: 12px;

          margin-top: 25px;
        }


        .save-button {
          flex: 1;

          border:
            1px solid
            rgba(150,210,255,0.30);

          padding: 14px;

          border-radius: 10px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #1d4ed8
            );

          color: white;

          font-size: 15px;

          font-weight: bold;

          cursor: pointer;

          box-shadow:
            0 10px 25px
            rgba(0,0,0,0.25);

          transition:
            transform 0.2s,
            box-shadow 0.2s;
        }


        .save-button:hover:not(:disabled) {
          transform: translateY(-1px);

          box-shadow:
            0 13px 28px
            rgba(0,0,0,0.30);
        }


        .save-button:disabled {
          opacity: 0.7;

          cursor: not-allowed;
        }


        .back-button {
          flex: 1;

          border:
            1px solid
            rgba(150,210,255,0.25);

          padding: 14px;

          border-radius: 10px;

          background:
            rgba(255,255,255,0.08);

          color: white;

          font-size: 15px;

          font-weight: bold;

          cursor: pointer;

          backdrop-filter:
            blur(12px);

          -webkit-backdrop-filter:
            blur(12px);

          box-shadow:
            0 8px 20px
            rgba(0,0,0,0.18);
        }


        .back-button:hover:not(:disabled) {
          background:
            rgba(255,255,255,0.13);
        }


        .back-button:disabled {
          opacity: 0.6;

          cursor: not-allowed;
        }


        /* =================================================
           FOOTER
        ================================================= */

        .footer {
          text-align: center;

          color: #7fa6cc;

          font-size: 13px;

          padding: 25px 0 10px;
        }


        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 600px) {

          .profile-page {
            padding:
              20px 14px;
          }


          .profile-card {
            padding: 24px;
          }


          .profile-header {
            padding: 22px;
          }


          .button-row {
            flex-direction: column;
          }


          .profile-icon {
            width: 60px;

            height: 60px;

            font-size: 38px;
          }

        }

      `}</style>

      <div className="profile-page">

        <div className="profile-container">

          {/* HEADER */}

          <div className="profile-header">

            <div>

              <h1>
                👤 My Profile
              </h1>

              <p>
                Manage your customer account
                information.
              </p>

            </div>

            <div className="profile-icon">
              👤
            </div>

          </div>


          {/* CARD */}

          <div className="profile-card">

            <h2>
              Account Information
            </h2>

            <p className="profile-description">
              Update your customer account
              information below.
            </p>


            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}


            {message && (
              <div className="success-message">
                ✅ {message}
              </div>
            )}


            <div className="profile-info">
              Customer accounts cannot change
              their account type.
            </div>


            <form onSubmit={handleSubmit}>

              {/* FULL NAME */}

              <div className="form-group">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(
                      e.target.value
                    )
                  }
                  disabled={loading}
                />

              </div>


              {/* USERNAME */}

              <div className="form-group">

                <label>
                  Username
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value
                    )
                  }
                  disabled={loading}
                />

              </div>


              {/* ACCOUNT TYPE */}

              <div className="form-group">

                <label>
                  Account Type
                </label>

                <div className="account-type">
                  Customer
                </div>

              </div>


              {/* BUTTONS */}

              <div className="button-row">

                <button
                  type="button"
                  className="back-button"
                  onClick={onBack}
                  disabled={loading}
                >
                  ← Back to Dashboard
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : "💾 Save Changes"}
                </button>

              </div>

            </form>

          </div>


          <div className="footer">
            Printing Management System ©{" "}
            {new Date().getFullYear()}
          </div>

        </div>

      </div>
    </>
  );
}

export default CustomerProfile;