"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import LoadingSpinner from "@/app/_components/LoadingSpinner";

export default function NewsDetails({ id, selectedAge }) {
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch("/api/fetchNews/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: parseInt(id), age: selectedAge }),
        });
        const data = await response.json();
        if (response.ok) {
          setArticle(data);
        } else {
          setError(data.error || "Failed to fetch news");
        }
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Failed to fetch news");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-100 via-white to-orange-50 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-700">{error}</h2>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-100 via-white to-orange-50 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-700">
          Article not found. Please try another one!
        </h2>
      </div>
    );
  }

  const { title, category, image_url, date, description, questions, meanings } =
    article;
// console.log("meanings",meanings)
  // Replace words with hoverable bolded spans
  const replaceWordsWithHover = (text) => {
    return meanings.reduce((acc, { word, description }) => {
      const regex = new RegExp(`\\b(${word})\\b`, "gi");
      return acc.replace(
        regex,
        `<span class="group font-bold cursor-pointer relative hover:text-orange-500 text-blue-500">
        <span className="">
        ${word}
        </span>
          <div class="absolute left-0 bottom-full mb-2 hidden group-hover:flex w-64 p-2 bg-white shadow-md border rounded-lg z-10 text-sm text-gray-700">${description}</div>
        </span>`
      );
    }, text);
  };

  // Process summary and paragraphs
  // const processedSummary = replaceWordsWithHover(summary);
  const processedParagraphs = description
    .split("\n\n")
    .map((para) => replaceWordsWithHover(para));

  return (
    <div className="text-gray-800 p-2">
      {/* Header Section */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-sm text-orange-500 uppercase font-medium mb-2">
          {category}
        </div>
        <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
        <p className="text-sm text-gray-500 mt-2">{date}</p>
      </motion.div>

      {/* Image Section */}
      <motion.div
        className="w-fit rounded-lg shadow-lg mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Image
          src={`https://wowfy.in/testusr/images/${image_url}`}
          alt={title}
          width={800}
          height={300}
          className="rounded-md"
        />
      </motion.div>

      {/* Summary Section */}
      {/* <motion.div
        className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6 rounded-md shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        dangerouslySetInnerHTML={{ __html: processedSummary }}
      ></motion.div> */}

      {/* Content Section */}
      <motion.div
        className="text-lg text-gray-700 space-y-6 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {processedParagraphs.map((paragraph, index) => (
          <p
            key={index}
            className=" text-justify"
            dangerouslySetInnerHTML={{ __html: paragraph }}
          ></p>
        ))}
      </motion.div>

      {/* Questions Section */}
      {questions && questions.length > 0 && (
        <motion.div
          className="mt-8 bg-gray-100 p-6 rounded-md shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Questions for revision</h2>
          <ol className="list-decimal pl-6 space-y-4">
            {questions.map((question, index) => (
              <li key={index} className="text-lg text-gray-700">
                {question}
              </li>
            ))}
          </ol>
        </motion.div>
      )}
    </div>
  );
}
