import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipes } from '../hooks/useRecipes';
import { updateRecipeSortOrders } from '../services/firebase';
import { CATEGORIES } from '../services/seedData';
import DragList from '../components/DragList';
import BottomNav from '../components/BottomNav';

export default function AdminRecipes() {
  const recipes = useRecipes();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  // Local reorder state: { [category]: [recipe, ...] }
  const [localOrder, setLocalOrder] = useState(null);

  const grouped = CATEGORIES.map((cat) => {
    const drinks = (localOrder?.[cat] || recipes?.filter((r) => r.category === cat) || [])
      .slice()
      .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
    return { category: cat, drinks };
  }).filter((g) => g.drinks.length > 0);

  function handleEdit() {
    // Snapshot current order into local state
    const order = {};
    for (const g of grouped) {
      order[g.category] = g.drinks.slice();
    }
    setLocalOrder(order);
    setIsEditing(true);
  }

  function handleCancel() {
    setLocalOrder(null);
    setIsEditing(false);
  }

  const handleReorder = useCallback((category, fromIndex, toIndex) => {
    setLocalOrder((prev) => {
      const updated = { ...prev };
      const list = [...updated[category]];
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      updated[category] = list;
      return updated;
    });
  }, []);

  async function handleSave() {
    if (!localOrder) return;
    setSaving(true);
    const updates = [];
    for (const cat of Object.keys(localOrder)) {
      localOrder[cat].forEach((recipe, index) => {
        if (recipe.sortOrder !== index) {
          updates.push({ id: recipe.id, sortOrder: index });
        }
      });
    }
    if (updates.length > 0) {
      await updateRecipeSortOrders(updates);
    }
    setLocalOrder(null);
    setIsEditing(false);
    setSaving(false);
  }

  if (!recipes) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="recipes-header">
        <h1>Recipes</h1>
        {isEditing ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-text" onClick={handleCancel} disabled={saving}>
              Cancel
            </button>
            <button className="btn-text btn-text--primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Done'}
            </button>
          </div>
        ) : (
          <button className="btn-text" onClick={handleEdit}>
            Edit
          </button>
        )}
      </div>

      {grouped.map((group) => (
        <div key={group.category} style={{ marginBottom: 24 }}>
          <div className="recipes-category-label">
            {group.category}
          </div>
          {isEditing ? (
            <DragList
              items={group.drinks}
              onReorder={(from, to) => handleReorder(group.category, from, to)}
              renderItem={(recipe, i, onDragStart) => (
                <div className="admin-card recipe-row">
                  <div
                    className="drag-handle"
                    onTouchStart={(e) => onDragStart(i, e)}
                    onMouseDown={(e) => onDragStart(i, e)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="8" cy="6" r="1.5" />
                      <circle cx="16" cy="6" r="1.5" />
                      <circle cx="8" cy="12" r="1.5" />
                      <circle cx="16" cy="12" r="1.5" />
                      <circle cx="8" cy="18" r="1.5" />
                      <circle cx="16" cy="18" r="1.5" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="admin-card-name">{recipe.name}</div>
                  </div>
                </div>
              )}
            />
          ) : (
            group.drinks.map((recipe) => (
              <div
                key={recipe.id}
                className="admin-card"
                onClick={() => navigate(`/admin/recipes/${recipe.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="admin-card-name">
                  {recipe.name}
                </div>
                <div className="admin-card-meta">{recipe.shortDescription}</div>
              </div>
            ))
          )}
        </div>
      ))}

      {!isEditing && (
        <button className="fab" onClick={() => navigate('/admin/recipes/new')}>
          +
        </button>
      )}
      <BottomNav type="admin" />
    </div>
  );
}
