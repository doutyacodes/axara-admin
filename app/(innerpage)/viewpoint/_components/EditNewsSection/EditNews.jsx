import GlobalApi from "@/app/api/GlobalApi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { BsTrash2Fill } from "react-icons/bs";
import { GoAlertFill } from "react-icons/go";
function EditNews({ selectedNews, selectedAge, setShowEditSection, fetchNews }) {
  const [categories, setCategories] = useState([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [base64Image, setBase64Image] = useState(null);
  const [image, setImage] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [isImageEdited, setIsImageEdited] = useState(false);
  const [deleteShow, setDeleteShow] = useState(false);
  const router = useRouter();

  // console.log("selectedNews", selectedNews);
  const [regionId, setRegionId] = useState(selectedNews.region_id);

  const [newsForm, setNewsForm] = useState({
    categories: [],
    title: "",
    description: "",
    showOnTop: false,
    main_news: false,
    image: null,
  });
  console.log("newsForm", newsForm);
  useEffect(() => {
    if (selectedNews) {
      console.log("Raw Selected News:", selectedNews);
      console.log("Current NewsForm before update:", newsForm);

      // Prepare image URL
      const imageUrl = selectedNews.image_url
        ? `https://wowfy.in/testusr/images/${selectedNews.image_url}`
        : null;

      // Create a new object with explicit field mapping
      const newFormState = {
        // category: selectedNews.news_category_id?.toString() || '',
        categories: selectedNews.categoryIds
          ? selectedNews.categoryIds
              .split(",")
              .map((id) => parseInt(id.trim(), 10))
          : [], // Convert categoryIds string to array
        title: selectedNews.title || "",
        description: selectedNews.description || "",
        showOnTop: selectedNews.showOnTop || false,
        main_news: selectedNews.main_news || false,
        image: imageUrl,
      };

      console.log("Prepared Form State:", newFormState);

      // Use functional update and log the result
      setNewsForm((prevForm) => {
        console.log("Previous Form State:", prevForm);
        console.log("New Form State:", newFormState);
        return newFormState;
      });

      // Set initial image
      setImage(imageUrl);
    }
  }, [selectedNews]);
  const Editions = [
    {
      id: 1,
      name: "All",
    },
    {
      id: 2,
      name: "India",
    },
    {
      id: 3,
      name: "United States",
    },
  ];
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
      newErrors.title = "Title is required";
    }

    if (!newsForm.description?.trim()) {
      newErrors.description = "Description is required";
    }

    if (!newsForm.image && !selectedNews?.image_url) {
      newErrors.image = "Image is required";
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
        image: "File size must be less than 10MB",
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

    const uploadMediaToCPanel = async (file) => {
      const formData = new FormData();
      const isVideo = file.type.startsWith('video/');
      
      if (isVideo) {
        formData.append('videoFile', file);
      } else {
        formData.append('coverImage', file);
      }
      
      const uploadUrl = isVideo 
        ? 'https://wowfy.in/testusr/upload2.php' 
        : 'https://wowfy.in/testusr/upload.php';
      
      try {
        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload file');
        }
        
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        
        return data.filePath; // This should be the filename returned from PHP
      } catch (error) {
        throw new Error(`File upload failed: ${error.message}`);
      }
    };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {

      let fileName = selectedNews.image_url
      // Upload file directly to cPanel if media is selected
      if (isImageEdited) {
        fileName = await uploadMediaToCPanel(newsForm.image);
      }

      const body = {
        id: selectedNews.id, // Add the news ID for updating
        categoryId: newsForm.categories,
        title: newsForm.title,
        description: newsForm.description,
        showOnTop: newsForm.showOnTop,
        main_news: newsForm.main_news,
        fileName,
        regionId
      };

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const response = await fetch("/api/adult/updateNewsArticle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to update article");
      }

      toast.success("News Updated Successfully");
      setShowEditSection(false);
      fetchNews()
      // Optional: Redirect or refresh data
      // router.push('/news');
    } catch (error) {
      console.error(error);
      setErrors({
        ...errors,
        submit: "Failed to update article. Please try again.",
      });
      toast.error("Failed to update article. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDropdownCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const handleClick = async () => {
    try {
      setIsSubmitting(false);
      const response = await GlobalApi.DeleteWholeNews(selectedNews.id);
      console.log("status", response.status);
      console.log("data", response.data);
      if (response.status == 201) {
        toast.success("News Deleted Successfully");
        window.location.reload();
      }
      setDeleteShow(false);
    } catch (error) {
      console.log(error);
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
            <p className="text-xl font-semibold">Updating news...</p>
            <p className="text-gray-500 mt-2">Please wait</p>
          </div>
        </div>
      )}
      {deleteShow && (
        <div className="fixed inset-0 bg-black/10 shadow-lg z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
            <div className="bg-red-100 rounded-full p-3 flex justify-center items-center">
              <GoAlertFill size={35} color="red" />
            </div>
            <p className="text-base font-semibold text-center mt-4">
              Do you want to delete the news for all ages?
            </p>
            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => setDeleteShow(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleClick}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Yes, delete them
              </button>
            </div>
          </div>
        </div>
      )}
      {newsForm.categories && (
        <Card className="border-none shadow-lg">
          {/* <CardHeader> */}
          {/* </CardHeader> */}
          <div className="w-full flex justify-end items-end p-4">
            <div
              onClick={() => setDeleteShow(true)}
              className="flex items-center text-white p-2 px-4 cursor-pointer bg-red-600 rounded-md gap-3"
            >
              <BsTrash2Fill size={20} color="white" />
              Delete
            </div>
          </div>
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
                {/* <Label htmlFor="category">Category*</Label> */}
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                  {Editions.map((edition) => (
                    <div
                      key={edition.id}
                      className={`
                          flex items-center space-x-2 p-2 border rounded-lg cursor-pointer 
                          ${
                            regionId == edition.id
                              ? "bg-orange-100 border-orange-500"
                              : "hover:bg-gray-100"
                          }
                        `}
                      onClick={() => setRegionId(edition.id)}
                    >
                      {regionId == edition.id && (
                        <Check className="h-5 w-5 text-orange-500" />
                      )}
                      <span>{edition.name}</span>
                    </div>
                  ))}
                </div>
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
                        {categories.map((cat) => (
                          <div
                            key={cat.id}
                            className={`
                                flex items-center space-x-2 p-2 border rounded-lg cursor-pointer 
                                ${
                                  newsForm.categories.includes(cat.id)
                                    ? "bg-orange-100 border-orange-500"
                                    : "hover:bg-gray-100"
                                }
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
                  {errors.categories && (
                    <p className="text-sm text-red-500">{errors.categories}</p>
                  )}
                </div>

                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category}</p>
                )}
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Article Image*</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 hover:border-orange-500 transition-colors ${
                    errors.image ? "border-red-500" : "border-gray-300"
                  }`}
                >
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
                        <p className="text-sm text-gray-600">
                          Click to change image
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 text-center">
                        <Upload className="w-12 h-12 mx-auto text-gray-400" />
                        <p className="text-gray-600">Click to upload image</p>
                        <p className="text-sm text-gray-400">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                {errors.image && (
                  <p className="text-sm text-red-500">{errors.image}</p>
                )}
              </div>
              {/* <CardTitle>{`Edit News Article (Age : ${selectedAge})`}</CardTitle> */}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title*</Label>
                <Input
                  id="title"
                  value={newsForm.title}
                  onChange={(e) => {
                    setNewsForm({ ...newsForm, title: e.target.value });
                    if (e.target.value.trim()) {
                      const newErrors = { ...errors };
                      delete newErrors.title;
                      setErrors(newErrors);
                    }
                  }}
                  placeholder="Enter article title"
                  className={`border-gray-200 ${
                    errors.title ? "border-red-500" : ""
                  }`}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description*</Label>
                <textarea
                  id="description"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 min-h-[200px] ${
                    errors.description ? "border-red-500" : "border-gray-200"
                  }`}
                  value={newsForm.description}
                  onChange={(e) => {
                    setNewsForm({ ...newsForm, description: e.target.value });
                    if (e.target.value.trim()) {
                      const newErrors = { ...errors };
                      delete newErrors.description;
                      setErrors(newErrors);
                    }
                  }}
                  placeholder="Detailed description of the article"
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              {/* Show in Home Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showOnTop"
                  checked={newsForm.showOnTop}
                  onCheckedChange={(checked) =>
                    setNewsForm({ ...newsForm, showOnTop: checked })
                  }
                />
                <Label htmlFor="showOnTop">Category Headline</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="main_news"
                  checked={newsForm.main_news}
                  onCheckedChange={(checked) =>
                    setNewsForm({ ...newsForm, main_news: checked })
                  }
                />
                <Label htmlFor="main_news">Main Headline</Label>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-orange-500 hover:bg-orange-600 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Article"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default EditNews;
