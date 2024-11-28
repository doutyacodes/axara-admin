"use client"

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, UserPlus, ToggleLeft, ToggleRight, Users } from 'lucide-react';
import Link from 'next/link';
import GlobalApi from '@/app/api/GlobalApi';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await GlobalApi.FetchAllUsers(); // Implement this method in your API service
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await GlobalApi.UpdateUserStatus(userId, !currentStatus);
      // Update local state to reflect the change
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_active: !currentStatus } : user
      ));
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const renderPagination = () => {
    return (
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">
          Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
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

  const renderUserStatus = (isActive) => {
    return isActive ? (
      <span className="flex items-center text-green-600">
        <ToggleRight className="mr-2" size={20} /> Active
      </span>
    ) : (
      <span className="flex items-center text-red-600">
        <ToggleLeft className="mr-2" size={20} /> Inactive
      </span>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan="6" className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          </td>
        </tr>
      );
    }

    if (currentUsers.length === 0) {
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
                No Users Found
              </h2>
              <p className="text-gray-600 max-w-md">
                No users match your search criteria. Try adjusting your search term.
              </p>
            </div>
          </td>
        </tr>
      );
    }

    return currentUsers.map((user) => (
      <tr 
        key={user.id} 
        className="border-b hover:bg-orange-50 transition-colors"
      >
        <td className="px-4 py-3">{user.name}</td>
        <td className="px-4 py-3">{user.username}</td>
        <td className="px-4 py-3">{user.mobile}</td>
        <td className="px-4 py-3">
          {new Date(user.created_at).toLocaleDateString()}
        </td>
        <td className="px-4 py-3">{renderUserStatus(user.is_active)}</td>
        <td className="px-4 py-3 flex space-x-2">
          <button 
            onClick={() => toggleUserStatus(user.id, user.is_active)}
            className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded hover:bg-orange-200 transition-colors"
          >
            {user.is_active ? 'Deactivate' : 'Activate'}
          </button>
          <Link 
            href={`/users/${user.id}`}
            className="text-sm bg-orange-500 text-white px-3 py-1 rounded flex items-center hover:bg-orange-600 transition-colors"
          >
            <Users className="mr-2" size={16} /> Children
          </Link>
        </td>
      </tr>
    ));
  };

  return (
    <div className="min-h-screen bg-orange-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-orange-700 mb-6">
          User Management
        </h1>

        <div className="mb-6 flex space-x-4">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Users
            </label>
            <input
              type="text"
              placeholder="Search by name, username, or mobile"
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
                <th className="px-4 py-3 text-left">Username</th>
                <th className="px-4 py-3 text-left">Mobile</th>
                <th className="px-4 py-3 text-left">Created At</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {renderContent()}
            </tbody>
          </table>
          
          {!isLoading && currentUsers.length > 0 && renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;