import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import GlobalApi from '@/app/api/GlobalApi';
import toast from 'react-hot-toast';

function DeleteCategoryModal({ 
  isOpen, 
  onClose, 
  onCategoryDeleted,
  selectedCategory
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteCategory = async () => {
    setIsDeleting(true);
    try {
      const response = await GlobalApi.DeleteNewsCategory({ id: selectedCategory.id });
      if (response.status === 200) {
        onCategoryDeleted();
        onClose();
        toast.success("Category deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error("Failed to delete category. Please try again later.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border shadow-xxl rounded-lg bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Delete Category
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600">
            Are you sure you want to delete the category <span className="font-semibold">&quot;{selectedCategory.name}&quot;</span>?
          </p>
          <p className="mt-2 text-sm text-gray-500">
            This action cannot be undone. All news related to this category will be removed.
          </p>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDeleteCategory} 
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteCategoryModal;