export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-beige">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full border-4 border-[#1A1A1A]/20 border-t-cuban-red animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Cargando portal…</p>
      </div>
    </div>
  );
}
