'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Loader2, AlertCircle, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function CreateNewsPage() {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadType, setUploadType] = useState('url'); // 'url' or 'file'
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // New state variables for admin role and source names
  const [adminRole, setAdminRole] = useState('');
  const [sourceNames, setSourceNames] = useState([]);
  const [customSource, setCustomSource] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchAdminInfo();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/news-map/categories');
      if (!res.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await res.json();
      setCategories(data.categories);
    } catch (err) {
      setError(err.message);
    }
  };

   // Function to fetch admin info and source names
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
      const sourcesRes = await fetch("/api/news-map/source-names",{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!sourcesRes.ok) {
        throw new Error('Failed to fetch source names');
      }
      const sourcesData = await sourcesRes.json();
      setSourceNames(sourcesData.sourceNames);
      
      // If newsmap_admin, set the source name automatically
      if (adminRole === "newsmap_admin" && sourcesData.currentAdminName) {
        setFormData(prev => ({ ...prev, source_name: sourcesData.currentAdminName }));
      }
    } catch (err) {
      setError(err.message);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setFilePreview(previewUrl);
    }
  };

  const uploadImageToCPanel = async (file) => {
    const formData = new FormData();
    formData.append('coverImage', file);
    
    try {
      setUploading(true);
      const response = await fetch('https://wowfy.in/testusr/upload.php', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data.filePath; // This should be the filename returned from PHP
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setError(null);
    
    try {
      let imageUrl = formData.image_url;

      // If it's a file upload, upload to cPanel first
      if (uploadType === 'file' && file) {
        const uploadedFileName = await uploadImageToCPanel(file);
        imageUrl = `https://wowfy.in/testusr/images/${uploadedFileName}`;
      }
      
      const dataToSubmit = {
        ...formData,
        image_url: imageUrl,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
      };
      
      const res = await fetch('/api/news-map', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create news');
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
        <div className="mb-8">
          <Link 
            href="/news-map" 
            className="flex items-center text-red-800 hover:text-red-700 transition mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to News List
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Create News Article</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter news title"
                />
              </div>
              
              {/* Image Upload Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4 mb-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="uploadType"
                      value="url"
                      checked={uploadType === 'url'}
                      onChange={() => setUploadType('url')}
                      className="h-4 w-4 text-red-800 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Image URL</span>
                  </label>
                  
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="uploadType"
                      value="file"
                      checked={uploadType === 'file'}
                      onChange={() => setUploadType('file')}
                      className="h-4 w-4 text-red-800 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Upload File</span>
                  </label>
                </div>
                
                {uploadType === 'url' ? (
                  <input
                    type="url"
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    required={uploadType === 'url'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter image URL"
                  />
                ) : (
                  <div>
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="file-upload" className="w-full flex flex-col items-center px-4 py-6 bg-white text-gray-500 rounded-lg shadow-lg tracking-wide border border-dashed border-gray-400 cursor-pointer hover:bg-gray-50">
                        {filePreview ? (
                          <div className="relative w-full h-48">
                            <img 
                              src={filePreview} 
                              alt="Preview" 
                              className="h-full mx-auto object-contain"
                            />
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-red-800" />
                            <span className="mt-2 text-base">Select an image file</span>
                          </>
                        )}
                        <input 
                          id="file-upload" 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileChange}
                          required={uploadType === 'file'} 
                        />
                      </label>
                    </div>
                    {file && (
                      <p className="mt-2 text-sm text-gray-500">
                        Selected: {file.name} ({Math.round(file.size / 1024)} KB)
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Article URL */}
              <div>
                <label htmlFor="article_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Article URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  id="article_url"
                  name="article_url"
                  value={formData.article_url}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter article URL"
                />
              </div>
              
              {/* Source Name */}
              {/* <div>
                <label htmlFor="source_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Source Name
                </label>
                <input
                  type="text"
                  id="source_name"
                  name="source_name"
                  value={formData.source_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="E.g., The Hindu, Times Express"
                />
              </div> */}

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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <MapPin className="h-4 w-4 inline text-red-800 ml-1" />
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="latitude" className="block text-xs text-gray-500 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      id="latitude"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      placeholder="E.g., 28.6139"
                    />
                  </div>
                  <div>
                    <label htmlFor="longitude" className="block text-xs text-gray-500 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      id="longitude"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      placeholder="E.g., 77.2090"
                    />
                  </div>
                </div>
              </div>
              
              {/* Category */}
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delete After Hours */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delete After Hours <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-6">
                  <div className="flex items-center">
                    <input
                      id="delete-24"
                      name="delete_after_hours"
                      type="radio"
                      value="24"
                      checked={formData.delete_after_hours === 24}
                      onChange={(e) => setFormData({...formData, delete_after_hours: parseInt(e.target.value)})}
                      className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <label htmlFor="delete-24" className="ml-2 block text-sm text-gray-700">
                      24 hours
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="delete-36"
                      name="delete_after_hours"
                      type="radio"
                      value="36"
                      checked={formData.delete_after_hours === 36}
                      onChange={(e) => setFormData({...formData, delete_after_hours: parseInt(e.target.value)})}
                      className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <label htmlFor="delete-36" className="ml-2 block text-sm text-gray-700">
                      36 hours
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="delete-48"
                      name="delete_after_hours"
                      type="radio"
                      value="48"
                      checked={formData.delete_after_hours === 48}
                      onChange={(e) => setFormData({...formData, delete_after_hours: parseInt(e.target.value)})}
                      className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <label htmlFor="delete-48" className="ml-2 block text-sm text-gray-700">
                      48 hours
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={formSubmitting || uploading}
                  className="px-6 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {(formSubmitting || uploading) ? (
                    <span className="flex items-center">
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      {uploading ? 'Uploading...' : 'Creating...'}
                    </span>
                  ) : (
                    'Create News'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}