'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
// Removed server action import. It's now standard API route.

export default function IAToolPage() {
    const { user, loading: authLoading } = useAuth()
    const [file, setFile] = useState<File | null>(null)
    const [textureFile, setTextureFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<any>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Canvas Drawing State
    const [isDrawing, setIsDrawing] = useState(false)
    const [brushSize, setBrushSize] = useState(40)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)

    const initCanvas = () => {
        if (imageRef.current && canvasRef.current) {
            canvasRef.current.width = imageRef.current.naturalWidth
            canvasRef.current.height = imageRef.current.naturalHeight
            const ctx = canvasRef.current.getContext('2d')
            if (ctx) {
                ctx.fillStyle = 'black'
                ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
            }
        }
    }

    const clearMask = () => {
        initCanvas()
    }

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true)
        draw(e)
    }

    const stopDrawing = () => {
        setIsDrawing(false)
        const ctx = canvasRef.current?.getContext('2d')
        if (ctx) ctx.beginPath()
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const x = (e.clientX - rect.left) * scaleX
        const y = (e.clientY - rect.top) * scaleY

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.lineWidth = brushSize * scaleX
        ctx.lineCap = 'round'
        ctx.strokeStyle = 'white'

        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    const handleFile = (selectedFile: File) => {
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile)
            const reader = new FileReader()
            reader.onloadend = () => setPreview(reader.result as string)
            reader.readAsDataURL(selectedFile)
            setResults(null)
        }
    }

    const handleSubmit = async () => {
        if (!file) return
        setLoading(true)
        setResults(null)

        try {
            const formData = new FormData()
            formData.append('image', file)
            if (textureFile) {
                formData.append('texture', textureFile)
            }
            if (canvasRef.current && preview) {
                const maskDataUrl = canvasRef.current.toDataURL('image/png')
                const base64Mask = maskDataUrl.split(',')[1] // Extract just the base64 part
                formData.append('mask', base64Mask)
            }

            const res = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });
            const response = await res.json();

            if (response.success) {
                setResults(response.data)
            } else {
                alert('Error: ' + response.error)
            }
        } catch (error) {
            console.error(error)
            alert('Error al procesar la imagen')
        } finally {
            setLoading(false)
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-epoxy-deep text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-epoxy-primary"></div>
            </div>
        )
    }

    return (
        <main className="min-h-screen pt-24 px-4 bg-epoxy-deep relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-epoxy-primary/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Diseñador <span className="text-transparent bg-clip-text bg-gradient-to-r from-epoxy-gold to-yellow-200">IA</span>
                        </h1>
                        <p className="text-gray-400">Transforma tus espacios con Inteligencia Artificial.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Upload */}
                    <div className="space-y-6">
                        <div className="glass-panel p-6 rounded-2xl relative group">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <span className="bg-epoxy-primary/20 text-epoxy-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                Sube tu Espacio
                            </h3>

                            {!preview ? (
                                <div
                                    className="border-2 border-dashed border-white/10 hover:border-epoxy-primary/50 transition-all cursor-pointer rounded-xl h-64 flex flex-col items-center justify-center bg-black/20"
                                    onClick={() => inputRef.current?.click()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
                                    }}
                                >
                                    <input ref={inputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} accept="image/*" />
                                    <svg className="w-10 h-10 text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    <span className="text-gray-400 text-sm">Click o arrastra foto aquí</span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative rounded-xl overflow-hidden border border-white/20 group shadow-2xl">
                                        <img
                                            ref={imageRef}
                                            src={preview}
                                            alt="Space"
                                            onLoad={initCanvas}
                                            className="w-full h-auto block select-none"
                                            draggable={false}
                                        />
                                        <canvas
                                            ref={canvasRef}
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={stopDrawing}
                                            onMouseLeave={stopDrawing}
                                            className="absolute top-0 left-0 w-full h-full cursor-crosshair mix-blend-screen opacity-60 touch-none"
                                        />
                                        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setPreview(null); setFile(null); setResults(null); }} className="text-white bg-red-500/90 hover:bg-red-600 px-4 py-2 rounded-full text-xs font-bold shadow-lg transition-colors">
                                                ✕ Cambiar Foto
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 bg-black/30 p-4 rounded-xl border border-white/5">
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-gray-300 mb-2 block tracking-wider uppercase">Grosor del Pincel Mágico</label>
                                            <input type="range" min="5" max="200" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-full accent-epoxy-primary h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                        </div>
                                        <button onClick={clearMask} className="text-sm font-bold bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg text-white border border-white/10 flex items-center gap-2">
                                            🧹 Borrar Todo
                                        </button>
                                    </div>
                                    <div className="bg-epoxy-gold/10 p-3 rounded-lg border border-epoxy-gold/20 flex items-start gap-3">
                                        <span className="text-xl">✨</span>
                                        <p className="text-sm text-epoxy-gold/90 font-medium">
                                            Para resultados perfectos, <b className="text-epoxy-gold">pinta de blanco</b> estrictamente la zona (ej. el piso) que la IA debe reemplazar. Lo negro quedará protegido e intacto.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Texture Upload (Restored) */}
                        <div className="glass-panel p-6 rounded-2xl relative">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <span className="bg-epoxy-gold/20 text-epoxy-gold w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                Modelo de Piso (Opcional)
                            </h3>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setTextureFile(e.target.files[0])
                                    }
                                }}
                                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-epoxy-gold/10 file:text-epoxy-gold hover:file:bg-epoxy-gold/20"
                            />
                            <p className="text-xs text-gray-500 mt-2">Sube una textura para guiar a la IA (ej: Mármol, Madera).</p>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || !file}
                            className={`w-full py-4 text-lg font-bold rounded-xl transition-all shadow-lg
                            ${!file ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-epoxy-primary to-epoxy-accent text-white hover:scale-[1.02] hover:shadow-epoxy-primary/25'}`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                    <span>Generando Diseño...</span>
                                </div>
                            ) : (
                                '✨ Generar Diseño'
                            )}
                        </button>
                    </div>

                    {/* Right Column: Visualization */}
                    <div className="glass-panel p-8 rounded-2xl flex flex-col min-h-[600px]">
                        {!results && !loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                                <span className="text-6xl mb-4">🎨</span>
                                <h3 className="text-xl font-bold text-white mb-2">Tu Nuevo Espacio</h3>
                                <p className="text-gray-500 max-w-xs">Sube una foto para ver la magia de la IA.</p>
                            </div>
                        ) : loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-epoxy-primary mb-6"></div>
                                <h3 className="text-xl font-bold text-white mb-2">Procesando Imagen...</h3>
                                <p className="text-gray-400">La IA (Pollinations) está rediseñando tu habitación.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-white mb-4">Resultado de la IA (Gemini Flash)</h3>

                                {results.image ? (
                                    <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-2xl border border-white/20">
                                        <Image
                                            src={results.image}
                                            alt="Generated Design"
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <div className="relative w-full h-96 rounded-xl overflow-y-auto p-6 bg-black/40 shadow-2xl border border-white/20 custom-scrollbar">
                                        <div className="prose prose-invert max-w-none">
                                            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                                                {results.description || results.response}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-gray-300 text-sm">
                                        <span className="text-epoxy-gold font-bold">Nota:</span> Análisis detallado y combinación realizada 100% nativa con Gemini 2.5 Flash.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
