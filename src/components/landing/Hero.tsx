import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-epoxy-deep">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-epoxy-primary/20 rounded-full blur-[120px] animate-flow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-epoxy-accent/20 rounded-full blur-[100px] animate-flow delay-1000" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="glass-panel inline-block px-4 py-2 rounded-full mb-8 animate-fade-in-up">
                    <span className="text-epoxy-accent font-semibold tracking-wider uppercase text-sm">
                        ✨ Renovación Premium con Resina
                    </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                    Diseño Líquido, <br />
                    <span className="text-gradient animate-shimmer bg-[length:200%_100%]">
                        Acabado Eterno
                    </span>
                </h1>

                <p className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Transformamos pisos, cocinas y escaleras en obras de arte funcionales con
                    resina epóxica de alta resistencia. Sin uniones, higiénico y 100% personalizado.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        href="https://wa.me/51900475318?text=Hola,%20quisiera%20solicitar%20un%20presupuesto"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-lg px-8 py-4 shadow-epoxy-primary/50 shadow-lg"
                    >
                        Solicitar Presupuesto
                    </Link>
                    <Link
                        href="#galeria"
                        className="px-8 py-4 rounded-full font-bold text-white border border-white/20 hover:bg-white/10 transition-all backdrop-blur-sm"
                    >
                        Ver Galería
                    </Link>
                </div>
            </div>

            {/* Decorative Overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
        </section>
    );
}
