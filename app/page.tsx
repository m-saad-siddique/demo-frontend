'use client';

import { useState, useEffect } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { FileList } from '@/components/FileList';
import { FileAnalyzer } from '@/components/FileAnalyzer';
import { StatisticsPanel } from '@/components/StatisticsPanel';
import { Upload, FileText, BarChart3, Settings } from 'lucide-react';

export default function Home() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/files`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setFiles(data.data);
      } else {
        setFiles([]);
      }
    } catch (error: any) {
      console.error('Error fetching files:', error);
      setError('Failed to fetch files. Make sure the backend API is running.');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploaded = () => {
    fetchFiles();
  };

  const handleFileSelect = (file: any) => {
    setSelectedFile(file);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            File Analyzer & Converter
          </h1>
          <p className="text-gray-600 text-lg">
            Upload, analyze, and convert your files with ease
          </p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{files?.length || 0}</p>
              <p className="text-sm text-gray-600">Total Files</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {files?.filter((f) => f?.mime_type?.startsWith('image/')).length || 0}
              </p>
              <p className="text-sm text-gray-600">Images</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {files?.length ? (files.reduce((acc, f) => acc + (f?.size || 0), 0) / 1024 / 1024).toFixed(2) : '0.00'} MB
              </p>
              <p className="text-sm text-gray-600">Total Size</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload File
              </h2>
              <FileUpload onUploadSuccess={handleFileUploaded} />
            </div>
          </div>

          {/* File List Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Files
              </h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading files...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={fetchFiles}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <FileList
                  files={files || []}
                  onFileSelect={handleFileSelect}
                  onFileDeleted={fetchFiles}
                />
              )}
            </div>
          </div>
        </div>

        {/* File Analyzer Section */}
        {selectedFile && (
          <div className="mt-6">
            <FileAnalyzer file={selectedFile} onClose={() => setSelectedFile(null)} />
          </div>
        )}

        {/* Statistics Panel */}
        <div className="mt-6">
          <StatisticsPanel />
        </div>
      </div>
    </main>
  );
}

