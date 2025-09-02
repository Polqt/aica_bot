"use client"

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { FileUpload } from '@/components/ui/file-upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Upload, CheckCircle, ArrowRight, Loader2 } from 'lucide-react'

export default function ResumeUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const router = useRouter()

  const handleFileChange = useCallback((files: File[]) => {
    if (files.length > 0) {
      const file = files[0]

      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]

      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload a PDF, DOC, or DOCX file.')
        return
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large. Please upload a file smaller than 10MB.')
        return
      }

      setSelectedFile(file)
      toast.success('File selected successfully!')
    }
  }, [])

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first.')
      return
    }

    setIsUploading(true)

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        toast.error('Please log in first.')
        router.push('/login')
        return
      }

      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/upload-resume`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Upload failed')
      }

      await response.json()
      setUploadComplete(true)
      toast.success('Resume uploaded successfully!')
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-green-600/20 rounded-full blur-3xl animate-float delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <Card className="glass-card border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Resume Upload</CardTitle>
            <CardDescription className="text-lg">
              Upload your resume to get personalized job matches and insights
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {!uploadComplete ? (
              <>
                <div className="space-y-4">
                  <FileUpload onChange={handleFileChange} />

                  {selectedFile && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between p-4 bg-green-50/50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-medium text-green-800 dark:text-green-200">
                            {selectedFile.name}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    className="flex-1 btn-modern group bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    size="lg"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Resume
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleSkip}
                    disabled={isUploading}
                    className="flex-1 btn-modern"
                    size="lg"
                  >
                    Skip for Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">
                    Upload Complete!
                  </h3>
                  <p className="text-green-600 dark:text-green-400 mt-2">
                    Your resume has been uploaded successfully. We&apos;re processing it now.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Redirecting to dashboard in a few seconds...
                </p>
              </motion.div>
            )}

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Supported formats: PDF, DOC, DOCX (Max 10MB)
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
