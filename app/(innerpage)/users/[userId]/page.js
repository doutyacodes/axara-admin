"use client"
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import GlobalApi from '@/app/api/GlobalApi';
import { useRouter } from 'next/navigation';
import { calculateAge } from '@/lib/ageCalculate';
import LoadingSpinner from '@/app/_components/LoadingSpinner';

const ChildrenManagement = ({params}) => {
  const router = useRouter();
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const childrenPerPage = 10;
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function fetchParams() {
      const resolvedParams = await params;
      setUserId(resolvedParams.userId);
    }
    fetchParams();
  }, [params]);

  const fetchChildren = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const response = await GlobalApi.FetchUserChildren(userId);
      setChildren(response.data.children);
    } catch (error) {
      console.error("Error fetching children:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [userId]);

  // Filter children based on search term
  const filteredChildren = children.filter(child => 
    child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.gender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastChild = currentPage * childrenPerPage;
  const indexOfFirstChild = indexOfLastChild - childrenPerPage;
  const currentChildren = filteredChildren.slice(indexOfFirstChild, indexOfLastChild);

  const totalPages = Math.ceil(filteredChildren.length / childrenPerPage);

  const renderPagination = () => {
    return (
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">
          Showing {indexOfFirstChild + 1} to {Math.min(indexOfLastChild, filteredChildren.length)} of {filteredChildren.length} children
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 bg-orange-100 text-orange-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 bg-orange-100 text-orange-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan="6" className="text-center p-8">
            {/* <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div> */}
            <LoadingSpinner />
          </td>
        </tr>
      );
    }

    if (currentChildren.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="text-center p-8">
            <div className="flex flex-col items-center justify-center">
              <div className="bg-orange-100 p-4 rounded-full mb-4">
                <UserPlus
                  className="text-orange-500" 
                  size={48} 
                  strokeWidth={1.5}
                />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                No Children Found
              </h2>
              <p className="text-gray-600 max-w-md">
                No children are linked to this user account or match your search criteria.
              </p>
            </div>
          </td>
        </tr>
      );
    }

    return currentChildren.map((child) => (
      <tr 
        key={child.id} 
        className="border-b hover:bg-orange-50 transition-colors"
      >
        <td className="px-4 py-3">{child.name}</td>
        <td className="px-4 py-3">{child.gender}</td>
        <td className="px-4 py-3">{calculateAge(child.age)} Years</td>
        <td className="px-4 py-3">{child.grade || "null"}</td>
        <td className="px-4 py-3">
          {new Date(child.createdAt).toLocaleDateString()}
        </td>
        {/* <td className="px-4 py-3 flex space-x-2">
          <button 
            onClick={() => router.push(`/admin/children/${child.id}/activities`)}
            className="text-sm bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition-colors"
          >
            View Activities
          </button>
        </td> */}
      </tr>
    ));
  };

  return (
    <div className="min-h-screen bg-orange-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-orange-700">
            Children Management
          </h1>
          <button 
            onClick={() => router.back()}
            className="bg-orange-100 text-orange-700 px-4 py-2 rounded hover:bg-orange-200 transition-colors"
          >
            Back to Users
          </button>
        </div>

        <div className="mb-6 flex space-x-4">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Children
            </label>
            <input
              type="text"
              placeholder="Search by name, gender, or grade"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on new search
              }}
              className="w-full p-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-orange-100">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Gender</th>
                <th className="px-4 py-3 text-left">Age</th>
                <th className="px-4 py-3 text-left">Grade</th>
                <th className="px-4 py-3 text-left">Created At</th>
                {/* <th className="px-4 py-3 text-left">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {renderContent()}
            </tbody>
          </table>
          
          {!isLoading && currentChildren.length > 0 && renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default ChildrenManagement;