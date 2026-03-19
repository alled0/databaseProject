//navbar.js
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = ({ role, onLogout }) => {
  const passengerLinks = [
    { path: "/searchtrain", label: "Search Trains" },
    { path: "/book", label: "Book Seat" },
    { path: "/reports", label: "Reports" },
  ];

  const adminLinks = [
    { path: "/manage-reservations", label: "Manage Reservations" },
    { path: "/assign-staff", label: "Assign Staff" },
    { path: "/promote-passenger", label: "Promote Passenger" },
    { path: "/reports", label: "Reports" },
  ];

  const links = role === "Admin" ? adminLinks : passengerLinks;
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <span style={styles.brandIcon}>🚆</span>
        <span style={styles.logo}>Saudi Railways</span>
      </div>
      <ul style={styles.ul}>
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <li key={link.path} style={styles.li}>
              <Link
                to={link.path}
                style={{ ...styles.link, ...(isActive ? styles.activeLink : {}) }}
              >
                {link.label}
                {isActive && <span style={styles.activeIndicator} />}
              </Link>
            </li>
          );
        })}
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
    padding: "0 28px",
    backgroundColor: "#2E3B4E",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "60px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  brandIcon: {
    fontSize: "22px",
  },
  logo: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#4CAF50",
    letterSpacing: "0.5px",
  },
  ul: {
    listStyle: "none",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    margin: 0,
    padding: 0,
  },
  li: {
    display: "inline-flex",
    alignItems: "center",
  },
  link: {
    position: "relative",
    textDecoration: "none",
    color: "#ccc",
    fontSize: "14px",
    fontWeight: "500",
    padding: "8px 14px",
    borderRadius: "6px",
    transition: "color 0.2s, background 0.2s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  activeLink: {
    color: "#fff",
    backgroundColor: "rgba(76, 175, 80, 0.15)",
  },
  activeIndicator: {
    position: "absolute",
    bottom: "-2px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "20px",
    height: "3px",
    backgroundColor: "#4CAF50",
    borderRadius: "2px",
  },
  logoutButton: {
    backgroundColor: "transparent",
    color: "#ff6b6b",
    border: "1.5px solid #ff6b6b",
    borderRadius: "6px",
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    marginLeft: "8px",
    transition: "background 0.2s, color 0.2s",
  },
};

export default Navbar;
