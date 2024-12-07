// frontend/src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>Saudi Railways System</h2>
      <ul style={styles.ul}>
        <li style={styles.li}>
          <Link to="/" style={styles.link}>Search Trains</Link>
        </li>
        <li style={styles.li}>
          <Link to="/book" style={styles.link}>Book Seat</Link>
        </li>
      </ul>
    </nav>
  );
};

const styles = {
  nav: {
    padding: '10px 20px',
    backgroundColor: '#2E3B4E',
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '3px solid #4CAF50',
  },
  logo: {
    fontSize: '24px',
    margin: 0,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  ul: {
    listStyle: 'none',
    display: 'flex',
    gap: '20px',
    margin: 0,
  },
  li: {
    display: 'inline',
  },
  link: {
    textDecoration: 'none',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '500',
    transition: 'color 0.3s ease',
  },
  linkHover: {
    color: '#4CAF50',
  }
};

export default Navbar;
