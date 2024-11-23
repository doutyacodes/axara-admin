"use client";
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddTopic from './_components/AddTopic/AddTopic';
import AddQuiz from './_components/AddQuiz/AddQuiz';

const NewsAdminPanel = () => {

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="p-6 max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">Learn Topic & Quiz</h1>
          <p className="text-gray-600">Manage your news articles and categories</p>
        </header>

        <Tabs defaultValue="add-topic" className="w-full">
          <TabsList className="w-full mb-8 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger 
              value="add-topic" 
              className="flex-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              Add Topic
            </TabsTrigger>
            <TabsTrigger 
              value="add-quiz" 
              className="flex-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              Add Learn Quiz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add-topic">
            <AddTopic />
          </TabsContent>

          <TabsContent value="add-quiz">
            <AddQuiz />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NewsAdminPanel;