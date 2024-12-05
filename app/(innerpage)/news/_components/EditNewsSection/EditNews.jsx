
import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, Loader2, Check } from 'lucide-react';
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

function EditNews({selectedNews, selectedAge, setShowEditSection}) {
    const [categories, setCategories] = useState([]);
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [base64Image, setBase64Image] = useState(null);
    const [image, setImage] = useState(null);
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [isImageEdited, setIsImageEdited] = useState(false);
    const router = useRouter();

    console.log('selectedNews', selectedNews)
    const [newsForm, setNewsForm] = useState({
      categories: [], 
      title: '',
      description: '',
      showOnTop: false,
      image: null
    });
    console.log('newsForm', newsForm)
    useEffect(() => {
        if (selectedNews) {
          console.log('Raw Selected News:', selectedNews);
          console.log('Current NewsForm before update:', newsForm);
      
          // Prepare image URL
          const imageUrl = selectedNews.image_url 
            ? `https://wowfy.in/testusr/images/${selectedNews.image_url}`
            : null;
      
          // Create a new object with explicit field mapping
          const newFormState = {
            // category: selectedNews.news_category_id?.toString() || '',
            categories: selectedNews.categoryIds
              ? selectedNews.categoryIds.split(",").map((id) => parseInt(id.trim(), 10))
              : [],// Convert categoryIds string to array
            title: selectedNews.title || '',
            description: selectedNews.description || '',
            showOnTop: selectedNews.showOnTop || false,
            image: imageUrl
          };
      
          console.log('Prepared Form State:', newFormState);
      
          // Use functional update and log the result
          setNewsForm(prevForm => {
            console.log('Previous Form State:', prevForm);
            console.log('New Form State:', newFormState);
            return newFormState;
          });
      
          // Set initial image
          setImage(imageUrl);
        }
      }, [selectedNews]);

      
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

      if (!newsForm.categories.length) {
        newErrors.categories = "At least one category is required";
      }

      if (!newsForm.title?.trim()) {
        newErrors.title = 'Title is required';
      }

      if (!newsForm.description?.trim()) {
        newErrors.description = 'Description is required';
      }

      if (!newsForm.image && !selectedNews?.image_url) {
        newErrors.image = 'Image is required';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleCategoryChange = (selected) => {
      setNewsForm({ ...newsForm, categories: selected });
      const newErrors = { ...errors };
      delete newErrors.categories;
      setErrors(newErrors);
    };

    const handleNewsImage = (event) => {
      const selectedFile = event.target.files[0];

      setNewsForm({ ...newsForm, image: selectedFile });
      setIsImageEdited(true);

      // Clear image error if exists
      const newErrors = { ...errors };
      delete newErrors.image;
      setErrors(newErrors);

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
        setImage(URL.createObjectURL(selectedFile)); // Preview the image

        // Convert the image to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setBase64Image(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        alert("Please upload a valid image file.");
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        const body = {
          id: selectedNews.id, // Add the news ID for updating
          categoryId: newsForm.categories,
          title: newsForm.title,
          description: newsForm.description,
          showOnTop: newsForm.showOnTop,
          // Only send base64 image if it's been edited, otherwise send original image name
          image: isImageEdited ? base64Image : selectedNews.image_url,
          oldImage: selectedNews.image_url,
          isImageEdited: isImageEdited
        };
        
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        
        const response = await fetch("/api/updateNewsArticle", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error('Failed to update article');
        }

        
        toast.success('News Updated Successfully');
        setShowEditSection(false)
        
        // Optional: Redirect or refresh data
        // router.push('/news');
      } catch (error) {
        console.error(error);
        setErrors({
          ...errors,
          submit: 'Failed to update article. Please try again.'
        });
        toast.error('Failed to update article. Please try again.');
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
            <p className="text-xl font-semibold">Updating news...</p>
            <p className="text-gray-500 mt-2">Please wait</p>
          </div>
        </div>
      )}

      {
        newsForm.categories && 
        (
            <Card className="border-none shadow-lg">
            <CardHeader>
            <CardTitle>{`Edit News Article (Age : ${selectedAge})`}</CardTitle>
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
                {/* <Select
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

                    {categoryLoading ? (
                        <div>
                        <Loader2 className="animate-spin" />
                        </div>
                    ) : (
                        filteredDropdownCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                        </SelectItem>
                        ))
                    )}
                    </SelectContent>
                </Select> */}

                  <div className="space-y-2">
                    <Label>Categories*</Label>
                    <div className="border rounded-lg p-4">
                      <div className="mb-2">
                        <Input
                          placeholder="Search categories..."
                          value={categorySearchTerm}
                          onChange={(e) => setCategorySearchTerm(e.target.value)}
                          className="border-gray-200"
                        />
                      </div>
                      
                      {categoryLoading ? (
                        <div className="flex justify-center">
                          <Loader2 className="animate-spin" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {categories.map(cat => (
                            <div 
                              key={cat.id} 
                              className={`
                                flex items-center space-x-2 p-2 border rounded-lg cursor-pointer 
                                ${newsForm.categories.includes(cat.id) 
                                  ? 'bg-orange-100 border-orange-500' 
                                  : 'hover:bg-gray-100'}
                              `}
                              onClick={() => handleCategoryChange(cat.id)}
                            >
                              {newsForm.categories.includes(cat.id) && (
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
                    {image ? (
                        <div className="space-y-2 text-center">
                        <img
                            src={image}
                            alt="Preview"
                            className="max-h-40 rounded-lg mx-auto"
                        />
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

                {/* Show in Home Checkbox */}
                <div className="flex items-center space-x-2">
                <Checkbox 
                    id="showOnTop"
                    checked={newsForm.showOnTop}
                    onCheckedChange={(checked) => setNewsForm({...newsForm, showOnTop: checked})}
                />
                <Label htmlFor="showOnTop">Show in Home Page</Label>
                </div>
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
                    Updating...
                    </>
                ) : (
                    'Update Article'
                )}
                </Button>
            </form>
            </CardContent>
        </Card>
        )
      }
    </>
  )
}

export default EditNews;