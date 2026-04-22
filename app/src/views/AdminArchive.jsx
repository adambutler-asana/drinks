import { useEffect, useState } from 'react';
import { subscribeCompletedOrders } from '../services/firebase';
import BottomNav from '../components/BottomNav';

export default function AdminArchive() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    return subscribeCompletedOrders(setOrders);
  }, []);

  if (!orders) return <div className="loading">Loading...</div>;

  const totalOrders = orders.length;
  const totalDrinks = orders.reduce(
    (sum, o) => sum + (o.items?.reduce((s, i) => s + i.quantity, 0) || 0),
    0
  );

  // Most popular drink
  const drinkCounts = {};
  orders.forEach((o) =>
    o.items?.forEach((i) => {
      drinkCounts[i.name] = (drinkCounts[i.name] || 0) + i.quantity;
    })
  );
  const topDrink = Object.entries(drinkCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="admin-page">
      <h1>Archive</h1>

      <div className="archive-stats">
        <div className="stat-card">
          <div className="stat-value">{totalOrders}</div>
          <div className="stat-label">Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalDrinks}</div>
          <div className="stat-label">Drinks</div>
        </div>
        {topDrink && (
          <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>{topDrink[0]}</div>
            <div className="stat-label">Most Popular ({topDrink[1]})</div>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">No completed orders yet</div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="admin-card-name">{order.guestName}</div>
              <span className="admin-card-meta">
                {order.completedAt?.toDate
                  ? order.completedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : ''}
              </span>
            </div>
            <div className="admin-card-meta" style={{ marginTop: 4 }}>
              {order.items?.map((i) => `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ''}`).join(' · ')}
            </div>
          </div>
        ))
      )}

      <BottomNav type="admin" />
    </div>
  );
}
