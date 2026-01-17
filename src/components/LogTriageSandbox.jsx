import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Upload, Download, BarChart3, Calendar, X, ChevronDown, ChevronUp } from 'lucide-react';
import { parseLogFile } from '../utils/logParser';
import { generateSampleLogs } from '../utils/sampleLogs';

const LogTriageSandbox = () => {
  // State management
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevels, setSelectedLevels] = useState(['ERROR', 'WARN', 'INFO', 'DEBUG']);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 50;

  // Initialize with sample logs
  useEffect(() => {
    setLogs(generateSampleLogs(200));
  }, []);

  // Filter logs based on search, level, and date range
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        log.message.toLowerCase().includes(searchLower) ||
        log.service.toLowerCase().includes(searchLower) ||
        log.traceId.toLowerCase().includes(searchLower);

      // Level filter
      const matchesLevel = selectedLevels.includes(log.level);

      // Date range filter
      const logDate = new Date(log.timestamp);
      const matchesDateRange =
        (!dateRange.start || logDate >= new Date(dateRange.start)) &&
        (!dateRange.end || logDate <= new Date(dateRange.end));

      return matchesSearch && matchesLevel && matchesDateRange;
    });
  }, [logs, searchQuery, selectedLevels, dateRange]);

  // Pagination
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * logsPerPage;
    return filteredLogs.slice(startIndex, startIndex + logsPerPage);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  // Statistics calculation
  const stats = useMemo(() => {
    const levelCounts = {};
    const serviceCounts = {};

    filteredLogs.forEach(log => {
      levelCounts[log.level] = (levelCounts[log.level] || 0) + 1;
      serviceCounts[log.service] = (serviceCounts[log.service] || 0) + 1;
    });

    const topServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      levelCounts,
      topServices,
      total: filteredLogs.length
    };
  }, [filteredLogs]);

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsedLogs = parseLogFile(text);
      setLogs(prevLogs => [...prevLogs, ...parsedLogs]);
    } catch (error) {
      console.error('Error parsing log file:', error);
      alert('Error parsing log file. Please check the format.');
    }
  };

  // Handle export
  const handleExport = () => {
    const dataStr = filteredLogs.map(log => JSON.stringify(log)).join('\\n');
    const dataBlob = new Blob([dataStr], { type: 'application/jsonl' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-export-${Date.now()}.jsonl`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Toggle level filter
  const toggleLevel = (level) => {
    setSelectedLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
    setCurrentPage(1);
  };

  // Level colors
  const levelColors = {
    ERROR: 'bg-red-500/20 text-red-400 border-red-500/50',
    WARN: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    INFO: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    DEBUG: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
  };

  const levelButtonColors = {
    ERROR: 'hover:bg-red-500/30 text-red-400',
    WARN: 'hover:bg-yellow-500/30 text-yellow-400',
    INFO: 'hover:bg-blue-500/30 text-blue-400',
    DEBUG: 'hover:bg-gray-500/30 text-gray-400'
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Log Triage Sandbox 🔍</h1>
          <p className="text-gray-400">Interactive environment for analyzing application logs</p>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search logs (message, service, trace ID)..."
              className="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Level Filters */}
            <div className="flex gap-2">
              <Filter size={20} className="text-gray-400 my-auto" />
              {['ERROR', 'WARN', 'INFO', 'DEBUG'].map(level => (
                <button
                  key={level}
                  onClick={() => toggleLevel(level)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    selectedLevels.includes(level)
                      ? `${levelColors[level]} border-2`
                      : 'bg-gray-700 text-gray-400 border-gray-600 opacity-50'
                  } ${levelButtonColors[level]}`}
                >
                  {level}
                </button>
              ))}
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-gray-400" />
              <input
                type="date"
                className="bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                className="bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 ml-auto">
              <label className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg cursor-pointer transition-colors">
                <Upload size={20} />
                Upload
                <input
                  type="file"
                  accept=".log,.txt,.jsonl"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Download size={20} />
                Export
              </button>
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <BarChart3 size={20} />
                {showStats ? 'Hide' : 'View'} Stats
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-400">
            Showing {paginatedLogs.length} of {filteredLogs.length} logs
            {filteredLogs.length !== logs.length && ` (filtered from ${logs.length} total)`}
          </div>
        </div>

        {/* Statistics Panel */}
        {showStats && (
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold">Statistics</h2>

            {/* Level Distribution */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-300">Log Level Distribution</h3>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(stats.levelCounts).map(([level, count]) => (
                  <div
                    key={level}
                    className={`p-4 rounded-lg border ${levelColors[level]}`}
                  >
                    <div className="text-sm font-medium">{level}</div>
                    <div className="text-2xl font-bold mt-1">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Services */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-300">Top 5 Services</h3>
              <div className="space-y-2">
                {stats.topServices.map(([service, count]) => (
                  <div
                    key={service}
                    className="flex justify-between items-center bg-gray-700 p-3 rounded-lg"
                  >
                    <span className="font-medium">{service}</span>
                    <span className="text-gray-400">{count} logs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Logs List */}
        <div className="space-y-3">
          {paginatedLogs.map((log, index) => (
            <div
              key={index}
              onClick={() => setSelectedLog(log)}
              className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 cursor-pointer transition-all hover:shadow-lg border border-gray-700 hover:border-gray-600"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${levelColors[log.level]}`}>
                  {log.level}
                </span>
                <span className="text-sm text-gray-400">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                <span className="text-sm text-blue-400">
                  {log.service}
                </span>
              </div>
              <p className="text-sm text-gray-300">{log.message}</p>
              {log.traceId && (
                <p className="text-xs text-gray-500 mt-2">
                  Trace: {log.traceId}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 bg-gray-800 rounded-lg p-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50 hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50 hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        )}

        {/* Log Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold">Log Details</h2>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-400">Timestamp</div>
                    <div className="text-white">{new Date(selectedLog.timestamp).toLocaleString()}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400">Level</div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${levelColors[selectedLog.level]}`}>
                      {selectedLog.level}
                    </span>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400">Service</div>
                    <div className="text-white">{selectedLog.service}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400">Message</div>
                    <div className="text-white">{selectedLog.message}</div>
                    // src/components/LogTriageSandbox.jsx
export function LogRow({ event }) {
  return (
    <div className={`log log-${event.level.toLowerCase()}`}>
      <strong>{event.level}</strong>
      <span>{event.source}</span>
      <pre>{event.message}</pre>
    </div>
  );
}

                  </div>

                  {selectedLog.traceId && (
                    <div>
                      <div className="text-sm text-gray-400">Trace ID</div>
                      <div className="text-white font-mono text-sm">{selectedLog.traceId}</div>
                    </div>
                  )}

                  {selectedLog.userId && (
                    <div>
                      <div className="text-sm text-gray-400">User ID</div>
                      <div className="text-white font-mono text-sm">{selectedLog.userId}</div>
                    </div>
                  )}

                  {selectedLog.metadata && (
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Metadata</div>
                      <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto text-gray-300">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogTriageSandbox;
