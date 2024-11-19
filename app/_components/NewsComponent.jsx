"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import GlobalApi from "../api/_services/GlobalApi";
import LoadingSpinner from "./LoadingSpinner";

const truncateTitle = (title, length = 40) =>
  title.length > length ? `${title.slice(0, length)}...` : title;

export default function NewsSection() {
  const [newsCategories, setNewsCategories] = useState([]);
  const [newsByCategory, setNewsByCategory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedAge } = 2;

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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 max-w-7xl w-screen text-gray-800">
      {/* Header */}
      <motion.header
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-orange-600">Axara News</h1>
      </motion.header>

      {/* Category Tabs */}
      <div className="flex space-x-4 overflow-x-auto pb-2 my-2 scrollbar-hide">
        {newsCategories.map((category) => (
          <button
            key={category.name}
            onClick={() => setSelectedCategory(category.name)}
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

      {/* News Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={selectedCategory}
        transition={{ duration: 0.8 }}
      >
        {currentCategoryNews.length > 0 ? (
          currentCategoryNews.map((article) => (
            <motion.div
  key={article.id}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
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

    {/* Spacer to push the button to the bottom */}
    <div className="flex justify-between items-center mt-auto">
      <span className="text-[9px] text-slate-500">{formatDate(article.created_at)}</span>
      <Link href={`/news/${selectedCategory.toLowerCase()}/${article.id}`}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="text-sm font-medium text-white bg-orange-500 px-4 py-2 rounded-lg shadow-md hover:bg-orange-600"
        >
          Read More
        </motion.button>
      </Link>
    </div>
  </div>
</motion.div>

          ))
        ) : (
          <p className="text-center col-span-full text-gray-600">
            No news available in this category.
          </p>
        )}
      </motion.div>
    </div>
  );
}
