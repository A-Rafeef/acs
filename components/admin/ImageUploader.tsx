'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, X, Star, ArrowUp, ArrowDown, Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'

interface UploadedImage {
  url: string
  r2_key: string
  sort_order: number
  is_primary: boolean
  file?: File
}

interface ImageUploaderProps {
  images: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Viewfinder Camera Modal State
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  // Clean up camera stream if component unmounts while modal is active
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Compress helper
  const compressImage = async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/')) return file
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      }
      return await imageCompression(file, options)
    } catch (err) {
      console.warn('Compression failed, using original file:', err)
      return file
    }
  }

  const processFile = async (file: File): Promise<UploadedImage> => {
    const signatureRes = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type })
    })

    if (!signatureRes.ok) {
      throw new Error('Failed to get upload signature')
    }

    const { uploadUrl, fileUrl, r2Key, isMock } = await signatureRes.json()

    if (isMock) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          resolve({
            url: reader.result as string,
            r2_key: r2Key,
            sort_order: images.length,
            is_primary: images.length === 0
          })
        }
        reader.onerror = (error) => reject(error)
      })
    }

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file
    })

    if (!uploadRes.ok) {
      throw new Error('Upload to storage failed')
    }

    return {
      url: fileUrl,
      r2_key: r2Key,
      sort_order: images.length,
      is_primary: images.length === 0
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    const toastId = toast.loading(`Processing and uploading ${files.length} image(s)...`)

    try {
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          return await compressImage(file)
        })
      )

      const uploadPromises = compressedFiles.map((file) => processFile(file))
      const newImages = await Promise.all(uploadPromises)

      const updated = [...images, ...newImages].map((img, idx) => ({
        ...img,
        sort_order: idx,
        is_primary: idx === 0 ? true : img.is_primary
      }))

      onChange(updated)
      toast.success('Images uploaded successfully', { id: toastId })
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Image upload failed', { id: toastId })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }

  // Multi-shot In-App Camera functions
  const openInAppCamera = async () => {
    setCameraLoading(true)
    setShowCameraModal(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      })
      mediaStreamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch (err: any) {
      console.error('Error starting camera stream:', err)
      toast.error('Failed to open camera: ' + (err.message || 'Permission denied'))
      closeInAppCamera()
    } finally {
      setCameraLoading(false)
    }
  }

  const closeInAppCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    setShowCameraModal(false)
  }

  const capturePhoto = async () => {
    if (!videoRef.current || capturing) return
    setCapturing(true)
    
    try {
      const video = videoRef.current
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 1280
      canvas.height = video.videoHeight || 720
      
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not instantiate canvas context')
      
      // Draw frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert to file
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88))
      if (!blob) throw new Error('Blob creation failed')
      
      const file = new File([blob], `snap-${Date.now()}.jpg`, { type: 'image/jpeg' })
      
      // Compress
      const compressed = await compressImage(file)
      
      // Upload
      const newImg = await processFile(compressed)
      
      // Update state
      const updated = [...images, newImg].map((img, idx) => ({
        ...img,
        sort_order: idx,
        is_primary: idx === 0 ? true : img.is_primary
      }))
      
      onChange(updated)
      toast.success('Snap uploaded successfully')
    } catch (err: any) {
      console.error(err)
      toast.error('Capture failed: ' + err.message)
    } finally {
      setCapturing(false)
    }
  }

  const removeImage = (indexToRemove: number) => {
    const updated = images
      .filter((_, idx) => idx !== indexToRemove)
      .map((img, idx) => ({
        ...img,
        sort_order: idx,
        is_primary: idx === 0 ? true : img.is_primary
      }))
    onChange(updated)
  }

  const setPrimary = (index: number) => {
    const updated = images.map((img, idx) => ({
      ...img,
      is_primary: idx === index
    }))
    onChange(updated)
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= images.length) return

    const updated = [...images]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    const final = updated.map((img, idx) => ({
      ...img,
      sort_order: idx,
      is_primary: idx === 0 ? true : img.is_primary
    }))

    onChange(final)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
          Product Images
        </label>
        <span className="text-[10px] text-foreground/45 uppercase font-medium">
          {images.length} uploaded (First is cover)
        </span>
      </div>

      {/* Grid of uploaded images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img, idx) => (
            <div
              key={img.r2_key + idx}
              className="group relative aspect-[3/4] border border-border/15 bg-secondary/10 rounded-sm overflow-hidden flex flex-col justify-end"
            >
              <Image
                src={img.url}
                alt="Product thumbnail"
                fill
                sizes="(max-w-7xl) 20vw, 30vw"
                className="object-cover"
              />

              {/* Cover badge */}
              {img.is_primary && (
                <div className="absolute top-2 left-2 bg-foreground text-background text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm flex items-center gap-1">
                  <Star className="h-2.5 w-2.5 fill-background stroke-background" /> Cover
                </div>
              )}

              {/* Action Toolbar */}
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveImage(idx, 'up')}
                      className="p-1 rounded-sm bg-secondary text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => moveImage(idx, 'down')}
                      className="p-1 rounded-sm bg-secondary text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="p-1 rounded-sm bg-destructive/15 text-destructive hover:bg-destructive hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {!img.is_primary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(idx)}
                    className="w-full bg-foreground text-background text-[9px] font-black uppercase tracking-widest py-1.5 rounded-sm hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Set as Cover
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Drag/Click Zone Split */}
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
        
        {/* 1. Browse Gallery */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-border/40 hover:border-foreground/40 bg-secondary/5 hover:bg-secondary/15 py-6 px-4 rounded-sm text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />
          <Upload className="h-5 w-5 text-foreground/40" />
          <div className="space-y-0.5">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">
              Browse Gallery
            </p>
            <p className="text-[8px] text-foreground/45 uppercase tracking-widest font-semibold">
              Select multiple photos
            </p>
          </div>
        </div>

        {/* 2. Take Photo (Native camera capture) */}
        <div
          onClick={() => cameraInputRef.current?.click()}
          className="border border-dashed border-border/40 hover:border-foreground/40 bg-secondary/5 hover:bg-secondary/15 py-6 px-4 rounded-sm text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
        >
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
          <Camera className="h-5 w-5 text-foreground/40" />
          <div className="space-y-0.5">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">
              Take Photo
            </p>
            <p className="text-[8px] text-foreground/45 uppercase tracking-widest font-semibold">
              Direct device camera
            </p>
          </div>
        </div>

        {/* 3. Multi-shot custom camera viewfinder */}
        <button
          type="button"
          onClick={openInAppCamera}
          className="border border-dashed border-border/40 hover:border-foreground/40 bg-secondary/5 hover:bg-secondary/15 py-6 px-4 rounded-sm text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-left"
        >
          <div className="relative">
            <Camera className="h-5 w-5 text-foreground/40" />
            <span className="absolute -top-1 -right-2 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
            </span>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">
              Multi-Shot Camera
            </p>
            <p className="text-[8px] text-foreground/45 uppercase tracking-widest font-semibold">
              Live sequential capture
            </p>
          </div>
        </button>
      </div>

      {/* In-App Camera Viewfinder Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md transition-all">
          <div className="relative flex flex-col w-full max-w-2xl bg-secondary/10 border border-border/25 rounded-md overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/20 px-6 py-4 bg-background/40">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-foreground/70" />
                <span className="text-xs font-bold uppercase tracking-wider">Multi-Shot Viewfinder</span>
              </div>
              <button
                type="button"
                onClick={closeInAppCamera}
                className="p-1 rounded-full hover:bg-secondary/40 text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Viewfinder Window */}
            <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
              {cameraLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-foreground/65">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Waking camera device...</span>
                </div>
              )}
              
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1] sm:scale-x-1" 
              />

              {capturing && (
                <div className="absolute inset-0 bg-white/20 animate-pulse flex items-center justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-background bg-foreground px-3 py-1.5 rounded-sm">Processing Snap...</span>
                </div>
              )}
            </div>

            {/* Footer Control Panel */}
            <div className="flex items-center justify-between border-t border-border/20 px-6 py-5 bg-background/40">
              <div className="text-[10px] text-foreground/45 font-bold uppercase tracking-wider">
                Captured: <span className="text-foreground">{images.length}</span>
              </div>

              {/* Shutter Button */}
              <button
                type="button"
                disabled={cameraLoading || capturing}
                onClick={capturePhoto}
                className="h-14 w-14 rounded-full border-4 border-foreground/30 hover:border-foreground/55 flex items-center justify-center bg-foreground text-background transition-all transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="Capture Photo"
              >
                {capturing ? (
                  <Loader2 className="h-5 w-5 animate-spin text-background" />
                ) : (
                  <span className="h-9 w-9 rounded-full bg-foreground border border-background" />
                )}
              </button>

              <button
                type="button"
                onClick={closeInAppCamera}
                className="px-4 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-foreground/80 transition-colors rounded-sm cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
