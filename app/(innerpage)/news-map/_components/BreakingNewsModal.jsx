// components/BreakingNewsModal.js
import { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

export default function BreakingNewsModal({ isOpen, onClose, breakingNews, onRemoveBreakingNews }) {
  const [removingId, setRemovingId] = useState(null);

  const handleRemoveBreakingNews = async (newsId) => {
    setRemovingId(newsId);
    try {
      const response = await fetch(`/api/news-map/breaking/${newsId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove breaking news');
      }

      onRemoveBreakingNews(newsId);
    } catch (error) {
      console.error('Error removing breaking news:', error);
      alert('Failed to remove breaking news. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Breaking News Limit Reached
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            You can have a maximum of 3 breaking news items. Please remove one of the existing breaking news to add a new one.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">
              <strong>Current breaking news: {breakingNews.length}/3</strong>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {breakingNews.map((news) => (
            <div key={news.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">{news.title}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Source: {news.source_name || 'Unknown'}</p>
                    <p>Breaking for: {news.breaking_news_hours || 2} hours</p>
                    <p>Created: {new Date(news.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveBreakingNews(news.id)}
                  disabled={removingId === news.id}
                  className="ml-4 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center disabled:opacity-50"
                >
                  {removingId === news.id ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Removing...
                    </span>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}