import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeEvents } from '../services/firebase';
import BottomNav from '../components/BottomNav';

export default function AdminEvents() {
  const [events, setEvents] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    return subscribeEvents(setEvents);
  }, []);

  if (!events) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-page">
      <h1>Events</h1>

      {events.length === 0 ? (
        <div className="empty-state">No events yet. Create one!</div>
      ) : (
        events.map((evt) => (
          <div
            key={evt.id}
            className="admin-card"
            onClick={() => navigate(`/admin/events/${evt.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="admin-card-name">{evt.name}</div>
              <span className={`badge ${evt.isActive ? 'badge-active' : 'badge-inactive'}`}>
                {evt.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="admin-card-meta" style={{ marginTop: 4 }}>
              {evt.date?.toDate ? evt.date.toDate().toLocaleDateString() : ''}
              {' · '}
              {evt.availableDrinks?.length || 0} drinks
            </div>
          </div>
        ))
      )}

      <button className="fab" onClick={() => navigate('/admin/events/new')}>
        +
      </button>
      <BottomNav type="admin" />
    </div>
  );
}
