"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import LoadingSpinner from "@/app/_components/LoadingSpinner";
import NewsDetails from "@/app/_components/NewsComponent";
import GlobalApi from "@/app/api/GlobalApi";

const truncateTitle = (title, length = 40) =>
  title.length > length ? `${title.slice(0, length)}...` : title;

export default function ViewAllNew() {
  const [newsCategories, setNewsCategories] = useState([]);
  const [newsByCategory, setNewsByCategory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showNews, setShowNews] = useState(false);
  const [showId, setShowId] = useState(null);
  const [selectedAge, setSelectedAge] = useState(3); // Default to age 3

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
      const response = await GlobalApi.FetchNews({ age: selectedAge });
      const categories = response.data.categories || [];
      const news = response.data.news || [];

      // Add "All" category
      setNewsCategories([{ name: "All" }, ...categories]);

      // Group news by categories
      const groupedNews = categories.reduce((acc, category) => {
        acc[category.name] = news.filter(
          (item) => item.news_category_id === category.id
        );
        return acc;
      }, {});

      // Add "All" category news (all news combined)
      groupedNews["All"] = news;

      setNewsByCategory(groupedNews);

      // Default to "All" category
      setSelectedCategory("All");
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [selectedAge]);

  const currentCategoryNews = newsByCategory[selectedCategory] || [];
  const filteredNews = currentCategoryNews.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase())||
      article.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  function getCategoryNameById(id) {
    const category = newsCategories.find((cat) => cat.id === id);
    return category ? category.name : null; // Returns null if no matching id is found
  }
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 text-gray-800 w-full">
      {/* Search Bar */}
      <motion.div
        className="w-full mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Filters Section */}
        <div className="flex gap-4 mb-6">
            {/* Dropdown for Age Filter */}
            <div className="relative w-full max-w-xs">
            <select
                value={selectedAge}
                onChange={(e) => setSelectedAge(Number(e.target.value))}
                className="appearance-none w-full bg-white border-2 text-gray-800 
                        py-3 px-4 rounded-lg shadow-md 
                        focus:outline-none focus:ring-2 focus:ring-orange-500
                        transition duration-300 ease-in-out
                        text-base font-medium"
            >
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((age) => (
                <option 
                    key={age} 
                    value={age} 
                    className="bg-white text-gray-800 hover:bg-blue-50"
                >
                    Age {age}
                </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg 
                className="fill-current h-5 w-5" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20"
                >
                <path 
                    d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                />
                </svg>
            </div>
            </div>
            <input
            type="text"
            placeholder="Search news..."
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

      </motion.div>

      {/* Category Tabs */}
      <div className="w-full max-w-[82vw] mb-4">
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {newsCategories.map((category) => (
            <button
              key={category.name}
              onClick={() => {
                setSelectedCategory(category.name);
                setShowId(null);
                setShowNews(false);
                setSearchQuery("");
              }}
              className={`whitespace-nowrap px-4 py-2 font-medium rounded-full ${
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

      {/* News Cards */}
      {showNews && showId ? (
        <NewsDetails id={showId} />
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={selectedCategory}
          transition={{ duration: 0.8 }}
        >
          {filteredNews.length > 0 ? (
            filteredNews.map((article) => (
              <motion.div
                key={article.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white shadow-md cursor-pointer rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                onClick={() => {
                  setShowId(article.id);
                  setShowNews(true);
                }}
              >
                {/* Image with fixed height */}
                <div className="h-48 w-full">
                  <Image
                    src={`https://wowfy.in/testusr/images/${article.image_url}`}
                    alt={article.title}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content Area */}
                <div className="flex flex-col flex-grow p-4">
                  {/* Title */}
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    {truncateTitle(article.title)}
                  </h3>

                  {/* Footer */}
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-sm text-gray-500">
                      {formatDate(article.created_at)}
                    </span>
                    <div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-xs font-medium text-orange-500 px-4 py-2 relative"
                      >
                        <span className="pb-1 ">
                          {getCategoryNameById(article.news_category_id)}
                        </span>
                      </motion.div>
                    </div>
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
      )}
    </div>
  );
}
