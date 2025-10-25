export default function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] bg-cosmic/90"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_60%)] opacity-30 mix-blend-overlay" />
        <div className="animate-slow-spin absolute -top-1/3 left-1/4 h-[40rem] w-[40rem] rounded-full bg-gradient-to-br from-neon/40 via-magenta/25 to-transparent blur-[140px]" />
        <div className="animate-floaty absolute -bottom-1/2 right-1/4 h-[45rem] w-[45rem] rounded-full bg-gradient-to-bl from-sunset/45 via-magenta/35 to-transparent blur-[160px]" />
        <div className="animate-pulse-glow absolute top-1/2 left-1/2 h-[32rem] w-[32rem] -translate-y-1/2 -translate-x-1/2 rounded-full bg-gradient-to-tr from-neon/35 via-transparent to-magenta/25 blur-[180px]" />
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%224%22 height=%224%22 viewBox=%220 0 4 4%22><path fill=%22rgba(255,255,255,0.05)%22 d=%22M0 0h1v1H0z%22/><path fill=%22rgba(0,0,0,0.08)%22 d=%22M1 1h1v1H1z%22/></svg>')] opacity-10" />
      </div>
    </div>
  );
}
