"use client"
import React, { useEffect, useState } from 'react';
import { Loader2, PlusCircle, X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import GlobalApi from '@/app/api/GlobalApi';
import toast from 'react-hot-toast';

const AddTopic = () => {

    const [initialData, setInitialData] = useState([])
    const [subjectsLoading, setSubjectsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const initialFormState = {
        subjectId: '',
        grade: '',
        topic: '',
        description: '',
        testDate: '',
    };

    const [formData, setFormData] = useState(initialFormState);


    const getLearnSubjects = async () => {
        setSubjectsLoading(true);
        try {
          const token =
            typeof window !== "undefined" ? localStorage.getItem("token") : null;
          if (!token) {
            setCategoryLoading(false);
            return;
          }
    
          const response = await GlobalApi.GetLearnSubjects(token);
          if (response.status === 200) {
            setInitialData(response.data.subjects);
            console.log(response.data.subjects);
            }
        } catch (err) {
          console.log(err);
        } finally {
            setSubjectsLoading(false);
        }
      };
    
      useEffect(() => {
        getLearnSubjects();
      }, []);
    

    // Extract unique grades from the data
    const grades = [...new Set(initialData.map(item => item.grade))].sort((a, b) => {

        // Custom sort to handle grade levels properly
        const gradeOrder = {
        'Pre-School': 1,
        'Nursery': 2,
        'LKG (Lower Kindergarten)': 3,
        'UKG (Upper Kindergarten)': 4
        };
    
        // Extract grade number for numerical grades
        const getGradeNumber = (grade) => {
        const match = grade.match(/Grade (\d+)/);
        return match ? parseInt(match[1]) + 4 : gradeOrder[grade] || 0;
        };
        
        return getGradeNumber(a) - getGradeNumber(b);
    });

    // Get available subjects for selected grade
    const getAvailableSubjects = (selectedGrade) => {
        const gradeSubjects = initialData.filter(item => item.grade === selectedGrade);
        return gradeSubjects.map(item => ({
        id: item.id.toString(),
        name: item.subject
        }));
    };

    const [availableSubjects, setAvailableSubjects] = useState([]);

    useEffect(() => {
        if (formData.grade) {
        const subjects = getAvailableSubjects(formData.grade);
        setAvailableSubjects(subjects);
        // Reset subject selection when grade changes
        setFormData(prev => ({ ...prev, subjectId: '' }));
        }
    }, [formData.grade]);


  const validateForm = () => {
    if (!formData.subjectId || !formData.grade || !formData.topic || !formData.description || !formData.testDate) {
      return "Please fill in all required fields";
    }
    if (formData.topic.length < 5) {
      return "Topic must be at least 5 characters long";
    }
    if (formData.description.length < 20) {
      return "Description must be at least 20 characters long";
    }
    return null;
  };

  const resetForm = () => {
    setFormData(initialFormState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    setIsSubmitting(true);
    try {
        const response = await GlobalApi.CreateLearnTopic(formData);
        if (response.status === 201) {
            toast.success("Quiz created successfully!");
            resetForm();
        }
      } catch (err) {
        console.error("Error:", err);
        // alert("");
// 
        if (err.response?.status === 400 && err.response?.data?.message) {
          const errorMsg = err.response.data.message;
          if (errorMsg.includes("already")) {
            toast.error("A topic already scheduled for this date. Please choose another date.")
          } else {
            console.error("Submission error:", errorMsg);
            toast.error("Failed to create quiz. Please try again.");
          }
        } else {
          toast.error(`Error: ${err.message}`);
        }
      } finally {
        setIsSubmitting(false);
      }
  };

  return (
    <div className="min-h-screen bg-orange-50 p-2 sm:p-4 md:p-6">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-4 sm:mb-8">Create Topic</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Grade Selection */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Grade</label>
            <select
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              value={formData.grade}
              onChange={e => setFormData(prev => ({ ...prev, grade: e.target.value }))}
            >
              <option value="">Select Grade</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
          
          {/* Subject Selection */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Subject</label>
            <select
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              value={formData.subjectId}
              onChange={e => setFormData(prev => ({ ...prev, subjectId: e.target.value }))}
              disabled={!formData.grade}
            >
              <option value="">
                {!formData.grade 
                  ? "Please select a grade first"
                  : availableSubjects.length === 0 
                    ? "No subjects available for this grade"
                    : "Select Subject"
                }
              </option>
              {availableSubjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Test Date */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Show Date</label>
          <input
            type="date"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            value={formData.testDate}
            onChange={e => setFormData(prev => ({ ...prev, testDate: e.target.value }))}
            min={format(new Date(), 'yyyy-MM-dd')}
            disabled={isSubmitting}
          />
        </div>

        {/* Topic and Description */}
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Topic</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              value={formData.topic}
              onChange={e => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              minLength={5}
              disabled={isSubmitting}
              placeholder="Enter topic (minimum 5 characters)"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Description</label>
            <textarea
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              minLength={20}
              disabled={isSubmitting}
              placeholder="Enter description (minimum 20 characters)"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Topic'}
        </button>
      </form>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/10 shadow-lg z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
            <p className="text-xl font-semibold">Creating Topic...</p>
            <p className="text-gray-500 mt-2">Please do not close the page</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTopic