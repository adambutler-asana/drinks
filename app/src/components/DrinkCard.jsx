import { useState, useRef, useEffect, useCallback } from 'react';
import { useOrder } from '../context/OrderContext';

export default function DrinkCard({ recipe }) {
  const { addItem, setQuantity, getItemQuantity } = useOrder();
  const qty = getItemQuantity(recipe.id);
  const [isExpanded, setIsExpanded] = useState(false);
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsExpanded(false), 3000);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Collapse if qty reaches 0 externally
  useEffect(() => {
    if (qty === 0) {
      setIsExpanded(false);
      clearTimeout(timerRef.current);
    }
  }, [qty]);

  function handleAdd() {
    addItem(recipe.id, recipe.name);
    setIsExpanded(true);
    resetTimer();
  }

  function handleExpand() {
    setIsExpanded(true);
    resetTimer();
  }

  function handleIncrement() {
    setQuantity(recipe.id, qty + 1);
    resetTimer();
  }

  function handleDecrement() {
    if (qty <= 1) {
      setQuantity(recipe.id, 0);
      setIsExpanded(false);
      clearTimeout(timerRef.current);
    } else {
      setQuantity(recipe.id, qty - 1);
      resetTimer();
    }
  }

  return (
    <div className="drink-card">
      <div className="drink-info">
        <div className="drink-name">{recipe.name}</div>
        <div className="drink-desc">{recipe.shortDescription}</div>
      </div>
      <div className="drink-action">
        {qty === 0 ? (
          <button className="btn-add" onClick={handleAdd}>+</button>
        ) : (
          <div
            className={`qty-pill ${isExpanded ? 'qty-pill--expanded' : 'qty-pill--collapsed'}`}
            onClick={!isExpanded ? handleExpand : undefined}
          >
            <span className="qty-pill-label">{qty}x</span>
            <div className="qty-pill-inner">
              <button className="qty-pill-btn" onClick={handleDecrement}>−</button>
              <span className="qty-pill-num">{qty}</span>
              <button className="qty-pill-btn" onClick={handleIncrement}>+</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
