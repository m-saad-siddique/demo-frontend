'use client';

import { useState, useEffect } from 'react';
import { BarChart3, FileText, Image, HardDrive, TrendingUp, Copy } from 'lucide-react';

export function StatisticsPanel() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [duplicates, setDuplicates] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchDuplicates();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/files/stats/summary`
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDuplicates = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/files/duplicates`
      );
      const data = await response.json();
      if (data.success) {
        setDuplicates(data.data);
      }
    } catch (error) {
      console.error('Error fetching duplicates:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <BarChart3 className="w-6 h-6 mr-2" />
        File Statistics
      </h2>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_files || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatBytes(parseInt(stats.total_size || 0))}
                </p>
              </div>
              <HardDrive className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Images</p>
                <p className="text-2xl font-bold text-gray-900">{stats.image_count || 0}</p>
              </div>
              <Image className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">PDFs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pdf_count || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Average File Size</p>
          <p className="text-xl font-bold text-gray-900">
            {stats ? formatBytes(parseInt(stats.avg_file_size || 0)) : '0 Bytes'}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Largest File</p>
          <p className="text-xl font-bold text-gray-900">
            {stats ? formatBytes(parseInt(stats.max_file_size || 0)) : '0 Bytes'}
          </p>
        </div>
      </div>

      {/* Duplicates Section */}
      {duplicates.length > 0 && (
        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Copy className="w-5 h-5 mr-2" />
            Duplicate Files ({duplicates.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {duplicates.map((dup, idx) => (
              <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="font-medium text-gray-900">{dup.original_filename}</p>
                <p className="text-sm text-gray-600">
                  {formatBytes(parseInt(dup.size))} • {dup.duplicate_count} copies
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

