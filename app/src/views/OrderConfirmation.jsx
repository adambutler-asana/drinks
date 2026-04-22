import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';
import { createOrder } from '../services/firebase';

export default function OrderConfirmation() {
  const { items, eventId, setQuantity, clearOrder, totalItems } = useOrder();
  const [name, setName] = useState(() => sessionStorage.getItem('guest_name') || '');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit() {
    if (!name.trim() || submitting || totalItems === 0) return;
    setSubmitting(true);
    sessionStorage.setItem('guest_name', name.trim());

    await createOrder({
      eventId: eventId || null,
      guestName: name.trim(),
      items: items.map((i) => ({
        recipeId: i.recipeId,
        name: i.name,
        quantity: i.quantity,
      })),
    });

    setSubmitted(true);
    clearOrder();

    setTimeout(() => {
      navigate('/queue');
    }, 1500);
  }

  if (submitted) {
    return (
      <div className="admin-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="confirmation-msg animate-in">
          <h2>Order Placed!</h2>
          <p>Heading to the queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <button
          className="btn-back"
          onClick={() => navigate(-1)}
          aria-label="Back to menu"
        >
          ←
        </button>
        <h1 style={{ margin: 0 }}>Your Order</h1>
      </div>

      {items.length === 0 ? (
        <div className="empty-state" style={{ margin: '24px 0' }}>
          No drinks in your order.<br />
          Tap the back button to add some!
        </div>
      ) : (
        items.map((item) => (
          <div key={item.recipeId} className="admin-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="admin-card-name">{item.name}</div>
            </div>
            <div className="order-qty-controls">
              <button
                className="order-qty-btn"
                onClick={() => setQuantity(item.recipeId, item.quantity - 1)}
              >
                −
              </button>
              <span className="order-qty-num">{item.quantity}</span>
              <button
                className="order-qty-btn"
                onClick={() => setQuantity(item.recipeId, item.quantity + 1)}
              >
                +
              </button>
            </div>
          </div>
        ))
      )}

      <div className="form-group" style={{ marginTop: 24 }}>
        <label className="form-label">Your Name</label>
        <input
          className="form-input"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>

      <button
        className="btn btn-primary btn-block btn-lg"
        disabled={!name.trim() || submitting || totalItems === 0}
        onClick={handleSubmit}
      >
        {submitting ? 'Submitting...' : `Submit Order (${totalItems} drink${totalItems !== 1 ? 's' : ''})`}
      </button>
    </div>
  );
}
