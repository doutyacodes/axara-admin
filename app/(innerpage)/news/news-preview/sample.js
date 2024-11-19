"use client"
import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, Loader2, RotateCcw, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import GlobalApi from '@/app/api/GlobalApi';
import toast, { Toaster } from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ageOptions = Array.from({ length: 10 }, (_, i) => i + 3);

function AddNews() {
  const [selectedAge, setSelectedAge] = useState(3);
  const [categories, setCategories] = useState([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [base64Image, setBase64Image] = useState(data?.image || null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [formStates, setFormStates] = useState({});

  

  const handleRevertToResult = (field) => {
    const resultData = data.results.find(r => r.age === selectedAge);
    if (resultData) {
      if (field === 'questions') {
        updateFormState(selectedAge, field, 
          resultData.questions.map((q, idx) => ({
            id: idx + 1,
            question: q
          }))
        );
      } else if (field === 'wordDefinitions') {
        updateFormState(selectedAge, field,
          resultData.wordDefinitions.map((wd, idx) => ({
            id: idx + 1,
            word: wd.word,
            definition: wd.definition
          }))
        );
      } else if (resultData[field]) {
        updateFormState(selectedAge, field, resultData[field]);
      }
    }
  };
  
  const handleRevertToOriginal = (field) => {
    if (data.originalData[field]) {
      if (field === 'wordDefinitions') {
        updateFormState(selectedAge, field,
          data.originalData.wordDefinitions.map((wd, idx) => ({
            id: idx + 1,
            word: wd.word,
            definition: wd.definition
          }))
        );
      } else {
        updateFormState(selectedAge, field, data.originalData[field]);
      }
    }
  };

  // Initialize form states for each age
  useEffect(() => {
    if (data) {
      const initialStates = {};
      ageOptions.forEach(age => {
        const resultData = data.results.find(r => r.age === age) || {};
        initialStates[age] = {
          category: data.originalData.categoryId,
          title: resultData.title || '',
          summary: resultData.summary || '',
          description: resultData.description || '',
          showInHome: data.originalData.showInHome,
          questions: resultData.questions?.map((q, idx) => ({ 
            id: idx + 1, 
            question: q 
          })) || [{ id: 1, question: '' }],
          wordDefinitions: resultData.wordDefinitions?.map((wd, idx) => ({
            id: idx + 1,
            word: wd.word,
            definition: wd.definition
          })) || [{ id: 1, word: '', definition: '' }]
        };
      });
      setFormStates(initialStates);
    }
  }, [data]);

  const getNewsCategories = async () => {
    setCategoryLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setCategoryLoading(false);
        return;
      }
      const response = await GlobalApi.GetNewsCategories(token);
      if (response.status === 200) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setCategoryLoading(false);
    }
  };

  useEffect(() => {
    getNewsCategories();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result);
      };
      reader.readAsDataURL(file);
    }
    setShowImageDialog(false);
  };

  const updateFormState = (age, field, value) => {
    setFormStates(prev => ({
      ...prev,
      [age]: {
        ...prev[age],
        [field]: value
      }
    }));
  };

  // const handleRevertToOriginal = (field) => {
  //   updateFormState(selectedAge, field, data.originalData[field]);
  // };

  // const handleRevertToResult = (field) => {
  //   const resultData = data.results.find(r => r.age === selectedAge);
  //   if (resultData && resultData[field]) {
  //     updateFormState(selectedAge, field, resultData[field]);
  //   }
  // };

  const validateForm = () => {
    const newErrors = {};
    ageOptions.forEach(age => {
      const state = formStates[age];
      if (!state?.title?.trim()) newErrors[`title-${age}`] = `Title required for age ${age}`;
      if (!state?.summary?.trim()) newErrors[`summary-${age}`] = `Summary required for age ${age}`;
      if (!state?.description?.trim()) newErrors[`description-${age}`] = `Description required for age ${age}`;
      if (!state?.questions?.some(q => q.question.trim())) {
        newErrors[`questions-${age}`] = `At least one question required for age ${age}`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill in all required fields for all age groups');
      return;
    }
    setIsSubmitting(true);
    try {
      // Submit logic here
      toast.success('News Updated Successfully');
    } catch (error) {
      toast.error('Failed to update article');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster />
      
      {/* Image Section */}
      <div className="mb-8 relative">
        <img 
          src={base64Image} 
          alt="Article" 
          className="w-full h-64 object-cover rounded-lg cursor-pointer"
          onClick={() => setShowImageDialog(true)}
        />
        <Button
          className="absolute bottom-4 right-4"
          onClick={() => setShowImageDialog(true)}
        >
          Change Image
        </Button>
      </div>

      {/* Age Selector */}
      <div className="mb-6">
        <Label>Select Age Group</Label>
        <Select
          value={selectedAge.toString()}
          onValueChange={(value) => setSelectedAge(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ageOptions.map(age => (
              <SelectItem key={age} value={age.toString()}>
                Age {age}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Form */}
      <Card className="border-none shadow-lg">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Select */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formStates[selectedAge]?.category}
                onValueChange={(value) => updateFormState(selectedAge, 'category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Title</Label>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevertToOriginal('title')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Original
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevertToResult('title')}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Result
                  </Button>
                </div>
              </div>
              <Input
                value={formStates[selectedAge]?.title || ''}
                onChange={(e) => updateFormState(selectedAge, 'title', e.target.value)}
                className={errors[`title-${selectedAge}`] ? 'border-red-500' : ''}
              />
              {errors[`title-${selectedAge}`] && (
                <p className="text-red-500 text-sm">{errors[`title-${selectedAge}`]}</p>
              )}
            </div>

            {/* Similar sections for Summary, Description, Questions, and Word Definitions */}
            {/* ... (implement similar pattern for other fields) */}

            {/* Summary Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Summary</Label>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevertToOriginal('summary')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Original
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevertToResult('summary')}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Result
                  </Button>
                </div>
              </div>
              <textarea
                value={formStates[selectedAge]?.summary || ''}
                onChange={(e) => updateFormState(selectedAge, 'summary', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 min-h-[100px] ${
                  errors[`summary-${selectedAge}`] ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Enter summary"
              />
              {errors[`summary-${selectedAge}`] && (
                <p className="text-red-500 text-sm">{errors[`summary-${selectedAge}`]}</p>
              )}
            </div>

            {/* Description Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Description</Label>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevertToOriginal('description')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Original
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevertToResult('description')}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Result
                  </Button>
                </div>
              </div>
              <textarea
                value={formStates[selectedAge]?.description || ''}
                onChange={(e) => updateFormState(selectedAge, 'description', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 min-h-[200px] ${
                  errors[`description-${selectedAge}`] ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Enter description"
              />
              {errors[`description-${selectedAge}`] && (
                <p className="text-red-500 text-sm">{errors[`description-${selectedAge}`]}</p>
              )}
            </div>

            {/* Word Definitions Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Word Definitions</h3>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevertToResult('wordDefinitions')}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Load Result Definitions
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      const currentDefs = formStates[selectedAge]?.wordDefinitions || [];
                      updateFormState(selectedAge, 'wordDefinitions', [
                        ...currentDefs,
                        { id: Date.now(), word: '', definition: '' }
                      ]);
                    }}
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Definition
                  </Button>
                </div>
              </div>

              {formStates[selectedAge]?.wordDefinitions?.map((def, index) => (
                <Card key={def.id} className="p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Definition {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        const newDefs = formStates[selectedAge].wordDefinitions.filter(d => d.id !== def.id);
                        updateFormState(selectedAge, 'wordDefinitions', newDefs);
                      }}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Word</Label>
                      <Input
                        value={def.word}
                        onChange={(e) => {
                          const newDefs = formStates[selectedAge].wordDefinitions.map(d =>
                            d.id === def.id ? { ...d, word: e.target.value } : d
                          );
                          updateFormState(selectedAge, 'wordDefinitions', newDefs);
                        }}
                        className="mt-1"
                        placeholder="Enter word"
                      />
                    </div>

                    <div>
                      <Label>Definition</Label>
                      <textarea
                        value={def.definition}
                        onChange={(e) => {
                          const newDefs = formStates[selectedAge].wordDefinitions.map(d =>
                            d.id === def.id ? { ...d, definition: e.target.value } : d
                          );
                          updateFormState(selectedAge, 'wordDefinitions', newDefs);
                        }}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 min-h-[100px] mt-1"
                        placeholder="Enter definition"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Questions Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Questions</h3>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevertToResult('questions')}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Load Result Questions
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      const currentQuestions = formStates[selectedAge]?.questions || [];
                      updateFormState(selectedAge, 'questions', [
                        ...currentQuestions,
                        { id: Date.now(), question: '' }
                      ]);
                    }}
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </div>

              {formStates[selectedAge]?.questions?.map((q, index) => (
                <Card key={q.id} className={`p-4 border ${
                  errors[`questions-${selectedAge}`] ? 'border-red-500' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        const newQuestions = formStates[selectedAge].questions.filter(question => question.id !== q.id);
                        updateFormState(selectedAge, 'questions', newQuestions);
                      }}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <Input
                    value={q.question}
                    onChange={(e) => {
                      const newQuestions = formStates[selectedAge].questions.map(question =>
                        question.id === q.id ? { ...question, question: e.target.value } : question
                      );
                      updateFormState(selectedAge, 'questions', newQuestions);
                    }}
                    placeholder="Enter your question"
                    className="w-full"
                  />
                </Card>
              ))}
              {errors[`questions-${selectedAge}`] && (
                <p className="text-red-500 text-sm">{errors[`questions-${selectedAge}`]}</p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Article'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Image Change Dialog */}
      <AlertDialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Article Image</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to change the article image?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <label>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                Change Image
              </label>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default AddNews;