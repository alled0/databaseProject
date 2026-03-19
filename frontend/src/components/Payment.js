import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/Payment.css";
import API_URL from "../config";

const Payment = () => {
  const { reservationID } = useParams();
  const [paymentStatus, setPaymentStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!reservationID) {
      setError("Invalid reservation ID. Please go back and try again.");
    }
  }, [reservationID]);

  const handlePayment = () => {
    if (!reservationID) {
      setError("Missing reservation ID. Cannot proceed with payment.");
      return;
    }
    setLoading(true);
    setError("");
    axios
      .post(`${API_URL}/api/reservations/completePayment`, { reservationID })
      .then((response) => {
        if (response.status === 200) {
          setPaymentStatus("Payment successful! Your reservation is confirmed.");
        } else {
          setError("Payment failed. Please try again.");
        }
      })
      .catch(() => {
        setError("A server error occurred. Please try again later.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="container">
      <div className="payment-icon">{paymentStatus ? "✅" : "💳"}</div>
      <h3 className="heading">{paymentStatus ? "Payment Complete" : "Complete Payment"}</h3>
      <p className="reservation-id">Reservation ID: <strong>#{reservationID}</strong></p>

      {error && <div className="alert alert-error">{error}</div>}

      {paymentStatus ? (
        <div className="alert alert-success">{paymentStatus}</div>
      ) : (
        <div className="payment-actions">
          <button onClick={handlePayment} className="button" disabled={loading}>
            {loading ? "Processing..." : "Pay Now"}
          </button>
          <button onClick={() => navigate(-1)} className="button backButton">
            Go Back
          </button>
        </div>
      )}
    </div>
  );
};

export default Payment;
