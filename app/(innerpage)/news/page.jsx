"use client";
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddCategories from './_components/AddCategories/AddCategories';
import AddNews from './_components/AddNews/AddNews';
import ViewAllNews from './_components/ViewAllNews/ViewAllNews';
import useAuth from '@/app/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const NewsAdminPanel = () => {

  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Only redirect after the authentication check is complete
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/10 shadow-lg z-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
          <p className="text-xl font-semibold">Loading...</p>
        </div>
      </div>
    )
  }
  
  // Only render the protected content if authenticated
  if (!isAuthenticated) {
    return null; // Return nothing while redirecting
  }

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