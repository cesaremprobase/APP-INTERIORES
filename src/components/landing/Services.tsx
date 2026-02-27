export default function Services() {
    const services = [
        {
            title: "Pisos Epóxicos 3D",
            description: "Transforma cualquier superficie en una obra de arte continua. Resistente al alto tráfico y fácil de limpiar.",
            icon: "🌊",
            gradient: "from-blue-500 to-cyan-400"
        },
        {
            title: "Cocinas de Lujo",
            description: "Encimeras higiénicas, sin uniones y con diseños que imitan mármol exótico a una fracción del costo.",
            icon: "🍳",
            gradient: "from-emerald-500 to-teal-400"
        },
        {
            title: "Baños y Escaleras",
            description: "Impermeabilización total y superficies antideslizantes seguras. Renovación sin escombros.",
            icon: "✨",
            gradient: "from-purple-500 to-indigo-400"
        }
    ];

    return (
        <section id="servicios" className="py-24 bg-epoxy-deep relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Maestría en <span className="text-gradient">Resina</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Llevamos la tecnología del porcelanato líquido a cada rincón de tu hogar.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <div key={index} className="glass-panel p-8 rounded-2xl hover:bg-white/5 transition-all duration-300 group">
                            <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${service.gradient} flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                {service.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                            <p className="text-gray-400 leading-relaxed">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
