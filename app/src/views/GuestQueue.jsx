import { useEffect, useState } from 'react';
import { subscribePendingOrders, subscribeCompletedOrders } from '../services/firebase';
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

const VERBS = ['ordered', 'is sipping on', 'went with', 'is enjoying'];
const EMOJIS = ['🍸', '🥃', '🍹', '🥂', '🍷'];

function hashStr(s) {
  return s.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
}

function drinkPhrase(order) {
  const h = hashStr(order.id);
  const verb = VERBS[h % VERBS.length];
  const first = order.items?.[0]?.name || 'a drink';
  const extra = (order.items?.length || 1) - 1;
  return `${verb} ${first}${extra > 0 ? ` + ${extra} more` : ''}`;
}

function feedEmoji(order) {
  return EMOJIS[hashStr(order.id) % EMOJIS.length];
}

export default function GuestQueue() {
  const [orders, setOrders] = useState(null);
  const [completedOrders, setCompletedOrders] = useState([]);
  const guestName = sessionStorage.getItem('guest_name');

  useEffect(() => {
    return subscribePendingOrders(null, setOrders);
  }, []);

  useEffect(() => {
    return subscribeCompletedOrders((results) => {
      setCompletedOrders(results.slice(0, 15));
    });
  }, []);

  if (!orders) return <div className="loading">Loading...</div>;

  return (
    <div className="page" style={{ background: '#111', color: '#fff', padding: '20px 16px' }}>
      <h1 style={{ fontFamily: "'DIN', sans-serif", fontSize: '1.75rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 20, textAlign: 'center' }}>
        Order Queue
      </h1>

      {/* --- Coming right up --- */}
      <div className="queue-section-header">🍸 Coming right up</div>

      {orders.length === 0 ? (
        <div className="empty-state" style={{ marginBottom: 8 }}>
          No drinks in the queue yet
        </div>
      ) : (
        orders.map((order, idx) => {
          const isYours = guestName && order.guestName?.toLowerCase() === guestName.toLowerCase();
          return (
            <div
              key={order.id}
              className="queue-card animate-in"
              style={isYours ? { border: '1px solid #CA4321' } : undefined}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="queue-position">#{idx + 1}</span>
                <span className="queue-guest">
                  {order.guestName}
                  {isYours && <span style={{ color: '#CA4321', marginLeft: 8, fontSize: '0.75rem' }}>YOU</span>}
                </span>
              </div>
              <div className="queue-drinks">
                {order.items?.map((item, i) => (
                  <span key={i}>
                    {i > 0 && ' · '}
                    {item.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}
                  </span>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* --- What others are drinking --- */}
      <div className="queue-section-header" style={{ marginTop: 32 }}>What others are drinking</div>

      {completedOrders.length === 0 ? (
        <div className="empty-state">
          Orders will show up here once drinks start flowing
        </div>
      ) : (
        completedOrders.map((order, idx) => {
          const isYours = guestName && order.guestName?.toLowerCase() === guestName.toLowerCase();
          return (
            <div
              key={order.id}
              className="feed-card animate-in-stagger"
              style={{
                animationDelay: `${idx * 0.05}s`,
                ...(isYours ? { border: '1px solid #CA4321' } : {}),
              }}
            >
              <span className="feed-emoji">{feedEmoji(order)}</span>
              <div className="feed-body">
                <span className="feed-text">
                  <span className="feed-name">{order.guestName}</span>{' '}
                  {drinkPhrase(order)}
                </span>
                <span className="feed-time">{timeAgo(order.completedAt)}</span>
              </div>
            </div>
          );
        })
      )}

      <BottomNav />
    </div>
  );
}
