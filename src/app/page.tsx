import Hero from '@/components/landing/Hero';
import Services from '@/components/landing/Services';

export default function Home() {
  return (
    <main className="min-h-screen pt-16">
      <Hero />
      <Services />

      <section id="galeria" className="py-20 px-4 bg-epoxy-deep/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Galería de Proyectos</h2>
          <div className="glass-panel p-10 rounded-xl inline-block">
            <p className="text-gray-400">🚀 Próximamente: Fotos reales de tus instalaciones.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
