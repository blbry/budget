/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/dialog";
import { Input } from "@/renderer/components/input";
import { Button } from "@/renderer/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/select";
import { Category } from "@/shared/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; parent_id: number | null }) => void;
  parentCategories: Category[];
}

export default function CategoryDialog({ open, onClose, onSubmit, parentCategories }: Props) {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setName('');
      setParentId(null);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({ name, parent_id: parentId });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category Name</label>
              <Input
                placeholder="Enter category name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Parent Category (optional)</label>
              <Select
                value={parentId?.toString() ?? '_none'}
                onValueChange={(value) => setParentId(value === '_none' ? null : parseInt(value, 10))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">None (Create parent category)</SelectItem>
                  {parentCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Category</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
