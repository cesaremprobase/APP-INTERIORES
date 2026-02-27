'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
// import { analyzeImage } from '@/app/actions/analyze-image'

export default function ImageUploader() {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [results, setResults] = useState<any>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFile = (selectedFile: File) => {
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(selectedFile)
            setResults(null) // Reset results on new file
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleSubmit = async () => {
        if (!file) return

        setLoading(true)
        const formData = new FormData()
        formData.append('image', file)

        try {
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
            alert('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full">
            {/* Upload Box */}
            {!preview ? (
                <div
                    className={`glass-panel p-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center min-h-[400px]
            ${dragActive ? 'border-epoxy-primary bg-white/10' : 'border-white/10 hover:border-epoxy-primary/50'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        onChange={handleChange}
                        accept="image/*"
                    />
                    <div className={`w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 transition-transform duration-300 ${dragActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                        <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Sube o arrastra tu foto</h3>
                    <p className="text-gray-500 text-center max-w-sm">
                        Soporta JPG, PNG de espacios interiores (cocinas, baños, salas).
                    </p>
                </div>
            ) : (
                <div className="glass-panel p-6 rounded-2xl">
                    <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-6">
                        <Image src={preview} alt="Preview" fill className="object-cover" />
                        <button
                            onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); setResults(null); }}
                            className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-500/80 transition-colors"
                            title="Cambiar imagen"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {!results && (
                        <div className="text-center">
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn-primary w-full md:w-auto min-w-[200px] py-4 text-lg relative overflow-hidden"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                        Analizando Espacio...
                                    </span>
                                ) : (
                                    '✨ Generar 3 Propuestas IA'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Results Display */}
            {results && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
                    {results.proposals.map((prop: any, index: number) => (
                        <div key={index} className="glass-panel p-6 rounded-xl border border-white/5 hover:border-epoxy-primary/30 transition-all hover:-translate-y-1">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-epoxy-primary to-epoxy-accent flex items-center justify-center mb-4 font-bold text-white">
                                {index + 1}
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{prop.title}</h3>
                            <p className="text-gray-300 text-sm mb-4 leading-relaxed">{prop.description}</p>
                            <div className="text-xs text-epoxy-gold bg-epoxy-gold/10 p-3 rounded-lg border border-epoxy-gold/20">
                                <strong>💎 Beneficio:</strong> {prop.benefit}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
