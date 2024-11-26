"use client";
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddCategories from './_components/AddCategories/AddCategories';
import AddNews from './_components/AddNews/AddNews';
import ViewAllNews from './_components/ViewAllNews/ViewAllNews';

const NewsAdminPanel = () => {

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="p-6 max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">News Admin Panel</h1>
          <p className="text-gray-600">Manage your news articles and categories</p>
        </header>

        <Tabs defaultValue="add-news" className="w-full">
          <TabsList className="w-full mb-8 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger 
              value="add-news" 
              className="flex-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              Add News
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className="flex-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              Categories
            </TabsTrigger>

            <TabsTrigger 
              value="view-news" 
              className="flex-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              View All News
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add-news">
            <AddNews />
          </TabsContent>

          <TabsContent value="categories">
            <AddCategories />
          </TabsContent>

          <TabsContent value="view-news">
            <ViewAllNews />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NewsAdminPanel;