import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Eye,
  FileText,
  Edit2,
  X,
  AlertTriangle,
  Trash2,
  Check,
} from "lucide-react";
import GlobalApi from "@/app/api/GlobalApi";
import Link from "next/link";
import LoadingSpinner from "@/app/_components/LoadingSpinner";
import NewsDetails from "../NewsDetails/NewsDetails";
import { FaArrowLeft } from "react-icons/fa";
import EditNews from "../EditNewsSection/EditNews";
import toast, { Toaster } from "react-hot-toast";

const truncateTitle = (title, length = 40) =>
  title.length > length ? `${title.slice(0, length)}...` : title;

export default function ViewAllNews() {
  const [newsCategories, setNewsCategories] = useState([]);
  const [newsByCategory, setNewsByCategory] = useState({});
  // const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showNews, setShowNews] = useState(false);
  const [showId, setShowId] = useState(null);
  const [selectedAge, setSelectedAge] = useState(3);
  const [hoveredNewsId, setHoveredNewsId] = useState(null);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showNewsSection, setShowNewsSection] = useState(false);
  const [showEditSection, setShowEditSection] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsReports, setNewsReports] = useState([]);
  const [regionId, setRegionId] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (date) => {
    const options = {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    };

    return new Date(date).toLocaleString("en-IN", options).replace(",", "");
  };

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const response = await GlobalApi.FetchNews({ age: selectedAge ,regionId});
      const { categories = [], news = [] } = response.data;

      const allCategory = { id: "all", name: "All" };
      setNewsCategories([allCategory, ...categories]);

      // Group news by categories
      const groupedNews = categories.reduce((acc, category) => {
        acc[category.name] = news.filter((item) =>
          item.categoryIds.split(",").map(Number).includes(category.id)
        );
        return acc;
      }, {});
      groupedNews["All"] = news;
      setNewsByCategory(groupedNews);
      setSelectedCategory("All");
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNewsReports = async (newsId) => {
    try {
      // Mock API call - replace with actual API
      const response = await GlobalApi.FetchNewsReports(newsId);
      setNewsReports(response.data.reports || []);
    } catch (error) {
      console.error("Error fetching news reports:", error);
      setNewsReports([]);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [selectedAge,regionId]);

  const currentCategoryNews = newsByCategory[selectedCategory] || [];
  const filteredNews = currentCategoryNews.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function getCategoryNamesByIds(ids) {
    // Handle case where ids is a single ID or an array of IDs
    const idsArray = Array.isArray(ids) ? ids : [ids];

    // Get category names for the given IDs
    const categoryNames = idsArray.map((id) => {
      const category = newsCategories.find((cat) => cat.id === id);
      return category ? category.name : null; // Return category name or null if not found
    });

    // Filter out null values and join the category names with commas
    return categoryNames.filter((name) => name !== null).join(", ");
  }

  const handleViewReports = (article) => {
    fetchNewsReports(article.id);
    setSelectedNews(article);
    setShowReportsModal(true);
  };

  const handleViewNews = (article) => {
    setSelectedNews(article);
    setShowNewsSection(true);
  };
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
  const handleEditNews = (article) => {
    setSelectedNews(article);
    setShowEditSection(true);
  };

  const handleDeleteNews = (article) => {
    setSelectedNews(article);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirmation = async () => {
    setIsDeleting(true);
    try {
      // Replace with your actual API endpoint for deleting news
      const response = await GlobalApi.DeleteNewsArticle(selectedNews.id);

      if (response.status === 201) {
        toast.success("News Deleted Successfully");
      } else {
        const errorMessage =
          response.data?.message || "News Deleted Successfully";
        toast.error(`Error: ${errorMessage}`);
      }
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete news:", error);
      // Optionally show an error toast or message
      toast.error(`Error: ${error}`);
    } finally {
      setIsDeleting(false);
      fetchNews();
    }
  };

  console.log("selectedNews", selectedNews);

  const ReportsModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-lg w-[800px] max-h-[800px] p-8 relative"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <AlertTriangle className="mr-3 text-orange-500" size={32} />
            Reports for: {selectedNews?.title}
          </h2>
          <button
            onClick={() => setShowReportsModal(false)}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={28} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[650px] space-y-4">
          {newsReports.length > 0 ? (
            newsReports.map((report, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-100 rounded-lg p-5 border-l-4 border-orange-500"
              >
                <p className="text-gray-700 text-base">{report.reportText}</p>
                <div className="mt-2 text-sm text-gray-500">
                  Reported on: {new Date().toLocaleDateString()}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-16">
              <AlertTriangle
                className="mx-auto mb-6 text-orange-500"
                size={64}
              />
              <p className="text-xl">No reports found for this news</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster />
      {showNewsSection ? (
        <>
          <button
            onClick={() => setShowNewsSection(false)}
            className="flex items-center p-2 bg-orange-100 text-orange-700 px-4 py-2 rounded hover:bg-orange-200 transition-colors"
          >
            <FaArrowLeft className="w-6 h-3 text-gray-700 hover:text-gray-900" />
            <span className="ml-2 text-gray-700">Back</span>
          </button>
          {/* <NewsSection selectedNews={selectedNews} /> */}
          <NewsDetails id={selectedNews.id} selectedAge={selectedAge} />
        </>
      ) : showEditSection ? (
        <>
          <button
            onClick={() => setShowEditSection(false)}
            className="flex items-center p-2 bg-orange-100 text-orange-700 px-4 py-2 rounded hover:bg-orange-200 transition-colors"
          >
            <FaArrowLeft className="w-6 h-3 text-gray-700 hover:text-gray-900" />
            <span className="ml-2 text-gray-700">Back</span>
          </button>
          <EditNews
            selectedNews={selectedNews}
            selectedAge={selectedAge}
            setShowEditSection={setShowEditSection}
            fetchNews={fetchNews}
          />
        </>
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* Filters Section */}
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
          <div className="flex space-x-4 mb-8 items-center">
            <div className="relative w-64">
              <select
                value={selectedAge}
                onChange={(e) => setSelectedAge(Number(e.target.value))}
                className="w-full appearance-none bg-white border-2 border-orange-500 text-gray-800 
                  py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-orange-600
                  text-base font-medium transition duration-300"
              >
                {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((age) => (
                  <option
                    key={age}
                    value={age}
                    className="bg-white text-gray-800 hover:bg-orange-50"
                  >
                    Age {age}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                <svg
                  className="fill-current h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <div className="flex-grow relative">
              <input
                type="text"
                placeholder="Search news..."
                className="w-full px-4 py-3 pl-10 border-2 border-orange-500 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-orange-600 transition duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="w-full mb-6">
            <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
              {newsCategories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`whitespace-nowrap px-4 py-2 font-medium rounded-full transition duration-300 ${
                    selectedCategory === category.name
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-orange-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          <>
            {/* News Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {filteredNews.length > 0 ? (
                filteredNews.map((article) => (
                  <motion.div
                    key={article.id}
                    className="bg-white shadow-md rounded-lg overflow-hidden relative group"
                    onMouseEnter={() => setHoveredNewsId(article.id)}
                    onMouseLeave={() => setHoveredNewsId(null)}
                  >
                    {/* Image */}
                    <div className="h-56 w-full relative">
                      <Image
                        src={`https://wowfy.in/testusr/images/${article.image_url}`}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />

                      {/* Hover Overlay */}
                      {hoveredNewsId === article.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center space-y-4 z-10 p-4"
                        >
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewNews(article)}
                            className="w-4/5 bg-white text-orange-600 py-2 px-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-orange-50 transition"
                          >
                            <Eye className="mr-2" />
                            <span>View News</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewReports(article)}
                            className="w-4/5 bg-white text-orange-600 py-2 px-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-orange-50 transition"
                          >
                            <FileText className="mr-2" />
                            <span>View Reports</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEditNews(article)}
                            className="w-4/5 bg-white text-orange-600 py-2 px-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-orange-50 transition"
                          >
                            <Edit2 className="mr-2" />
                            <span>Edit News</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteNews(article)}
                            className="w-4/5 bg-white text-red-600 py-2 px-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-red-50 transition"
                          >
                            <Trash2 className="mr-2" />
                            <span>Delete News</span>
                          </motion.button>
                        </motion.div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        {truncateTitle(article.title)}
                      </h3>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {formatDate(article.created_at)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-center col-span-full text-gray-600">
                  No news found.
                </p>
              )}
            </motion.div>
          </>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>{showReportsModal && <ReportsModal />}</AnimatePresence>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-sm w-full"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Confirm Deletion
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this news article? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmation}
                disabled={isDeleting}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
