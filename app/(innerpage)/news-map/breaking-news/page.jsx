"use client"
import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, Clock, Eye } from 'lucide-react';

const BreakingNewsManagement = () => {
  const [breakingNews, setBreakingNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  // Fetch breaking news on component mount
  useEffect(() => {
    fetchBreakingNews();
  }, []);

  const fetchBreakingNews = async () => {
    try {
      const response = await fetch('/api/news-map/breaking-news');
      const data = await response.json();
      
      // Filter out expired breaking news
      const activeBreakingNews = (data.breakingNews || []).filter(news => {
        if (!news.breaking_expire_at) return true; // No expiry date means it's active
        return new Date(news.breaking_expire_at) > new Date(); // Not expired
      });
      
      setBreakingNews(activeBreakingNews);
    } catch (error) {
      console.error('Error fetching breaking news:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromBreaking = async (newsId) => {
    setRemoving(newsId);
    try {
      const response = await fetch(`/api/news-map/breaking-news/${newsId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_breaking: false }),
      });

      if (response.ok) {
        // Remove from local state
        setBreakingNews(prev => prev.filter(news => news.id !== newsId));
      } else {
        console.error('Failed to remove breaking news');
      }
    } catch (error) {
      console.error('Error removing breaking news:', error);
    } finally {
      setRemoving(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-800" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Breaking News Management
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium">
              {breakingNews.length}/3 Active
            </span>
          </div>
        </div>

        {/* No Breaking News */}
        {breakingNews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Breaking News Active
            </h3>
            <p className="text-gray-500">
              There are currently no breaking news items. Add breaking news from the main news management page.
            </p>
          </div>
        ) : (
          /* Breaking News Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {breakingNews.map((news) => (
              <div
                key={news.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  {news.image_url ? (
                    <img
                      src={news.image_url}
                      alt={news.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Eye className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Breaking Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-red-800 text-white px-2 py-1 rounded-md text-xs font-bold">
                      BREAKING
                    </span>
                  </div>

                  {/* Expiry Status - Commented out since we're not showing expired items */}
                  {/* 
                  {news.breaking_expire_at && (
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        isExpired(news.breaking_expire_at)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {isExpired(news.breaking_expire_at) ? 'EXPIRED' : 'ACTIVE'}
                      </span>
                    </div>
                  )}
                  */}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 leading-tight">
                    {news.title}
                  </h3>
                  
                  {news.source_name && (
                    <p className="text-sm text-gray-600 mb-2">
                      Source: {news.source_name}
                    </p>
                  )}

                  {/* Expiry Info */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Clock className="h-4 w-4" />
                    <span>Expires: {formatDate(news.breaking_expire_at)}</span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => removeFromBreaking(news.id)}
                    disabled={removing === news.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {removing === news.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Removing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Remove from Breaking
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">Breaking News Guidelines:</p>
              <ul className="list-disc list-inside space-y-1 text-red-700">
                <li>Maximum of 3 breaking news items can be active at once</li>
                <li>Breaking news will automatically expire based on the set expiry time</li>
                <li>Removing a news item from breaking news will not delete the news article</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsManagement;