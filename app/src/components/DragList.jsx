import { useState, useRef, useCallback } from 'react';

export default function DragList({ items, onReorder, renderItem }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const dragItemRef = useRef(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const itemRectsRef = useRef([]);
  const containerRef = useRef(null);

  const captureRects = useCallback(() => {
    if (!containerRef.current) return;
    const children = containerRef.current.children;
    itemRectsRef.current = Array.from(children).map((el) => {
      const rect = el.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom, mid: rect.top + rect.height / 2 };
    });
  }, []);

  function handleDragStart(index, e) {
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    startYRef.current = touch.clientY;
    currentYRef.current = touch.clientY;
    setDragIndex(index);
    setOverIndex(index);
    captureRects();

    dragItemRef.current = containerRef.current.children[index];
    dragItemRef.current.style.zIndex = '100';
    dragItemRef.current.style.transition = 'none';

    const onMove = (ev) => {
      ev.preventDefault();
      const t = ev.touches ? ev.touches[0] : ev;
      currentYRef.current = t.clientY;
      const delta = t.clientY - startYRef.current;
      if (dragItemRef.current) {
        dragItemRef.current.style.transform = `translateY(${delta}px)`;
      }
      // Determine which index we're over
      const rects = itemRectsRef.current;
      for (let i = 0; i < rects.length; i++) {
        if (t.clientY < rects[i].mid) {
          setOverIndex(i);
          return;
        }
      }
      setOverIndex(rects.length - 1);
    };

    const onEnd = () => {
      if (dragItemRef.current) {
        dragItemRef.current.style.zIndex = '';
        dragItemRef.current.style.transition = '';
        dragItemRef.current.style.transform = '';
      }
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);

      setDragIndex((prevDrag) => {
        setOverIndex((prevOver) => {
          if (prevDrag !== null && prevOver !== null && prevDrag !== prevOver) {
            onReorder(prevDrag, prevOver);
          }
          return null;
        });
        return null;
      });
    };

    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
  }

  return (
    <div ref={containerRef}>
      {items.map((item, i) => {
        let className = 'drag-item';
        if (dragIndex !== null && i === dragIndex) className += ' drag-item--dragging';
        if (dragIndex !== null && overIndex !== null && i !== dragIndex) {
          if (dragIndex < overIndex && i > dragIndex && i <= overIndex) {
            className += ' drag-item--shift-up';
          }
          if (dragIndex > overIndex && i < dragIndex && i >= overIndex) {
            className += ' drag-item--shift-down';
          }
        }
        return (
          <div key={item.id} className={className}>
            {renderItem(item, i, handleDragStart)}
          </div>
        );
      })}
    </div>
  );
}
