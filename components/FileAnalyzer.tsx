'use client';

import { useState } from 'react';
import { X, Download, Image as ImageIcon, FileText, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileTools } from './FileTools';

interface FileAnalyzerProps {
  file: any;
  onClose: () => void;
}

export function FileAnalyzer({ file, onClose }: FileAnalyzerProps) {
  const [converting, setConverting] = useState(false);
  const [convertFormat, setConvertFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [convertWidth, setConvertWidth] = useState('');
  const [convertHeight, setConvertHeight] = useState('');
  const [convertQuality, setConvertQuality] = useState('80');

  const metadata = typeof file.metadata === 'string' ? JSON.parse(file.metadata) : file.metadata;

  const handleConvert = async () => {
    if (!file.mime_type?.startsWith('image/')) {
      alert('Only images can be converted');
      return;
    }

    setConverting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/files/${file.id}/convert`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            format: convertFormat,
            width: convertWidth ? parseInt(convertWidth) : undefined,
            height: convertHeight ? parseInt(convertHeight) : undefined,
            quality: convertQuality ? parseInt(convertQuality) : undefined,
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${file.original_filename.split('.')[0]}.${convertFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        alert(data.error?.message || 'Conversion failed');
      }
    } catch (error) {
      console.error('Error converting file:', error);
      alert('Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const isImage = file.mime_type?.startsWith('image/');

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Info className="w-6 h-6 mr-2" />
          File Analysis
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* File Preview */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
          {isImage ? (
            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/files/${file.id}/download`}
                alt={file.original_filename}
                className="max-w-full max-h-64 rounded-lg"
              />
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
              <FileText className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* File Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Filename</p>
              <p className="text-base font-medium text-gray-900">{file.original_filename}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="text-base font-medium text-gray-900">{file.mime_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Size</p>
              <p className="text-base font-medium text-gray-900">{formatFileSize(file.size)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Uploaded</p>
              <p className="text-base font-medium text-gray-900">
                {new Date(file.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      {metadata && Object.keys(metadata).length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-700 overflow-x-auto">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* File Tools */}
      <div className="mt-6 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ImageIcon className="w-5 h-5 mr-2" />
          File Tools
        </h3>
        <FileTools file={file} />
      </div>

      {/* Image Conversion */}
      {isImage && (
        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2" />
            Convert Image Format
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <select
                value={convertFormat}
                onChange={(e) => setConvertFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Width (px)</label>
              <input
                type="number"
                value={convertWidth}
                onChange={(e) => setConvertWidth(e.target.value)}
                placeholder="Auto"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height (px)</label>
              <input
                type="number"
                value={convertHeight}
                onChange={(e) => setConvertHeight(e.target.value)}
                placeholder="Auto"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quality (1-100)</label>
              <input
                type="number"
                value={convertQuality}
                onChange={(e) => setConvertQuality(e.target.value)}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={handleConvert}
            disabled={converting}
            className={cn(
              'mt-4 w-full py-2 px-4 rounded-lg font-medium transition-colors',
              converting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            {converting ? 'Converting...' : 'Convert & Download'}
          </button>
        </div>
      )}
    </div>
  );
}

