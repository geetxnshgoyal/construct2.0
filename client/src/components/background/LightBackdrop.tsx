export default function LightBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundColor: '#f8f5ec',
        backgroundImage:
          "linear-gradient(transparent 95%, rgba(0, 0, 0, 0.05) 96%), repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.03) 0, rgba(0, 0, 0, 0.03) 1px, transparent 1px, transparent 140px)",
        backgroundSize: '100% 32px, 160px 160px',
        backgroundAttachment: 'fixed'
      }}
    />
  );
}
