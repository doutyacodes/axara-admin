import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, X, Users, Clock, BarChart2, RefreshCw } from 'lucide-react';

const AnalyticsModal = ({ articleId, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  React.useEffect(() => {
    if (isOpen && articleId) {
      fetchAnalytics();
    }
  }, [isOpen, articleId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/articles/${articleId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Detailed Analytics</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
              <p className="text-gray-500 mt-2">Loading analytics...</p>
            </div>
          ) : analytics ? (
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                icon={Users}
                label="Unique Views"
                value={analytics.uniqueViews || 0}
              />
              <MetricCard
                icon={Clock}
                label="Avg. Engagement"
                value={formatTime(analytics.avgEngagementTimePerView || 0)}
              />
              <MetricCard
                icon={BarChart2}
                label="Views per User"
                value={(analytics.avgViewsPerUser || 0).toFixed(2)}
              />
              <MetricCard
                icon={RefreshCw}
                label="Returning Users"
                value={analytics.returningUsers || 0}
              />
            </div>
          ) : (
            <p className="text-center text-gray-500">No analytics data available.</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Helper function to format time (e.g., seconds to "mm:ss")
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

// Metric Card Component
const MetricCard = ({ icon: Icon, label, value }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center space-x-2 mb-2">
      <Icon className="h-4 w-4 text-gray-600" />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <div className="text-lg font-semibold text-gray-800">{value}</div>
  </div>
);

export default AnalyticsModal;
