import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-beige">
      <div className="text-center px-6">
        <h1 className="text-8xl font-bold text-[#1A1A1A]">404</h1>
        <p className="text-xl text-muted-foreground mt-4">Página no encontrada</p>
        <p className="text-sm text-muted-foreground mt-2">
          La página que busca no existe o ha sido movida.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#1A1A1A]-light transition-colors font-medium"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
