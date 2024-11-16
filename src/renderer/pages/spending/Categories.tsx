/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEffect, useState } from 'react';
import { Category } from '@/shared/types';
import { Button } from '@/renderer/components/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/renderer/components/table';
import CategoryDialog from '@/renderer/components/CategoryDialog';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadCategories = async () => {
    const cats = await window.electron.categories.getAll();
    setCategories(cats);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const parentCategories = categories.filter(c => c.parent_id === null);

  const handleDeleteCategory = async (id: number) => {
    try {
      await window.electron.categories.delete(id);
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Category Management</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          Add Category
        </Button>
      </div>

      <CategoryDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        parentCategories={parentCategories}
        onSubmit={async (data) => {
          try {
            await window.electron.categories.create({
              name: data.name,
              parent_id: data.parent_id,
              type: 'expense',
              is_default: false
            });
            loadCategories();
          } catch (error) {
            console.error('Error adding category:', error);
          }
          setIsDialogOpen(false);
        }}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow
              key={category.id}
              className={category.parent_id ? 'pl-8' : ''}
            >
              <TableCell className={`${category.parent_id ? 'pl-8' : ''}`}>
                {category.name}
                {!category.is_default && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="ml-4 h-[21px] px-2 text-xs"
                  >
                    Delete
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
