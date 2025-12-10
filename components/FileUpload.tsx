'use client';

import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadMode, setUploadMode] = useState<'single' | 'batch'>('single');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (uploadMode === 'single' && selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setFiles([]);
    } else if (uploadMode === 'batch') {
      setFiles(selectedFiles);
      setFile(null);
    }
    setStatus('idle');
    setMessage('');
  };

  const handleUpload = async () => {
    if (uploadMode === 'single' && !file) return;
    if (uploadMode === 'batch' && files.length === 0) return;

    setUploading(true);
    setStatus('idle');
    setMessage('');
    setUploadProgress({});

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      if (uploadMode === 'single' && file) {
        // Single file upload
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${apiUrl}/api/files/upload`, {
          method: 'POST',
          body: formData,
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`);
        }

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('File uploaded successfully!');
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setTimeout(() => {
            onUploadSuccess();
            setStatus('idle');
            setMessage('');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.error?.message || `Upload failed: ${response.status} ${response.statusText}`);
        }
      } else if (uploadMode === 'batch' && files.length > 0) {
        // Batch file upload
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < files.length; i++) {
          const currentFile = files[i];
          setUploadProgress(prev => ({ ...prev, [currentFile.name]: 0 }));

          try {
            const formData = new FormData();
            formData.append('file', currentFile);

            const response = await fetch(`${apiUrl}/api/files/upload`, {
              method: 'POST',
              body: formData,
            });

            setUploadProgress(prev => ({ ...prev, [currentFile.name]: 100 }));

            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            errorCount++;
            setUploadProgress(prev => ({ ...prev, [currentFile.name]: -1 }));
          }
        }

        if (errorCount === 0) {
          setStatus('success');
          setMessage(`Successfully uploaded ${successCount} file(s)!`);
        } else {
          setStatus('error');
          setMessage(`Uploaded ${successCount} file(s), ${errorCount} failed`);
        }

        setFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        setTimeout(() => {
          onUploadSuccess();
          setStatus('idle');
          setMessage('');
          setUploadProgress({});
        }, 2000);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Upload failed. Make sure the backend API is running on port 3001.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (uploadMode === 'single' && droppedFiles.length > 0) {
      setFile(droppedFiles[0]);
      setFiles([]);
    } else if (uploadMode === 'batch') {
      setFiles(droppedFiles);
      setFile(null);
    }
    setStatus('idle');
    setMessage('');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Mode Toggle */}
      <div className="flex space-x-2">
        <button
          onClick={() => {
            setUploadMode('single');
            setFile(null);
            setFiles([]);
          }}
          className={cn(
            'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
            uploadMode === 'single'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          )}
        >
          Single File
        </button>
        <button
          onClick={() => {
            setUploadMode('batch');
            setFile(null);
            setFiles([]);
          }}
          className={cn(
            'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
            uploadMode === 'batch'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          )}
        >
          Batch Upload
        </button>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          (file || files.length > 0)
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,application/pdf,text/plain"
          multiple={uploadMode === 'batch'}
        />
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 mb-2">
          Drag and drop {uploadMode === 'batch' ? 'files' : 'a file'} here, or{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            browse
          </button>
        </p>
        <p className="text-sm text-gray-500">
          Supports: Images, PDFs, Text files (Max 10MB per file)
        </p>
      </div>

      {/* Selected File(s) */}
      {uploadMode === 'single' && file && (
        <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          </div>
          <button
            onClick={() => {
              setFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="ml-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {uploadMode === 'batch' && files.length > 0 && (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {files.map((f, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{f.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(f.size)}</p>
                {uploadProgress[f.name] !== undefined && (
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={cn(
                          'h-1.5 rounded-full transition-all',
                          uploadProgress[f.name] === -1
                            ? 'bg-red-500'
                            : uploadProgress[f.name] === 100
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                        )}
                        style={{ width: `${Math.max(0, uploadProgress[f.name])}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setFiles(files.filter((_, i) => i !== idx));
                }}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Status Message */}
      {message && (
        <div
          className={cn(
            'rounded-lg p-3 flex items-center space-x-2',
            status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          )}
        >
          {status === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm">{message}</span>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={(uploadMode === 'single' && !file) || (uploadMode === 'batch' && files.length === 0) || uploading}
        className={cn(
          'w-full py-2 px-4 rounded-lg font-medium transition-colors',
          ((uploadMode === 'single' && file) || (uploadMode === 'batch' && files.length > 0)) && !uploading
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        )}
      >
        {uploading
          ? uploadMode === 'batch'
            ? `Uploading ${files.length} files...`
            : 'Uploading...'
          : uploadMode === 'batch'
          ? `Upload ${files.length} File(s)`
          : 'Upload File'}
      </button>
    </div>
  );
}

