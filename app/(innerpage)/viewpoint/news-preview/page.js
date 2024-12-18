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

  const router = useRouter();

  useEffect(() => {
    if (data) {
      const initialStates = {};
      const categoryId = data.originalData.categoryIds;

      // Set initial form states
      data.results.forEach((result) => {
        initialStates[result.viewpoint] = {
          category: categoryId,
          viewpoint: result.viewpoint,
          title: result.title || '',
          description: result.description || '',
          showOnTop: data.originalData.showOnTop,
        };
      });
console.log(initialStates)
      setFormStates(initialStates);
      setViewpoints(data.results.map(result => result.viewpoint));
      setImageData(data.image);
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

  useEffect(() => {
    console.log(formStates);
    const category = formStates[viewpoints]?.category;
    const title = formStates[viewpoints]?.title;
    if (category && title) {
      const fileName = `${Date.now()}-${category}-${title.replace(/\s+/g, '-')}.png`;
      setFileName(fileName);
    }
  }, [formStates]);
  

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields for all viewpoints");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        result: formStates,
        imageData,
        fileName: `${Date.now()}-axara.png`,
        slotId: data.originalData.mainNewsSlot,
      };

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const response = await fetch("/api/adult/saveNewsArticle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        toast.error(data.message || "Failed to submit article. Please try again.");
        return;
      }
      toast.success("News Added Successfully");
      router.push("/viewpoint");
    } catch (error) {
      console.error(error);
      toast.error("Network error occurred. Please try again.");
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 relative">
          <img
            src={base64Image}
            alt="Article"
            className="w-full h-96 object-cover rounded-lg cursor-pointer"
            onClick={() => setShowImageDialog(true)}
          />
          <Button className="absolute bottom-4 right-4" onClick={() => setShowImageDialog(true)}>
            Change Image
          </Button>
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

        <AlertDialog open={showImageDialog} onOpenChange={setShowImageDialog}>
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
        </AlertDialog>
      </div>
    </>
  );
}

export default AddNews;
