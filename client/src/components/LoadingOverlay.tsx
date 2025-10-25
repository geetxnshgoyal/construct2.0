type LoadingOverlayProps = {
  message?: string;
};

export default function LoadingOverlay({ message = 'Summoning nebulae…' }: LoadingOverlayProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 text-center">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-4 border-neon/40 border-t-magenta animate-spin" />
        <div className="absolute inset-2 rounded-full border border-dashed border-white/20 animate-pulse" />
      </div>
      <p className="max-w-xs text-lg text-white/80">{message}</p>
    </div>
  );
}
