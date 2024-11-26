"use client"
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Upload, Edit2, Plus, Check, ArrowLeft, ArrowRight } from 'lucide-react';

const DetailsSection = ({ formData, setFormData, errors, setErrors, setCurrentSection, imagePreview, setImagePreview, handleSubmit }) => { 

    

    const validateDetailsSection = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.show_date) newErrors.show_date = 'Show date is required';
        if (!formData.challenge_type) newErrors.challenge_type = 'Challenge type is required';
        if (!formData.image) newErrors.image = 'Image is required';
        if (!formData.age) newErrors.age = 'Age is required';
        if (formData.entry_type === 'fee' && !formData.entry_fee) {
          newErrors.entry_fee = 'Entry fee is required';
        }
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };
    
      const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast.error('Image size should be less than 2MB');
            return;
          }
          
          // setFormData(prev => ({ ...prev, image: file }));
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result);
            setFormData(prev => ({ ...prev, image: reader.result }))
          };
          reader.readAsDataURL(file);
        }
      };
    
      const handleNext = () => {
        if (validateDetailsSection()) {
          if (formData.challenge_type === 'upload') {
            handleSubmit();
          } else {
            setCurrentSection('quiz');
          }
        } else {
          toast.error('Please fill in all required fields');
        }
      };
  
  
  return (
    <div className="space-y-6">
    {/* Image Upload */}
    {/* <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Challenge Image*</label>
      <div className={`border-2 border-dashed rounded-lg hover:border-orange-500 transition-colors ${
        errors.image ? 'border-red-500' : 'border-gray-300'
      }`}>
        <input
          type="file"
          id="image"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleImageChange}
          className="hidden"
        />
        <label 
          htmlFor="image" 
          className="flex flex-col items-center justify-center cursor-pointer w-full"
        >
          {imagePreview ? (
            <div className="w-full">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <p className="text-sm text-gray-600 text-center py-2">Click to change image</p>
            </div>
          ) : (
            <div className="space-y-2 text-center py-12">
              <Upload className="w-12 h-12 mx-auto text-gray-400" />
              <p className="text-gray-600">Click to upload image</p>
              <p className="text-sm text-gray-400">PNG, JPG up to 2MB</p>
            </div>
          )}
        </label>
      </div>
      {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
    </div> */}

    <label className="block text-sm font-medium text-gray-700">Challenge Image*</label>
      <div
        className={`border-2 border-dashed rounded-lg hover:border-orange-500 transition-colors ${
          errors?.image ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <input
          type="file"
          id="image"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleImageChange}
          className="hidden"
        />
        <label htmlFor="image" className="flex flex-col items-center justify-center cursor-pointer w-full">
          {imagePreview ? (
            <div className="w-full">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <p className="text-sm text-gray-600 text-center py-2">Click to change image</p>
            </div>
          ) : (
            <div className="space-y-2 text-center py-12">
              <Upload className="w-12 h-12 mx-auto text-gray-400" />
              <p className="text-gray-600">Click to upload image</p>
              <p className="text-sm text-gray-400">PNG, JPG up to 2MB</p>
            </div>
          )}
        </label>
      </div>
      {errors?.image && <p className="text-sm text-red-500">{errors.image}</p>}

    <div>
      <label className="block text-sm font-medium text-gray-700">Title</label>
      <input
        type="text"
        className={`mt-1 block w-full rounded-md border ${errors.title ? 'border-red-500' : 'border-gray-300'} p-2`}
        value={formData.title}
        // onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        onChange={(e) => {
          setFormData({...formData, title: e.target.value});
          if (e.target.value.trim()) {
            const newErrors = { ...errors };
            delete newErrors.title;
            setErrors(newErrors);
          }
        }} 
      />
      {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700">Description</label>
      <textarea
        className={`mt-1 block w-full rounded-md border ${errors.description ? 'border-red-500' : 'border-gray-300'} p-2`}
        rows="4"
        value={formData.description}
        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
      />
      {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Show Date</label>
        <div className="relative">
          <Calendar className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="date"
            className={`mt-1 block w-full rounded-md border ${errors.show_date ? 'border-red-500' : 'border-gray-300'} p-2 pl-10`}
            value={formData.show_date}
            onChange={e => setFormData(prev => ({ ...prev, show_date: e.target.value }))}
          />
        </div>
        {errors.show_date && <p className="text-red-500 text-sm mt-1">{errors.show_date}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Age Requirement</label>
        <input
          type="number"
          className={`mt-1 block w-full rounded-md border ${errors.age ? 'border-red-500' : 'border-gray-300'} p-2`}
          value={formData.age}
          onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))}
        />
        {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Challenge Type</label>
        <select
          className={`mt-1 block w-full rounded-md border ${errors.challenge_type ? 'border-red-500' : 'border-gray-300'} p-2`}
          value={formData.challenge_type}
          onChange={e => setFormData(prev => ({ ...prev, challenge_type: e.target.value }))}
        >
          <option value="">Select Type</option>
          <option value="upload">Upload</option>
          <option value="quiz">Quiz</option>
        </select>
        {errors.challenge_type && <p className="text-red-500 text-sm mt-1">{errors.challenge_type}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Entry Type</label>
        <select
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          value={formData.entry_type}
          onChange={e => setFormData(prev => ({ ...prev, entry_type: e.target.value }))}
        >
          <option value="nill">None</option>
          <option value="points">Points</option>
          <option value="fee">Fee</option>
        </select>
      </div>
    </div>

    {(formData.entry_type === 'fee' || formData.entry_type === 'points') && (
      <div>
        <label className="block text-sm font-medium text-gray-700">Entry Fee</label>
        <input
          type="number"
          className={`mt-1 block w-full rounded-md border ${errors.entry_fee ? 'border-red-500' : 'border-gray-300'} p-2`}
          value={formData.entry_fee}
          onChange={e => setFormData(prev => ({ ...prev, entry_fee: e.target.value }))}
        />
        {errors.entry_fee && <p className="text-red-500 text-sm mt-1">{errors.entry_fee}</p>}
      </div>
    )}

    <div className="flex justify-end">
      <button
        type="button"
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        onClick={handleNext}
      >
        {formData.challenge_type === 'quiz' ? (
          <>Next <ArrowRight className="ml-2 h-5 w-5" /></>
        ) : (
          'Create Challenge'
        )}
      </button>
    </div>
  </div>
  )
}

export default DetailsSection