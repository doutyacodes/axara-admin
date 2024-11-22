"use client"
import React, { useEffect, useState } from 'react';
import { Loader2, PlusCircle, X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import GlobalApi from '@/app/api/GlobalApi';
import toast from 'react-hot-toast';

const TopicQuizForm = () => {

    const [initialData, setInitialData] = useState([])
    const [subjectsLoading, setSubjectsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const initialFormState = {
        subjectId: '',
        grade: '',
        topic: '',
        description: '',
        testDate: '',
        questions: [
        {
            question: '',
            options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
            ]
        }
        ]
    };

    const [formData, setFormData] = useState(initialFormState);

    const gradeOptions = [
        "Pre-School",
        "Nursery",
        "LKG (Lower Kindergarten)",
        "UKG (Upper Kindergarten)",
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
        "Grade 5",
        "Grade 6",
        "Grade 7",
    ];

    // Mock subjects with IDs - replace with API data
    const subjects = [
        { id: "1", name: "Mathematics" },
        { id: "2", name: "Science" },
        { id: "3", name: "English" },
        { id: "4", name: "History" }
    ];


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
        id: item.subject_id.toString(),
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


  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ]
      }]
    }));
  };

  const removeQuestion = (questionIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, index) => index !== questionIndex)
    }));
  };

  const addOption = (questionIndex) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex].options.push({ text: '', isCorrect: false });
      return { ...prev, questions: newQuestions };
    });
  };

  const removeOption = (questionIndex, optionIndex) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex].options = newQuestions[questionIndex].options
        .filter((_, index) => index !== optionIndex);
      return { ...prev, questions: newQuestions };
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      if (field === 'isCorrect') {
        newQuestions[questionIndex].options.forEach(opt => opt.isCorrect = false);
      }
      newQuestions[questionIndex].options[optionIndex][field] = value;
      return { ...prev, questions: newQuestions };
    });
  };

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
    if (formData.questions.length < 5) {
      return "Please add at least 5 questions";
    }
    for (const question of formData.questions) {
      if (!question.question || question.options.length < 4) {
        return "Each question must have at least 4 options";
      }
      if (!question.options.some(opt => opt.isCorrect)) {
        return "Each question must have one correct answer";
      }
      if (question.options.some(opt => !opt.text)) {
        return "All options must have text";
      }
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
        const response = await GlobalApi.CreateLearnQuiz(formData);
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
            // setError("username", {
            //   type: "manual",
            //   message: "A test is already scheduled for this date. Please choose another date.",
            // });
            toast.error("A test is already scheduled for this date. Please choose another date.")
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
    <div className="min-h-screen bg-orange-50 p-6">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-orange-500 mb-8">Create Topic and Quiz</h1>
        
        {/* Subject and Grade Selection */}
        {/* <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Subject</label>
            <select
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              value={formData.subjectId}
              onChange={e => setFormData(prev => ({ ...prev, subjectId: e.target.value }))}
              disabled={isSubmitting}
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Grade</label>
            <select
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              value={formData.grade}
              onChange={e => setFormData(prev => ({ ...prev, grade: e.target.value }))}
              disabled={isSubmitting}
            >
              <option value="">Select Grade</option>
              {gradeOptions.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
        </div> */}

<div className="grid grid-cols-2 gap-6">
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

        {/* Topic and Description */}
        <div className="space-y-4">
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

        {/* Test Date */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Test Date</label>
          <input
            type="date"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            value={formData.testDate}
            onChange={e => setFormData(prev => ({ ...prev, testDate: e.target.value }))}
            min={format(new Date(), 'yyyy-MM-dd')}
            disabled={isSubmitting}
          />
        </div>

        {/* Questions Section */}
        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-gray-700">Questions</h2>
          
          {formData.questions.map((question, qIndex) => (
            <div key={qIndex} className="p-6 bg-white rounded-lg shadow-sm space-y-4 relative">
              {formData.questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  disabled={isSubmitting}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Question {qIndex + 1}
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  value={question.question}
                  onChange={e => {
                    const newQuestions = [...formData.questions];
                    newQuestions[qIndex].question = e.target.value;
                    setFormData(prev => ({ ...prev, questions: newQuestions }));
                  }}
                  disabled={isSubmitting}
                  placeholder="Enter your question"
                />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="block text-gray-700 font-medium">Options</label>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-4">
                    <input
                      type="text"
                      className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      value={option.text}
                      onChange={e => handleOptionChange(qIndex, oIndex, 'text', e.target.value)}
                      disabled={isSubmitting}
                      placeholder={`Option ${oIndex + 1}`}
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={option.isCorrect}
                        onChange={e => handleOptionChange(qIndex, oIndex, 'isCorrect', e.target.checked)}
                        disabled={isSubmitting}
                      />
                      Correct
                    </label>
                    {question.options.length > 4 && (
                      <button
                        type="button"
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="text-red-500 hover:text-red-700"
                        disabled={isSubmitting}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => addOption(qIndex)}
                  className="text-orange-500 flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Option
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="w-full p-3 border-2 border-dashed border-orange-300 rounded-lg text-orange-500 hover:bg-orange-50 flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            <PlusCircle className="w-5 h-5" />
            Add Question
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </form>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/10 shadow-lg z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
            <p className="text-xl font-semibold">Creating Topic and Quiz...</p>
            <p className="text-gray-500 mt-2">Please do not close the page</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicQuizForm;