import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-epoxy-deep/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                            <Image
                                src="/logo-epoart-v2.jpg"
                                alt="EpoArt Perú Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="text-xl font-bold text-white tracking-widest hidden sm:block">
                            EpoArt <span className="text-epoxy-primary">Perú</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <Link href="/" className="text-white hover:text-epoxy-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Inicio
                            </Link>
                            <Link href="#servicios" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Servicios
                            </Link>
                            <Link href="#galeria" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Galería
                            </Link>
                            <Link href="/herramienta-ia" className="text-epoxy-gold hover:text-yellow-300 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-epoxy-gold opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-epoxy-gold"></span>
                                </span>
                                Diseñador IA
                            </Link>
                            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
                                <Link href="/login" className="text-white hover:text-epoxy-primary text-sm font-medium transition-colors">
                                    Entrar
                                </Link>
                                <Link href="/signup" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-all">
                                    Registrarse
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Button - Placeholder */}
                    <div className="-mr-2 flex md:hidden">
                        <button className="text-gray-400 hover:text-white p-2">
                            <span className="sr-only">Open menu</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
