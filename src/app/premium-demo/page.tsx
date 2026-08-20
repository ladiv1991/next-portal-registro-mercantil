import { PremiumFeaturesExample } from '@/components/portal/PremiumFeaturesExample';

export const metadata = {
  title: 'Demo - Funciones Premium | Registro Mercantil',
  description: 'Página de demostración de funciones premium y validaciones',
};

export default function PremiumDemoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <PremiumFeaturesExample />
      </div>
    </main>
  );
}
