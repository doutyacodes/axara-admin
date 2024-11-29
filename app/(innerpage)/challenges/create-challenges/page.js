"use client"
import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { Calendar, Upload, Edit2, Plus, Check, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import DetailsSection from '../_components/DetailsSection/DetailsSection';
import QuizSection from '../_components/QuizSection/QuizSection';


const ChallengeCreationForm = () => {
  const [currentSection, setCurrentSection] = useState('details');
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    show_date: '',
    challenge_type: '',
    image: null,
    entry_type: 'nill',
    entry_fee: '',
    age: '',
    latitude: '',
    longitude: '',
    reach_distance: '',
    steps: '',
    direction: '',
  });
  console.log(formData)

  const [questions, setQuestions] = useState([]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateQuiz = () => {
    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return false;
    }
    
    for (const q of questions) {
      if (!q.question.trim() || q.options.some(opt => !opt.trim()) || q.correctOption === null) {
        toast.error('All questions must be complete with all options and correct answer marked');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async() => {
    if (formData.challenge_type === 'quiz' && !validateQuiz()) {
      return;
    }
    setIsSubmitting(true);
    // Here you would make your API call
    const payload = {
      ...formData,
      questions: formData.challenge_type === 'quiz' ? questions : undefined
    };
    console.log('Submission payload:', payload);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      const response = await fetch("/api/createChallenges", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Add token to headers if needed
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Parse response body for detailed error
        if (response.status === 400 && errorData.duplicateAges && errorData.duplicateWords) {
          const duplicateAges = errorData.duplicateAges.join(', ');
          const duplicateWords = errorData.duplicateWords.join(', ');
          const errorMessage = `Word Definitions are already present for the given ages and Words Ages: ${duplicateAges}, Words: ${duplicateWords}. Please Remove them and try submitting again`;
          setErrors({
            ...errors,
            submit: errorMessage
          });
          toast.error(errorMessage);
          return;
        }
        // Handle other error cases
        toast.error(data.message || 'Failed to create challenge Please try again.');
        return;
      }
      // Reset form on success
      setFormData({
        title: '',
        description: '',
        show_date: '',
        challenge_type: '',
        image: null,
        entry_type: 'nill',
        entry_fee: '',
        age: ''
      });
      setImagePreview(null)
      // Success case
      toast.success('Challenge created successfully!');
      console.log('Submission payload:', payload);
    } catch (error) {
      console.error(error);
      toast.error('Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      <Toaster />
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/10 shadow-lg z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
            <p className="text-xl font-semibold">Creating the challenge...</p>
            <p className="text-gray-500 mt-2">Please do not close the page</p>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">Challenges Admin Panel</h1>
          <p className="text-gray-600">Manage your challenges</p>
        </header>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Challenge</h1>
        
        <div className="mt-6">
          {currentSection === 'details' ? 
          <DetailsSection 
          formData={formData} 
          setFormData={setFormData} 
          errors = {errors} 
          setErrors = {setErrors}
          setCurrentSection={setCurrentSection}
          handleSubmit = {handleSubmit}
          imagePreview = {imagePreview}
          setImagePreview = {setImagePreview}
          /> 
          : 
          <QuizSection 
            questions={questions} 
            setQuestions={setQuestions} 
            errors = {errors} 
            setErrors = {setErrors}
            setCurrentSection={setCurrentSection}
            handleSubmit = {handleSubmit}
          />
          }
        </div>
      </div>
    </>

  );
};

export default ChallengeCreationForm;