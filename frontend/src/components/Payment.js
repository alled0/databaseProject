import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/Payment.css";

const Payment = () => {
  const { reservationID } = useParams(); // Get ReservationID from URL
  const [paymentStatus, setPaymentStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate(); // For navigation

  useEffect(() => {
    console.log("Received Reservation ID from URL:", reservationID);

    // Validate reservationID
    if (!reservationID) {
      setError("Invalid reservation ID. Please go back and try again.");
    }
  }, [reservationID]);

  const handlePayment = () => {
    if (!reservationID) {
      setError("Missing reservation ID. Cannot proceed with payment.");
      return;
    }

    setLoading(true); // Start loading
    setError(""); // Clear errors

    axios
      .post("http://localhost:4000/api/reservations/completePayment", { reservationID })
      .then((response) => {
        if (response.status === 200) {
          setPaymentStatus("Payment successful! Your reservation is now paid.");
        } else {
          setError("Payment failed. Please try again later.");
        }
      })
      .catch((error) => {
        console.error("Payment error:", error);
        setError("A server error occurred. Please try again later.");
      })
      .finally(() => {
        setLoading(false); // End loading
      });
  };

  const goBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  return (
    <div className="container">
      <h3 className="heading">Complete Payment</h3>
      {error && <p className="error">{error}</p>}
      {paymentStatus ? (
        <p className="success">{paymentStatus}</p>
      ) : (
        <div>
          <button onClick={handlePayment} className="button" disabled={loading}>
            {loading ? "Processing..." : "Pay Now"}
          </button>
          <button onClick={goBack} className="button backButton">
            Go Back
          </button>
        </div>
      )}
    </div>
  );
};

export default Payment;
