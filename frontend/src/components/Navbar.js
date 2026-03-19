import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const TrainIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C8.14 2 5 3.57 5 6v10c0 1.85 1.29 3.41 3 3.86V21h2l1-1h2l1 1h2v-1.14c1.71-.45 3-2.01 3-3.86V6c0-2.43-3.14-4-7-4zm0 2c3.31 0 5 1.34 5 2H7c0-.66 1.69-2 5-2zM7 12V8h10v4H7zm2.5 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
  </svg>
);

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
        <div style={styles.logoIcon}>
          <TrainIcon />
        </div>
        <span style={styles.logoText}>Saudi Railways</span>
        <span style={styles.roleBadge}>{role}</span>
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
                {isActive && <span style={styles.activeBar} />}
              </Link>
            </li>
          );
        })}
        <li style={{ ...styles.li, marginLeft: "8px" }}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Log out
          </button>
        </li>
      </ul>
    </nav>
  );
};

const styles = {
  nav: {
    height: "60px",
    padding: "0 28px",
    background: "#0F2137",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 1px 0 rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.25)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },
  logoIcon: {
    width: "34px",
    height: "34px",
    background: "linear-gradient(135deg, #006B3C, #004D2B)",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    boxShadow: "0 2px 8px rgba(0, 107, 60, 0.5)",
    flexShrink: 0,
  },
  logoText: {
    fontSize: "16px",
    fontWeight: "700",
    color: "white",
    letterSpacing: "-0.2px",
    fontFamily: "'Inter', sans-serif",
  },
  roleBadge: {
    fontSize: "10px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "100px",
    background: "rgba(0, 107, 60, 0.3)",
    color: "#6EE7B7",
    letterSpacing: "0.4px",
    textTransform: "uppercase",
    fontFamily: "'Inter', sans-serif",
  },
  ul: {
    listStyle: "none",
    display: "flex",
    alignItems: "center",
    gap: "2px",
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
    color: "rgba(255,255,255,0.55)",
    fontSize: "13px",
    fontWeight: "500",
    padding: "8px 12px",
    borderRadius: "7px",
    transition: "color 0.18s, background 0.18s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "'Inter', sans-serif",
  },
  activeLink: {
    color: "white",
    background: "rgba(255,255,255,0.07)",
  },
  activeBar: {
    position: "absolute",
    bottom: "4px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "16px",
    height: "2px",
    background: "#4ADE80",
    borderRadius: "1px",
  },
  logoutBtn: {
    background: "transparent",
    color: "rgba(255,255,255,0.45)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "7px",
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    fontFamily: "'Inter', sans-serif",
    transition: "color 0.18s, border-color 0.18s, background 0.18s",
  },
};

export default Navbar;
