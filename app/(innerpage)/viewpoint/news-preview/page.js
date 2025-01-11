"use client";
import GlobalApi from "@/app/api/GlobalApi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/context/DataContext";
import { chunkFile } from "@/utils/uploadHelpers";
import { Check, FileText, Loader2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

function AddNews() {
  const [selectedViewpoint, setSelectedViewpoint] = useState('');
  const [viewpoints, setViewpoints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showImageDialog, setShowImageDialog] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [formStates, setFormStates] = useState({});
  const { data } = useData();
  const [base64Image, setBase64Image] = useState(data?.image || null);
  const [imageData, setImageData] = useState(null);
  const [fileName, setFileName] = useState(null);
  const isFirstRender = useRef(true);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [base64Media, setBase64Media] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [mediaType, setMediaType] = useState('image'); // 'image' or 'video'

  const [uploadProgress, setUploadProgress] = useState(0);

  const router = useRouter();
console.log(data)
console.log("base64Media", base64Media);

  // useEffect(() => {
  //   if (data) {
  //     const initialStates = {};
  //     const categoryId = data.originalData.categoryIds;

  //     // Set initial form states
  //     data.results.forEach((result) => {
  //       initialStates[result.viewpoint] = {
  //         category: categoryId,
  //         viewpoint: result.viewpoint,
  //         title: result.title || '',
  //         description: result.description || '',
  //         region_id: data.originalData.region_id,
  //         showOnTop: data.originalData.showOnTop,
  //       };
  //     });
  //     console.log(initialStates)
  //     setFormStates(initialStates);
  //     setViewpoints(data.results.map(result => result.viewpoint));
  //     setImageData(data.image);
  //   }
  // }, [data]);

  useEffect(() => {
    if (data) {
      const initialStates = {};
      const categoryId = data.originalData.categoryIds;
  
      data.results.forEach((result) => {
        initialStates[result.viewpoint] = {
          category: categoryId,
          viewpoint: result.viewpoint,
          title: result.title || '',
          description: result.description || '',
          region_id: data.originalData.region_id,
          showOnTop: data.originalData.showOnTop,
        };
      });
  
      setFormStates(initialStates);
      setViewpoints(data.results.map(result => result.viewpoint));
      setBase64Media(data.mediaData);
      setIsVideo(data.originalData.mediaType === 'video');
      setMediaType(data.originalData.mediaType || 'image');
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
        const fetchedCategories = response.data.categories;
        setCategories(fetchedCategories);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setCategoryLoading(false);
    }
  };

  useEffect(() => {
    getNewsCategories();
  }, [data]);

  // useEffect(() => {
  //   console.log(formStates);
  //   const category = formStates[viewpoints]?.category;
  //   const title = formStates[viewpoints]?.title;
  //   if (category && title) {
  //     const fileName = `${Date.now()}-${category}-${title.replace(/\s+/g, '-')}.png`;
  //     setFileName(fileName);
  //   }
  // }, [formStates]);

  useEffect(() => {
    console.log(formStates);
    const category = formStates[viewpoints]?.category;
    const title = formStates[viewpoints]?.title;
    if (category && title) {
      const extension = isVideo ? '.mp4' : '.png';
      const fileName = `${Date.now()}-${category}-${title.replace(/\s+/g, '-')}${extension}`;
      setFileName(fileName);
    }
  }, [formStates, isVideo]);
  
  const handleMediaChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const isVideoFile = file.type.startsWith('video/');
      setIsVideo(isVideoFile);
      setMediaType(isVideoFile ? 'video' : 'image');
  
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Media(reader.result);
        setImageData(reader.result); // Keep this for backward compatibility
      };
      reader.readAsDataURL(file);
    }
    setShowMediaDialog(false);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result);
        setImageData(reader.result);
      };
      reader.readAsDataURL(file);
    }
    setShowImageDialog(false);
  };

  const updateFormState = (viewpoint, field, value) => {
    setFormStates((prev) => ({
      ...prev,
      [viewpoint]: {
        ...prev[viewpoint],
        [field]: value,
      },
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    viewpoints.forEach((viewpoint) => {
      const state = formStates[viewpoint];
      if (!state?.title?.trim()) newErrors[`title-${viewpoint}`] = `Title required for viewpoint ${viewpoint}`;
      if (!state?.description?.trim()) newErrors[`description-${viewpoint}`] = `Description required for viewpoint ${viewpoint}`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!validateForm()) {
  //     toast.error("Please fill in all required fields for all viewpoints");
  //     return;
  //   }
  //   setIsSubmitting(true);
  //   try {

  //     const extension = isVideo ? '.mp4' : '.png';
  //     const payload = {
  //       result: formStates,
  //       mediaData: base64Media,
  //       mediaType: mediaType,
  //       fileName: `${Date.now()}-axara${extension}`,
  //       slotId: data.originalData.mainNewsSlot,
  //     };


  //     const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  //     const response = await fetch("/api/adult/saveNewsArticle", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     if (!response.ok) {
  //       toast.error(data.message || "Failed to submit article. Please try again.");
  //       return;
  //     }
  //     toast.success("News Added Successfully");
  //     router.push("/viewpoint");
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Network error occurred. Please try again.");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  // Utility function to split base64 string into chunks
const splitIntoChunks = (base64String, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < base64String.length; i += chunkSize) {
    chunks.push(base64String.slice(i, i + chunkSize));
  }
  return chunks;
};


  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!validateForm()) {
  //     toast.error("Please fill in all required fields for all viewpoints");
  //     return;
  //   }
  
  //   setIsSubmitting(true);
  //   const uploadToast = toast.loading("Uploading media...");
  
  //   try {
  //     const extension = isVideo ? '.mp4' : '.png';
  //     const fileName = `${Date.now()}-axara${extension}`;
  //     const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  //     // Split the base64 media into chunks (3MB each)
  //     const CHUNK_SIZE = 3 * 1024 * 1024;
  //     const chunks = splitIntoChunks(base64Media, CHUNK_SIZE);
  //     let uploadedChunks = 0;
  
  //     // Upload each chunk
  //     for (let i = 0; i < chunks.length; i++) {
  //       const chunkPayload = {
  //         chunk: chunks[i],
  //         chunkIndex: i,
  //         totalChunks: chunks.length,
  //         fileName,
  //         sessionId: Date.now().toString(), // Unique session ID for this upload
  //       };
  
  //       const chunkResponse = await fetch("/api/adult/upload-chunk", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify(chunkPayload),
  //       });
  
  //       if (!chunkResponse.ok) {
  //         throw new Error(`Failed to upload chunk ${i + 1}`);
  //       }
  
  //       uploadedChunks++;
  //       const progress = Math.round((uploadedChunks / chunks.length) * 100);
  //       toast.loading(`Uploading: ${progress}%`, { id: uploadToast });
  //     }
  
  //     // After all chunks are uploaded, save the news article
  //     const payload = {
  //       result: formStates,
  //       fileName,
  //       mediaType,
  //       slotId: data.originalData.mainNewsSlot,
  //     };
  
  //     const response = await fetch("/api/adult/saveNewsArticle", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(payload),
  //     });
  
  //     const responseData = await response.json();
  
  //     if (!response.ok) {
  //       throw new Error(responseData.message || "Failed to submit article");
  //     }
  
  //     toast.success("News Added Successfully", { id: uploadToast });
  //     router.push("/viewpoint");
  //   } catch (error) {
  //     console.error(error);
  //     toast.error(error.message || "Network error occurred. Please try again.", { 
  //       id: uploadToast 
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!validateForm()) {
  //     toast.error("Please fill in all required fields for all viewpoints");
  //     return;
  //   }
    
  //   setIsSubmitting(true);
  //   const uploadToast = toast.loading("Uploading media...");
  
  //   try {
  //     const extension = isVideo ? '.mp4' : '.png';
  //     const fileName = `${Date.now()}-axara${extension}`;
      
  //     const payload = {
  //       result: formStates,
  //       mediaData: base64Media,
  //       mediaType,
  //       fileName,
  //       slotId: data.originalData.mainNewsSlot,
  //     };
  
  //     const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  //     const response = await fetch("/api/adult/saveNewsArticle", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(payload),
  //     });
  
  //     const responseData = await response.json();
  
  //     if (!response.ok) {
  //       throw new Error(responseData.error || responseData.message || "Failed to upload file");
  //     }
  
  //     toast.success("News Added Successfully", { id: uploadToast });
  //     router.push("/viewpoint");
  //   } catch (error) {
  //     console.error('Upload error:', error);
  //     toast.error(error.message || "Failed to upload file. Please try again.", {
  //       id: uploadToast,
  //       duration: 5000
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  /* original */
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!validateForm()) {
  //     toast.error("Please fill in all required fields for all viewpoints");
  //     return;
  //   }
  //   setIsSubmitting(true);
  //   try {

  //     const extension = isVideo ? '.mp4' : '.png';
  //     const payload = {
  //       result: formStates,
  //       mediaData: base64Media,
  //       mediaType: mediaType,
  //       fileName: `${Date.now()}-axara${extension}`,
  //       slotId: data.originalData.mainNewsSlot,
  //     };

  //     const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  //     const response = await fetch("/api/adult/saveNewsArticle", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     if (!response.ok) {
  //       toast.error(data.message || "Failed to submit article. Please try again.");
  //       return;
  //     }
  //     toast.success("News Added Successfully");
  //     router.push("/viewpoint");
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Network error occurred. Please try again.");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

/* working */
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!validateForm()) {
  //     toast.error("Please fill in all required fields for all viewpoints");
  //     return;
  //   }
    
  //   setIsSubmitting(true);
  //   try {
  //     const extension = isVideo ? '.mp4' : '.png';
  //     const fileName = `${Date.now()}-axara${extension}`;
      
  //     // First, upload the media file if it exists
  //     if (base64Media) {
  //       // Convert base64 to Blob
  //       const base64Response = await fetch(base64Media);
  //       const blob = await base64Response.blob();
        
  //       // Split into chunks
  //       const chunks = chunkFile(blob);
  //       const totalChunks = chunks.length;
        
  //       // Upload each chunk
  //       for (let i = 0; i < chunks.length; i++) {
  //         const formData = new FormData();
  //         formData.append('file', chunks[i]);
  //         formData.append('fileName', fileName);
  //         formData.append('chunkIndex', i);
  //         formData.append('totalChunks', totalChunks);
          
  //         const uploadResponse = await fetch('/api/adult/uploadChunk', {
  //           method: 'POST',
            
  //           body: formData,
  //         });

  //         // headers: {
  //         //   Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         // },
          
  //         if (!uploadResponse.ok) {
  //           throw new Error('Failed to upload file chunk');
  //         }
  //       }
  //     }
      
  //     // Then submit the article data
  //     const payload = {
  //       result: formStates,
  //       fileName,
  //       mediaType,
  //       slotId: data.originalData.mainNewsSlot,
  //     };
      
  //     const response = await fetch("/api/adult/saveNewsArticle", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${localStorage.getItem("token")}`,
  //       },
  //       body: JSON.stringify(payload),
  //     });
  
  //     if (!response.ok) {
  //       throw new Error(response.statusText);
  //     }
      
  //     toast.success("News Added Successfully");
  //     router.push("/viewpoint");
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Upload failed. Please try again.");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const uploadChunkWithRetry = async (chunk, fileName, chunkIndex, totalChunks, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const formData = new FormData();
        formData.append('file', chunk);
        formData.append('fileName', fileName);
        formData.append('chunkIndex', chunkIndex);
        formData.append('totalChunks', totalChunks);

        const response = await fetch('/api/adult/uploadChunk', {
          method: 'POST',
          body: formData,
          timeout: chunkIndex === totalChunks - 1 ? 30000 : 10000,
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields for all viewpoints");
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(0); // Reset progress at start
    
    try {
      const extension = isVideo ? '.mp4' : '.png';
      const fileName = `${Date.now()}-axara${extension}`;
      
      if (base64Media) {
        const base64Response = await fetch(base64Media);
        const blob = await base64Response.blob();
        
        // Create smaller chunks (1MB each)
        const chunkSize = 1024 * 1024;
        const chunks = [];
        for (let i = 0; i < blob.size; i += chunkSize) {
          chunks.push(blob.slice(i, i + chunkSize));
        }
        
        // Upload chunks with progress tracking
        for (let i = 0; i < chunks.length; i++) {
          await uploadChunkWithRetry(chunks[i], fileName, i, chunks.length);
          // Update progress after each chunk
          setUploadProgress(Math.round((i + 1) * 100 / chunks.length));
        }
      }
      
      // Rest of your form submission logic...
      const payload = {
        result: formStates,
        fileName,
        mediaType,
        slotId: data.originalData.mainNewsSlot,
      };

      const response = await fetch("/api/adult/saveNewsArticle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save article');
      }
      
      toast.success("News Added Successfully");
      router.push("/viewpoint");
    } catch (error) {
      console.error(error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0); // Reset progress after completion
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 relative">
          {/* <img
            src={base64Image}
            alt="Article"
            className="w-full h-96 object-cover rounded-lg cursor-pointer"
            onClick={() => setShowImageDialog(true)}
          />
          <Button className="absolute bottom-4 right-4" onClick={() => setShowImageDialog(true)}>
            Change Image
          </Button> */}
          <div className="mb-8 relative">
            {isVideo ? (
              <video
                src={base64Media}
                controls
                className="w-full h-96 object-cover rounded-lg cursor-pointer"
                onClick={() => setShowMediaDialog(true)}
              />
            ) : (
              <img
                src={base64Media}
                alt="Article"
                className="w-full h-96 object-cover rounded-lg cursor-pointer"
                onClick={() => setShowMediaDialog(true)}
              />
            )}
            <Button 
              className="absolute bottom-4 right-4" 
              onClick={() => setShowMediaDialog(true)}
            >
              Change {isVideo ? 'Video' : 'Image'}
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <Label>Select Viewpoint</Label>
          <Select value={selectedViewpoint} onValueChange={(value) => setSelectedViewpoint(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {viewpoints.map((viewpoint) => (
                <SelectItem key={viewpoint} value={viewpoint}>
                  {viewpoint}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="border-none shadow-lg w-full max-w-full mx-auto px-2 md:px-6">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {errors.submit && <Alert variant="destructive"><AlertDescription>{errors.submit}</AlertDescription></Alert>}

              <div className="space-y-2">
                <Label>Categories*</Label>
                <div className="border rounded-lg p-4">
                  {categoryLoading ? (
                    <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {categories.map((cat) => (
                        <div
                          key={cat.id}
                          className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer ${
                            formStates[selectedViewpoint]?.category?.includes(cat.id) ? "bg-orange-100 border-orange-500" : "hover:bg-gray-100"
                          }`}
                          onClick={() => handleCategoryToggle(cat.id)}
                        >
                          {formStates[selectedViewpoint]?.category?.includes(cat.id) && <Check className="h-5 w-5 text-orange-500" />}
                          <span>{cat.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showOnTop"
                  checked={formStates[selectedViewpoint]?.showOnTop}
                  onCheckedChange={(checked) => updateFormState(selectedViewpoint, "showOnTop", checked)}
                />
                <Label htmlFor="showOnTop">Show in Home Page</Label>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Title</h3>
                <Input
                  value={formStates[selectedViewpoint]?.title || ""}
                  onChange={(e) => updateFormState(selectedViewpoint, "title", e.target.value)}
                  className={`w-full ${errors[`title-${selectedViewpoint}`] ? "border-red-500" : ""}`}
                />
                {errors[`title-${selectedViewpoint}`] && <p className="text-red-500 text-sm">{errors[`title-${selectedViewpoint}`]}</p>}
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Description</h3>
                <textarea
                  value={formStates[selectedViewpoint]?.description || ""}
                  onChange={(e) => updateFormState(selectedViewpoint, "description", e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 min-h-[150px] md:min-h-[200px] ${
                    errors[`description-${selectedViewpoint}`] ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="Enter description"
                />
                {errors[`description-${selectedViewpoint}`] && <p className="text-red-500 text-sm">{errors[`description-${selectedViewpoint}`]}</p>}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full bg-orange-500 hover:bg-orange-600">
                {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>) : "Update Article"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* <AlertDialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Change Article Image</AlertDialogTitle>
              <AlertDialogDescription>Would you like to change the article image?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <>
                  <input className="hidden" type="file" id="image" accept="image/jpeg,image/png,image/jpg" onChange={handleImageChange} />
                  <label htmlFor="image" className="bg-black text-white py-2 px-4 rounded cursor-pointer hover:bg-gray-800">Change Image</label>
                </>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog> */}

        <AlertDialog open={showMediaDialog} onOpenChange={setShowMediaDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Change Article {isVideo ? 'Video' : 'Image'}</AlertDialogTitle>
              <AlertDialogDescription>
                Would you like to change the article {isVideo ? 'video' : 'image'}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <>
                  <input 
                    className="hidden" 
                    type="file" 
                    id="media" 
                    accept="image/jpeg,image/png,image/jpg,video/mp4,video/webm" 
                    onChange={handleMediaChange} 
                  />
                  <label 
                    htmlFor="media" 
                    className="bg-black text-white py-2 px-4 rounded cursor-pointer hover:bg-gray-800"
                  >
                    Change {isVideo ? 'Video' : 'Image'}
                  </label>
                </>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}

export default AddNews;
