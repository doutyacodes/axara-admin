'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Loader2, AlertCircle, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function EditNewsPage({ params }) {
  const unwrappedParams = use(params);  // Unwrap the params Promise
  const { id } = unwrappedParams;

  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    article_url: '',
    source_name: '',
    latitude: '',
    longitude: '',
    category_id: '',
    delete_after_hours: 24, 
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadType, setUploadType] = useState('url'); // 'url' or 'file'
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState('');

  const [adminRole, setAdminRole] = useState('');
  const [sourceNames, setSourceNames] = useState([]);
  const [customSource, setCustomSource] = useState(false);


  useEffect(() => {
    Promise.all([
      fetchNewsItem(),
      fetchCategories(),
      fetchAdminInfo()
    ]).then(() => {
      setLoading(false);
    }).catch(err => {
      setError(err.message);
      setLoading(false);
    });
  }, [id]);

  // function to fetch admin info and source names
  const fetchAdminInfo = async () => {
    try {
      // Verify token and get admin role
      const tokenRes = await fetch("/api/verify-token", { method: "GET" });
      if (!tokenRes.ok) {
        throw new Error('Failed to verify authentication');
      }
      const tokenData = await tokenRes.json();
      const adminRole = tokenData.role;
      setAdminRole(adminRole);
      
      // Fetch source names based on admin role
      const sourcesRes = await fetch("/api/news-map/source-names", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!sourcesRes.ok) {
        throw new Error('Failed to fetch source names');
      }
      const sourcesData = await sourcesRes.json();
      setSourceNames(sourcesData.sourceNames);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchNewsItem = async () => {
    try {
      const res = await fetch(`/api/news-map/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch news item');
      }
      const newsItem = await res.json();
      
      // Set form data from API response
      setFormData({
        title: newsItem.title || '',
        image_url: newsItem.image_url || '',
        article_url: newsItem.article_url || '',
        source_name: newsItem.source_name || '',
        latitude: newsItem.latitude !== null ? String(newsItem.latitude) : '',
        longitude: newsItem.longitude !== null ? String(newsItem.longitude) : '',
        category_id: newsItem.category_id !== null ? String(newsItem.category_id) : '',
        delete_after_hours: newsItem.delete_after_hours !== null ? newsItem.delete_after_hours : '',
      });
      
      // Store original image URL for comparison later
      setOriginalImageUrl(newsItem.image_url || '');
      
      // Determine if the image is a URL or a file path
      setUploadType(newsItem.image_url && newsItem.image_url.startsWith('http') ? 'url' : 'file');
      
      // If it's a file, set the preview
      if (newsItem.image_url && !newsItem.image_url.startsWith('http')) {
        setFilePreview(`https://wowfy.in/testusr/uploads/${newsItem.image_url}`);
      }
      
    } catch (err) {
      throw err;
    }
  };

  const toggleCustomSource = () => {
    setCustomSource(!customSource);
    if (customSource) {
      // When switching back to dropdown, reset the source name
      if (sourceNames.length > 0) {
        setFormData(prev => ({ ...prev, source_name: sourceNames[0].name }));
      } else {
        setFormData(prev => ({ ...prev, source_name: '' }));
      }
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setError(null);
    
    try {
      let imageUrl = formData.image_url;
      let shouldDeleteOldImage = false;
      let oldImagePath = null;
      
      // If it's a file upload and there's a new file, upload to cPanel first
      if (uploadType === 'file' && file) {
        const uploadedFileName = await uploadImageToCPanel(file);
        imageUrl = `https://wowfy.in/testusr/images/${uploadedFileName}`;
        
        // If there was previously an uploaded image, we should delete it
        if (originalImageUrl && !originalImageUrl.startsWith('http')) {
          shouldDeleteOldImage = true;
          oldImagePath = originalImageUrl;
        }
      }
      
      // If we switched from file to URL, we should delete the old file
      if (uploadType === 'url' && originalImageUrl && !originalImageUrl.startsWith('http')) {
        shouldDeleteOldImage = true;
        oldImagePath = originalImageUrl;
      }
      
      const dataToSubmit = {
        ...formData,
        image_url: imageUrl,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        deleteOldImage: shouldDeleteOldImage,
        oldImagePath: oldImagePath
      };
      
      const res = await fetch(`/api/news-map/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSubmit),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update news');
      }
      
      // Redirect to the news listing page on success
      router.push('/news-map');
      
    } catch (err) {
      setError(err.message);
      setFormSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">  
        <div className="bg-white rounded-lg shadow-md p-6">  
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Title */}    
              {/* Image Upload Type Selection */}
              {/* Article URL */}

              {/* Source Name */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="source_name" className="block text-sm font-medium text-gray-700">
                    Source Name <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Only show toggle for superadmin and admin */}
                  {(adminRole === "superadmin" || adminRole === "admin") && (
                    <button 
                      type="button"
                      onClick={toggleCustomSource}
                      className="text-xs text-red-600 hover:text-red-800 underline"
                    >
                      {customSource ? "Select from list" : "Enter custom source"}
                    </button>
                  )}
                </div>
                
                {adminRole === "newsmap_admin" || !customSource ? (
                  <select
                    id="source_name"
                    name="source_name"
                    value={formData.source_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    disabled={adminRole === "newsmap_admin"}
                  >
                    <option value="" disabled>Select a source</option>
                    {sourceNames.map((source, index) => (
                      <option key={index} value={source.name}>
                        {source.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    id="source_name"
                    name="source_name"
                    value={formData.source_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter custom source name"
                  />
                )}
                {adminRole === "newsmap_admin" && (
                  <p className="mt-1 text-xs text-gray-500">
                    As a News Page admin, you can only post news under your company name.
                  </p>
                )}
              </div>
                            
              {/* Location */}
              
              {/* Category */}

              {/* Delete After Hours */}     
              {/* Submit Button */}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}