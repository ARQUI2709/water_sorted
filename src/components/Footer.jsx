export default function Footer({ styleContent }) {
  return (
    <div style={{ ...styles.footer, ...styleContent }}>
      <span style={styles.text}>by Os2group - 2026 | ver1.2.0</span>
    </div>
  );
}

const styles = {
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: '24px 16px',
    marginTop: 'auto',
    width: '100%',
    zIndex: 10,
  },
  text: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: "'Baloo 2', system-ui, sans-serif",
    fontWeight: 500,
  },
};
