"use client"
// context/DataContext.js
import React, { createContext, useState, useContext } from 'react';

// Create the Context
const DataContext = createContext();

// Provider component to wrap the app with context
export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null); // Store the data here

  // Function to update data
  const setDataFromPage = (newData) => {
    setData(newData); // This will set the data that you want to share
  };

  return (
    <DataContext.Provider value={{ data, setDataFromPage }}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to access data
export const useData = () => useContext(DataContext);
