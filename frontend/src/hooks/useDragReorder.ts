"use client";

import { useEffect, useState } from "react";

type Sortable = { ID: number; SortOrder: number };

export function useDragReorder<T extends Sortable>(
  items: T[] | undefined,
  onPersist: (id: number, sortOrder: number) => void
) {
  const [ordered, setOrdered] = useState<T[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    if (items && dragIndex === null) {
      setOrdered([...items].sort((a, b) => a.SortOrder - b.SortOrder));
    }
  }, [items, dragIndex]);

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setOrdered((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(index);
  }

  function handleDrop() {
    setDragIndex(null);
    ordered.forEach((item, i) => {
      if (item.SortOrder !== i) {
        onPersist(item.ID, i);
      }
    });
  }

  return { ordered, handleDragStart, handleDragOver, handleDrop, isDragging: dragIndex !== null };
}
