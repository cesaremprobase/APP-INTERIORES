import AuthForm from '@/components/auth/AuthForm'

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-epoxy-deep relative">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      <AuthForm view="signup" />
    </main>
  )
}
