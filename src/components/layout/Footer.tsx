export default function Footer() {
    return (
        <footer className="bg-epoxy-deep border-t border-white/5 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <span className="text-2xl font-bold text-white tracking-widest">
                            EpoArt <span className="text-epoxy-primary">Perú</span>
                        </span>
                        <p className="mt-4 text-gray-400 text-sm">
                            Especialistas en remodelación de alta gama con resina epóxica y porcelanato líquido.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Servicios</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li>Pisos Epóxicos</li>
                            <li>Cocinas de Diseño</li>
                            <li>Escaleras Antideslizantes</li>
                            <li>Mesas de Río</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Empresa</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li>Sobre Nosotros</li>
                            <li>Galería</li>
                            <li>Contacto</li>
                            <li>Política de Privacidad</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Contacto</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li>Huánuco, Perú</li>
                            <li>cesarestebandelao@gmail.com</li>
                            <li>900 475 318 - 962997672</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} ZGAS Resina. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
}
