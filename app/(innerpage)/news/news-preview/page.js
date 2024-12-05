"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Upload, Loader2, FileText, Zap, Check } from 'lucide-react';
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
import { useData } from '@/context/DataContext';
import { useRouter } from 'next/navigation';
import { datas } from './data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const ageOptions = Array.from({ length: 10 }, (_, i) => i + 3);

function AddNews() {
  const [selectedAge, setSelectedAge] = useState(3);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [formStates, setFormStates] = useState({});
  const { data } = useData();
  // const data = datas
  const [base64Image, setBase64Image] = useState(data?.image || null);
  const [imageData, setImageData] = useState(null);
  const [fileName, setFileName] = useState(null)
  const isFirstRender = useRef(true);

  const router = useRouter();

  console.log("data", data)
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


  useEffect(() => {
    if (data) {
      const initialStates = {};
      const categoryId = data.originalData.categoryIds;      
  
      ageOptions.forEach(age => {
        const resultData = data.results.find(r => r.age === age) || {};
        initialStates[age] = {
          category: categoryId, // Ensure category is set consistently
          age: age,
          title: resultData.title || '',
          // summary: resultData.summary || '',
          description: resultData.description || '',
          showOnTop: data.originalData.showOnTop,
          main_news: data.originalData.main_news,
          questions: resultData.questions?.map((q, idx) => ({ 
            id: idx + 1, 
            question: q 
          })) || [{ id: 1, question: '' }],
          wordDefinitions: resultData.wordDefinitions?.map((wd, idx) => ({
            id: idx + 1,
            word: wd.word,
            definition: wd.definition
          })) || [{ id: 1, word: '', definition: '' }],
        };
      });
      setFormStates(initialStates);
      setImageData(data.image);
  
    }
  }, [data]);
  console.log("formStates:", formStates);

  useEffect(()=>{
    const category = formStates[selectedAge]?.category
    const title = formStates[selectedAge]?.title
    if(category && title){
      const fileName = `${Date.now()}-${category}-${title.replace(/\s+/g, '-')}.png`;
      setFileName(fileName)
    }
  },[formStates])

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
        const fetchedCategories = response.data.categories;
        setCategories(fetchedCategories);

        // Match categoryId with categories
        // const defaultCategoryId = data?.originalData?.categoryId;
        // console.log("defaultCategory Test");
        // if (defaultCategoryId) {
        //   console.log("defaultCategory Test 2");

        //   const defaultCategory = fetchedCategories.find(cat => cat.id.toString() === defaultCategoryId.toString());
        //   console.log("defaultCategory", defaultCategory);
          
        //   if (defaultCategory) {
        //     // Update all ages with the same category
        //     ageOptions.forEach(age => {
        //       updateFormState(age, 'category', defaultCategory.id.toString());
        //     });
        //   }
        // }
        
      }
    } catch (err) {
      console.log(err);
    } finally {
      setCategoryLoading(false);
    }
  };

  console.log("categories", categories)

  useEffect(() => {
    // if(selectedAge){
      getNewsCategories();
    // }
  }, [data]);

  const handleImageChange = (event) => {    
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result); // Save base64 encoded image
        setImageData(reader.result); // Update form state
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

  const validateForm = () => {
    const newErrors = {};
    ageOptions.forEach(age => {
      const state = formStates[age];
      if (!state?.title?.trim()) newErrors[`title-${age}`] = `Title required for age ${age}`;
      // if (!state?.summary?.trim()) newErrors[`summary-${age}`] = `Summary required for age ${age}`;
      if (!state?.description?.trim()) newErrors[`description-${age}`] = `Description required for age ${age}`;
      if (!state?.questions?.some(q => q.question.trim())) {
        newErrors[`questions-${age}`] = `At least one question required for age ${age}`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleCategoryToggle = (age, categoryId) => {
  //   setFormStates(prev => {
  //     const currentCategories = prev[age]?.category || [];
  //     const isSelected = currentCategories.includes(categoryId);
      
  //     // If already selected, remove. If not, add.
  //     const updatedCategories = isSelected 
  //       ? currentCategories.filter(id => id !== categoryId)
  //       : [...currentCategories, categoryId];
      
  //     return {
  //       ...prev,
  //       [age]: {
  //         ...prev[age],
  //         category: updatedCategories
  //       }
  //     };
  //   });
  // };

  const handleCategoryToggle = (categoryId) => {
    setFormStates(prev => {
      const updatedFormStates = {};
      
      ageOptions.forEach(age => {
        const currentCategories = prev[age]?.category || [];
        const isSelected = currentCategories.includes(categoryId);
        
        // If already selected, remove. If not, add.
        const updatedCategories = isSelected 
          ? currentCategories.filter(id => id !== categoryId)
          : [...currentCategories, categoryId];
        
        updatedFormStates[age] = {
          ...prev[age],
          category: updatedCategories
        };
      });
      
      return {
        ...prev,
        ...updatedFormStates
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill in all required fields for all age groups');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        result: formStates,
        imageData,
        fileName,
      };
      
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      const response = await fetch("/api/saveNewsArticle", {
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
        toast.error(data.message || 'Failed to submit article. Please try again.');
        return;
      }
      // Success case
      toast.success('News Added Successfully');
      router.push('/news');
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
            <p className="text-xl font-semibold">Submitting your article...</p>
            <p className="text-gray-500 mt-2">Please do not close the page</p>
          </div>
        </div>
      )}
      {
        (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Image Section */}
          <div className="mb-8 relative">
            {
              // base64Image && (
                <img 
                src={base64Image} 
                alt="Article" 
                className="w-full h-96 object-cover rounded-lg cursor-pointer"
                onClick={() => setShowImageDialog(true)}
              />
              // )
            }
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
          <Card className="border-none shadow-lg w-full max-w-full mx-auto px-2 md:px-6">
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {/* Error Alert */}
                {errors.submit && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.submit}</AlertDescription>
                  </Alert>
                )}

                {/* Category Select */}
                {/* <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Category</h3>
                  <Select
                    value={formStates[selectedAge]?.category}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="w-full">
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
                </div> */}

                {/* Categories Multi-Select */}
              <div className="space-y-2">
                <Label>Categories*</Label>
                <div className="border rounded-lg p-4">
                  {/* <div className="mb-2">
                    <Input
                      placeholder="Search categories..."
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      className="border-gray-200"
                    />
                  </div> */}
                  
                  {categoryLoading ? (
                    <div className="flex justify-center">
                      <Loader2 className="animate-spin" />
                    </div>
                  ) : (
                    // <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    //   {categories.map(cat => (
                    //     <div 
                    //       key={cat.id} 
                    //       className={`
                    //         flex items-center space-x-2 p-2 border rounded-lg cursor-pointer 
                    //         ${formStates.category.includes(cat.id) 
                    //           ? 'bg-orange-100 border-orange-500' 
                    //           : 'hover:bg-gray-100'}
                    //       `}
                    //       onClick={() => handleCategoryToggle(cat.id)}
                    //     >
                    //       {formStates.category.includes(cat.id) && (
                    //         <Check className="h-5 w-5 text-orange-500" />
                    //       )}
                    //       <span>{cat.name}</span>
                    //     </div>
                    //   ))}
                    // </div>
                    // In the render method:
                    // <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    //   {categories.map(cat => (
                    //     <div 
                    //       key={cat.id} 
                    //       className={`
                    //         flex items-center space-x-2 p-2 border rounded-lg cursor-pointer 
                    //         ${formStates[selectedAge]?.category?.includes(cat.id) 
                    //           ? 'bg-orange-100 border-orange-500' 
                    //           : 'hover:bg-gray-100'}
                    //       `}
                    //       onClick={() => handleCategoryToggle(selectedAge, cat.id)}
                    //     >
                    //       {formStates[selectedAge]?.category?.includes(cat.id) && (
                    //         <Check className="h-5 w-5 text-orange-500" />
                    //       )}
                    //       <span>{cat.name}</span>
                    //     </div>
                    //   ))}
                    // </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {categories.map(cat => (
                        <div 
                          key={cat.id} 
                          className={`
                            flex items-center space-x-2 p-2 border rounded-lg cursor-pointer 
                            ${formStates[selectedAge]?.category?.includes(cat.id) 
                              ? 'bg-orange-100 border-orange-500' 
                              : 'hover:bg-gray-100'}
                          `}
                          onClick={() => handleCategoryToggle(cat.id)}
                        >
                          {formStates[selectedAge]?.category?.includes(cat.id) && (
                            <Check className="h-5 w-5 text-orange-500" />
                          )}
                          <span>{cat.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.categories && <p className="text-sm text-red-500">{errors.categories}</p>}
              </div>

                {/* Show in Home Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="showOnTop"
                    checked={formStates[selectedAge]?.showOnTop}
                    onCheckedChange={(checked) => updateFormState(selectedAge, 'showOnTop', checked)}
                  />
                  <Label htmlFor="showOnTop">Show in Home Page</Label>
                </div>

                {/* Title Section */}
                <div className="space-y-2">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
                    <h3 className="text-lg font-semibold">Title</h3>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevertToOriginal('title')}
                        className="w-full md:w-auto"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Provided Data
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevertToResult('title')}
                        className="w-full md:w-auto"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Processed Result
                      </Button>
                    </div>
                  </div>
                  <Input
                    value={formStates[selectedAge]?.title || ''}
                    onChange={(e) => updateFormState(selectedAge, 'title', e.target.value)}
                    className={`w-full ${errors[`title-${selectedAge}`] ? 'border-red-500' : ''}`}
                  />
                  {errors[`title-${selectedAge}`] && (
                    <p className="text-red-500 text-sm">{errors[`title-${selectedAge}`]}</p>
                  )}
                </div>

                {/* Description Section */}
                <div className="space-y-2">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
                    <h3 className="text-lg font-semibold">Description</h3>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevertToOriginal('description')}
                        className="w-full md:w-auto"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Provided Data
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevertToResult('description')}
                        className="w-full md:w-auto"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Processed Result
                      </Button>
                    </div>
                  </div>
                  <textarea
                    value={formStates[selectedAge]?.description || ''}
                    onChange={(e) => updateFormState(selectedAge, 'description', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 min-h-[150px] md:min-h-[200px] ${
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
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevertToResult('wordDefinitions')}
                        className="border-orange-500 text-orange-500"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Processed Result
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
                        className="border-orange-500 text-orange-500"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Definition
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {formStates[selectedAge]?.wordDefinitions?.map((def, index) => (
                      <Accordion 
                        key={def.id} 
                        type="single" 
                        collapsible 
                        className="border-2 border-gray-200 rounded-lg transition-colors"
                      >
                        <AccordionItem value={`item-${def.id}`}>
                          <AccordionTrigger className="px-4 py-2">
                            Definition {index + 1}
                          </AccordionTrigger>
                          <AccordionContent className="p-4">
                            <div className="space-y-4">
                              <div>
                                <Label className="">Word</Label>
                                <Input
                                  value={def.word}
                                  onChange={(e) => {
                                    const newDefs = formStates[selectedAge].wordDefinitions.map(d =>
                                      d.id === def.id ? { ...d, word: e.target.value } : d
                                    );
                                    updateFormState(selectedAge, 'wordDefinitions', newDefs);
                                  }}
                                  className="mt-1 border-gray-200 focus:ring-orange-500"
                                  placeholder="Enter word"
                                />
                              </div>

                              <div>
                                <Label className="">Definition</Label>
                                <textarea
                                  value={def.definition}
                                  onChange={(e) => {
                                    const newDefs = formStates[selectedAge].wordDefinitions.map(d =>
                                      d.id === def.id ? { ...d, definition: e.target.value } : d
                                    );
                                    updateFormState(selectedAge, 'wordDefinitions', newDefs);
                                  }}
                                  className="w-full p-3 border-2 rounded-lg border-gray-200 focus:ring-2 min-h-[100px] mt-1"
                                  placeholder="Enter definition"
                                />
                              </div>

                              <Button
                                type="button"
                                onClick={() => {
                                  const newDefs = formStates[selectedAge].wordDefinitions.filter(d => d.id !== def.id);
                                  updateFormState(selectedAge, 'wordDefinitions', newDefs);
                                }}
                                className="w-full bg-[#E54D2E] hover:bg-[#D94A2A] text-white"
                              >
                                Remove Definition
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ))}
                  </div>
                </div>

                {/* Questions Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Questions</h3>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevertToResult('questions')}
                        className="border-orange-500 text-orange-500"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Processed Result
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
                        className="border-orange-500 text-orange-500"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {formStates[selectedAge]?.questions?.map((q, index) => (
                      <Accordion 
                        key={q.id} 
                        type="single" 
                        collapsible 
                        className="border-2 border-gray-200 rounded-lg transition-colors"
                      >
                        <AccordionItem value={`item-${q.id}`}>
                          <AccordionTrigger className="px-4 py-2">
                            Question {index + 1}
                          </AccordionTrigger>
                          <AccordionContent className="p-4">
                            <div className="space-y-4">
                              <div>
                                <Label className="">Question</Label>
                                <Input
                                  value={q.question}
                                  onChange={(e) => {
                                    const newQuestions = formStates[selectedAge].questions.map(question =>
                                      question.id === q.id ? { ...question, question: e.target.value } : question
                                    );
                                    updateFormState(selectedAge, 'questions', newQuestions);
                                  }}
                                  className="mt-1 border-gray-200 focus:ring-orange-500"
                                  placeholder="Enter question"
                                />
                              </div>

                              <Button
                                type="button"
                                onClick={() => {
                                  const newQuestions = formStates[selectedAge].questions.filter(question => question.id !== q.id);
                                  updateFormState(selectedAge, 'questions', newQuestions);
                                }}
                                className="w-full bg-[#E54D2E] hover:bg-[#D94A2A] text-white"
                              >
                                Remove Question
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ))}
                  </div>
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
                <>
                  <input
                    className="hidden"
                    type="file"
                    id="image"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleImageChange}
                  />
                  <label 
                    htmlFor="image" 
                    className="bg-black text-white py-2 px-4 rounded cursor-pointer hover:bg-gray-800"
                  >
                    Change Image
                  </label>
                </>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        )
      }
    </>
  );
}

export default AddNews;