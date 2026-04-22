import { useEffect, useState } from 'react';
import { subscribePendingOrders, completeOrder } from '../services/firebase';
import { seedRecipes } from '../services/seedData';
import { useRecipes } from '../hooks/useRecipes';
import RecipeModal from '../components/RecipeModal';
import BottomNav from '../components/BottomNav';

function timeAgo(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);
  const recipes = useRecipes();

  async function handleSeed() {
    setSeeding(true);
    try {
      const didSeed = await seedRecipes();
      setSeedDone(true);
      if (!didSeed) alert('Recipes already exist in the database — no need to seed again.');
    } catch (err) {
      alert('Error seeding recipes: ' + err.message);
    }
    setSeeding(false);
  }


  useEffect(() => {
    return subscribePendingOrders(null, setOrders);
  }, []);

  function handleDrinkTap(recipeId) {
    const recipe = recipes?.find((r) => r.id === recipeId);
    if (recipe) setSelectedRecipe(recipe);
  }

  async function handleComplete(orderId) {
    await completeOrder(orderId);
  }

  if (!orders) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-page">
      <h1>Orders</h1>

      {(!recipes || recipes.length === 0) && !seedDone && (
        <div className="admin-card" style={{ textAlign: 'center', padding: 24 }}>
          <p style={{ color: '#aaa', marginBottom: 16, fontFamily: "'SF Mono', monospace", fontSize: '0.875rem' }}>
            No recipes in the database yet. Tap below to load all cocktails.
          </p>
          <button className="btn btn-primary btn-lg btn-block" onClick={handleSeed} disabled={seeding}>
            {seeding ? 'Seeding...' : 'Seed Recipes'}
          </button>
        </div>
      )}

      {seedDone && (
        <div className="admin-card animate-in" style={{ textAlign: 'center', padding: 24 }}>
          <p style={{ color: '#2d7a4f', fontFamily: "'SF Mono', monospace", fontSize: '0.875rem' }}>
            Recipes loaded! Your menu is ready.
          </p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="empty-state">No pending orders</div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="admin-card animate-in">
            <div className="order-header">
              <div className="admin-card-name" style={{ fontSize: '1.25rem' }}>
                {order.guestName}
              </div>
              <span className="time-ago">{timeAgo(order.createdAt)}</span>
            </div>
            <div className="order-items">
              {order.items?.map((item, i) => (
                <div key={i} className="order-item-row">
                  <span className="order-item-qty">{item.quantity}×</span>
                  <span className="order-item-name">{item.name}</span>
                  <button
                    className="order-item-view"
                    onClick={() => handleDrinkTap(item.recipeId)}
                    aria-label={`View ${item.name} recipe`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              className="btn-complete"
              onClick={() => handleComplete(order.id)}
            >
              Complete
            </button>
          </div>
        ))
      )}

      <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      <BottomNav type="admin" />
    </div>
  );
}
