import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ role, onLogout }) => {
  // Define links for Passenger and Admin
  const passengerLinks = [
    { path: "/searchtrain", label: "Search Trains" },
    { path: "/book", label: "Book Seat" },
  ];

  const adminLinks = [
    { path: "/manage-reservations", label: "Manage Reservations" },
    { path: "/assign-staff", label: "Assign Staff" },
    { path: "/promote-passenger", label: "Promote Passenger" },
  ];

  // Determine which links to render
  const links = role === "Admin" ? adminLinks : passengerLinks;

  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/"); // Redirect to login page
  };

  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>Saudi Railways System</h2>
      <ul style={styles.ul}>
        {links.map((link) => (
          <li key={link.path} style={styles.li}>
            <Link to={link.path} style={styles.link}>
              {link.label}
            </Link>
          </li>
        ))}
        <li style={styles.li}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

const styles = {
  nav: {
    padding: "10px 20px",
    backgroundColor: "#2E3B4E",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "3px solid #4CAF50",
  },
  logo: {
    fontSize: "24px",
    margin: 0,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  ul: {
    listStyle: "none",
    display: "flex",
    gap: "20px",
    margin: 0,
  },
  li: {
    display: "inline",
  },
  link: {
    textDecoration: "none",
    color: "#fff",
    fontSize: "18px",
    fontWeight: "500",
    transition: "color 0.3s ease",
  },
  logoutButton: {
    backgroundColor: "#FF4D4F",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
  },
};

export default Navbar;
