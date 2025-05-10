'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Edit, Plus, AlertCircle } from 'lucide-react';

export default function AdminNewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/news-map', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch news');
      }
      const data = await res.json();
      setNews(data.news);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!newsToDelete) return;
    
    try {
      const res = await fetch(`/api/news-map/${newsToDelete.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete news');
      }
      
      // Remove the deleted news from the state
      setNews(news.filter(item => item.id !== newsToDelete.id));
      setShowDeleteModal(false);
      setNewsToDelete(null);
    } catch (err) {
      console.error('Error deleting news:', err);
      setError(err.message);
    }
  };

  const confirmDelete = (newsItem) => {
    setNewsToDelete(newsItem);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-2 text-red-800">
            <div className="w-4 h-4 border-2 border-red-800 border-t-transparent rounded-full animate-spin"></div>
            <p>Loading news...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md text-red-800">
          <p className="flex items-center"><AlertCircle className="mr-2" /> Error: {error}</p>
          <button 
            onClick={fetchNews}
            className="mt-4 px-4 py-2 bg-red-800 text-white rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">News Management</h1>
          <Link 
            href="/news-map/create" 
            className="flex items-center px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition"
          >
            <Plus className="mr-2 h-5 w-5" /> Create News
          </Link>
        </div>

        {news.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600 mb-4">No news articles found.</p>
            <Link 
              href="/news-map/create" 
              className="inline-flex items-center px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition"
            >
              <Plus className="mr-2 h-5 w-5" /> Add Your First News Article
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map(newsItem => (
              <div key={newsItem.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <div className="relative h-48 w-full">
                  <img
                    src={newsItem.image_url.startsWith('http') ? newsItem.image_url : `https://wowfy.in/testusr/images/${newsItem.image_url}`} 
                    alt={newsItem.title}
                    
                    className="object-cover w-full h-full" 
                  />
                </div>
                <div className="p-4 flex-grow">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">{newsItem.title}</h2>
                  <p className="text-sm text-gray-500">Source: {newsItem.source_name || 'Unknown'}</p>
                </div>
                <div className="border-t border-gray-100 p-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">{formatDate(newsItem.created_at)}</span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => router.push(`/news-map/edit/${newsItem.id}`)}
                      className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                      aria-label="Edit news"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => confirmDelete(newsItem)}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                      aria-label="Delete news"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{newsToDelete?.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-800 text-white rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}