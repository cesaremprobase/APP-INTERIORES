
export function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 h-full w-20 md:w-64 bg-zgas-navy border-r border-white/10 flex flex-col items-center md:items-start py-8 z-50 transition-all">
            {/* Logo Area */}
            <div className="px-6 mb-12 flex items-center gap-3">
                <div className="w-8 h-8 bg-zgas-lime rounded-lg flex items-center justify-center font-bold text-zgas-navy">
                    Z
                </div>
                <span className="hidden md:block text-xl font-bold text-white tracking-tight">
                    Z-Gas <span className="text-zgas-lime">SST</span>
                </span>
            </div>

            {/* Navigation */}
            <nav className="w-full flex-1 px-4 space-y-2">
                <NavItem
                    active
                    icon={<path d="M22 12h-4l-3 9L9 3l-3 9H2" />}
                    label="Cursos"
                />
                <NavItem
                    icon={<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />}
                    // Usando un icono de Award/Trophy simplificado
                    svgContent={<path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />}
                    label="Ranking"
                />
                <NavItem
                    icon={<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />}
                    label="Tienda"
                />
                <NavItem
                    icon={<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />}
                    circleHeader
                    label="Mi Perfil"
                />
            </nav>

            {/* Footer / Logout */}
            <div className="w-full px-4 mt-auto">
                <button className="flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white transition-colors w-full rounded-xl hover:bg-white/5 group">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span className="hidden md:block font-medium">Salir</span>
                </button>
            </div>
        </aside>
    );
}

function NavItem({ active, label, icon, svgContent, circleHeader }: any) {
    return (
        <button
            className={`
        w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
        ${active
                    ? 'bg-zgas-lime text-zgas-navy font-bold shadow-[0_0_20px_rgba(196,214,0,0.3)]'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }
      `}
        >
            <svg
                className={`w-5 h-5 ${active ? 'stroke-current' : 'stroke-current group-hover:text-zgas-lime transition-colors'}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {svgContent || icon}
                {circleHeader && <circle cx="12" cy="7" r="4" />}
                {!svgContent && !circleHeader && !icon && <circle cx="12" cy="12" r="10" />}
            </svg>
            <span className="hidden md:block">{label}</span>
        </button>
    );
}
