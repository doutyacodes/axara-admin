import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import GlobalApi from '@/app/api/GlobalApi';
import AddCategoryModal from '../AddCategoryModal/AddCategoryModal';
import { Toaster } from 'react-hot-toast';

function AddCategories() {
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryLoading, setCategoryLoading] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);


    const getNewsCategories = async () => {
      setCategoryLoading(true);
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          setCategoryLoading(false);
          return;
        }
  
        const response = await GlobalApi.GetNewsCategories(token);
        if (response.status === 200) {
          setCategories(response.data.categories);
          console.log(response.data.categories);
          }
      } catch (err) {
        console.log(err);
      } finally {
        setCategoryLoading(false);
      }
    };
  
    useEffect(() => {
      getNewsCategories();
    }, []);

    const filteredCategories = categories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    const handleCategoryAdded = () => {
      getNewsCategories();
    };
  
  return (
    <>
      <Toaster />
      <Card className="border-none shadow-lg">
          <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="space-y-6">
              {/* Search and Add Category */}
              <div className="flex gap-4">
              <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200"
                  />
              </div>
              <Button 
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                </Button>
              </div>

              {/* Categories List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map(category => (
                  <Card key={category.id} className="group hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                      <span className="font-medium">{category.name}</span>
                      <Button 
                          variant="ghost" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-500"
                      >
                          <X className="w-4 h-4" />
                      </Button>
                      </div>
                  </CardContent>
                  </Card>
              ))}
              </div>
          </div>
          </CardContent>
      </Card>

      <AddCategoryModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onCategoryAdded={handleCategoryAdded}
      />
    </>
  )
}

export default AddCategories