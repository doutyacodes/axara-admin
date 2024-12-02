import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, Loader2 } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';

function AddNews() {
    const [categories, setCategories] = useState([]);
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [base64Image, setBase64Image] = useState(null);
    const [image, setImage] = useState(null);
    const [questions, setQuestions] = useState([{ id: 1, question: '' }]);
    const [wordDefinitions, setWordDefinitions] = useState([{ id: 1, word: '', definition: '' }]);
    const [categoryLoading, setCategoryLoading] = useState(false)
    const router = useRouter();
    
    const { setDataFromPage } = useData(); 

    const [newsForm, setNewsForm] = useState({
      category: '',
      title: '',
      // summary: '',
      description: '',
      // age: '',
      showInHome: false,
      image: null
    });
  

    const getNewsCategories = async () => {
      setCategoryLoading(true);
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          setCategoryLoading(false);
          return;
        }
  
        const response = await GlobalApi.GetNewsCategories(token);
        if (response.status === 200) {
          setCategories(response.data.categories);
          console.log(response.data.categories);
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

    const validateForm = () => {
      const newErrors = {};

      if (!newsForm.category) {
        newErrors.category = 'Category is required';
      }

      if (!newsForm.title?.trim()) {
        newErrors.title = 'Title is required';
      }

      // if (!newsForm.summary?.trim()) {
      //   newErrors.summary = 'Summary is required';
      // }

      if (!newsForm.description?.trim()) {
        newErrors.description = 'Description is required';
      }

      if (!newsForm.image) {
        newErrors.image = 'Image is required';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

     // Word Definitions Handlers
     const handleAddWordDefinition = () => {
      setWordDefinitions([
        ...wordDefinitions,
        {
          id: wordDefinitions.length + 1,
          word: '',
          definition: ''
        }
      ]);
    };
  
    const handleRemoveWordDefinition = (definitionId) => {
      if (wordDefinitions.length > 1) {
        setWordDefinitions(wordDefinitions.filter(wd => wd.id !== definitionId));
      }
    };
  
    const handleWordDefinitionChange = (definitionId, field, value) => {
      setWordDefinitions(wordDefinitions.map(wd => {
        if (wd.id === definitionId) {
          return { ...wd, [field]: value };
        }
        return wd;
      }));
    };
  
    const handleNewsImage = (event) => {
      const selectedFile = event.target.files[0];

      setNewsForm({ ...newsForm, image: selectedFile });
        // Clear image error if exists
        const newErrors = { ...errors };
        delete newErrors.image;
        setErrors(newErrors);

          // Validate file type
          // const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
          // if (!validTypes.includes(selectedFile.type)) {
          //   setErrors({
          //     ...errors,
          //     image: 'Only JPG, JPEG, and PNG files are allowed'
          //   });
          //   return;
          // }

          // Validate file size (10MB max)
          if (selectedFile.size > 10 * 1024 * 1024) {
            setErrors({
              ...errors,
              image: 'File size must be less than 10MB'
            });
            return;
          }
    
        // Check if the selected file is an image
        if (selectedFile && selectedFile.type.startsWith("image/")) {
          // setFile(selectedFile); // Store the file for later use
          setImage(URL.createObjectURL(selectedFile)); // Preview the image (optional)
    
          // Convert the image to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            setBase64Image(reader.result); // Save base64 encoded image
          };
          reader.readAsDataURL(selectedFile);
     
          console.log("Image uploaded:", selectedFile);
        } else {
          alert("Please upload a valid image file.");
        }
    };

    const handleSubmit = async (e) => {
      console.log("handleing");
      
      e.preventDefault();
      
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        const body = {
          categoryId: newsForm.category,
          title: newsForm.title,
          // summary: newsForm.summary,
          description: newsForm.description,
          // age: newsForm.age,
          showInHome: newsForm.showInHome,
          questions: questions.filter(q => q.question.trim()).map(q => q.question),
          wordDefinitions: wordDefinitions.filter(wd => 
                            wd.word.trim() && wd.definition.trim()
                          ),
          // image: base64Image,
        };
        
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        
        const response = await fetch("/api/createNewsArticle", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add token to headers if needed
          },
          body: JSON.stringify(body),
        });
        // console.log(response.data,"response.data")
        if (!response.ok) {
          console.log("not ok")
          throw new Error('Failed to submit article');
        }
        // console.log()
        const data = await response.json();
        const payload = { ...data, image: base64Image }; // Include the image in the payload
        setDataFromPage(payload);
        router.push('/news/news-preview');
        // const serializedData = encodeURIComponent(JSON.stringify(payload));
        // console.log("pusgh ok")
        // router.push(`/news-preview?data=${serializedData}`);
        // Reset form on success
        setNewsForm({
          category: '',
          title: '',
          // summary: '',
          description: '',
          // age: '',
          showInHome: false,
          image: null
        });
        setQuestions([{ id: 1, question: '' }]);
        setErrors({});
        toast.success('News Added Successfully')
        
 
      } catch (error) {
        setErrors({
          ...errors,
          submit: 'Failed to submit article. Please try again.'
        });
        toast.error('Failed to submit article. Please try again.')
      } finally {
        setIsSubmitting(false);
      }
    };
  
    const filteredDropdownCategories = categories.filter(cat =>
      cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );
  
  return (
    <>
      <Toaster />

      {isSubmitting && (
        <div className="fixed inset-0 bg-black/10 shadow-lg z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
            <p className="text-xl font-semibold">Generating news for all Age Groups...</p>
            <p className="text-gray-500 mt-2">Please do not close the page</p>
          </div>
        </div>
      )}

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Add New News Article</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Alert */}
            {errors.submit && (
              <Alert variant="destructive">
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            {/* Category Select with Search */}
            <div className="space-y-2">
              <Label htmlFor="category">Category*</Label>
              <Select
                value={newsForm.category}
                onValueChange={(value) => {
                  setNewsForm({...newsForm, category: value});
                  const newErrors = { ...errors };
                  delete newErrors.category;
                  setErrors(newErrors);
                }}
              >
                <SelectTrigger className={`w-full ${errors.category ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <div className="py-2 px-3 sticky top-0 bg-white">
                    <Input
                      placeholder="Search categories..."
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      className="border-gray-200"
                    />
                  </div>

                  {
                    categoryLoading ? (
                      <div>
                      <Loader2 className="animate-spin" />
                    </div>
                    ) : (
                      filteredDropdownCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )
                  }

                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Article Image*</Label>
              <div className={`border-2 border-dashed rounded-lg p-6 hover:border-orange-500 transition-colors ${
                errors.image ? 'border-red-500' : 'border-gray-300'
              }`}>
                <input
                  type="file"
                  id="image"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleNewsImage}
                  className="hidden"
                />
                <label 
                  htmlFor="image" 
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  {newsForm.image ? (
                    <div className="space-y-2 text-center">
                      {image && (
                        <img
                          src={image}
                          alt="Preview"
                          className="max-h-40 rounded-lg mx-auto"
                        />
                      )}
                      <p className="text-sm text-gray-600">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-center">
                      <Upload className="w-12 h-12 mx-auto text-gray-400" />
                      <p className="text-gray-600">Click to upload image</p>
                      <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
              {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title*</Label>
              <Input 
                id="title"
                value={newsForm.title}
                onChange={(e) => {
                  setNewsForm({...newsForm, title: e.target.value});
                  if (e.target.value.trim()) {
                    const newErrors = { ...errors };
                    delete newErrors.title;
                    setErrors(newErrors);
                  }
                }}
                placeholder="Enter article title"
                className={`border-gray-200 ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            {/* Summary */}
            {/* <div className="space-y-2">
              <Label htmlFor="summary">Summary*</Label>
              <textarea 
                id="summary"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 min-h-[100px] ${
                  errors.summary ? 'border-red-500' : 'border-gray-200'
                }`}
                value={newsForm.summary}
                onChange={(e) => {
                  setNewsForm({...newsForm, summary: e.target.value});
                  if (e.target.value.trim()) {
                    const newErrors = { ...errors };
                    delete newErrors.summary;
                    setErrors(newErrors);
                  }
                }}
                placeholder="Brief summary of the article"
              />
              {errors.summary && <p className="text-sm text-red-500">{errors.summary}</p>}
            </div> */}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description*</Label>
              <textarea 
                id="description"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 min-h-[200px] ${
                  errors.description ? 'border-red-500' : 'border-gray-200'
                }`}
                value={newsForm.description}
                onChange={(e) => {
                  setNewsForm({...newsForm, description: e.target.value});
                  if (e.target.value.trim()) {
                    const newErrors = { ...errors };
                    delete newErrors.description;
                    setErrors(newErrors);
                  }
                }}
                placeholder="Detailed description of the article"
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            {/* Age Input */}
            {/* <div className="space-y-2">
              <Label htmlFor="age">Age* (3-12 years)</Label>
              <Input 
                id="age"
                type="number"
                min="3"
                max="12"
                value={newsForm.age}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || '';
                  setNewsForm({...newsForm, age: value});
                  if (value >= 3 && value <= 12) {
                    const newErrors = { ...errors };
                    delete newErrors.age;
                    setErrors(newErrors);
                  }
                }}
                className={`border-gray-200 ${errors.age ? 'border-red-500' : ''}`}
              />
              {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
            </div> */}

            {/* Show in Home Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="showInHome"
                checked={newsForm.showInHome}
                onCheckedChange={(checked) => setNewsForm({...newsForm, showInHome: checked})}
              />
              <Label htmlFor="showInHome">Show in Home Page</Label>
            </div>

            {/* Word Definitions Section */}
            {/* <div className="space-y-4 mt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Word Definitions</h3>
                <Button
                  type="button"
                  onClick={handleAddWordDefinition}
                  variant="outline"
                  className="border-orange-500 text-orange-500 hover:bg-orange-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Word
                </Button>
              </div>

              {wordDefinitions.map((def, index) => (
                <Card key={def.id} className="p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Word {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveWordDefinition(def.id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Word</Label>
                    <Input
                      value={def.word}
                      onChange={(e) => handleWordDefinitionChange(def.id, 'word', e.target.value)}
                      placeholder="Enter word"
                      className="border-gray-200"
                    />
                    
                    <Label className="mt-2">Definition</Label>
                    <textarea
                      value={def.definition}
                      onChange={(e) => handleWordDefinitionChange(def.id, 'definition', e.target.value)}
                      placeholder="Enter word definition"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 min-h-[100px] border-gray-200"
                    />
                  </div>
                </Card>
              ))}
            </div> */}
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full bg-orange-500 hover:bg-orange-600 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Article'
              )}
            </Button>
          </form>
          </CardContent>
      </Card>
    </>
  )
}

export default AddNews