// frontend/src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={styles.nav}>
      <h2>Saudi Railways System</h2>
      <ul style={styles.ul}>
        <li style={styles.li}><Link to="/">Search Trains</Link></li>
        <li style={styles.li}><Link to="/book">Book Seat</Link></li>
      </ul>
    </nav>
  );
};

const styles = {
  nav: {
    padding: '10px',
    backgroundColor: '#333',
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  ul: {
    listStyle: 'none',
    display: 'flex',
    gap: '15px'
  },
  li: {
    display: 'inline'
  }
};

export default Navbar;
