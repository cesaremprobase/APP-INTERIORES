import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'EpoArt Perú - Innovación en Superficies',
  description: 'Transforma tus espacios con resina epóxica de alta gama. Pisos, cocinas y más.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased text-white bg-epoxy-deep">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  )
}
