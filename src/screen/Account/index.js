import React, { useState, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
import { UserContaxt } from "../../store/userData";
import { SERVER_API_URL } from "../../server/server"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import "./index.css";


export const Account = () => {
  // const navigate = useNavigate();
  const { userData } = useContext(UserContaxt)
  const [showScannerModal, setShowScannerModal] = useState(false);
  // const [paymentAddress, setPaymentAddress] = useState("");
  const [transactions, setTransactions] = useState([]);

  const [scannerList, setScannerList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentScanner = scannerList[currentIndex];
  const [showTxModal, setShowTxModal] = useState(false);
  // 👉 Form State
  const [txData, setTxData] = useState({
    amount: "",
    paymentMethod: "BEP 20/USDT",
    screenshot: null,
    type: "deposit", // 👈 NEW
  });

  // 👉 Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedData = {
      ...txData,
      [name]: value,
    };

    // 👉 Withdraw select → extra fields remove
    if (name === "type" && value === "withdraw") {
      updatedData.paymentMethod = "";
      updatedData.screenshot = null;
    }

    // 👉 Deposit select → default method set
    if (name === "type" && value === "deposit") {
      updatedData.paymentMethod = "BEP 20/USDT";
    }

    setTxData(updatedData);
  };

  const handleFile = (e) => {
    setTxData({ ...txData, screenshot: e.target.files[0] });
  };

  // Date time
  const formatDateTime = (date) => {
    const d = new Date(date);

    const day = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const time = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${day} • ${time}`;
  };






  // 👉 Submit API
  const handleSubmitTx = async () => {
    let loadingToast;

    try {
      if (!txData.amount) {
        toast.error("Please enter amount");
        return;
      }

      const token = localStorage.getItem("global_user_token");

      if (!token) {
        toast.error("Session expired");
        return;
      }

      const formData = new FormData();
      formData.append("amount", txData.amount);
      formData.append("type", txData.type);

      if (txData.type === "deposit") {
        formData.append("paymentMethod", txData.paymentMethod);
        formData.append("screenshot", txData.screenshot);
      }

      // 🔥 Loader start
      loadingToast = toast.loading("Submitting transaction...");

      const res = await axios.post(`${SERVER_API_URL}/api/transactions`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      );

      if (res.status === 200) {
        // ✅ Success
        toast.update(loadingToast, {
          render: "Transaction Added Successfully ✅",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });

        fetchTransactions()
      }

      setShowTxModal(false);

    } catch (err) {
      console.error("TX ERROR:", err);

      const message =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong ❌";

      // ❗ IMPORTANT: loader stop in error
      if (loadingToast) {
        toast.update(loadingToast, {
          render: message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.error(message);
      }

    }
  };

  // Scanner code
  const fetchScanner = async () => {
    try {
      const res = await axios.get(`${SERVER_API_URL}/api/scanner`);
      console.log("scaneer-data", res.data.data)
      if (res.status === 200) {
        setScannerList(res.data.data || []);
      }

    } catch (err) {
      console.error("Fetch Scanner Error:", err);

      const message = err.response?.data?.message || "Failed to load Scanner";
      toast.error(message);
    }
  };


  // curent user transction
  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("global_user_token");

      if (!token) {
        toast.error("Please login first");
        return;
      }

      const res = await axios.get(`${SERVER_API_URL}/api/transactions/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      );

      if (res.status === 200) {
        setTransactions(res.data.data || []);
      }

    } catch (err) {
      console.error("Fetch TX Error:", err);

      const message =
        err.response?.data?.message || "Failed to load transactions";

      toast.error(message);

      // 🔐 if token expired
      if (err.response?.status === 401) {
        localStorage.removeItem("global_user_token");
        window.location.href = "/login";
      }
    }
  };



  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % scannerList.length);
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === 0 ? scannerList.length - 1 : prev - 1
    );
  };


  useEffect(() => {
    fetchScanner();
    fetchTransactions();
  }, []);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  if (!userData || !userData.email) {
    return (
      <div className="loading-wrapper">
        <h2 className="loading-text">Loading...</h2>
      </div>
    );
  }


  return (
    <>
      <ToastContainer position="top-right" autoClose={4000} newestOnTop
        pauseOnHover
        theme="dark"
      />

      <div className="transaction-main-container">
        <div className="account-container">

          {/* TOP SECTION */}
          <div className="top-section">

            {/* LEFT SIDE */}
            <div className="left-box" onClick={() => setShowScannerModal(true)}>

              {scannerList.length > 0 && currentScanner && (
                <>
                  {/* Slider */}
                  <div className="slider-container">
                    <button className="slide-btn left" onClick={prevSlide}>‹</button>

                    <img
                      src={`${SERVER_API_URL}/${currentScanner.scannerImage}`}
                      className="scanner-img"
                      alt="scanner"
                    />

                    <button className="slide-btn right" onClick={nextSlide}>›</button>
                  </div>

                  {/* Payment Address */}
                  <div className="payment-box">
                    <p>Payment Address</p>

                    <span className="break">
                      {currentScanner.scannerPayAdd}
                    </span>

                    <button
                      className="copy-btn1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(currentScanner.scannerPayAdd);
                      }}
                    >
                      Copy Link
                    </button>
                  </div>
                </>
              )}

            </div>

            {/* RIGHT SIDE */}
            <div className="right-box">
              <h2>{userData.name}</h2>

              <div className="info-row">
                <span>Email</span>
                <span>{userData.email}</span>
              </div>

              <div className="info-row">
                <span>User ID</span>
                <span>{userData.userCode}</span>
              </div>

              <div className="info-row">
                <span>Wallet</span>
                <span>$ {userData.wallet}</span>
              </div>

              <div className="info-row">
                <span>Referral Code</span>
                <span>{userData.referralCode}</span>
              </div>

              <div className="info-row">
                <span>Rank</span>
                <span>RANK {userData.rankId}</span>
              </div>
            </div>

          </div>

          {/* BOTTOM SECTION - TRANSACTIONS */}
          <div className="transaction-section">
            <h3>Transaction History</h3>
            <button className="add-tx-btn" onClick={() => setShowTxModal(true)}>
              + Add Diposit / withdraw
            </button>

            <div className="transaction-list">
              {transactions.length === 0 ? (
                <p>No transactions found</p>
              ) : (
                transactions.map((tx) => (
                  <div className="transaction-card" key={tx.id}>
                    <div className="tx-left">
                      <p className="amount">$ {tx.amount}</p>
                      {/* <span className="method">{tx.paymentMethod}</span> */}
                      <span className="method">
                        {tx.type === "deposit"
                          ? tx.paymentMethod || "N/A"
                          : tx.withdrawMethod || "N/A"}
                      </span>
                    </div>

                    {tx.type === "withdraw" && (
                      <div className="charge-box">
                        <span className="charge-text">
                          Deduction (10%): Admin 5% + TDS 5%
                        </span>
                      </div>
                    )}

                    <div className="tx-center">
                      {tx.screenshot && (
                        <img src={`${SERVER_API_URL}/${tx.screenshot}`} alt="proof" />
                      )}
                    </div>

                    <div className="upi-status-image">

                      {/* 👉 DATE TIME */}
                      <p className="tx-date">
                        {formatDateTime(tx.createdAt)}
                      </p>

                      {/* <div className="tx-right">
                        <span className={`status type`}>
                          {tx.type} Status
                        </span>
                      </div> */}

                      <div className="tx-right">
                        <span className={`status type`}>
                          {tx.type} Status
                        </span>
                      </div>


                      <div className="tx-right">
                        <span className={`status ${tx.status}`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {showScannerModal && (
        <div className="scanner-modal">
          <div className="scanner-box">

            {/* Close */}
            <span
              className="close-btn"
              onClick={() => setShowScannerModal(false)}
            >
              ✖
            </span>

            {/* Big Scanner Image */}
            <img src={`${SERVER_API_URL}/${currentScanner.scannerImage}`} alt="Scanner" className="big-scanner" />

            <h3>Update Wallet</h3>

            {/* Payment Address */}
            <div className="payment-info">
              <span>Payment Address:</span>
              <span className="break">{currentScanner.scannerPayAdd}</span>
            </div>

          </div>
        </div>
      )}

      {/* 🔥 POPUP */}
      {showTxModal && (
        <div className="modal">
          <div className="modal-box">

            <span
              className="close-btn"
              onClick={() => setShowTxModal(false)}
            >
              ✖
            </span>

            <h3>Deposit / Withdraw</h3>

            {/* 👉 TYPE SELECT */}
            <select
              name="type"
              value={txData.type}
              onChange={handleChange}
            >
              <option value="deposit">Deposit</option>
              <option value="withdraw">Withdraw</option>
            </select>

            {/* 👉 AMOUNT */}
            <input
              type="number"
              name="amount"
              placeholder="Enter Amount"
              value={txData.amount}
              onChange={handleChange}
            />

            {/* ✅ ONLY FOR DEPOSIT */}
            {txData.type === "deposit" && (
              <>
                <select
                  name="paymentMethod"
                  value={txData.paymentMethod || "BEP 20/USDT"}
                  onChange={handleChange}
                >
                  <option value="BEP 20/USDT">🟡 BEP 20 / USDT (BSC)</option>
                  <option value="TRC 20/USDT">🔴 TRC 20 / USDT (TRON)</option>
                  <option value="Polygon/USDT">🟣 Polygon / USDT</option>
                </select>

                <input type="file" onChange={handleFile} />
              </>
            )}

            {/* ✅ ONLY FOR WITHDRAW */}
            {txData.type === "withdraw" && txData.amount > 0 && (
              <>
                {(() => {
                  const amount = Number(txData.amount);
                  const adminCharge = amount * 0.05;
                  const tds = amount * 0.05;
                  const totalDeduction = adminCharge + tds;
                  const approvedAmount = amount - totalDeduction;

                  return (
                    <div className="withdraw-summary">
                      <p><strong>Deduction:</strong> ${totalDeduction.toFixed(2)}</p>
                      <p>Admin Charge (5%): ${adminCharge.toFixed(2)}</p>
                      <p>TDS (5%): ${tds.toFixed(2)}</p>
                      <p style={{ color: "green" }}>
                        <strong>Approved Amount:</strong> ${approvedAmount.toFixed(2)}
                      </p>
                    </div>
                  );
                })()}
              </>
            )}

            <div className="modal-actions">
              <button onClick={handleSubmitTx}>Submit</button>
              <button onClick={() => setShowTxModal(false)}>Cancel</button>
            </div>

          </div>
        </div>
      )}

    </>
  );
};