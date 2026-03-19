const developers = [
  { name: "Alwaleed Meshal", url: "https://www.linkedin.com/in/alwaleed-meshal-almutairi-8a48ab263/" },
  { name: "Omar Alkhulaif",  url: "https://www.linkedin.com/in/omar-alkhulaif-7827b8295/" },
  { name: "Mohammed Aldahash", url: "https://www.linkedin.com/in/mohammed-aldahash-208613326/" },
];

const Footer = () => (
  <footer style={styles.footer}>
    <span style={styles.label}>Developed by</span>
    <div style={styles.names}>
      {developers.map((dev, i) => (
        <span key={dev.url} style={styles.item}>
          <a href={dev.url} target="_blank" rel="noreferrer" style={styles.link}>
            {dev.name}
          </a>
          {i < developers.length - 1 && <span style={styles.dot}>·</span>}
        </span>
      ))}
    </div>
  </footer>
);

const styles = {
  footer: {
    background: "#0F2137",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "18px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  label: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.35)",
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "0.3px",
  },
  names: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  link: {
    color: "rgba(255,255,255,0.65)",
    fontSize: "13px",
    fontWeight: "500",
    fontFamily: "'Inter', sans-serif",
    textDecoration: "none",
    transition: "color 0.18s",
  },
  dot: {
    color: "rgba(255,255,255,0.2)",
    fontSize: "14px",
  },
};

export default Footer;
