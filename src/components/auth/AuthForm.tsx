'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AuthFormProps {
    view: 'login' | 'signup'
}

export default function AuthForm({ view }: AuthFormProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (view === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (error) throw error
                // For simple email/pass, usually check email confirmation or auto login
                router.push('/')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                router.push('/')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md p-8 glass-panel rounded-2xl relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-epoxy-primary/20 blur-[50px] rounded-full pointer-events-none" />

            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                    {view === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
                </h2>
                <p className="text-gray-400">
                    {view === 'login'
                        ? 'Ingresa para gestionar tus diseños'
                        : 'Únete para empezar a remodelar con IA'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-epoxy-primary focus:border-transparent outline-none text-white placeholder-gray-500 transition-all"
                        placeholder="ejemplo@correo.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-epoxy-primary focus:border-transparent outline-none text-white placeholder-gray-500 transition-all"
                        placeholder="••••••••"
                        required
                    />
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-3.5 relative overflow-hidden group"
                >
                    <span className="relative z-10">
                        {loading ? 'Procesando...' : (view === 'login' ? 'Iniciar Sesión' : 'Registrarse')}
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
                {view === 'login' ? (
                    <>
                        ¿No tienes cuenta?{' '}
                        <Link href="/signup" className="text-epoxy-primary hover:text-epoxy-accent font-medium transition-colors">
                            Regístrate gratis
                        </Link>
                    </>
                ) : (
                    <>
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" className="text-epoxy-primary hover:text-epoxy-accent font-medium transition-colors">
                            Inicia sesión
                        </Link>
                    </>
                )}
            </div>
        </div>
    )
}
