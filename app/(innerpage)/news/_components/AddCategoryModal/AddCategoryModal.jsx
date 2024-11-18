import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import GlobalApi from '@/app/api/GlobalApi';
import toast from 'react-hot-toast';

function AddCategoryModal({ 
  isOpen, 
  onClose, 
  onCategoryAdded 
}) {
  const [categoryName, setCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCategory = async () => {
    if (!categoryName.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await GlobalApi.CreateNewsCategory({ name: categoryName });
      
      if (response.status === 201) {
        onCategoryAdded();
        setCategoryName('');
        onClose();
        toast.success("Category added successfully")
      }
    } catch (error) {
        console.error("Failed to add category:", error);
      
        // Check for conflict error and show a specific toast message
        if (error.response?.status === 409) {
          toast.error("Category already exists. Please add a new category.");
        } else {
          toast.error("Failed to add category. Please try again later.");
        }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
        className="border shadow-xxl rounded-lg bg-white"
        >
        <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <div className="py-4">
            <Input 
            placeholder="Enter category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full"
            />
        </div>
        <DialogFooter>
            <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
            >
            Cancel
            </Button>
            <Button 
            onClick={handleAddCategory} 
            disabled={!categoryName.trim() || isSubmitting}
            >
            {isSubmitting ? 'Adding...' : 'Add Category'}
            </Button>
        </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}

export default AddCategoryModal;