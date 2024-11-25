"use client"
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Edit2, Plus, Check, ArrowLeft } from 'lucide-react';

function QuizSection({questions, setQuestions, errors, setErrors, setCurrentSection, handleSubmit}) {

    const [currentQuestion, setCurrentQuestion] = useState({
        question: '',
        options: ['', '', '', ''],
        correctOption: null
      });

    const addQuestion = () => {
        if (!currentQuestion.question.trim() || 
            currentQuestion.options.some(opt => !opt.trim()) || 
            currentQuestion.correctOption === null) {
            toast.error('Please complete the current question first');
            return;
        }
        
        setQuestions(prev => [...prev, { ...currentQuestion }]);
        setCurrentQuestion({
            question: '',
            options: ['', '', '', ''],
            correctOption: null
        });
    };
    
    const editQuestion = (index) => {
        setCurrentQuestion(questions[index]);
        setQuestions(prev => prev.filter((_, i) => i !== index));
    };
    
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
        <button
            type="button"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
            onClick={() => setCurrentSection('details')}
        >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Details
        </button>
        <h2 className="text-xl font-semibold text-gray-800">Quiz Questions</h2>
        </div>

        <div className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-700">Question</label>
            <input
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            value={currentQuestion.question}
            onChange={e => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
            />
        </div>

        <div className="space-y-2">
            {currentQuestion.options.map((option, idx) => (
            <div key={idx} className="flex items-center space-x-2">
                <input
                type="text"
                className="flex-1 rounded-md border border-gray-300 p-2"
                value={option}
                placeholder={`Option ${idx + 1}`}
                onChange={e => {
                    const newOptions = [...currentQuestion.options];
                    newOptions[idx] = e.target.value;
                    setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
                }}
                />
                <button
                type="button"
                className={`p-2 rounded-md ${currentQuestion.correctOption === idx ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setCurrentQuestion(prev => ({ ...prev, correctOption: idx }))}
                >
                <Check className="h-5 w-5" />
                </button>
            </div>
            ))}
        </div>

        <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
            onClick={addQuestion}
        >
            <Plus className="h-5 w-5 mr-2" />
            Add Question
        </button>
        </div>

        {/* Added Questions List */}
        <div className="mt-6 space-y-4">
        {questions.map((q, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg shadow">
            <div className="flex justify-between items-start">
                <h3 className="font-medium">Question {idx + 1}: {q.question}</h3>
                <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => editQuestion(idx)}
                >
                <Edit2 className="h-5 w-5" />
                </button>
            </div>
            <div className="mt-2 space-y-1">
                {q.options.map((opt, optIdx) => (
                <div key={optIdx} className={`pl-4 ${optIdx === q.correctOption ? 'text-green-600 font-medium' : ''}`}>
                    {optIdx + 1}. {opt} {optIdx === q.correctOption && '✓'}
                </div>
                ))}
            </div>
            </div>
        ))}
        </div>

        <div className="flex justify-end mt-6">
        <button
            type="button"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            onClick={handleSubmit}
        >
            Create Quiz Challenge
        </button>
        </div>
    </div>
  )
}

export default QuizSection